"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const jwt_utils_1 = require("../utils/jwt.utils");
const password_utils_1 = require("../utils/password.utils");
const env_1 = require("../config/env");
const error_middleware_1 = require("../middleware/error.middleware");
const MAX_LOGIN_ATTEMPTS = 4;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const loginAttemptMap = new Map();
function getAccountLock(email) {
    return loginAttemptMap.get(email) ?? { attempts: 0, lockedUntil: null };
}
class AuthService {
    static async login(input, ipAddress, userAgent) {
        const normalizedEmail = input.email.trim().toLowerCase();
        const emailKey = normalizedEmail;
        // ── Check if THIS account is temporarily locked (in-memory, per-email) ──
        const lockInfo = getAccountLock(emailKey);
        if (lockInfo.lockedUntil && lockInfo.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((lockInfo.lockedUntil.getTime() - Date.now()) / 60000);
            logger_1.logger.warn(`Login attempt for locked account: ${normalizedEmail}, unlocks in ${minutesLeft}min`);
            const err = (0, error_middleware_1.createError)('ACCOUNT_LOCKED', 429);
            err.code = 'ACCOUNT_LOCKED';
            err.minutesLeft = minutesLeft;
            throw err;
        }
        const user = await database_1.prisma.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
            include: { employee: true },
        });
        if (!user) {
            logger_1.logger.warn(`Login attempt with non-existent email: ${normalizedEmail}`);
            throw new Error('Credenciales inválidas');
        }
        if (!user.isActive) {
            logger_1.logger.warn(`Login attempt with inactive account: ${normalizedEmail}`);
            throw new Error('Cuenta desactivada');
        }
        // Check if the tenant (barbershop) is active
        if (user.tenantId) {
            const tenant = await database_1.prisma.tenant.findUnique({ where: { id: user.tenantId } });
            if (tenant && !tenant.isActive) {
                logger_1.logger.warn(`Login attempt for inactive tenant: ${user.tenantId} by user: ${normalizedEmail}`);
                const supportPhone = env_1.env.SUPPORT_PHONE || '';
                const err = (0, error_middleware_1.createError)('TENANT_INACTIVE', 403);
                err.code = 'TENANT_INACTIVE';
                err.phone = supportPhone;
                throw err;
            }
        }
        const isValidPassword = await password_utils_1.PasswordUtils.compare(input.password, user.passwordHash);
        if (!isValidPassword) {
            // Increment in-memory counter for THIS account only
            const currentAttempts = lockInfo.attempts;
            const newAttempts = currentAttempts + 1;
            const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;
            if (shouldLock) {
                loginAttemptMap.set(emailKey, {
                    attempts: newAttempts,
                    lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
                });
                // Auto-clear after lockout expires so map doesn't grow forever
                setTimeout(() => loginAttemptMap.delete(emailKey), LOCKOUT_DURATION_MS + 1000);
                logger_1.logger.warn(`Account locked after ${newAttempts} failed attempts: ${normalizedEmail}`);
                const err = (0, error_middleware_1.createError)('ACCOUNT_LOCKED', 429);
                err.code = 'ACCOUNT_LOCKED';
                err.minutesLeft = 15;
                throw err;
            }
            loginAttemptMap.set(emailKey, { attempts: newAttempts, lockedUntil: null });
            const attemptsLeft = MAX_LOGIN_ATTEMPTS - newAttempts;
            logger_1.logger.warn(`Failed login attempt ${newAttempts}/${MAX_LOGIN_ATTEMPTS} for: ${normalizedEmail} (${attemptsLeft} left)`);
            const err = (0, error_middleware_1.createError)(`Credenciales inválidas. Te quedan ${attemptsLeft} intento${attemptsLeft === 1 ? '' : 's'} antes de bloquear la cuenta.`, 401);
            err.code = 'INVALID_CREDENTIALS';
            err.attemptsLeft = attemptsLeft;
            throw err;
        }
        // ✅ Successful login → clear counter for this account
        loginAttemptMap.delete(emailKey);
        // Update lastLogin in DB
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        // Log audit
        await database_1.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                tableName: 'users',
                recordId: user.id,
                ipAddress,
                userAgent,
            },
        });
        const payload = {
            userId: user.id,
            tenantId: user.tenantId ?? undefined,
            email: user.email,
            role: user.role,
        };
        const tokens = jwt_utils_1.JwtUtils.generateTokens(payload);
        logger_1.logger.info(`User logged in: ${user.email}`);
        return { user: payload, tokens };
    }
    static async register(input) {
        // Check if email exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }
        // Validate password
        const passwordValidation = password_utils_1.PasswordUtils.validatePassword(input.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message);
        }
        // Hash password
        const passwordHash = await password_utils_1.PasswordUtils.hash(input.password);
        // Create tenant if shopName is provided
        let tenantId = undefined;
        if (input.shopName) {
            let planId = null;
            if (input.plan) {
                const plan = await database_1.prisma.subscriptionPlan.findUnique({
                    where: { name: input.plan }
                });
                planId = plan?.id || null;
            }
            const tenant = await database_1.prisma.tenant.create({
                data: {
                    name: input.shopName,
                    planId,
                },
            });
            tenantId = tenant.id;
        }
        // Create user
        const user = await database_1.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                role: input.role || (tenantId ? 'ADMIN' : 'EMPLOYEE'),
                tenantId,
            },
        });
        // Create employee record if provided and part of a tenant
        if (input.firstName && input.lastName && tenantId) {
            await database_1.prisma.employee.create({
                data: {
                    userId: user.id,
                    tenantId: tenantId,
                    firstName: input.firstName,
                    lastName: input.lastName,
                },
            });
        }
        // Log audit
        await database_1.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'REGISTER',
                tableName: 'users',
                recordId: user.id,
                newData: { email: user.email, role: user.role },
            },
        });
        const payload = {
            userId: user.id,
            tenantId: user.tenantId ?? undefined,
            email: user.email,
            role: user.role,
        };
        const tokens = jwt_utils_1.JwtUtils.generateTokens(payload);
        logger_1.logger.info(`User registered: ${user.email}`);
        return { user: payload, tokens };
    }
    static async refreshTokens(input) {
        try {
            const { userId } = jwt_utils_1.JwtUtils.verifyRefreshToken(input.refreshToken);
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user || !user.isActive) {
                throw new Error('Usuario no válido');
            }
            const payload = {
                userId: user.id,
                tenantId: user.tenantId ?? undefined,
                email: user.email,
                role: user.role,
            };
            return jwt_utils_1.JwtUtils.generateTokens(payload);
        }
        catch (error) {
            logger_1.logger.warn('Invalid refresh token attempt');
            throw new Error('Token de refresco inválido');
        }
    }
    static async getCurrentUser(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.isActive) {
            return null;
        }
        return {
            userId: user.id,
            tenantId: user.tenantId ?? undefined,
            email: user.email,
            role: user.role,
        };
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        const isValidPassword = await password_utils_1.PasswordUtils.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Contraseña actual incorrecta');
        }
        const passwordValidation = password_utils_1.PasswordUtils.validatePassword(newPassword);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message);
        }
        const newPasswordHash = await password_utils_1.PasswordUtils.hash(newPassword);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        // Log audit
        await database_1.prisma.auditLog.create({
            data: {
                userId,
                action: 'CHANGE_PASSWORD',
                tableName: 'users',
                recordId: userId,
            },
        });
        logger_1.logger.info(`Password changed for user: ${user.email}`);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map