import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.subscriptionPlan.findMany().then(plans => {
    console.log(JSON.stringify(plans, null, 2));
}).catch(console.error).finally(() => prisma.$disconnect());
