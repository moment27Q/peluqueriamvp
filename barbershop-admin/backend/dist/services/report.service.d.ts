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
export declare class ReportService {
    static getDailyReport(date?: Date): Promise<PeriodReport>;
    static getWeeklyReport(endDate?: Date): Promise<PeriodReport>;
    static getBiweeklyReport(endDate?: Date): Promise<PeriodReport>;
    static getMonthlyReport(endDate?: Date): Promise<PeriodReport>;
    static getCustomReport(startDate: Date, endDate: Date): Promise<PeriodReport>;
    private static generatePeriodReport;
    static getDashboardSummary(): Promise<DashboardSummary>;
    private static getTopEmployees;
    static getEmployeeComparison(startDate: Date, endDate: Date): Promise<{
        employeeId: string;
        employeeName: string;
        commissionRate: number;
        servicesCount: number;
        totalRevenue: number;
        totalCommission: number;
        salonEarnings: number;
        averageServiceValue: number;
    }[]>;
}
//# sourceMappingURL=report.service.d.ts.map