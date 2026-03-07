import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { JwtUtils } from '../utils/jwt.utils';
import { PasswordUtils } from '../utils/password.utils';
import { env } from '../config/env';
import { createError } from '../middleware/error.middleware';
import {
  UserPayload,
  AuthTokens,
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
} from '../types/auth.types';

const MAX_LOGIN_ATTEMPTS = 4;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory per-account lockout tracker (keyed by email, isolated per account)
interface AccountLockInfo {
  attempts: number;
  lockedUntil: Date | null;
}
const loginAttemptMap = new Map<string, AccountLockInfo>();

function getAccountLock(email: string): AccountLockInfo {
  return loginAttemptMap.get(email) ?? { attempts: 0, lockedUntil: null };
}

export class AuthService {
  static async login(input: LoginInput, ipAddress?: string, userAgent?: string): Promise<{ user: UserPayload; tokens: AuthTokens }> {
    const emailKey = input.email.toLowerCase();

    // ── Check if THIS account is temporarily locked (in-memory, per-email) ──
    const lockInfo = getAccountLock(emailKey);
    if (lockInfo.lockedUntil && lockInfo.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((lockInfo.lockedUntil.getTime() - Date.now()) / 60000);
      logger.warn(`Login attempt for locked account: ${input.email}, unlocks in ${minutesLeft}min`);
      const err: any = createError('ACCOUNT_LOCKED', 429);
      err.code = 'ACCOUNT_LOCKED';
      err.minutesLeft = minutesLeft;
      throw err;
    }

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

    // Check if the tenant (barbershop) is active
    if (user.tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
      if (tenant && !tenant.isActive) {
        logger.warn(`Login attempt for inactive tenant: ${user.tenantId} by user: ${input.email}`);
        const supportPhone = env.SUPPORT_PHONE || '';
        const err: any = createError('TENANT_INACTIVE', 403);
        err.code = 'TENANT_INACTIVE';
        err.phone = supportPhone;
        throw err;
      }
    }

    const isValidPassword = await PasswordUtils.compare(input.password, user.passwordHash);

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

        logger.warn(`Account locked after ${newAttempts} failed attempts: ${input.email}`);
        const err: any = createError('ACCOUNT_LOCKED', 429);
        err.code = 'ACCOUNT_LOCKED';
        err.minutesLeft = 15;
        throw err;
      }

      loginAttemptMap.set(emailKey, { attempts: newAttempts, lockedUntil: null });

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - newAttempts;
      logger.warn(`Failed login attempt ${newAttempts}/${MAX_LOGIN_ATTEMPTS} for: ${input.email} (${attemptsLeft} left)`);
      const err: any = createError(`Credenciales inválidas. Te quedan ${attemptsLeft} intento${attemptsLeft === 1 ? '' : 's'} antes de bloquear la cuenta.`, 401);
      err.code = 'INVALID_CREDENTIALS';
      err.attemptsLeft = attemptsLeft;
      throw err;
    }

    // ✅ Successful login → clear counter for this account
    loginAttemptMap.delete(emailKey);

    // Update lastLogin in DB
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
      tenantId: user.tenantId ?? undefined,
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

    // Create tenant if shopName is provided
    let tenantId: string | undefined = undefined;
    if (input.shopName) {
      // Find the selected plan from the database or default to 'BASIC'
      const selectedPlanName = input.plan || 'BASIC';
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { name: selectedPlanName }
      });

      const tenant = await prisma.tenant.create({
        data: {
          name: input.shopName,
          planId: plan?.id || null, // Link to dynamic SubscriptionPlan
        },
      });
      tenantId = tenant.id;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role || (tenantId ? 'ADMIN' : 'EMPLOYEE'),
        tenantId,
      },
    });

    // Create employee record if provided and part of a tenant
    if (input.firstName && input.lastName && tenantId) {
      await prisma.employee.create({
        data: {
          userId: user.id,
          tenantId: tenantId,
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
      tenantId: user.tenantId ?? undefined,
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
        tenantId: user.tenantId ?? undefined,
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
      tenantId: user.tenantId ?? undefined,
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
