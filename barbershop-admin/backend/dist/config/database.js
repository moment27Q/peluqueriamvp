"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const env_1 = require("./env");
const client_2 = require("@prisma/client");
const password_utils_1 = require("../utils/password.utils");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
async function connectDatabase() {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('✅ Database connected successfully');
        try {
            const dbNameRows = await exports.prisma.$queryRaw `SELECT current_database()`;
            const dbName = dbNameRows?.[0]?.current_database;
            const tenantCount = await exports.prisma.tenant.count();
            logger_1.logger.info(`📦 Connected DB: ${dbName ?? 'unknown'} | Tenants: ${tenantCount}`);
        }
        catch (err) {
            logger_1.logger.warn('⚠️ Could not query DB metadata for diagnostics.');
        }
        if (env_1.env.NODE_ENV !== 'production') {
            await ensureSuperAdmin();
            await ensureDefaultPlans();
        }
    }
    catch (error) {
        logger_1.logger.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}
async function ensureSuperAdmin() {
    const email = 'admin@barbershop.com';
    const existing = await exports.prisma.user.findUnique({ where: { email } });
    if (existing)
        return;
    const passwordHash = await password_utils_1.PasswordUtils.hash('Admin123!');
    await exports.prisma.user.create({
        data: {
            email,
            passwordHash,
            role: client_2.UserRole.SUPERADMIN,
            isActive: true,
        },
    });
    logger_1.logger.info('✅ SuperAdmin bootstrap created: admin@barbershop.com');
}
async function ensureDefaultPlans() {
    const existingCount = await exports.prisma.subscriptionPlan.count();
    if (existingCount > 0)
        return;
    const plans = [
        {
            name: 'Basico',
            price: 19,
            features: [
                'Hasta 3 empleados',
                'Servicios y ventas',
                'Soporte por WhatsApp',
            ],
            maxEmployees: 3,
            displayOrder: 1,
        },
        {
            name: 'Pro',
            price: 39,
            features: [
                'Hasta 8 empleados',
                'Reportes avanzados',
                'Soporte prioritario',
            ],
            maxEmployees: 8,
            displayOrder: 2,
        },
        {
            name: 'Premium',
            price: 69,
            features: [
                'Empleados ilimitados',
                'Reportes y métricas',
                'Soporte VIP',
            ],
            maxEmployees: null,
            displayOrder: 3,
        },
        {
            name: 'Enterprise',
            price: 0,
            features: [
                'Plan a medida',
                'Integraciones',
                'Soporte dedicado',
            ],
            maxEmployees: null,
            displayOrder: 4,
        },
    ];
    await exports.prisma.subscriptionPlan.createMany({
        data: plans.map((plan) => ({
            name: plan.name,
            price: plan.price,
            features: plan.features,
            maxEmployees: plan.maxEmployees,
            isActive: true,
            displayOrder: plan.displayOrder,
        })),
        skipDuplicates: true,
    });
    logger_1.logger.info('✅ Default plans created');
}
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
    logger_1.logger.info('Database disconnected');
}
//# sourceMappingURL=database.js.map