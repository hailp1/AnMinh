import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ADVANCED SEEDING START ---');

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('123456', salt);

    // Ensure TDV user exists
    const tdv = await prisma.user.upsert({
        where: { employeeCode: 'TDV001' },
        update: {},
        create: {
            employeeCode: 'TDV001', name: 'Nguyen Van A', role: 'TDV', username: 'tdv1', password: pass
        }
    });
    console.log('User TDV001 ready');

    // 1. CREATE REGIONS & TERRITORIES
    console.log('Creating Regions...');
    const regionsData = [
        { name: 'Miền Bắc', code: 'MIEN_BAC' },
        { name: 'Miền Trung', code: 'MIEN_TRUNG' },
        { name: 'Miền Nam', code: 'MIEN_NAM' }
    ];

    for (const r of regionsData) {
        let region = await prisma.region.findFirst({ where: { code: r.code } });
        if (!region) {
            region = await prisma.region.create({
                data: {
                    name: r.name,
                    code: r.code,
                    territories: {
                        create: [
                            { name: `Khu vực ${r.name} 1`, code: `KV_${r.code}_1` },
                            { name: `Khu vực ${r.name} 2`, code: `KV_${r.code}_2` }
                        ]
                    }
                }
            });
            console.log(`Created region: ${r.name}`);
        }
    }

    // 2. CREATE PRODUCT GROUPS & PRODUCTS
    console.log('Creating Product Groups & Products...');
    const groupsData = [
        { name: 'Kháng sinh', code: 'KS' },
        { name: 'Tim mạch', code: 'TM' },
        { name: 'Vitamin & Khoáng chất', code: 'VT' },
        { name: 'Giảm đau & Hạ sốt', code: 'GD' }
    ];

    for (const gData of groupsData) {
        let group = await prisma.productGroup.findFirst({ where: { code: gData.code } });
        if (!group) {
            group = await prisma.productGroup.create({
                data: { name: gData.name, code: gData.code }
            });
            console.log(`Created group: ${gData.name}`);
        }

        // Create 5 products per group
        for (let i = 1; i <= 5; i++) {
            const productCode = `${gData.code}00${i}`;
            let product = await prisma.product.findFirst({ where: { code: productCode } });
            if (!product) {
                await prisma.product.create({
                    data: {
                        name: `${gData.name} Pro ${i}`,
                        code: productCode,
                        price: (Math.floor(Math.random() * 50) + 10) * 10000,
                        groupId: group.id,
                        unit: 'Hộp',
                        minStock: 50
                    }
                });
            }
        }
    }
    console.log('Products created');

    // 3. CREATE PHARMACIES
    console.log('Creating Pharmacies...');
    const allTerritories = await prisma.territory.findMany({ include: { region: true } });

    for (const territory of allTerritories) {
        for (let i = 1; i <= 3; i++) {
            const pharmCode = `NT_${territory.code}_${i}`;
            let pharmacy = await prisma.pharmacy.findFirst({ where: { code: pharmCode } });
            if (!pharmacy) {
                await prisma.pharmacy.create({
                    data: {
                        name: `Nhà thuốc ${territory.name} ${i}`,
                        code: pharmCode,
                        address: `${territory.name}, ${territory.region.name}`,
                        territoryId: territory.id
                    }
                });
            }
        }
    }
    console.log('Pharmacies created');

    // 4. GENERATE ORDERS (if few exist)
    const orderCount = await prisma.order.count();
    if (orderCount < 50) {
        console.log('Generating Orders...');
        const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
        const allPharmacies = await prisma.pharmacy.findMany();
        const allProducts = await prisma.product.findMany();

        if (allPharmacies.length > 0 && allProducts.length > 0) {
            for (let i = 0; i < 100; i++) {
                const randPharm = allPharmacies[Math.floor(Math.random() * allPharmacies.length)];
                const randStatus = statuses[Math.floor(Math.random() * statuses.length)];
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Last 6 months

                const order = await prisma.order.create({
                    data: {
                        orderNumber: `ORD-${Date.now()}-${i}`,
                        userId: tdv.id,
                        pharmacyId: randPharm.id,
                        status: randStatus,
                        totalAmount: 0,
                        createdAt: date,
                        updatedAt: date
                    }
                });

                let total = 0;
                const itemCount = Math.floor(Math.random() * 5) + 1;
                for (let j = 0; j < itemCount; j++) {
                    const randProd = allProducts[Math.floor(Math.random() * allProducts.length)];
                    const qty = Math.floor(Math.random() * 20) + 1;
                    const sub = (randProd.price || 100000) * qty;

                    await prisma.orderItem.create({
                        data: {
                            orderId: order.id,
                            productId: randProd.id,
                            quantity: qty,
                            price: randProd.price || 100000,
                            subtotal: sub
                        }
                    });
                    total += sub;
                }

                await prisma.order.update({
                    where: { id: order.id },
                    data: { totalAmount: total }
                });
            }
            console.log('Generated 100 orders');
        }
    } else {
        console.log(`Skipping order generation (${orderCount} orders exist)`);
    }

    // 5. INVENTORY
    console.log('Ensuring Inventory...');
    let warehouse = await prisma.warehouse.findFirst({ where: { code: 'WH_MAIN' } });
    if (!warehouse) {
        warehouse = await prisma.warehouse.create({
            data: { name: 'Kho Tổng', code: 'WH_MAIN' }
        });
    }

    const allProds = await prisma.product.findMany();
    for (const p of allProds) {
        const exists = await prisma.inventoryItem.findFirst({
            where: { productId: p.id, warehouseId: warehouse.id }
        });
        if (!exists) {
            const qty = Math.floor(Math.random() * 500);
            await prisma.inventoryItem.create({
                data: {
                    productId: p.id,
                    warehouseId: warehouse.id,
                    currentQty: qty,
                    isLowStock: qty < (p.minStock || 50)
                }
            });
        }
    }

    console.log('--- SEEDING COMPLETE ---');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
