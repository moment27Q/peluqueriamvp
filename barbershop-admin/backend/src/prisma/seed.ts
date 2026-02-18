import { PrismaClient, UserRole } from '@prisma/client';
import { PasswordUtils } from '../utils/password.utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await PasswordUtils.hash('Admin123!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@barbershop.com' },
    update: {},
    create: {
      email: 'admin@barbershop.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create Matias admin user
  const matiasPassword = await PasswordUtils.hash('matias123');
  const matias = await prisma.user.upsert({
    where: { email: 'matias@gmail.com' },
    update: {},
    create: {
      email: 'matias@gmail.com',
      passwordHash: matiasPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', matias.email);

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
        employee: {
          create: {
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
      where: { name: type.name },
    });

    if (existing) {
      await prisma.serviceType.update({
        where: { id: existing.id },
        data: type,
      });
      console.log(`🔄 Service type updated: ${type.name}`);
    } else {
      await prisma.serviceType.create({
        data: type,
      });
      console.log(`✅ Service type created: ${type.name}`);
    }
  }

  // Create sample service records if table is empty
  const existingServicesCount = await prisma.service.count();
  if (existingServicesCount === 0) {
    const activeEmployees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    const activeServiceTypes = await prisma.serviceType.findMany({
      where: { isActive: true },
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
  console.log('  Admin: admin@barbershop.com / Admin123!');
  console.log('  Admin (Matias): matias@gmail.com / matias123');
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
