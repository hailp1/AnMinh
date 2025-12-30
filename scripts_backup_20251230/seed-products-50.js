import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCT_GROUPS = [
    { name: 'Thuốc giảm đau', description: 'Các loại thuốc giảm đau, hạ sốt' },
    { name: 'Kháng sinh', description: 'Thuốc kháng sinh các loại' },
    { name: 'Vitamin & Khoáng chất', description: 'Thực phẩm bổ sung vitamin' },
    { name: 'Tiêu hóa', description: 'Thuốc hỗ trợ tiêu hóa' },
    { name: 'Tim mạch', description: 'Thuốc tim mạch, huyết áp' }
];

const PRODUCTS = [
    { name: 'Paracetamol 500mg', code: 'PARA500', unit: 'Hộp', price: 25000, groupIndex: 0 },
    { name: 'Ibuprofen 400mg', code: 'IBU400', unit: 'Hộp', price: 45000, groupIndex: 0 },
    { name: 'Aspirin 81mg', code: 'ASP81', unit: 'Hộp', price: 30000, groupIndex: 0 },
    { name: 'Panadol Extra', code: 'PANEX', unit: 'Hộp', price: 35000, groupIndex: 0 },
    { name: 'Efferalgan 500mg', code: 'EFF500', unit: 'Tuýp', price: 50000, groupIndex: 0 },

    { name: 'Amoxicillin 500mg', code: 'AMOX500', unit: 'Hộp', price: 60000, groupIndex: 1 },
    { name: 'Cephalexin 500mg', code: 'CEPH500', unit: 'Hộp', price: 75000, groupIndex: 1 },
    { name: 'Augmentin 625mg', code: 'AUG625', unit: 'Hộp', price: 120000, groupIndex: 1 },
    { name: 'Azithromycin 500mg', code: 'AZI500', unit: 'Hộp', price: 85000, groupIndex: 1 },
    { name: 'Cefuroxime 500mg', code: 'CEFU500', unit: 'Hộp', price: 95000, groupIndex: 1 },

    { name: 'Vitamin C 500mg', code: 'VITC500', unit: 'Lọ', price: 40000, groupIndex: 2 },
    { name: 'Vitamin B Complex', code: 'VITBCOM', unit: 'Hộp', price: 55000, groupIndex: 2 },
    { name: 'MultiVitamin', code: 'MULTI', unit: 'Lọ', price: 150000, groupIndex: 2 },
    { name: 'Calcium + D3', code: 'CALD3', unit: 'Lọ', price: 120000, groupIndex: 2 },
    { name: 'Iron Melts', code: 'IRON', unit: 'Hộp', price: 180000, groupIndex: 2 },

    { name: 'Berberin', code: 'BERB', unit: 'Lọ', price: 15000, groupIndex: 3 },
    { name: 'Smecta', code: 'SMEC', unit: 'Hộp', price: 45000, groupIndex: 3 },
    { name: 'Oresol', code: 'ORE', unit: 'Hộp', price: 20000, groupIndex: 3 },
    { name: 'Men vi sinh Enterogermina', code: 'ENTERO', unit: 'Hộp', price: 160000, groupIndex: 3 },
    { name: 'Gaviscon', code: 'GAVIS', unit: 'Hộp', price: 140000, groupIndex: 3 },

    { name: 'Amlodipin 5mg', code: 'AMLO5', unit: 'Hộp', price: 35000, groupIndex: 4 },
    { name: 'Losartan 50mg', code: 'LOS50', unit: 'Hộp', price: 55000, groupIndex: 4 },
    { name: 'Atorvastatin 10mg', code: 'ATOR10', unit: 'Hộp', price: 80000, groupIndex: 4 },
    { name: 'Concor 2.5mg', code: 'CON25', unit: 'Hộp', price: 110000, groupIndex: 4 },
    { name: 'Plavix 75mg', code: 'PLA75', unit: 'Hộp', price: 250000, groupIndex: 4 }
];

// Generate more to reach 50
for (let i = 0; i < 30; i++) {
    const groupIndex = Math.floor(Math.random() * 5);
    PRODUCTS.push({
        name: `Sản phẩm mẫu ${i + 1}`,
        code: `SPM${String(i + 1).padStart(3, '0')}`,
        unit: 'Hộp',
        price: Math.floor(Math.random() * 200000) + 10000,
        groupIndex
    });
}

async function main() {
    console.log('🚀 Bắt đầu tạo dữ liệu sản phẩm...\n');

    // 1. Create Product Groups
    const groups = [];
    for (const g of PRODUCT_GROUPS) {
        let group = await prisma.productGroup.findFirst({
            where: { name: g.name }
        });

        if (!group) {
            group = await prisma.productGroup.create({
                data: {
                    name: g.name,
                    description: g.description,
                    isActive: true
                }
            });
            console.log(`✅ Đã tạo nhóm: ${group.name}`);
        } else {
            console.log(`ℹ️ Nhóm đã tồn tại: ${group.name}`);
        }
        groups.push(group);
    }

    // 2. Create Products
    console.log('\n📦 Đang tạo sản phẩm...');
    for (const p of PRODUCTS) {
        const group = groups[p.groupIndex];
        await prisma.product.upsert({
            where: { code: p.code },
            update: {
                name: p.name,
                price: p.price,
                unit: p.unit,
                groupId: group.id
            },
            create: {
                name: p.name,
                code: p.code,
                price: p.price,
                unit: p.unit,
                groupId: group.id,
                description: `Mô tả cho ${p.name}`,
                isActive: true
            }
        });
    }
    console.log(`✅ Đã tạo/cập nhật ${PRODUCTS.length} sản phẩm.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
