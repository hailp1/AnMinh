
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting FAST Demo Data Seed (V2)...');

    // 1. REGION
    console.log('Creating Region...');
    const region = await prisma.region.upsert({
        where: { code: 'SOUTH' },
        create: { code: 'SOUTH', name: 'Miền Nam' },
        update: {}
    });

    console.log('Creating BU...');
    const bu = await prisma.businessUnit.upsert({
        where: { code: 'BU_HCM' },
        create: { code: 'BU_HCM', name: 'HCM Business Unit', regionId: region.id },
        update: {}
    });

    console.log('Creating Territories...');
    const terr = await prisma.territory.upsert({
        where: { code: 'TER_Q1' },
        create: {
            code: 'TER_Q1',
            name: 'Khu vực Quận 1',
            businessUnitId: bu.id,
            regionId: region.id,
            districts: ['Q1']
        },
        update: {}
    });

    // 2. USERS
    console.log('Creating Users...');
    const password = await bcrypt.hash('123456', 10);
    const ss = await prisma.user.upsert({
        where: { employeeCode: 'SS001' },
        update: {},
        create: {
            employeeCode: 'SS001',
            username: 'SS001',
            name: 'Nguyễn Văn Quản Lý',
            role: 'MANAGER',
            password
        }
    });

    const tdv = await prisma.user.upsert({
        where: { employeeCode: 'TDV001' },
        update: {},
        create: {
            employeeCode: 'TDV001',
            username: 'TDV001', // Ensure username is provided as it might be required
            name: 'Trình Dược Viên 1',
            role: 'TDV',
            password,
            managerId: ss.id
        }
    });

    // 3. PRODUCT
    console.log('Creating Product...');
    const prod = await prisma.product.upsert({
        where: { code: 'PROD001' },
        update: {},
        create: {
            code: 'PROD001',
            name: 'Thuốc Demo 1',
            price: 150000,
            unit: 'Hộp',
            packingSpec: 'Hộp 10 vỉ', // spec
            manufacturer: 'AM Pharma',
            countryOfOrigin: 'VN',
            isActive: true
        }
    });

    // 4. CUSTOMER
    console.log('Creating Customer...');
    const cust = await prisma.pharmacy.upsert({
        where: { code: 'KH0001' },
        update: {},
        create: {
            code: 'KH0001',
            name: 'Nhà Thuốc Demo 1',
            territoryId: terr.id,
            latitude: 10.7769,
            longitude: 106.7009
        }
    });

    // 5. ASSIGN
    console.log('Assigning...');
    await prisma.customerAssignment.create({
        data: {
            userId: tdv.id,
            pharmacyId: cust.id,
            territoryId: terr.id,
            isActive: true
        }
    });

    // 6. VISIT PLAN
    console.log('Creating Visit Plan...');
    // Create for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await prisma.visitPlan.create({
        data: {
            userId: tdv.id,
            pharmacyId: cust.id,
            territoryId: terr.id,
            visitDate: tomorrow,
            status: 'PLANNED',
            dayOfWeek: tomorrow.getDay()
        }
    });

    // 7. ORDER (Minimal)
    console.log('Creating Order...');
    const order = await prisma.order.create({
        data: {
            orderNumber: `ORD-${Date.now()}`,
            userId: tdv.id,
            pharmacyId: cust.id,
            status: 'COMPLETED',
            totalAmount: 150000,
            createdAt: new Date(),
            items: {
                create: [{
                    productId: prod.id,
                    quantity: 1,
                    price: 150000,
                    subtotal: 150000
                }]
            }
        }
    });

    console.log('✅ Fast Seed Completed Successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
