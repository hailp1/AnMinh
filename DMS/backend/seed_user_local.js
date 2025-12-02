import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:postgres@localhost:5432/anminh_db?schema=public',
        },
    },
});

async function main() {
    const password = await bcrypt.hash('123456', 10);

    console.log('Seeding admin user...');

    const user = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: password,
            role: 'ADMIN'
        },
        create: {
            username: 'admin',
            password: password,
            role: 'ADMIN'
        },
    });

    console.log('Admin user seeded:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
