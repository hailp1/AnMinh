import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
    return { lat: y + y0, lng: x + x0 };
}

// Helper to generate random date in November 2024
function getRandomNovemberDate() {
    const start = new Date('2024-11-01');
    const end = new Date('2024-11-30');
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log('🚀 Starting Comprehensive Demo Data Seed...');
    const password = await bcrypt.hash('123456', 10);

    // 1. REGION & TERRITORY
    console.log('🗺️  Setting up Geography...');
    const region = await prisma.region.upsert({
        where: { code: 'SOUTH' },
        create: { code: 'SOUTH', name: 'Miền Nam' },
        update: {}
    });

    const bu = await prisma.businessUnit.upsert({
        where: { code: 'BU_HCM' },
        create: { code: 'BU_HCM', name: 'HCM Business Unit', regionId: region.id },
        update: {}
    });

    const territories = [];
    const districts = ['Q1', 'Q3', 'Q5', 'Q7', 'Q10', 'TanBinh', 'BinhThanh', 'PhuNhuan', 'GoVap', 'ThuDuc'];
    for (const d of districts) {
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

    // 2. CREATE 3 SS (Sales Supervisors)
    console.log('👥 Creating 3 Sales Supervisors...');
    const ssList = [];
    for (let i = 1; i <= 3; i++) {
        const code = `SS${i.toString().padStart(3, '0')}`;
        const ss = await prisma.user.upsert({
            where: { employeeCode: code },
            update: {},
            create: {
                employeeCode: code,
                username: code,
                name: `Sales Supervisor ${i}`,
                email: `${code.toLowerCase()}@ammedtech.com`,
                password,
                role: 'SS',
                isActive: true,
                channel: 'OTC',
                regionId: region.id
            }
        });
        ssList.push(ss);
    }

    // 3. CREATE 30 TDV (10 per SS)
    console.log('👥 Creating 30 TDVs (10 per SS)...');
    const tdvList = [];
    for (let ssIndex = 0; ssIndex < ssList.length; ssIndex++) {
        const ss = ssList[ssIndex];
        for (let i = 1; i <= 10; i++) {
            const tdvNumber = (ssIndex * 10) + i;
            const code = `TDV${tdvNumber.toString().padStart(3, '0')}`;
            const tdv = await prisma.user.upsert({
                where: { employeeCode: code },
                update: { managerId: ss.id },
                create: {
                    employeeCode: code,
                    username: code,
                    name: `Trình Dược Viên ${tdvNumber}`,
                    email: `${code.toLowerCase()}@ammedtech.com`,
                    password,
                    role: 'TDV',
                    managerId: ss.id,
                    isActive: true,
                    channel: 'OTC',
                    regionId: region.id
                }
            });
            tdvList.push(tdv);
        }
    }

    // 4. CREATE 200 PRODUCTS
    console.log('💊 Creating 200 Products...');
    const productCategories = ['Kháng sinh', 'Giảm đau', 'Vitamin', 'Tiêu hóa', 'Tim mạch', 'Hô hấp', 'Da liễu', 'Thần kinh'];
    const products = [];

    for (let i = 1; i <= 200; i++) {
        const code = `PROD${i.toString().padStart(3, '0')}`;
        const category = getRandom(productCategories);
        const product = await prisma.product.upsert({
            where: { code },
            update: {},
            create: {
                code,
                name: `${category} AM ${i}`,
                price: 50000 + (Math.random() * 500000),
                unit: getRandom(['Hộp', 'Chai', 'Tuýp', 'Vỉ']),
                packingSpec: `${Math.floor(Math.random() * 5) + 1} vỉ x ${Math.floor(Math.random() * 20) + 5} viên`,
                manufacturer: getRandom(['AM Pharma', 'Traphaco', 'Domesco', 'DHG Pharma']),
                countryOfOrigin: 'Vietnam',
                isActive: true,
                minStock: 10,
                order: i
            }
        });
        products.push(product);
    }

    // 5. CREATE 100 CUSTOMERS
    console.log('🏥 Creating 100 Customers...');
    const hcmCenter = { lat: 10.7769, lng: 106.7009 };
    const customers = [];

    for (let i = 1; i <= 100; i++) {
        const code = `KH${i.toString().padStart(4, '0')}`;
        const loc = getRandomLoc(hcmCenter.lat, hcmCenter.lng, 15);
        const terr = getRandom(territories);

        const customer = await prisma.pharmacy.upsert({
            where: { code },
            update: {},
            create: {
                code,
                name: `Nhà Thuốc ${i}`,
                address: `${i} Đường ${getRandom(['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng'])}, ${terr.name}`,
                district: terr.districts[0],
                province: 'Hồ Chí Minh',
                phone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
                type: 'PHARMACY',
                channel: 'OTC',
                status: 'ACTIVE',
                latitude: loc.lat,
                longitude: loc.lng,
                territoryId: terr.id,
                visitFrequency: Math.floor(Math.random() * 3) + 2
            }
        });
        customers.push(customer);
    }

    // 6. ASSIGN CUSTOMERS TO TDVs
    console.log('🔗 Assigning Customers to TDVs...');
    const customersPerTDV = Math.floor(customers.length / tdvList.length);

    for (let i = 0; i < tdvList.length; i++) {
        const tdv = tdvList[i];
        const start = i * customersPerTDV;
        const end = (i === tdvList.length - 1) ? customers.length : start + customersPerTDV;
        const myCustomers = customers.slice(start, end);

        for (const customer of myCustomers) {
            const existing = await prisma.customerAssignment.findFirst({
                where: {
                    userId: tdv.id,
                    pharmacyId: customer.id
                }
            });

            if (!existing) {
                await prisma.customerAssignment.create({
                    data: {
                        userId: tdv.id,
                        pharmacyId: customer.id,
                        territoryId: customer.territoryId,
                        assignedBy: 'SYSTEM',
                        isActive: true
                    }
                });
            }
        }
    }

    // 7. CREATE 200 ORDERS IN NOVEMBER 2024
    console.log('📦 Creating 200 Orders in November 2024...');

    for (let i = 1; i <= 200; i++) {
        const tdv = getRandom(tdvList);
        const customer = getRandom(customers);
        const orderDate = getRandomNovemberDate();
        const orderNumber = `ORD-2024-11-${i.toString().padStart(4, '0')}`;

        // Random 1-5 items per order
        const itemCount = Math.floor(Math.random() * 5) + 1;
        const orderItems = [];
        let totalAmount = 0;

        for (let j = 0; j < itemCount; j++) {
            const product = getRandom(products);
            const quantity = Math.floor(Math.random() * 10) + 1;
            const price = product.price;
            const subtotal = price * quantity;
            totalAmount += subtotal;

            orderItems.push({
                productId: product.id,
                quantity,
                price,
                subtotal
            });
        }

        await prisma.order.create({
            data: {
                orderNumber,
                userId: tdv.id,
                pharmacyId: customer.id,
                status: getRandom(['COMPLETED', 'CONFIRMED', 'DELIVERED']),
                totalAmount,
                paymentStatus: 'PAID',
                paymentMethod: getRandom(['CASH', 'TRANSFER', 'COD']),
                deliveryDate: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000),
                createdAt: orderDate,
                updatedAt: orderDate,
                items: {
                    create: orderItems
                }
            }
        });
    }

    console.log('✅ Comprehensive Demo Data Seed Completed!');
    console.log(`   - 3 Sales Supervisors`);
    console.log(`   - 30 TDVs (10 per SS)`);
    console.log(`   - 200 Products`);
    console.log(`   - 100 Customers`);
    console.log(`   - 200 Orders in November 2024`);
}

main()
    .catch(e => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
