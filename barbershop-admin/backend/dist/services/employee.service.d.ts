import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters, EmployeeEarningsFilters, EmployeeEarnings } from '../types/employee.types';
export declare class EmployeeService {
    static createEmployee(input: CreateEmployeeInput, createdBy: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        userId: string;
        id: string;
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
}
//# sourceMappingURL=employee.service.d.ts.map