import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { JwtUtils } from '../utils/jwt.utils';
import { PasswordUtils } from '../utils/password.utils';
import {
  UserPayload,
  AuthTokens,
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
} from '../types/auth.types';

export class AuthService {
  static async login(input: LoginInput, ipAddress?: string, userAgent?: string): Promise<{ user: UserPayload; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { employee: true },
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${input.email}`);
      throw new Error('Credenciales inválidas');
    }

    if (!user.isActive) {
      logger.warn(`Login attempt with inactive account: ${input.email}`);
      throw new Error('Cuenta desactivada');
    }

    const isValidPassword = await PasswordUtils.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      logger.warn(`Failed login attempt for: ${input.email}`);
      throw new Error('Credenciales inválidas');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        tableName: 'users',
        recordId: user.id,
        ipAddress,
        userAgent,
      },
    });

    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = JwtUtils.generateTokens(payload);

    logger.info(`User logged in: ${user.email}`);

    return { user: payload, tokens };
  }

  static async register(input: RegisterInput): Promise<{ user: UserPayload; tokens: AuthTokens }> {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Validate password
    const passwordValidation = PasswordUtils.validatePassword(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Hash password
    const passwordHash = await PasswordUtils.hash(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role || 'EMPLOYEE',
      },
    });

    // Create employee record if provided
    if (input.firstName && input.lastName) {
      await prisma.employee.create({
        data: {
          userId: user.id,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        tableName: 'users',
        recordId: user.id,
        newData: { email: user.email, role: user.role },
      },
    });

    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = JwtUtils.generateTokens(payload);

    logger.info(`User registered: ${user.email}`);

    return { user: payload, tokens };
  }

  static async refreshTokens(input: RefreshTokenInput): Promise<AuthTokens> {
    try {
      const { userId } = JwtUtils.verifyRefreshToken(input.refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.isActive) {
        throw new Error('Usuario no válido');
      }

      const payload: UserPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      return JwtUtils.generateTokens(payload);
    } catch (error) {
      logger.warn('Invalid refresh token attempt');
      throw new Error('Token de refresco inválido');
    }
  }

  static async getCurrentUser(userId: string): Promise<UserPayload | null> {
    const user = await prisma.user.findUnique({
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

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValidPassword = await PasswordUtils.compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Contraseña actual incorrecta');
    }

    const passwordValidation = PasswordUtils.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    const newPasswordHash = await PasswordUtils.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CHANGE_PASSWORD',
        tableName: 'users',
        recordId: userId,
      },
    });

    logger.info(`Password changed for user: ${user.email}`);
  }
}
