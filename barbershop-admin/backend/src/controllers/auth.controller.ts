import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    firstName: z.string().min(2, 'El nombre es requerido'),
    lastName: z.string().min(2, 'El apellido es requerido'),
    role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
    shopName: z.string().min(2, 'El nombre de la peluquería es requerido').optional(),
    plan: z.string().optional(),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'El token de refresco es requerido'),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  }),
});

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req).body;

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.login({ email, password }, ipAddress, userAgent);

    res.json({
      success: true,
      data: result,
    });
  });

  static register = asyncHandler(async (req: Request, res: Response) => {
    const data = registerSchema.parse(req).body;

    const result = await AuthService.register(data);

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // In a more complex implementation, we would invalidate the token
    // For now, we just log the logout
    logger.info(`User logged out: ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = refreshTokenSchema.parse(req).body;

    const tokens = await AuthService.refreshTokens({ refreshToken });

    res.json({
      success: true,
      data: tokens,
    });
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
    }

    const user = await AuthService.getCurrentUser(req.user.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    const tenant = user.tenantId
      ? await prisma.tenant.findUnique({
          where: { id: user.tenantId },
          select: {
            id: true,
            name: true,
            subscriptionPlan: {
              select: { id: true, name: true, price: true, maxEmployees: true } as any,
            },
            trialStartedAt: true,
            trialEndsAt: true,
            trialUsed: true,
          },
        })
      : null;

    res.json({
      success: true,
      data: {
        ...user,
        tenant,
      },
    });
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req).body;

    await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  });

  static activateTrial = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId) {
      res.status(400).json({ error: 'El usuario no tiene peluquerÃ­a asociada' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: req.user.tenantId } });
    if (!tenant) {
      res.status(404).json({ error: 'PeluquerÃ­a no encontrada' });
      return;
    }

    if (tenant.planId) {
      res.status(400).json({ error: 'Ya tienes un plan activo' });
      return;
    }

    if (tenant.trialUsed && tenant.trialEndsAt && tenant.trialEndsAt < new Date()) {
      res.status(400).json({ error: 'La prueba gratuita ya fue utilizada' });
      return;
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        trialStartedAt: now,
        trialEndsAt: endsAt,
        trialUsed: true,
      },
      select: {
        id: true,
        name: true,
        subscriptionPlan: { select: { id: true, name: true, price: true } as any },
        trialStartedAt: true,
        trialEndsAt: true,
        trialUsed: true,
      },
    });

    res.json({ success: true, data: updated });
  });

  static updateMyPlan = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId) {
      res.status(400).json({ error: 'El usuario no tiene peluquerÃ­a asociada' });
      return;
    }

    const { planId } = req.body as { planId?: string | null };

    if (planId === null || planId === undefined || planId === '') {
      const updated = await prisma.tenant.update({
        where: { id: req.user.tenantId },
        data: { planId: null },
        select: { id: true, name: true, subscriptionPlan: { select: { id: true, name: true, price: true } as any } },
      });
      res.json({ success: true, data: updated });
      return;
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      res.status(404).json({ error: 'Plan no encontrado' });
      return;
    }

    const updated = await prisma.tenant.update({
      where: { id: req.user.tenantId },
      data: { planId },
      select: { id: true, name: true, subscriptionPlan: { select: { id: true, name: true, price: true } as any } },
    });

    res.json({ success: true, data: updated });
  });
}
