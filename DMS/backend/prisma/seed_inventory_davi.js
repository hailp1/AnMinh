
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding inventory for Davi...');

    // 1. Create Warehouses
    const whDavi = await prisma.warehouse.upsert({
        where: { code: 'WH_DAVI' },
        update: {},
        create: {
            code: 'WH_DAVI',
            name: 'Kho Davi',
            type: 'BRANCH',
            address: '123 Đường Davi, Quận 1, TP.HCM',
            isActive: true
        }
    });
    console.log('Upserted Warehouse: Kho Davi');

    const whMain = await prisma.warehouse.upsert({
        where: { code: 'WH_MAIN' },
        update: {},
        create: {
            code: 'WH_MAIN',
            name: 'Kho Tổng (Central)',
            type: 'CENTRAL',
            address: 'KCN Tân Bình, TP.HCM',
            isActive: true
        }
    });

    // 2. Create Products
    const productsData = [
        { code: 'SP001', name: 'Panadol Extra', unit: 'Hộp', price: 150000 },
        { code: 'SP002', name: 'Tiffy Dey', unit: 'Vỉ', price: 5000 },
        { code: 'SP003', name: 'Efferalgan 500mg', unit: 'Tuýp', price: 65000 },
        { code: 'SP004', name: 'Berberin', unit: 'Lọ', price: 25000 },
        { code: 'SP005', name: 'Vitamin C 500mg', unit: 'Hộp', price: 80000 },
    ];

    const products = [];
    for (const p of productsData) {
        const product = await prisma.product.upsert({
            where: { code: p.code },
            update: {},
            create: {
                code: p.code,
                name: p.name,
                genericName: p.name,
                unit: p.unit,
                price: p.price,
                description: `Mô tả cho ${p.name}`,
                imageUrl: 'https://placehold.co/100x100',
                isActive: true
            }
        });
        products.push(product);
    }
    console.log(`Upserted ${products.length} products.`);

    // 3. Add Stock & Batches to Kho Davi
    for (const product of products) {
        const qty = Math.floor(Math.random() * 500) + 50;
        const batchNo = `LOT${new Date().getFullYear()}${Math.floor(Math.random() * 1000)}`;

        const whId = whDavi.id; // Use Davi

        await prisma.inventoryItem.upsert({
            where: {
                productId_warehouseId: {
                    productId: product.id,
                    warehouseId: whId
                }
            },
            update: {
                currentQty: qty,
                lastUpdated: new Date()
            },
            create: {
                productId: product.id,
                warehouseId: whId,
                currentQty: qty,
                beginningQty: 0,
                receivedQty: qty,
                issuedQty: 0
            }
        });

        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + Math.floor(Math.random() * 24));

        await prisma.productBatch.upsert({
            where: {
                productId_batchNumber: {
                    productId: product.id,
                    batchNumber: batchNo
                }
            },
            update: {
                currentQuantity: qty,
                warehouseId: whId
            },
            create: {
                productId: product.id,
                batchNumber: batchNo,
                expiryDate: expiry,
                initialQuantity: qty,
                currentQuantity: qty,
                warehouseId: whId,
                status: 'ACTIVE'
            }
        });

        // C. Transaction History (Import)
        const txNo = `IMP-${Date.now()}-${product.code}`;
        const exists = await prisma.inventoryTransaction.findFirst({
            where: { productId: product.id, type: 'IMPORT', warehouseId: whId }
        });
        if (!exists) {
            await prisma.inventoryTransaction.create({
                data: {
                    type: 'IMPORT',
                    transactionNo: txNo,
                    productId: product.id,
                    warehouseId: whId,
                    quantity: qty,
                    unitPrice: product.price * 0.8,
                    totalAmount: qty * (product.price * 0.8),
                    batchNumber: batchNo,
                    reason: 'Nhập hàng đầu kỳ',
                    transactionDate: new Date()
                }
            });
        }
    }

    console.log('Stock and Batches seeded for Davi.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
