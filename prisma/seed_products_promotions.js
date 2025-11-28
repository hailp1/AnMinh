import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding products and promotions...');

    // 1. Create Product Group
    let group = await prisma.productGroup.findFirst({
        where: { name: 'Nhóm Thuốc Mẫu' }
    });

    if (!group) {
        group = await prisma.productGroup.create({
            data: {
                name: 'Nhóm Thuốc Mẫu',
                description: 'Nhóm thuốc tạo tự động cho demo',
                order: 1
            }
        });
        console.log('Created Product Group:', group.id);
    } else {
        console.log('Found Product Group:', group.id);
    }

    // 2. Create 60 Products
    const products = [];
    for (let i = 1; i <= 60; i++) {
        const code = `SKU${String(i).padStart(3, '0')}`;
        const existingProduct = await prisma.product.findUnique({
            where: { code }
        });

        if (!existingProduct) {
            const product = await prisma.product.create({
                data: {
                    name: `Thuốc mẫu ${i} - Điều trị bệnh lý`,
                    code: code,
                    description: `Mô tả cho thuốc mẫu ${i}`,
                    groupId: group.id,
                    unit: 'Hộp',
                    price: 50000 + (i * 1000), // Different prices
                    isActive: true
                }
            });
            products.push(product);
        } else {
            products.push(existingProduct);
        }
    }
    console.log(`Seeded ${products.length} products.`);

    // 3. Create Promotions
    // Promotion 1: Mua 10 tặng 1 (BUY_X_GET_Y)
    const promo1Code = 'PROMO_10_1';
    let promo1 = await prisma.promotion.findUnique({ where: { code: promo1Code } });
    if (!promo1) {
        promo1 = await prisma.promotion.create({
            data: {
                code: promo1Code,
                name: 'Mua 10 tặng 1 (Thuốc mẫu 1)',
                type: 'BUY_X_GET_Y',
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                applicableTo: 'ALL',
                isActive: true,
                items: {
                    create: {
                        productId: products[0].id, // Thuốc mẫu 1
                        quantity: 10,
                        discountValue: 1 // Tặng 1
                    }
                }
            }
        });
        console.log('Created Promotion 1:', promo1.code);
    }

    // Promotion 2: Chiết khấu 2% (DISCOUNT)
    const promo2Code = 'PROMO_DISCOUNT_2';
    let promo2 = await prisma.promotion.findUnique({ where: { code: promo2Code } });
    if (!promo2) {
        promo2 = await prisma.promotion.create({
            data: {
                code: promo2Code,
                name: 'Chiết khấu thanh toán 2%',
                type: 'DISCOUNT',
                discountType: 'PERCENTAGE',
                discountValue: 2,
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                applicableTo: 'ALL',
                isActive: true
            }
        });
        console.log('Created Promotion 2:', promo2.code);
    }

    // 4. Create a Demo Pharmacy
    const pharmacyCode = 'PHARM_DEMO_01';
    let pharmacy = await prisma.pharmacy.findUnique({ where: { code: pharmacyCode } });
    if (!pharmacy) {
        pharmacy = await prisma.pharmacy.create({
            data: {
                code: pharmacyCode,
                name: 'Nhà thuốc Demo',
                phone: '0901234567',
                address: '123 Đường Demo, Quận 1, TP.HCM',
                isActive: true
            }
        });
        console.log('Created Demo Pharmacy:', pharmacy.id);
    } else {
        console.log('Found Demo Pharmacy:', pharmacy.id);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
