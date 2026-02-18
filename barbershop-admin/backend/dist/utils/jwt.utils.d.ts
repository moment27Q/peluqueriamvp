import { UserPayload, AuthTokens } from '../types/auth.types';
export declare class JwtUtils {
    static generateTokens(payload: UserPayload): AuthTokens;
    static verifyAccessToken(token: string): UserPayload;
    static verifyRefreshToken(token: string): {
        userId: string;
    };
    static decodeToken(token: string): UserPayload | null;
}
//# sourceMappingURL=jwt.utils.d.ts.map