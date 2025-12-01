const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const admin = await prisma.user.findUnique({
            where: { employeeCode: 'ADMIN001' },
        });

        if (admin) {
            console.log('✅ Admin found:', admin.employeeCode, admin.role);
        } else {
            console.log('❌ Admin NOT found');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
