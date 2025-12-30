import { prisma } from '../lib/prisma.js';

async function main() {
    console.log('Seeding Bundle Products...');

    // 1. Create specific products to bundle if they don't exist
    // We'll reuse existing ones if possible, but let's make sure we have some 'singles'

    const component1 = await prisma.product.create({
        data: {
            name: 'Khẩu trang Y tế (Lẻ)',
            code: 'KTYT-01',
            price: 25000,
            unit: 'Hộp',
            isActive: true,
            description: 'Hộp 50 cái, 4 lớp kháng khuẩn',
            manufacturer: 'VN Pharma'
        }
    }).catch(e => prisma.product.findFirst({ where: { code: 'KTYT-01' } }));

    const component2 = await prisma.product.create({
        data: {
            name: 'Nước rửa tay khô (Lẻ)',
            code: 'NRTK-100',
            price: 35000,
            unit: 'Chai',
            isActive: true,
            description: 'Chai 100ml, cồn 70 độ',
            manufacturer: 'Lifebuoy'
        }
    }).catch(e => prisma.product.findFirst({ where: { code: 'NRTK-100' } }));

    const component3 = await prisma.product.create({
        data: {
            name: 'Vitamin C Sủi (Lẻ)',
            code: 'VITC-SUI',
            price: 45000,
            unit: 'Tuýp',
            isActive: true,
            description: 'Tuýp 20 viên',
            manufacturer: 'Berocca'
        }
    }).catch(e => prisma.product.findFirst({ where: { code: 'VITC-SUI' } }));


    // 2. Create the Bundle Products

    // Bundle 1: Combo Phòng Dịch
    const bundle1 = await prisma.product.create({
        data: {
            name: '🎁 COMBO PHÒNG DỊCH AN TOÀN',
            code: 'CB-PHONGDICH',
            price: 150000, // Cheaper than sum (25*2 + 35*2 + 45 = 50+70+45 = 165k)
            unit: 'Combo',
            isActive: true,
            isCombo: true,
            description: 'Gồm: 2 Hộp khẩu trang + 2 Nước rửa tay + 1 C Sủi',
            bundleItems: {
                create: [
                    { childId: component1.id, quantity: 2 },
                    { childId: component2.id, quantity: 2 },
                    { childId: component3.id, quantity: 1 }
                ]
            }
        }
    }).catch((e) => {
        console.log('Bundle 1 might already exist or error:', e.message);
        return prisma.product.findFirst({ where: { code: 'CB-PHONGDICH' } });
    });

    // Bundle 2: Gói Khởi Nghiệp Nhà Thuốc
    const bundle2 = await prisma.product.create({
        data: {
            name: '🎁 GÓI KHỞI NGHIỆP BASIC',
            code: 'CB-STARTUP',
            price: 5000000,
            unit: 'Gói',
            isActive: true,
            isCombo: true,
            description: 'Gói hàng cơ bản cho nhà thuốc mới mở',
            bundleItems: {
                create: [
                    { childId: component1.id, quantity: 100 }, // 100 hộp khẩu trang
                    { childId: component3.id, quantity: 50 }, // 50 tuýp C
                ]
            }
        }
    }).catch((e) => {
        console.log('Bundle 2 might already exist or error:', e.message);
    });

    console.log('Seeding bundles completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
