import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const tdv = await prisma.user.findUnique({
            where: { employeeCode: 'TDV001' },
        });

        if (tdv) {
            console.log('✅ TDV found:', tdv.employeeCode, tdv.role);
        } else {
            console.log('❌ TDV NOT found');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
