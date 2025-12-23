// November 2024 Mock Data Generator for Reports Testing
// This creates realistic data for: Orders, VisitPlans, Users, Pharmacies, Products
// Run with: node seed_november_data.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting November 2024 Data Seeding...\n');

    // 1. Create/Verify Users (TDVs & Managers)
    console.log('👥 Creating Sales Team...');

    const manager1 = await prisma.user.upsert({
        where: { employeeCode: 'MGR001' },
        update: {},
        create: {
            employeeCode: 'MGR001',
            name: 'Nguyễn Văn Thành',
            email: 'thanh.nguyen@ammedtech.com',
            password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // hashed
            role: 'MANAGER'
        }
    });

    const tdvs = [];
    const tdvNames = [
        { code: 'TDV001', name: 'Trần Minh Tuấn', area: 'HCM' },
        { code: 'TDV002', name: 'Lê Thị Hoa', area: 'HCM' },
        { code: 'TDV003', name: 'Phạm Văn Long', area: 'HN' },
        { code: 'TDV004', name: 'Hoàng Thị Mai', area: 'HN' }
    ];

    for (const tdvData of tdvNames) {
        const tdv = await prisma.user.upsert({
            where: { employeeCode: tdvData.code },
            update: {},
            create: {
                employeeCode: tdvData.code,
                name: tdvData.name,
                email: `${tdvData.code.toLowerCase()}@ammedtech.com`,
                password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
                role: 'TDV',
                managerId: manager1.id
            }
        });
        tdvs.push(tdv);
    }
    console.log(`✅ Created ${tdvs.length} TDVs\n`);

    // 2. Create Territories & Regions
    console.log('🗺️  Creating Territories...');

    const region1 = await prisma.region.upsert({
        where: { code: 'SOUTH' },
        update: {},
        create: { code: 'SOUTH', name: 'Miền Nam' }
    });

    const region2 = await prisma.region.upsert({
        where: { code: 'NORTH' },
        update: {},
        create: { code: 'NORTH', name: 'Miền Bắc' }
    });

    const bu1 = await prisma.businessUnit.upsert({
        where: { code: 'BU_HCM' },
        update: {},
        create: {
            code: 'BU_HCM',
            name: 'Khu vực TP.HCM',
            regionId: region1.id
        }
    });

    const bu2 = await prisma.businessUnit.upsert({
        where: { code: 'BU_HN' },
        update: {},
        create: {
            code: 'BU_HN',
            name: 'Khu vực Hà Nội',
            regionId: region2.id
        }
    });

    const terr1 = await prisma.territory.upsert({
        where: { code: 'Q1' },
        update: {},
        create: {
            code: 'Q1',
            name: 'Quận 1',
            businessUnitId: bu1.id,
            regionId: region1.id
        }
    });

    const terr2 = await prisma.territory.upsert({
        where: { code: 'Q3' },
        update: {},
        create: {
            code: 'Q3',
            name: 'Quận 3',
            businessUnitId: bu1.id,
            regionId: region1.id
        }
    });

    const terr3 = await prisma.territory.upsert({
        where: { code: 'CAUGIAAY' },
        update: {},
        create: {
            code: 'CAUGIAAY',
            name: 'Cầu Giấy',
            businessUnitId: bu2.id,
            regionId: region2.id
        }
    });

    console.log('✅ Created 3 territories\n');

    // 3. Create Pharmacies
    console.log('🏥 Creating Pharmacies...');

    const pharmacies = [];
    const pharmacyData = [
        { code: 'NT001', name: 'NT Phúc An', address: '123 Nguyễn Huệ, Q1, HCM', territoryId: terr1.id, phone: '0281234567' },
        { code: 'NT002', name: 'NT Bình Minh', address: '456 Lê Lợi, Q1, HCM', territoryId: terr1.id, phone: '0281234568' },
        { code: 'NT003', name: 'NT Hòa Bình', address: '789 Cách Mạng, Q3, HCM', territoryId: terr2.id, phone: '0281234569' },
        { code: 'NT004', name: 'NT Sức Khỏe', address: '321 Láng Hạ, Cầu Giấy, HN', territoryId: terr3.id, phone: '0241234567' },
        { code: 'NT005', name: 'NT Long Châu Q1', address: '111 Hai Bà Trưng, Q1, HCM', territoryId: terr1.id, phone: '0281234570' },
        { code: 'NT006', name: 'NT An Khang', address: '222 Trường Chinh, Cầu Giấy, HN', territoryId: terr3.id, phone: '0241234568' }
    ];

    for (const pharData of pharmacyData) {
        const phar = await prisma.pharmacy.upsert({
            where: { code: pharData.code },
            update: {},
            create: pharData
        });
        pharmacies.push(phar);
    }
    console.log(`✅ Created ${pharmacies.length} pharmacies\n`);

    // 4. Create Product Groups & Categories
    console.log('📦 Creating Products...');

    let group1 = await prisma.productGroup.findFirst({ where: { code: 'GRP_VITAMIN' } });
    if (!group1) {
        group1 = await prisma.productGroup.create({
            data: { code: 'GRP_VITAMIN', name: 'Vitamin & Khoáng chất' }
        });
    }

    let group2 = await prisma.productGroup.findFirst({ where: { code: 'GRP_ANTIBIO' } });
    if (!group2) {
        group2 = await prisma.productGroup.create({
            data: { code: 'GRP_ANTIBIO', name: 'Kháng sinh' }
        });
    }

    const cat1 = await prisma.category.upsert({
        where: { code: 'OTC' },
        update: {},
        create: { code: 'OTC', name: 'Thuốc không kê đơn' }
    });

    const cat2 = await prisma.category.upsert({
        where: { code: 'ETC' },
        update: {},
        create: { code: 'ETC', name: 'Thuốc kê đơn' }
    });

    const products = [];
    const productData = [
        { code: 'VIT001', name: 'Vitamin C 1000mg', groupId: group1.id, categoryId: cat1.id, price: 150000, unit: 'Hộp', vat: 10 },
        { code: 'VIT002', name: 'Vitamin D3 + K2', groupId: group1.id, categoryId: cat1.id, price: 280000, unit: 'Hộp', vat: 10 },
        { code: 'AB001', name: 'Amoxicillin 500mg', groupId: group2.id, categoryId: cat2.id, price: 45000, unit: 'Hộp', vat: 5 },
        { code: 'AB002', name: 'Azithromycin 250mg', groupId: group2.id, categoryId: cat2.id, price: 85000, unit: 'Hộp', vat: 5 },
        { code: 'VIT003', name: 'Multivitamin Gold', groupId: group1.id, categoryId: cat1.id, price: 320000, unit: 'Hộp', vat: 10 },
        { code: 'AB003', name: 'Cephalexin 500mg', groupId: group2.id, categoryId: cat2.id, price: 65000, unit: 'Hộp', vat: 5 }
    ];

    for (const prodData of productData) {
        const prod = await prisma.product.upsert({
            where: { code: prodData.code },
            update: {},
            create: prodData
        });
        products.push(prod);
    }
    console.log(`✅ Created ${products.length} products\n`);

    // 5. Generate November 2024 Data
    console.log('📅 Generating November 2024 Orders & Visits...\n');

    const novemberStart = new Date('2024-11-01T00:00:00Z');
    const novemberEnd = new Date('2024-11-30T23:59:59Z');

    let orderCount = 0;
    let visitCount = 0;

    // Simulate 20 days of activity in November
    for (let day = 1; day <= 20; day++) {
        const currentDate = new Date(2024, 10, day, 9, 0, 0); // Month is 0-indexed

        // Each TDV visits 2-3 pharmacies per day
        for (const tdv of tdvs) {
            const dailyVisits = Math.floor(Math.random() * 2) + 2; // 2-3 visits

            for (let v = 0; v < dailyVisits; v++) {
                const randomPharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];

                // Create Visit Plan
                const visitStatus = Math.random() > 0.1 ? 'COMPLETED' : 'PLANNED'; // 90% completion rate
                const visit = await prisma.visitPlan.create({
                    data: {
                        userId: tdv.id,
                        pharmacyId: randomPharmacy.id,
                        territoryId: randomPharmacy.territoryId,
                        visitDate: currentDate,
                        status: visitStatus,
                        createdAt: currentDate
                    }
                });
                visitCount++;

                // 70% of completed visits result in orders
                if (visitStatus === 'COMPLETED' && Math.random() > 0.3) {
                    const itemCount = Math.floor(Math.random() * 3) + 2; // 2-4 items per order
                    let totalAmount = 0;
                    const orderItems = [];

                    for (let i = 0; i < itemCount; i++) {
                        const randomProduct = products[Math.floor(Math.random() * products.length)];
                        const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 units
                        const price = randomProduct.price;
                        const discount = Math.random() > 0.7 ? Math.floor(price * 0.05) : 0; // 30% chance of 5% discount
                        const subtotal = (price * quantity) - discount;

                        totalAmount += subtotal;
                        orderItems.push({
                            productId: randomProduct.id,
                            quantity,
                            price,
                            discount,
                            subtotal
                        });
                    }

                    // Create Order
                    const orderNumber = `ORD-${day.toString().padStart(2, '0')}${tdv.employeeCode}${orderCount}`;
                    const order = await prisma.order.create({
                        data: {
                            orderNumber,
                            userId: tdv.id,
                            pharmacyId: randomPharmacy.id,
                            status: Math.random() > 0.2 ? 'COMPLETED' : 'CONFIRMED', // 80% completed
                            totalAmount,
                            deliveryDate: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
                            paymentStatus: Math.random() > 0.3 ? 'PAID' : 'UNPAID',
                            paymentMethod: 'Tiền mặt',
                            createdAt: currentDate,
                            items: {
                                create: orderItems
                            }
                        }
                    });
                    orderCount++;
                }
            }
        }
    }

    console.log(`✅ Created ${visitCount} visit plans`);
    console.log(`✅ Created ${orderCount} orders with line items\n`);

    console.log('🎉 November 2024 Data Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${tdvs.length + 1} (${tdvs.length} TDVs + 1 Manager)`);
    console.log(`   - Pharmacies: ${pharmacies.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - November Visits: ${visitCount}`);
    console.log(`   - November Orders: ${orderCount}`);
    console.log(`\n✅ Ready to view reports for November 2024!`);
}

main()
    .catch(e => {
        console.error('❌ Seeding Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
