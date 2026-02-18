export declare class PasswordUtils {
    static hash(password: string): Promise<string>;
    static compare(password: string, hash: string): Promise<boolean>;
    static validatePassword(password: string): {
        valid: boolean;
        message?: string;
    };
}
//# sourceMappingURL=password.utils.d.ts.map