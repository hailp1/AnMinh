import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('123456', 10);

        const tdv = await prisma.user.upsert({
            where: { employeeCode: 'TDV001' },
            update: { password: hashedPassword },
            create: {
                name: 'Nguyễn Văn An',
                employeeCode: 'TDV001',
                email: 'tdv1@anminh.com',
                phone: '0900000001',
                password: hashedPassword,
                role: 'TDV',
                isActive: true,
            },
        });

        console.log('✅ Created/Updated TDV001 with password 123456');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
