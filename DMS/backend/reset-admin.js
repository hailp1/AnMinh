import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('123456', 10);

        const admin = await prisma.user.upsert({
            where: { employeeCode: 'ADMIN001' },
            update: { password: hashedPassword },
            create: {
                name: 'Administrator',
                employeeCode: 'ADMIN001',
                email: 'admin@anminh.com',
                phone: '0900000000',
                password: hashedPassword,
                role: 'ADMIN',
                isActive: true,
            },
        });

        console.log('✅ Admin password reset to 123456 for user:', admin.employeeCode);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
