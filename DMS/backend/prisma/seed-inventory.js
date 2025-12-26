// Seed Inventory & Product Batches for BizReview
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedInventoryData() {
    console.log('📦 Seeding Inventory & Product Batches...\n');

    // Get warehouses
    let warehouses = await prisma.warehouse.findMany();

    if (warehouses.length === 0) {
        console.log('Creating default warehouses...');
        warehouses = await Promise.all([
            prisma.warehouse.create({
                data: {
                    code: 'WH-HCM-001',
                    name: 'Kho Tổng HCM',
                    type: 'MAIN',
                    address: '123 Nguyễn Văn Linh, Q7',
                    province: 'TP.HCM',
                    district: 'Quận 7',
                    phone: '0283 123 4567',
                    isActive: true
                }
            }),
            prisma.warehouse.create({
                data: {
                    code: 'WH-HN-001',
                    name: 'Kho Chi Nhánh Hà Nội',
                    type: 'BRANCH',
                    address: '456 Giải Phóng, Hai Bà Trưng',
                    province: 'Hà Nội',
                    district: 'Hai Bà Trưng',
                    phone: '024 987 6543',
                    isActive: true
                }
            }),
            prisma.warehouse.create({
                data: {
                    code: 'WH-DN-001',
                    name: 'Kho Chi Nhánh Đà Nẵng',
                    type: 'BRANCH',
                    address: '789 Lê Duẩn, Hải Châu',
                    province: 'Đà Nẵng',
                    district: 'Hải Châu',
                    phone: '0236 555 6789',
                    isActive: true
                }
            })
        ]);
        console.log(`✅ Created ${warehouses.length} warehouses\n`);
    }

    // Get all products
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { category: true }
    });

    console.log(`📊 Found ${products.length} products\n`);

    let inventoryCount = 0;
    let batchCount = 0;

    // Create inventory items and batches for each product in each warehouse
    for (const warehouse of warehouses) {
        console.log(`\n🏭 Processing ${warehouse.name}...`);

        for (const product of products) {
            // Random stock quantity based on warehouse type
            const baseQty = warehouse.type === 'MAIN' ? 500 : 200;
            const currentQty = Math.floor(baseQty + Math.random() * baseQty);
            const receivedQty = Math.floor(currentQty * 1.2);
            const issuedQty = receivedQty - currentQty;

            // Calculate average cost
            const avgCostPrice = product.costPrice || product.price * 0.7;
            const totalValue = currentQty * avgCostPrice;

            // Check stock levels
            const isLowStock = currentQty < (product.minStock || 50);
            const isOverStock = currentQty > (product.maxStock || 1000);

            try {
                // Create or update inventory item
                const inventoryItem = await prisma.inventoryItem.upsert({
                    where: {
                        productId_warehouseId: {
                            productId: product.id,
                            warehouseId: warehouse.id
                        }
                    },
                    update: {
                        currentQty,
                        receivedQty,
                        issuedQty,
                        avgCostPrice,
                        totalValue,
                        isLowStock,
                        isOverStock,
                        lastUpdated: new Date()
                    },
                    create: {
                        productId: product.id,
                        warehouseId: warehouse.id,
                        beginningQty: 0,
                        currentQty,
                        receivedQty,
                        issuedQty,
                        avgCostPrice,
                        totalValue,
                        isLowStock,
                        isOverStock
                    }
                });

                inventoryCount++;

                // Create 2-3 batches per product with different expiry dates
                const batchesPerProduct = Math.floor(Math.random() * 2) + 2; // 2-3 batches

                for (let i = 0; i < batchesPerProduct; i++) {
                    const batchQty = Math.floor(currentQty / batchesPerProduct);

                    // Expiry dates: some near, some far
                    let monthsToExpiry;
                    if (i === 0 && Math.random() < 0.1) {
                        monthsToExpiry = 2; // 10% chance of near expiry (< 3 months)
                    } else if (i === 1 && Math.random() < 0.2) {
                        monthsToExpiry = 4; // 20% chance of 3-6 months
                    } else {
                        monthsToExpiry = 12 + Math.floor(Math.random() * 24); // 12-36 months
                    }

                    const expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + monthsToExpiry);

                    const manufacturingDate = new Date();
                    manufacturingDate.setMonth(manufacturingDate.getMonth() - 6);

                    const batchNumber = `BATCH-${product.code}-${warehouse.code}-${String(i + 1).padStart(3, '0')}`;

                    try {
                        await prisma.productBatch.upsert({
                            where: {
                                productId_batchNumber: {
                                    productId: product.id,
                                    batchNumber
                                }
                            },
                            update: {
                                currentQuantity: batchQty,
                                expiryDate,
                                status: monthsToExpiry < 3 ? 'EXPIRING_SOON' : 'ACTIVE'
                            },
                            create: {
                                productId: product.id,
                                batchNumber,
                                expiryDate,
                                manufacturingDate,
                                initialQuantity: batchQty,
                                currentQuantity: batchQty,
                                costPrice: avgCostPrice,
                                warehouseId: warehouse.id,
                                status: monthsToExpiry < 3 ? 'EXPIRING_SOON' : 'ACTIVE'
                            }
                        });

                        batchCount++;
                    } catch (error) {
                        // Skip if batch already exists
                    }
                }

                // Update hasExpiringSoon flag
                const expiringSoonBatches = await prisma.productBatch.count({
                    where: {
                        productId: product.id,
                        warehouseId: warehouse.id,
                        expiryDate: {
                            lte: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
                        }
                    }
                });

                if (expiringSoonBatches > 0) {
                    await prisma.inventoryItem.update({
                        where: {
                            productId_warehouseId: {
                                productId: product.id,
                                warehouseId: warehouse.id
                            }
                        },
                        data: { hasExpiringSoon: true }
                    });
                }

            } catch (error) {
                console.log(`  ⚠️  Error for ${product.name}: ${error.message}`);
            }
        }

        console.log(`  ✅ Processed ${products.length} products`);
    }

    console.log('\n========================================');
    console.log('✅ Inventory Data Seeded Successfully!');
    console.log('========================================');
    console.log(`🏭 Warehouses: ${warehouses.length}`);
    console.log(`📦 Inventory Items: ${inventoryCount}`);
    console.log(`🏷️  Product Batches: ${batchCount}`);
    console.log('========================================');

    // Calculate summary stats
    const totalValue = await prisma.inventoryItem.aggregate({
        _sum: { totalValue: true }
    });

    const expiringBatches = await prisma.productBatch.count({
        where: {
            expiryDate: {
                lte: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
            },
            status: { not: 'EXPIRED' }
        }
    });

    console.log(`\n💰 Total Inventory Value: ${(totalValue._sum.totalValue / 1000000000).toFixed(2)} tỷ VND`);
    console.log(`⚠️  Batches Expiring Soon (< 6 months): ${expiringBatches}`);
}

async function main() {
    try {
        await seedInventoryData();
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
