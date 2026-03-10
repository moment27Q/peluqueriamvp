import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters, EmployeeEarningsFilters, EmployeeEarnings } from '../types/employee.types';
export declare class EmployeeService {
    private static generateWithdrawalOperationNumber;
    private static getPeriodDates;
    static createEmployee(input: CreateEmployeeInput, createdBy: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        userId: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    static getAllEmployees(filters?: EmployeeFilters): Promise<({
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
        };
    } & {
        userId: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    static getEmployeeById(id: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            lastLogin: Date | null;
        };
        _count: {
            services: number;
        };
    } & {
        userId: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    static updateEmployee(id: string, input: UpdateEmployeeInput, updatedBy: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        userId: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    static deleteEmployee(id: string, deletedBy: string): Promise<void>;
    static getEmployeeEarnings(employeeId: string, filters: EmployeeEarningsFilters): Promise<EmployeeEarnings>;
    static getAllEmployeesEarnings(filters: EmployeeEarningsFilters): Promise<EmployeeEarnings[]>;
    static getEmployeeByUserId(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            lastLogin: Date | null;
        };
        _count: {
            services: number;
        };
    } & {
        userId: string;
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    static getEmployeeEarningsByUserId(userId: string, filters: EmployeeEarningsFilters): Promise<EmployeeEarnings>;
    static getMyServiceHistory(userId: string, limit?: number): Promise<{
        id: string;
        date: Date;
        clientName: string;
        serviceName: string;
        price: number;
        commissionAmount: number;
    }[]>;
    static getMyPeriodReport(userId: string, period: 'daily' | 'weekly' | 'biweekly' | 'monthly'): Promise<{
        employeeId: string;
        employeeName: string;
        period: "daily" | "weekly" | "biweekly" | "monthly";
        range: {
            startDate: Date;
            endDate: Date;
        };
        summary: {
            totalServices: number;
            totalRevenue: number;
            totalCommission: number;
            totalSalonEarnings: number;
        };
        services: {
            id: string;
            date: Date;
            clientName: string;
            serviceName: string;
            price: number;
            commissionAmount: number;
        }[];
    }>;
    static requestWithdrawal(userId: string, amount: number, bankAccount: {
        accountHolder: string;
        bankName: string;
        accountType: 'checking' | 'savings';
        accountNumber: string;
    }): Promise<{
        operationNumber: string;
        requestedAt: string;
        requestedAmount: number;
        availableBalance: number;
        status: string;
        message: string;
        bankAccount: {
            accountHolder: string;
            bankName: string;
            accountType: "checking" | "savings";
            accountNumber: string;
        };
    }>;
}
//# sourceMappingURL=employee.service.d.ts.map