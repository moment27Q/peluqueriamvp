import { PrismaClient, UserRole } from '@prisma/client';
import { PasswordUtils } from '../utils/password.utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Default Subscription Plans
  const plans = [
    { name: 'BASIC', price: 0.00, maxEmployees: 3, features: ['Funciones bÃ¡sicas', 'Hasta 3 empleados', 'Soporte por correo'] },
    { name: 'PRO', price: 29.99, maxEmployees: 10, features: ['Todo en BÃ¡sico', 'Hasta 10 empleados', 'Soporte prioritario', 'Reportes avanzados'] },
    { name: 'PREMIUM', price: 99.99, maxEmployees: null, features: ['Todo en Pro', 'Empleados ilimitados', 'Soporte 24/7', 'Marca blanca'] }
  ];

  const createdPlans = [];
  for (const plan of plans) {
    const created = await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: { price: plan.price, features: plan.features, maxEmployees: plan.maxEmployees } as any,
      create: {
        name: plan.name,
        price: plan.price,
        features: plan.features,
        maxEmployees: plan.maxEmployees,
      } as any
    });
    createdPlans.push(created);
    console.log(`✅ Subscription plan ensured: ${created.name}`);
  }

  const premiumPlan = createdPlans.find(p => p.name === 'PREMIUM');

  // Create default tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { subdomain: 'default' },
    update: { planId: premiumPlan?.id },
    create: {
      name: 'Peluquería Principal',
      subdomain: 'default',
      planId: premiumPlan?.id,
      isActive: true,
    },
  });
  console.log('✅ Default tenant created:', defaultTenant.name);

  // Create SuperAdmin user
  const adminPassword = await PasswordUtils.hash('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@barbershop.com' },
    update: {},
    create: {
      email: 'admin@barbershop.com',
      passwordHash: adminPassword,
      role: UserRole.SUPERADMIN,
      isActive: true,
    },
  });
  console.log('✅ SuperAdmin user created:', admin.email);

  // Create Matias admin user (Tenant Admin)
  const matiasPassword = await PasswordUtils.hash('matias123');
  const matias = await prisma.user.upsert({
    where: { email: 'matias@gmail.com' },
    update: {},
    create: {
      email: 'matias@gmail.com',
      passwordHash: matiasPassword,
      role: UserRole.ADMIN,
      isActive: true,
      tenantId: defaultTenant.id,
    },
  });
  console.log('✅ Tenant Admin user created:', matias.email);

  // Create sample employees
  const employees = [
    {
      email: 'juan@barbershop.com',
      password: 'Juan123!',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+1234567890',
      commissionRate: 50,
    },
    {
      email: 'maria@barbershop.com',
      password: 'Maria123!',
      firstName: 'María',
      lastName: 'García',
      phone: '+1234567891',
      commissionRate: 45,
    },
    {
      email: 'carlos@barbershop.com',
      password: 'Carlos123!',
      firstName: 'Carlos',
      lastName: 'López',
      phone: '+1234567892',
      commissionRate: 55,
    },
  ];

  for (const emp of employees) {
    const password = await PasswordUtils.hash(emp.password);

    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        passwordHash: password,
        role: UserRole.EMPLOYEE,
        isActive: true,
        tenantId: defaultTenant.id,
        employee: {
          create: {
            tenantId: defaultTenant.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            phone: emp.phone,
            commissionRate: emp.commissionRate,
            isActive: true,
          },
        },
      },
    });

    console.log(`✅ Employee created: ${emp.firstName} ${emp.lastName}`);
  }

  // Create sample service types
  const serviceTypes = [
    {
      name: 'Corte de Cabello',
      description: 'Corte de cabello para hombre o mujer',
      defaultPrice: 25.00,
      durationMinutes: 30,
    },
    {
      name: 'Afeitado',
      description: 'Afeitado tradicional con navaja',
      defaultPrice: 15.00,
      durationMinutes: 20,
    },
    {
      name: 'Corte y Afeitado',
      description: 'Combo de corte y afeitado',
      defaultPrice: 35.00,
      durationMinutes: 45,
    },
    {
      name: 'Tinte',
      description: 'Tinte de cabello completo',
      defaultPrice: 50.00,
      durationMinutes: 60,
    },
    {
      name: 'Tratamiento Capilar',
      description: 'Tratamiento hidratante y reparador',
      defaultPrice: 40.00,
      durationMinutes: 45,
    },
  ];

  for (const type of serviceTypes) {
    const existing = await prisma.serviceType.findFirst({
      where: { name: type.name, tenantId: defaultTenant.id },
    });

    if (existing) {
      await prisma.serviceType.update({
        where: { id: existing.id },
        data: type,
      });
      console.log(`🔄 Service type updated: ${type.name}`);
    } else {
      await prisma.serviceType.create({
        data: {
          ...type,
          tenantId: defaultTenant.id,
        },
      });
      console.log(`✅ Service type created: ${type.name}`);
    }
  }

  // Create sample service records if table is empty
  const existingServicesCount = await prisma.service.count();
  if (existingServicesCount === 0) {
    const activeEmployees = await prisma.employee.findMany({
      where: { isActive: true, tenantId: defaultTenant.id },
      orderBy: { createdAt: 'asc' },
    });

    const activeServiceTypes = await prisma.serviceType.findMany({
      where: { isActive: true, tenantId: defaultTenant.id },
      orderBy: { name: 'asc' },
    });

    const sampleClients = [
      { name: 'Pedro Ramírez', phone: '+1234567801' },
      { name: 'Luis Fernández', phone: '+1234567802' },
      { name: 'Andrés Castillo', phone: '+1234567803' },
      { name: 'Miguel Torres', phone: '+1234567804' },
      { name: 'Santiago Rojas', phone: '+1234567805' },
    ];

    for (let i = 0; i < Math.min(sampleClients.length, activeEmployees.length * 2); i++) {
      const employee = activeEmployees[i % activeEmployees.length];
      const serviceType = activeServiceTypes[i % activeServiceTypes.length];
      const basePrice = Number(serviceType.defaultPrice);
      const commissionRate = Number(employee.commissionRate);
      const commissionAmount = (basePrice * commissionRate) / 100;

      await prisma.service.create({
        data: {
          tenantId: defaultTenant.id,
          employeeId: employee.id,
          serviceTypeId: serviceType.id,
          clientName: sampleClients[i].name,
          clientPhone: sampleClients[i].phone,
          price: basePrice,
          commissionRate: commissionRate,
          commissionAmount: commissionAmount,
          serviceDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          notes: `Servicio de prueba: ${serviceType.name}`,
          createdBy: matias.id,
        },
      });
    }

    console.log('✅ Sample service records created');
  } else {
    console.log(`ℹ️ Service records already exist: ${existingServicesCount}`);
  }

  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('Login credentials:');
  console.log('  SuperAdmin (Platform): admin@barbershop.com / Admin123!');
  console.log('  Admin (Shop Owner): matias@gmail.com / matias123');
  console.log('  Employee: juan@barbershop.com / Juan123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

