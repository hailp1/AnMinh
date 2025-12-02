import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPlans() {
    const user = await prisma.user.findUnique({ where: { employeeCode: 'KA001' } });
    if (!user) {
        console.log('User KA001 not found');
        return;
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    console.log('Checking plans for KA001 on', today.toISOString());
    console.log('Range:', startOfDay.toISOString(), '-', endOfDay.toISOString());

    const plans = await prisma.visitPlan.findMany({
        where: {
            userId: user.id,
            visitDate: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: { pharmacy: true }
    });

    console.log(`Found ${plans.length} plans.`);
    plans.forEach(p => {
        console.log(`- ${p.pharmacy.name} (${p.visitDate.toISOString()})`);
    });
}

checkPlans()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
