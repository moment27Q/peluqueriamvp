import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { PasswordUtils } from '../utils/password.utils';
import { CommissionService } from './commission.service';
import { NotificationService } from './notification.service';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFilters,
  EmployeeEarningsFilters,
  EmployeeEarnings,
} from '../types/employee.types';

export class EmployeeService {
  private static generateWithdrawalOperationNumber(date: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `WD-${y}${m}${d}-${h}${min}${s}-${random}`;
  }

  private static getPeriodDates(period: 'daily' | 'weekly' | 'biweekly' | 'monthly') {
    const endDate = new Date();
    const startDate = new Date(endDate);

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'biweekly':
        startDate.setDate(startDate.getDate() - 14);
        break;
      case 'monthly':
      default:
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    return { startDate, endDate };
  }

  static async createEmployee(input: CreateEmployeeInput, createdBy: string) {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Validate password
    const passwordValidation = PasswordUtils.validatePassword(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Hash password
    const passwordHash = await PasswordUtils.hash(input.password);

    // Create user and employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: 'EMPLOYEE',
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          photoUrl: input.photoUrl,
          commissionRate: input.commissionRate,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return employee;
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: createdBy,
        action: 'CREATE_EMPLOYEE',
        tableName: 'employees',
        recordId: result.id,
        newData: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          commissionRate: input.commissionRate,
        },
      },
    });

    logger.info(`Employee created: ${input.firstName} ${input.lastName}`);

    return result;
  }

  static async getAllEmployees(filters: EmployeeFilters = {}) {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return employees;
  }

  static async getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        },
        _count: {
          select: { services: true },
        },
      },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    return employee;
  }

  static async updateEmployee(id: string, input: UpdateEmployeeInput, updatedBy: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        photoUrl: input.photoUrl,
        commissionRate: input.commissionRate,
        isActive: input.isActive,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // If employee is deactivated, also deactivate user
    if (input.isActive === false) {
      await prisma.user.update({
        where: { id: employee.userId },
        data: { isActive: false },
      });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'UPDATE_EMPLOYEE',
        tableName: 'employees',
        recordId: id,
        oldData: employee,
        newData: updated,
      },
    });

    logger.info(`Employee updated: ${id}`);

    return updated;
  }

  static async deleteEmployee(id: string, deletedBy: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    if (employee._count.services > 0) {
      // Soft delete - just deactivate
      await prisma.employee.update({
        where: { id },
        data: { isActive: false },
      });

      await prisma.user.update({
        where: { id: employee.userId },
        data: { isActive: false },
      });
    } else {
      // Hard delete if no services
      await prisma.$transaction([
        prisma.employee.delete({ where: { id } }),
        prisma.user.delete({ where: { id: employee.userId } }),
      ]);
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: deletedBy,
        action: 'DELETE_EMPLOYEE',
        tableName: 'employees',
        recordId: id,
        oldData: employee,
      },
    });

    logger.info(`Employee deleted: ${id}`);
  }

  static async getEmployeeEarnings(
    employeeId: string,
    filters: EmployeeEarningsFilters
  ): Promise<EmployeeEarnings> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    let startDate: Date;
    let endDate: Date = new Date();

    if (filters.startDate && filters.endDate) {
      startDate = filters.startDate;
      endDate = filters.endDate;
    } else {
      // Calculate based on period
      switch (filters.period) {
        case 'daily':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'biweekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 14);
          break;
        case 'monthly':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
      }
    }

    const services = await prisma.service.findMany({
      where: {
        employeeId,
        serviceDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totals = CommissionService.calculateTotals(services);
    const withdrawalsAggregate = await prisma.withdrawal.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        employeeId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const totalWithdrawn = Number(withdrawalsAggregate._sum.amount || 0);
    const availableBalance = Math.max(0, totals.totalCommission - totalWithdrawn);

    return {
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      totalServices: services.length,
      totalRevenue: totals.totalRevenue,
      totalCommission: totals.totalCommission,
      totalWithdrawn,
      availableBalance,
      salonEarnings: totals.totalSalonEarnings,
      period: { start: startDate, end: endDate },
    };
  }

  static async getAllEmployeesEarnings(
    filters: EmployeeEarningsFilters
  ): Promise<EmployeeEarnings[]> {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
    });

    const earningsPromises = employees.map((emp) =>
      this.getEmployeeEarnings(emp.id, filters)
    );

    return Promise.all(earningsPromises);
  }

  static async getEmployeeByUserId(userId: string) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        },
        _count: {
          select: { services: true },
        },
      },
    });

    if (!employee) {
      throw new Error('No existe perfil de peluquero para este usuario');
    }

    return employee;
  }

  static async getEmployeeEarningsByUserId(userId: string, filters: EmployeeEarningsFilters) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!employee) {
      throw new Error('No existe perfil de peluquero para este usuario');
    }

    return this.getEmployeeEarnings(employee.id, filters);
  }

  static async getMyServiceHistory(userId: string, limit = 50) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!employee) {
      throw new Error('No existe perfil de peluquero para este usuario');
    }

    const services = await prisma.service.findMany({
      where: { employeeId: employee.id },
      include: {
        serviceType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        serviceDate: 'desc',
      },
      take: limit,
    });

    return services.map((item) => ({
      id: item.id,
      date: item.serviceDate,
      clientName: item.clientName,
      serviceName: item.serviceType?.name || 'Servicio personalizado',
      price: Number(item.price),
      commissionAmount: Number(item.commissionAmount),
    }));
  }

  static async getMyPeriodReport(userId: string, period: 'daily' | 'weekly' | 'biweekly' | 'monthly') {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!employee) {
      throw new Error('No existe perfil de peluquero para este usuario');
    }

    const { startDate, endDate } = this.getPeriodDates(period);

    const services = await prisma.service.findMany({
      where: {
        employeeId: employee.id,
        serviceDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        serviceType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        serviceDate: 'desc',
      },
    });

    const totalRevenue = services.reduce((acc, item) => acc + Number(item.price), 0);
    const totalCommission = services.reduce((acc, item) => acc + Number(item.commissionAmount), 0);

    return {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      period,
      range: {
        startDate,
        endDate,
      },
      summary: {
        totalServices: services.length,
        totalRevenue,
        totalCommission,
        totalSalonEarnings: totalRevenue - totalCommission,
      },
      services: services.map((item) => ({
        id: item.id,
        date: item.serviceDate,
        clientName: item.clientName,
        serviceName: item.serviceType?.name || 'Servicio personalizado',
        price: Number(item.price),
        commissionAmount: Number(item.commissionAmount),
      })),
    };
  }

  static async requestWithdrawal(
    userId: string,
    amount: number,
    bankAccount: {
      accountHolder: string;
      bankName: string;
      accountType: 'checking' | 'savings';
      accountNumber: string;
    }
  ) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Monto invalido para retiro');
    }

    const earnings = await this.getEmployeeEarningsByUserId(userId, { period: 'monthly' });

    if (amount > earnings.availableBalance) {
      throw new Error('No tienes saldo suficiente para ese retiro');
    }

    const maskedAccountNumber = bankAccount.accountNumber.length > 4
      ? `****${bankAccount.accountNumber.slice(-4)}`
      : bankAccount.accountNumber;
    const requestedAt = new Date();
    const operationNumber = this.generateWithdrawalOperationNumber(requestedAt);

    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!employee) {
      throw new Error('No existe perfil de peluquero para este usuario');
    }

    const employeeName = `${employee.firstName} ${employee.lastName}`;

    const employeeEmail = employee?.user?.email || '';
    await prisma.withdrawal.create({
      data: {
        employeeId: employee.id,
        operationNumber,
        amount,
        status: 'PENDING',
        accountHolder: bankAccount.accountHolder.trim(),
        bankName: bankAccount.bankName.trim(),
        accountType: bankAccount.accountType,
        maskedAccountNumber,
        createdAt: requestedAt,
      },
    });

    const recipients = Array.from(
      new Set(
        [env.WITHDRAWAL_NOTIFY_EMAIL, employeeEmail]
          .map((value) => value?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );

    for (const recipient of recipients) {
      try {
        await NotificationService.sendWithdrawalNotification({
          toEmail: recipient,
          operationNumber,
          amount,
          requestedAt,
          employeeName,
          employeeEmail: employeeEmail || 'sin-email',
          bankName: bankAccount.bankName.trim(),
          accountType: bankAccount.accountType,
          maskedAccountNumber,
        });
      } catch (error) {
        const detail =
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : typeof error === 'string'
              ? error
              : JSON.stringify(error);
        logger.error(`Withdrawal notification email failed (${operationNumber}) user=${userId} to=${recipient} detail=${detail}`);
      }
    }

    return {
      operationNumber,
      requestedAt: requestedAt.toISOString(),
      requestedAmount: amount,
      availableBalance: Math.max(0, earnings.availableBalance - amount),
      status: 'PENDING',
      message: 'Solicitud de retiro registrada para tu cuenta bancaria',
      bankAccount: {
        accountHolder: bankAccount.accountHolder,
        bankName: bankAccount.bankName,
        accountType: bankAccount.accountType,
        accountNumber: maskedAccountNumber,
      },
    };
  }
}
