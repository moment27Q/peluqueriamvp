import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { CommissionService } from './commission.service';

export interface PeriodReport {
  period: {
    start: Date;
    end: Date;
    label: string;
  };
  summary: {
    totalServices: number;
    totalRevenue: number;
    totalCommission: number;
    totalSalonEarnings: number;
    averageServiceValue: number;
  };
  byEmployee: Array<{
    employeeId: string;
    employeeName: string;
    servicesCount: number;
    revenue: number;
    commission: number;
    salonEarnings: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    services: number;
    revenue: number;
    commission: number;
  }>;
}

export interface DashboardSummary {
  today: {
    services: number;
    revenue: number;
    commission: number;
  };
  thisWeek: {
    services: number;
    revenue: number;
    commission: number;
  };
  thisMonth: {
    services: number;
    revenue: number;
    commission: number;
  };
  topEmployees: Array<{
    employeeId: string;
    employeeName: string;
    services: number;
    revenue: number;
  }>;
  recentServices: Array<{
    id: string;
    clientName: string;
    employeeName: string;
    serviceType: string;
    price: number;
    date: Date;
  }>;
}

export class ReportService {
  static async getDailyReport(date?: Date): Promise<PeriodReport> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.generatePeriodReport(startOfDay, endOfDay, 'Diario');
  }

  static async getWeeklyReport(endDate?: Date): Promise<PeriodReport> {
    const end = endDate || new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return this.generatePeriodReport(start, end, 'Semanal');
  }

  static async getBiweeklyReport(endDate?: Date): Promise<PeriodReport> {
    const end = endDate || new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return this.generatePeriodReport(start, end, 'Quincenal');
  }

  static async getMonthlyReport(endDate?: Date): Promise<PeriodReport> {
    const end = endDate || new Date();
    const start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return this.generatePeriodReport(start, end, 'Mensual');
  }

  static async getCustomReport(startDate: Date, endDate: Date): Promise<PeriodReport> {
    return this.generatePeriodReport(startDate, endDate, 'Personalizado');
  }

  private static async generatePeriodReport(
    startDate: Date,
    endDate: Date,
    label: string
  ): Promise<PeriodReport> {
    const services = await prisma.service.findMany({
      where: {
        serviceDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        serviceType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        serviceDate: 'asc',
      },
    });

    const totals = CommissionService.calculateTotals(services);

    // Group by employee
    const byEmployeeMap = new Map();
    services.forEach((service) => {
      const empId = service.employeeId;
      const empName = `${service.employee.firstName} ${service.employee.lastName}`;
      
      if (!byEmployeeMap.has(empId)) {
        byEmployeeMap.set(empId, {
          employeeId: empId,
          employeeName: empName,
          servicesCount: 0,
          revenue: 0,
          commission: 0,
          salonEarnings: 0,
        });
      }

      const emp = byEmployeeMap.get(empId);
      emp.servicesCount++;
      emp.revenue += Number(service.price);
      emp.commission += Number(service.commissionAmount);
      emp.salonEarnings += Number(service.price) - Number(service.commissionAmount);
    });

    // Group by day
    const dailyMap = new Map();
    services.forEach((service) => {
      const dateKey = service.serviceDate.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          services: 0,
          revenue: 0,
          commission: 0,
        });
      }

      const day = dailyMap.get(dateKey);
      day.services++;
      day.revenue += Number(service.price);
      day.commission += Number(service.commissionAmount);
    });

    return {
      period: {
        start: startDate,
        end: endDate,
        label,
      },
      summary: {
        totalServices: services.length,
        totalRevenue: totals.totalRevenue,
        totalCommission: totals.totalCommission,
        totalSalonEarnings: totals.totalSalonEarnings,
        averageServiceValue: services.length > 0 ? totals.totalRevenue / services.length : 0,
      },
      byEmployee: Array.from(byEmployeeMap.values()).sort((a, b) => b.revenue - a.revenue),
      dailyBreakdown: Array.from(dailyMap.values()),
    };
  }

  static async getDashboardSummary(): Promise<DashboardSummary> {
    const now = new Date();

    // Today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // This week
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // This month
    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 1);
    monthStart.setHours(0, 0, 0, 0);

    const [todayServices, weekServices, monthServices] = await Promise.all([
      prisma.service.findMany({
        where: { serviceDate: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.service.findMany({
        where: { serviceDate: { gte: weekStart, lte: todayEnd } },
      }),
      prisma.service.findMany({
        where: { serviceDate: { gte: monthStart, lte: todayEnd } },
      }),
    ]);

    const todayTotals = CommissionService.calculateTotals(todayServices);
    const weekTotals = CommissionService.calculateTotals(weekServices);
    const monthTotals = CommissionService.calculateTotals(monthServices);

    // Top employees this month
    const topEmployees = await this.getTopEmployees(monthStart, todayEnd, 5);

    // Recent services
    const recentServices = await prisma.service.findMany({
      take: 10,
      orderBy: { serviceDate: 'desc' },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        serviceType: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      today: {
        services: todayServices.length,
        revenue: todayTotals.totalRevenue,
        commission: todayTotals.totalCommission,
      },
      thisWeek: {
        services: weekServices.length,
        revenue: weekTotals.totalRevenue,
        commission: weekTotals.totalCommission,
      },
      thisMonth: {
        services: monthServices.length,
        revenue: monthTotals.totalRevenue,
        commission: monthTotals.totalCommission,
      },
      topEmployees,
      recentServices: recentServices.map((s) => ({
        id: s.id,
        clientName: s.clientName,
        employeeName: `${s.employee.firstName} ${s.employee.lastName}`,
        serviceType: s.serviceType?.name || 'Servicio personalizado',
        price: Number(s.price),
        date: s.serviceDate,
      })),
    };
  }

  private static async getTopEmployees(
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<Array<{ employeeId: string; employeeName: string; services: number; revenue: number }>> {
    const services = await prisma.service.findMany({
      where: {
        serviceDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const employeeMap = new Map();
    services.forEach((service) => {
      const empId = service.employeeId;
      const empName = `${service.employee.firstName} ${service.employee.lastName}`;

      if (!employeeMap.has(empId)) {
        employeeMap.set(empId, {
          employeeId: empId,
          employeeName: empName,
          services: 0,
          revenue: 0,
        });
      }

      const emp = employeeMap.get(empId);
      emp.services++;
      emp.revenue += Number(service.price);
    });

    return Array.from(employeeMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  static async getEmployeeComparison(startDate: Date, endDate: Date) {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: {
            serviceDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    return employees.map((emp) => {
      const totals = CommissionService.calculateTotals(emp.services);
      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        commissionRate: Number(emp.commissionRate),
        servicesCount: emp.services.length,
        totalRevenue: totals.totalRevenue,
        totalCommission: totals.totalCommission,
        salonEarnings: totals.totalSalonEarnings,
        averageServiceValue: emp.services.length > 0 ? totals.totalRevenue / emp.services.length : 0,
      };
    });
  }
}
