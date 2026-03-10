"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantController = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const password_utils_1 = require("../utils/password.utils");
// Helper to include all tenant details
const tenantInclude = {
    subscriptionPlan: { select: { id: true, name: true } },
    users: {
        where: { role: 'ADMIN' },
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
class TenantController {
}
exports.TenantController = TenantController;
_a = TenantController;
// GET /api/admin/tenants
TenantController.getAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const tenants = await database_1.prisma.tenant.findMany({
        orderBy: { createdAt: 'asc' },
        include: tenantInclude,
    });
    res.json({ success: true, data: tenants });
});
// PATCH /api/admin/tenants/:id/toggle
TenantController.toggleActive = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const tenant = await database_1.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
        res.status(404).json({ error: 'Peluquería no encontrada' });
        return;
    }
    const updated = await database_1.prisma.tenant.update({
        where: { id },
        data: { isActive: !tenant.isActive },
        include: tenantInclude,
    });
    res.json({ success: true, data: updated });
});
// PATCH /api/admin/tenants/:id/plan  — change subscription plan
TenantController.updatePlan = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { planId } = req.body;
    if (!planId) {
        res.status(400).json({ error: 'planId es requerido' });
        return;
    }
    const plan = await database_1.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
    }
    const updated = await database_1.prisma.tenant.update({
        where: { id },
        data: { planId },
        include: tenantInclude,
    });
    res.json({ success: true, data: updated });
});
// POST /api/admin/tenants/:id/admins  — add a new admin to a tenant
TenantController.addAdmin = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
    }
    const tenant = await database_1.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
        res.status(404).json({ error: 'Peluquería no encontrada' });
        return;
    }
    const existingUser = await database_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        return;
    }
    const passwordValidation = password_utils_1.PasswordUtils.validatePassword(password);
    if (!passwordValidation.valid) {
        res.status(400).json({ error: passwordValidation.message });
        return;
    }
    const passwordHash = await password_utils_1.PasswordUtils.hash(password);
    const user = await database_1.prisma.user.create({
        data: {
            email,
            passwordHash,
            role: 'ADMIN',
            tenantId: id,
        },
    });
    await database_1.prisma.employee.create({
        data: {
            userId: user.id,
            tenantId: id,
            firstName,
            lastName,
        },
    });
    // Return updated tenant
    const updated = await database_1.prisma.tenant.findUnique({
        where: { id },
        include: tenantInclude,
    });
    res.status(201).json({ success: true, data: updated });
});
//# sourceMappingURL=tenant.controller.js.map