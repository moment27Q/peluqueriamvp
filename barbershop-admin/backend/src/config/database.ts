import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { env } from './env';
import { UserRole } from '@prisma/client';
import { PasswordUtils } from '../utils/password.utils';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    try {
      const dbNameRows = await prisma.$queryRaw<{ current_database: string }[]>`SELECT current_database()`;
      const dbName = dbNameRows?.[0]?.current_database;
      const tenantCount = await prisma.tenant.count();
      logger.info(`📦 Connected DB: ${dbName ?? 'unknown'} | Tenants: ${tenantCount}`);
    } catch (err) {
      logger.warn('⚠️ Could not query DB metadata for diagnostics.');
    }
    if (env.NODE_ENV !== 'production') {
      await ensureSuperAdmin();
      await ensureDefaultPlans();
    }
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function ensureSuperAdmin(): Promise<void> {
  const email = 'admin@barbershop.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await PasswordUtils.hash('Admin123!');

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: UserRole.SUPERADMIN,
      isActive: true,
    },
  });

  logger.info('✅ SuperAdmin bootstrap created: admin@barbershop.com');
}

async function ensureDefaultPlans(): Promise<void> {
  const existingCount = await prisma.subscriptionPlan.count();
  if (existingCount > 0) return;

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

  await prisma.subscriptionPlan.createMany({
    data: plans.map((plan) => ({
      name: plan.name,
      price: plan.price,
      features: plan.features,
      maxEmployees: plan.maxEmployees,
      isActive: true,
      displayOrder: plan.displayOrder,
    })) as any,
    skipDuplicates: true,
  });

  logger.info('✅ Default plans created');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
