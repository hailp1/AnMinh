import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Connection & Admin Restoration Script (Robust) ---');
    try {
        // 1. Verify Connection
        console.log('1. Testing Database Connection...');
        const count = await prisma.user.count();
        console.log(`   > Success! Found ${count} existing users.`);

        // 2. Restore/Create Admin
        console.log('2. Restoring ADMIN user...');

        const hashedPassword = await bcrypt.hash('123456', 10);
        const adminCode = 'ADMIN';
        const adminEmail = 'admin@ammedtech.com';

        // Strategy: Find by Code -> Find by Email -> Create
        let user = await prisma.user.findUnique({ where: { employeeCode: adminCode } });

        if (!user) {
            console.log(`   Admin not found by code '${adminCode}'. Checking email '${adminEmail}'...`);
            user = await prisma.user.findUnique({ where: { email: adminEmail } });
        }

        if (user) {
            console.log(`   > Found existing user (ID: ${user.id}). Updating permissions...`);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    role: 'ADMIN', // Enforce ADMIN role
                    isActive: true,
                    employeeCode: adminCode, // Enforce Code
                    username: adminCode,
                }
            });
        } else {
            console.log('   > No matching user found. Creating new ADMIN...');
            await prisma.user.create({
                data: {
                    name: 'Administrator',
                    username: adminCode,
                    employeeCode: adminCode,
                    email: adminEmail,
                    role: 'ADMIN',
                    isActive: true,
                    password: hashedPassword,
                    channel: 'OTC'
                }
            });
        }

        console.log('   > Success! Agent ADMIN is ready.');
        console.log('------------------------------------------------');
        console.log('LOGIN DETAILS:');
        console.log(`   Employee Code: ${adminCode}`);
        console.log(`   Password:      123456`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('!!! ERROR !!!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
