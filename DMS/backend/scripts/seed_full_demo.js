
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Setup connection
const prisma = new PrismaClient();

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random coordinates near HCMC
function getRandomLoc(centerLat, centerLng, radiusInKm) {
    const y0 = centerLat;
    const x0 = centerLng;
    const rd = radiusInKm / 111300;

    const u = Math.random();
    const v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    const newLat = y + y0;
    const newLng = x + x0;

    return { lat: newLat, lng: newLng };
}

async function main() {
    console.log('🚀 Starting Full Demo Data Seed (Safe Mode)...');

    // -------------------------------------------------------------
    // 2. CREATE REGIONS & TERRITORIES (Safe Mode - No Metrics)
    // -------------------------------------------------------------
    console.log('🗺️  Setting up Geographies...');
    const region = await prisma.region.upsert({
        where: { code: 'SOUTH' },
        create: {
            code: 'SOUTH',
            name: 'Miền Nam'
        },
        update: {}
    });

    const bu = await prisma.businessUnit.upsert({
        where: { code: 'BU_HCM' },
        create: {
            code: 'BU_HCM',
            name: 'HCM Business Unit',
            regionId: region.id
        },
        update: {}
    });

    const territories = [];
    const dists = ['Q1', 'Q3', 'Q5', 'Q10', 'TanBinh', 'BinhThanh'];
    for (const d of dists) {
        const t = await prisma.territory.upsert({
            where: { code: `TER_${d}` },
            create: {
                code: `TER_${d}`,
                name: `Khu vực ${d}`,
                businessUnitId: bu.id,
                regionId: region.id,
                districts: [d]
            },
            update: {}
        });
        territories.push(t);
    }

    // -------------------------------------------------------------
    // 3. CREATE USERS (SS & TDV)
    // -------------------------------------------------------------
    console.log('👥 Creating Users (SS/TDV)...');
    const password = await bcrypt.hash('123456', 10);

    const ssUser = await prisma.user.upsert({
        where: { employeeCode: 'SS001' },
        update: {},
        create: {
            employeeCode: 'SS001',
            username: 'SS001',
            name: 'Nguyễn Văn Quản Lý',
            email: 'ss001@ammedtech.com',
            password,
            role: 'MANAGER',
            isActive: true,
            channel: 'OTC',
            regionId: region.id
        }
    });

    const tdvList = [];
    for (let i = 1; i <= 5; i++) {
        const code = `TDV${i.toString().padStart(3, '0')}`;
        const tdv = await prisma.user.upsert({
            where: { employeeCode: code },
            update: { managerId: ssUser.id },
            create: {
                employeeCode: code,
                username: code,
                name: `Trình Dược Viên ${i}`,
                email: `${code.toLowerCase()}@ammedtech.com`,
                password,
                role: 'TDV',
                managerId: ssUser.id,
                isActive: true,
                channel: 'OTC',
                regionId: region.id
            }
        });
        tdvList.push(tdv);
    }

    // -------------------------------------------------------------
    // 4. CREATE PRODUCTS
    // -------------------------------------------------------------
    console.log('💊 Creating Products...');

    for (let i = 1; i <= 20; i++) {
        const code = `PROD${i.toString().padStart(3, '0')}`;
        await prisma.product.upsert({
            where: { code },
            update: { price: 100000 + (i * 5000) },
            create: {
                code,
                name: `Sản phẩm mẫu AM ${i}`,
                price: 100000 + (i * 5000),
                unit: 'Hộp',
                packingSpec: 'Hộp 3 vỉ x 10 viên',
                manufacturer: 'AM Pharma',
                countryOfOrigin: 'Vietnam',
                isActive: true,
                order: i
            }
        });
    }

    // -------------------------------------------------------------
    // 5. CREATE 500 CUSTOMERS (PHARMACIES)
    // -------------------------------------------------------------
    console.log('🏥 Creating 500 Customers...');
    const hcmCenter = { lat: 10.7769, lng: 106.7009 };
    // Create fewer customers if speed is critical, but user asked for 500.
    // Batching creations might be faster but simple loop is safer for now.

    for (let i = 1; i <= 500; i++) {
        const code = `KH${i.toString().padStart(4, '0')}`;
        const loc = getRandomLoc(hcmCenter.lat, hcmCenter.lng, 10);
        const terr = getRandom(territories);

        // Skipping advanced fields to avoid schema errors
        await prisma.pharmacy.upsert({
            where: { code },
            update: { territoryId: terr.id, latitude: loc.lat, longitude: loc.lng },
            create: {
                code,
                name: `Nhà Thuốc Demo ${i}`,
                tradeName: `Nhà Thuốc Số ${i}`,
                address: `Số ${i} Đường Demo, ${terr.name}, TP.HCM`,
                district: terr.districts[0],
                province: 'Hồ Chí Minh',
                phone: `090${Math.floor(Math.random() * 10000000)}`,
                type: 'PHARMACY',
                channel: 'OTC',
                status: 'ACTIVE',
                latitude: loc.lat,
                longitude: loc.lng,
                territoryId: terr.id,
                visitFrequency: 4
            }
        });
    }

    const allPharmacies = await prisma.pharmacy.findMany({
        where: { code: { startsWith: 'KH' } },
        take: 500
    });

    // -------------------------------------------------------------
    // 6. ASSIGN CUSTOMERS TO TDVs & CREATE ROUTES
    // -------------------------------------------------------------
    console.log('🔗 Assigning Customers & Creating Routes...');

    const chunkSize = Math.ceil(allPharmacies.length / tdvList.length);
    let visitPlanCount = 0;

    for (let i = 0; i < tdvList.length; i++) {
        const tdv = tdvList[i];
        const start = i * chunkSize;
        const end = start + chunkSize;
        const myPharmacies = allPharmacies.slice(start, end);

        for (const phar of myPharmacies) {
            try {
                // Assignment
                const existingAssign = await prisma.customerAssignment.findFirst({
                    where: { userId: tdv.id, pharmacyId: phar.id }
                });

                if (!existingAssign) {
                    await prisma.customerAssignment.create({
                        data: {
                            userId: tdv.id,
                            pharmacyId: phar.id,
                            territoryId: phar.territoryId,
                            assignedBy: 'SYSTEM',
                            isActive: true
                        }
                    });
                }

                // Route
                const dayOfWeek = Math.floor(Math.random() * 6) + 1;
                const existingRoute = await prisma.route.findFirst({
                    where: { userId: tdv.id, pharmacyId: phar.id, dayOfWeek }
                });

                if (!existingRoute) {
                    await prisma.route.create({
                        data: {
                            userId: tdv.id,
                            pharmacyId: phar.id,
                            dayOfWeek,
                            frequency: 'F4',
                            visitOrder: Math.floor(Math.random() * 10) + 1
                        }
                    });
                }

                // Visit Plan (Next 14 Days to ensure visibility)
                const today = new Date();
                const currentDay = today.getDay();
                const distance = (dayOfWeek + 7 - currentDay) % 7;
                const visitDate = new Date(today);
                visitDate.setDate(today.getDate() + distance); // Coming up soon

                const existingVP = await prisma.visitPlan.findFirst({
                    where: {
                        userId: tdv.id,
                        pharmacyId: phar.id,
                        visitDate: {
                            gte: new Date(visitDate.setHours(0, 0, 0, 0)), // Start of day
                            lt: new Date(visitDate.setHours(23, 59, 59, 999)) // End of day
                        }
                    }
                });

                if (!existingVP) {
                    await prisma.visitPlan.create({
                        data: {
                            userId: tdv.id,
                            pharmacyId: phar.id,
                            territoryId: phar.territoryId,
                            visitDate: visitDate,
                            status: 'PLANNED',
                            dayOfWeek: dayOfWeek
                        }
                    });
                    visitPlanCount++;
                }
            } catch (err) {
                if (err.code !== 'P2002') console.error('Error assigning:', err.message);
            }
        }
    }

    console.log(`✅ Assigned customers to ${tdvList.length} TDVs.`);
    console.log(`✅ Created ~${visitPlanCount} NEW visit plans.`);
    console.log('🎉 Full Demo Seed Completed!');
}

main()
    .catch(e => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
