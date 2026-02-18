import { UserPayload, AuthTokens, LoginInput, RegisterInput, RefreshTokenInput } from '../types/auth.types';
export declare class AuthService {
    static login(input: LoginInput, ipAddress?: string, userAgent?: string): Promise<{
        user: UserPayload;
        tokens: AuthTokens;
    }>;
    static register(input: RegisterInput): Promise<{
        user: UserPayload;
        tokens: AuthTokens;
    }>;
    static refreshTokens(input: RefreshTokenInput): Promise<AuthTokens>;
    static getCurrentUser(userId: string): Promise<UserPayload | null>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map