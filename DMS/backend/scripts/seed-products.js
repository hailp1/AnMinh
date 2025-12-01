import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
    { name: 'Thuốc giảm đau', description: 'Các loại thuốc giảm đau, hạ sốt' },
    { name: 'Kháng sinh', description: 'Thuốc kháng sinh, kháng khuẩn' },
    { name: 'Vitamin & Khoáng chất', description: 'Thực phẩm bổ sung vitamin' },
    { name: 'Tim mạch', description: 'Thuốc điều trị bệnh tim mạch' },
    { name: 'Tiêu hóa', description: 'Thuốc hỗ trợ tiêu hóa, dạ dày' }
];

const MANUFACTURERS = [
    'GSK', 'Sanofi', 'AstraZeneca', 'Pfizer', 'Novartis',
    'Roche', 'Bayer', 'DHG Pharma', 'Traphaco', 'Imexpharm'
];

const DRUG_NAMES = [
    'Panadol', 'Efferalgan', 'Augmentin', 'Zinnat', 'Berberin',
    'Smecta', 'Gaviscon', 'Lipitor', 'Plavix', 'Aspirin',
    'Vitamin C', 'Vitamin B12', 'Calcium D', 'Omega 3', 'Glucosamine',
    'Amoxicillin', 'Cefixime', 'Paracetamol', 'Ibuprofen', 'Omeprazole'
];

async function main() {
    console.log('💊 Bắt đầu tạo 150 sản phẩm...');

    // 1. Tạo Categories (ProductGroups)
    const groups = [];
    for (const cat of CATEGORIES) {
        let group = await prisma.productGroup.findFirst({ where: { name: cat.name } });
        if (!group) {
            group = await prisma.productGroup.create({
                data: {
                    name: cat.name,
                    description: cat.description,
                    isActive: true
                }
            });
            console.log(`Created group: ${cat.name}`);
        }
        groups.push(group);
    }

    // 2. Tạo 150 Products
    let createdCount = 0;

    for (let i = 0; i < 150; i++) {
        const group = groups[Math.floor(Math.random() * groups.length)];
        const manufacturer = MANUFACTURERS[Math.floor(Math.random() * MANUFACTURERS.length)];
        const baseName = DRUG_NAMES[Math.floor(Math.random() * DRUG_NAMES.length)];
        const strength = ['500mg', '250mg', '10mg', '5mg', '1g'][Math.floor(Math.random() * 5)];

        // Tạo tên sản phẩm độc nhất một chút
        const name = `${baseName} ${strength} (${manufacturer})`;
        const code = `SP_${String(i + 1).padStart(4, '0')}`;

        // Kiểm tra trùng code
        const existing = await prisma.product.findUnique({ where: { code } });
        if (existing) {
            console.log(`Skipping existing product: ${code}`);
            continue;
        }

        await prisma.product.create({
            data: {
                code,
                name,
                description: `Sản phẩm chính hãng từ ${manufacturer}`,
                groupId: group.id,
                unit: ['Hộp', 'Vĩ', 'Chai', 'Lọ'][Math.floor(Math.random() * 4)],
                price: Math.floor(Math.random() * 500) * 1000 + 50000, // 50k - 550k
                isActive: true
            }
        });
        createdCount++;
        if (createdCount % 20 === 0) console.log(`Created ${createdCount} products...`);
    }

    console.log(`✅ Hoàn tất! Đã tạo ${createdCount} sản phẩm.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
