
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- DB CHECK ---');
        const userCount = await prisma.user.count({ where: { role: 'TDV' } });
        const empCount = await prisma.employee.count();
        const tdvEmployees = await prisma.employee.count({ where: { user: { role: 'TDV' } } });

        console.log(`TDV Users: ${userCount}`);
        console.log(`Total Employees: ${empCount}`);
        console.log(`TDV Employees: ${tdvEmployees}`);

        if (empCount === 0) {
            console.log('NO EMPLOYEES! Need to run orgStructure init.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
