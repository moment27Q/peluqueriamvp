import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/error.middleware';
import { PasswordUtils } from '../utils/password.utils';

// Helper to include all tenant details
const tenantInclude = {
    subscriptionPlan: { select: { id: true, name: true } },
    users: {
        where: { role: 'ADMIN' as any },
        select: {
            id: true,
            email: true,
            role: true,
            employee: {
                select: { firstName: true, lastName: true, phone: true },
            },
        },
    },
    employees: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
        },
    },
};

export class TenantController {
    // GET /api/admin/tenants
    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const tenants = await prisma.tenant.findMany({
            orderBy: { createdAt: 'asc' },
            include: tenantInclude,
        });
        res.json({ success: true, data: tenants });
    });

    // PATCH /api/admin/tenants/:id/toggle
    static toggleActive = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const tenant = await prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            res.status(404).json({ error: 'Peluquería no encontrada' });
            return;
        }
        const updated = await prisma.tenant.update({
            where: { id },
            data: { isActive: !tenant.isActive },
            include: tenantInclude,
        });
        res.json({ success: true, data: updated });
    });

    // PATCH /api/admin/tenants/:id/plan  — change subscription plan
    static updatePlan = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { planId } = req.body;

        if (!planId) {
            res.status(400).json({ error: 'planId es requerido' });
            return;
        }

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) {
            res.status(404).json({ error: 'Plan no encontrado' });
            return;
        }

        const updated = await prisma.tenant.update({
            where: { id },
            data: { planId },
            include: tenantInclude,
        });

        res.json({ success: true, data: updated });
    });

    // POST /api/admin/tenants/:id/admins  — add a new admin to a tenant
    static addAdmin = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            res.status(400).json({ error: 'Todos los campos son requeridos' });
            return;
        }

        const tenant = await prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            res.status(404).json({ error: 'Peluquería no encontrada' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'El correo electrónico ya está registrado' });
            return;
        }

        const passwordValidation = PasswordUtils.validatePassword(password);
        if (!passwordValidation.valid) {
            res.status(400).json({ error: passwordValidation.message });
            return;
        }

        const passwordHash = await PasswordUtils.hash(password);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: 'ADMIN',
                tenantId: id,
            },
        });

        await prisma.employee.create({
            data: {
                userId: user.id,
                tenantId: id,
                firstName,
                lastName,
            },
        });

        // Return updated tenant
        const updated = await prisma.tenant.findUnique({
            where: { id },
            include: tenantInclude,
        });

        res.status(201).json({ success: true, data: updated });
    });
}
