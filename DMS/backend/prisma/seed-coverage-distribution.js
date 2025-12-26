// Seed Coverage & Distribution Data for Biz Review
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedCoverageDistribution() {
    console.log('🗺️  Seeding Coverage & Distribution Data...\n');

    // === CREATE REGIONS ===
    console.log('📍 Creating Regions...');

    const regions = [
        {
            code: 'MIEN_NAM',
            name: 'Miền Nam',
            description: 'Khu vực miền Nam Việt Nam',
            targetRevenue: 50000000000, // 50 tỷ
            customerCount: 500,
            territoryCount: 15
        },
        {
            code: 'MIEN_TRUNG',
            name: 'Miền Trung',
            description: 'Khu vực miền Trung Việt Nam',
            targetRevenue: 30000000000, // 30 tỷ
            customerCount: 300,
            territoryCount: 10
        },
        {
            code: 'MIEN_BAC',
            name: 'Miền Bắc',
            description: 'Khu vực miền Bắc Việt Nam',
            targetRevenue: 40000000000, // 40 tỷ
            customerCount: 400,
            territoryCount: 12
        }
    ];

    const createdRegions = {};
    for (const region of regions) {
        const created = await prisma.region.upsert({
            where: { code: region.code },
            update: region,
            create: region
        });
        createdRegions[region.code] = created;
        console.log(`  ✅ ${region.name}`);
    }

    // === CREATE TERRITORIES ===
    console.log('\n🏙️  Creating Territories...');

    const territories = [
        // Miền Nam
        { code: 'HCM_Q1', name: 'TP.HCM - Quận 1', regionId: createdRegions.MIEN_NAM.id, districts: ['Quận 1'], targetRevenue: 5000000000, customerCount: 80 },
        { code: 'HCM_Q3', name: 'TP.HCM - Quận 3', regionId: createdRegions.MIEN_NAM.id, districts: ['Quận 3'], targetRevenue: 4500000000, customerCount: 75 },
        { code: 'HCM_Q5', name: 'TP.HCM - Quận 5', regionId: createdRegions.MIEN_NAM.id, districts: ['Quận 5'], targetRevenue: 4000000000, customerCount: 70 },
        { code: 'HCM_BINH_THANH', name: 'TP.HCM - Bình Thạnh', regionId: createdRegions.MIEN_NAM.id, districts: ['Bình Thạnh'], targetRevenue: 3500000000, customerCount: 65 },
        { code: 'HCM_TAN_BINH', name: 'TP.HCM - Tân Bình', regionId: createdRegions.MIEN_NAM.id, districts: ['Tân Bình'], targetRevenue: 3800000000, customerCount: 68 },
        { code: 'BINH_DUONG', name: 'Bình Dương', regionId: createdRegions.MIEN_NAM.id, districts: ['Thủ Dầu Một', 'Dĩ An'], targetRevenue: 3000000000, customerCount: 55 },
        { code: 'DONG_NAI', name: 'Đồng Nai', regionId: createdRegions.MIEN_NAM.id, districts: ['Biên Hòa'], targetRevenue: 2800000000, customerCount: 50 },
        { code: 'CAN_THO', name: 'Cần Thơ', regionId: createdRegions.MIEN_NAM.id, districts: ['Ninh Kiều', 'Cái Răng'], targetRevenue: 2500000000, customerCount: 45 },

        // Miền Trung
        { code: 'DA_NANG', name: 'Đà Nẵng', regionId: createdRegions.MIEN_TRUNG.id, districts: ['Hải Châu', 'Thanh Khê'], targetRevenue: 4000000000, customerCount: 60 },
        { code: 'HUE', name: 'Huế', regionId: createdRegions.MIEN_TRUNG.id, districts: ['Thành phố Huế'], targetRevenue: 2500000000, customerCount: 40 },
        { code: 'QUY_NHON', name: 'Quy Nhơn', regionId: createdRegions.MIEN_TRUNG.id, districts: ['Quy Nhơn'], targetRevenue: 2000000000, customerCount: 35 },

        // Miền Bắc
        { code: 'HN_HOAN_KIEM', name: 'Hà Nội - Hoàn Kiếm', regionId: createdRegions.MIEN_BAC.id, districts: ['Hoàn Kiếm'], targetRevenue: 4500000000, customerCount: 70 },
        { code: 'HN_DONG_DA', name: 'Hà Nội - Đống Đa', regionId: createdRegions.MIEN_BAC.id, districts: ['Đống Đa'], targetRevenue: 4000000000, customerCount: 65 },
        { code: 'HN_CAU_GIAY', name: 'Hà Nội - Cầu Giấy', regionId: createdRegions.MIEN_BAC.id, districts: ['Cầu Giấy'], targetRevenue: 3800000000, customerCount: 62 },
        { code: 'HAI_PHONG', name: 'Hải Phòng', regionId: createdRegions.MIEN_BAC.id, districts: ['Hồng Bàng', 'Lê Chân'], targetRevenue: 3000000000, customerCount: 50 }
    ];

    const createdTerritories = [];
    for (const territory of territories) {
        const created = await prisma.territory.upsert({
            where: { code: territory.code },
            update: {
                ...territory,
                wards: [],
                visitDays: ['MON', 'WED', 'FRI'],
                potentialValue: territory.targetRevenue * 1.5,
                currentRevenue: territory.targetRevenue * 0.75, // 75% achievement
                activeCustomers: Math.floor(territory.customerCount * 0.8), // 80% active
                coverageRate: 75.0
            },
            create: {
                ...territory,
                wards: [],
                visitDays: ['MON', 'WED', 'FRI'],
                potentialValue: territory.targetRevenue * 1.5,
                currentRevenue: territory.targetRevenue * 0.75,
                activeCustomers: Math.floor(territory.customerCount * 0.8),
                coverageRate: 75.0
            }
        });
        createdTerritories.push(created);
        console.log(`  ✅ ${territory.name}`);
    }

    // === UPDATE PHARMACIES WITH TERRITORIES ===
    console.log('\n🏪 Updating Pharmacies with Territories...');

    const pharmacies = await prisma.pharmacy.findMany({
        take: 500,
        where: { isActive: true }
    });

    let updatedCount = 0;
    for (const pharmacy of pharmacies) {
        // Assign random territory
        const territory = createdTerritories[Math.floor(Math.random() * createdTerritories.length)];

        // Set status based on random
        const rand = Math.random();
        let status = 'ACTIVE';
        if (rand < 0.1) status = 'INACTIVE'; // 10% inactive
        else if (rand < 0.15) status = 'PROSPECT'; // 5% prospect

        // Set segment
        const segmentRand = Math.random();
        let segment = 'C';
        if (segmentRand < 0.1) segment = 'A'; // 10% A
        else if (segmentRand < 0.3) segment = 'B'; // 20% B
        else if (segmentRand < 0.7) segment = 'C'; // 40% C
        else segment = 'D'; // 30% D

        await prisma.pharmacy.update({
            where: { id: pharmacy.id },
            data: {
                territoryId: territory.id,
                status,
                segment,
                tier: segment === 'A' ? 'VIP' : segment === 'B' ? 'GOLD' : 'STANDARD',
                visitFrequency: segment === 'A' ? 2 : 1, // A customers: 2 visits/week
                lastVisitDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
                lastOrderDate: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) // Last 15 days
            }
        });

        updatedCount++;
        if (updatedCount % 50 === 0) {
            console.log(`  ✅ Updated ${updatedCount}/${pharmacies.length} pharmacies...`);
        }
    }

    // === UPDATE REGION METRICS ===
    console.log('\n📊 Calculating Region Metrics...');

    for (const regionCode of Object.keys(createdRegions)) {
        const region = createdRegions[regionCode];

        // Count pharmacies in this region
        const pharmacyCount = await prisma.pharmacy.count({
            where: {
                territory: {
                    regionId: region.id
                },
                isActive: true
            }
        });

        // Count active pharmacies
        const activeCount = await prisma.pharmacy.count({
            where: {
                territory: {
                    regionId: region.id
                },
                status: 'ACTIVE'
            }
        });

        // Get total revenue from orders
        const orders = await prisma.order.findMany({
            where: {
                pharmacy: {
                    territory: {
                        regionId: region.id
                    }
                },
                createdAt: {
                    gte: new Date('2024-01-01')
                }
            },
            select: {
                totalAmount: true
            }
        });

        const currentRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        await prisma.region.update({
            where: { id: region.id },
            data: {
                customerCount: pharmacyCount,
                currentRevenue
            }
        });

        console.log(`  ✅ ${region.name}: ${pharmacyCount} customers, ${activeCount} active, ${(currentRevenue / 1000000).toFixed(0)}M revenue`);
    }

    console.log('\n========================================');
    console.log('✅ Coverage & Distribution Data Seeded!');
    console.log('========================================');
    console.log(`📍 Regions: ${Object.keys(createdRegions).length}`);
    console.log(`🏙️  Territories: ${createdTerritories.length}`);
    console.log(`🏪 Pharmacies Updated: ${updatedCount}`);
    console.log('========================================');
    console.log('\n📊 Coverage Metrics:');
    console.log('  - Total Territories: 15');
    console.log('  - Coverage Rate: ~75%');
    console.log('  - Active Rate: ~80%');
    console.log('  - Segment A: ~10%');
    console.log('  - Segment B: ~20%');
    console.log('  - Segment C: ~40%');
    console.log('  - Segment D: ~30%');
    console.log('\n🎯 Data ready for Biz Review - Coverage & Distribution tab!');
}

async function main() {
    try {
        await seedCoverageDistribution();
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
