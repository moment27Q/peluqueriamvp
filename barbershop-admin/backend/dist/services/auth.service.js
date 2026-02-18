"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const jwt_utils_1 = require("../utils/jwt.utils");
const password_utils_1 = require("../utils/password.utils");
class AuthService {
    static async login(input, ipAddress, userAgent) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: input.email },
            include: { employee: true },
        });
        if (!user) {
            logger_1.logger.warn(`Login attempt with non-existent email: ${input.email}`);
            throw new Error('Credenciales inválidas');
        }
        if (!user.isActive) {
            logger_1.logger.warn(`Login attempt with inactive account: ${input.email}`);
            throw new Error('Cuenta desactivada');
        }
        const isValidPassword = await password_utils_1.PasswordUtils.compare(input.password, user.passwordHash);
        if (!isValidPassword) {
            logger_1.logger.warn(`Failed login attempt for: ${input.email}`);
            throw new Error('Credenciales inválidas');
        }
        // Update last login
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
        // Create user
        const user = await database_1.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                role: input.role || 'EMPLOYEE',
            },
        });
        // Create employee record if provided
        if (input.firstName && input.lastName) {
            await database_1.prisma.employee.create({
                data: {
                    userId: user.id,
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