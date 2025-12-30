import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- CHECKING DATA STATE ---');

    // 1. Check Users
    console.log('\n[USERS]');
    const users = await prisma.user.findMany({
        select: { id: true, username: true, employeeCode: true, role: true, isActive: true }
    });
    if (users.length === 0) console.log('(No Users Found)');
    else console.table(users);

    // 2. Check Orders (Revenue)
    console.log('\n[ORDERS]');
    const orderCount = await prisma.order.count();
    const totalRev = await prisma.order.aggregate({ _sum: { totalAmount: true } });
    console.log(`Total Orders: ${orderCount}`);
    console.log(`Total Revenue: ${totalRev._sum.totalAmount || 0}`);

    // 3. Check Visit Plans
    console.log('\n[VISIT PLANS]');
    const visitCount = await prisma.visitPlan.count();
    console.log(`Total Visits: ${visitCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
