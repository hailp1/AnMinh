const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createDrivers() {
    try {
        const password = await bcrypt.hash('123456', 10);

        const drivers = [
            {
                employeeCode: 'TX001',
                name: 'Trần Văn B',
                email: 'tx001@anminh.com',
                phone: '0901234567',
                password,
                role: 'DRIVER',
                isActive: true
            },
            {
                employeeCode: 'TX002',
                name: 'Nguyễn Văn C',
                email: 'tx002@anminh.com',
                phone: '0901234568',
                password,
                role: 'DRIVER',
                isActive: true
            },
            {
                employeeCode: 'TX003',
                name: 'Lê Văn D',
                email: 'tx003@anminh.com',
                phone: '0901234569',
                password,
                role: 'DRIVER',
                isActive: true
            }
        ];

        for (const driver of drivers) {
            const existing = await prisma.user.findUnique({
                where: { employeeCode: driver.employeeCode }
            });

            if (existing) {
                console.log(`✓ ${driver.employeeCode} already exists`);
            } else {
                await prisma.user.create({ data: driver });
                console.log(`✓ Created ${driver.employeeCode} - ${driver.name}`);
            }
        }

        // Verify
        const allDrivers = await prisma.user.findMany({
            where: { role: 'DRIVER' },
            select: { employeeCode: true, name: true, email: true, role: true, isActive: true }
        });

        console.log('\n📊 All Drivers:');
        console.table(allDrivers);

        console.log('\n✅ Driver users created successfully!');
        console.log('Login credentials: employeeCode / 123456');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDrivers();
