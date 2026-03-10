interface WithdrawalNotificationPayload {
    toEmail?: string;
    operationNumber: string;
    amount: number;
    requestedAt: Date;
    employeeName: string;
    employeeEmail: string;
    bankName: string;
    accountType: 'checking' | 'savings';
    maskedAccountNumber: string;
}
export declare class NotificationService {
    private static transporter;
    private static getTransporter;
    static sendWithdrawalNotification(payload: WithdrawalNotificationPayload): Promise<void>;
}
export {};
//# sourceMappingURL=notification.service.d.ts.map