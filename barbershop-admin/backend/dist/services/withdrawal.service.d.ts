export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
interface WithdrawalFilters {
    tenantId: string;
    status?: WithdrawalStatus;
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
}
export declare class WithdrawalService {
    static getWithdrawals(filters: WithdrawalFilters): Promise<({
        employee: {
            user: {
                email: string;
            };
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        operationNumber: string;
        accountHolder: string;
        bankName: string;
        accountType: string;
        maskedAccountNumber: string;
    })[]>;
    static updateStatus(id: string, tenantId: string, status: WithdrawalStatus, updatedBy: string): Promise<{
        status: import(".prisma/client").$Enums.WithdrawalStatus;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        operationNumber: string;
        accountHolder: string;
        bankName: string;
        accountType: string;
        maskedAccountNumber: string;
    }>;
}
export {};
//# sourceMappingURL=withdrawal.service.d.ts.map