// Seed Realistic Products with Categories
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedProductsAndCategories() {
    console.log('💊 Seeding Realistic Products & Categories...\n');

    // === CREATE CATEGORIES ===
    console.log('📁 Creating Categories...');

    const categories = [
        {
            code: 'VITAMIN',
            name: 'Vitamin & Khoáng Chất',
            description: 'Thực phẩm chức năng bổ sung vitamin và khoáng chất',
            order: 1
        },
        {
            code: 'PAIN_RELIEF',
            name: 'Giảm Đau - Hạ Sốt',
            description: 'Thuốc giảm đau, hạ sốt, chống viêm',
            order: 2
        },
        {
            code: 'ANTIBIOTICS',
            name: 'Kháng Sinh',
            description: 'Thuốc kháng sinh điều trị nhiễm khuẩn',
            order: 3
        },
        {
            code: 'DIGESTIVE',
            name: 'Tiêu Hóa',
            description: 'Thuốc hỗ trợ tiêu hóa, men vi sinh',
            order: 4
        },
        {
            code: 'RESPIRATORY',
            name: 'Hô Hấp',
            description: 'Thuốc điều trị ho, cảm cúm, viêm đường hô hấp',
            order: 5
        },
        {
            code: 'CARDIOVASCULAR',
            name: 'Tim Mạch',
            description: 'Thuốc điều trị bệnh tim mạch, huyết áp',
            order: 6
        },
        {
            code: 'DIABETES',
            name: 'Tiểu Đường',
            description: 'Thuốc điều trị đái tháo đường',
            order: 7
        },
        {
            code: 'SKINCARE',
            name: 'Chăm Sóc Da',
            description: 'Thuốc và mỹ phẩm chăm sóc da',
            order: 8
        },
        {
            code: 'EYECARE',
            name: 'Nhãn Khoa',
            description: 'Thuốc nhỏ mắt, chăm sóc mắt',
            order: 9
        },
        {
            code: 'SUPPLEMENTS',
            name: 'Thực Phẩm Chức Năng',
            description: 'Thực phẩm bổ sung sức khỏe',
            order: 10
        }
    ];

    const createdCategories = {};
    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { code: cat.code },
            update: cat,
            create: cat
        });
        createdCategories[cat.code] = category;
        console.log(`  ✅ ${cat.name}`);
    }

    // === CREATE PRODUCTS ===
    console.log('\n💊 Creating Products...');

    const products = [
        // VITAMIN & KHOÁNG CHẤT
        {
            name: 'Vitamin C 1000mg',
            code: 'VIT-C-1000',
            genericName: 'Ascorbic Acid',
            categoryId: createdCategories.VITAMIN.id,
            manufacturer: 'DHG Pharma',
            countryOfOrigin: 'Việt Nam',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 85000,
            costPrice: 65000,
            retailPrice: 95000,
            concentration: '1000mg',
            usage: 'Uống',
            indications: 'Bổ sung vitamin C, tăng cường sức đề kháng',
            isPrescription: false
        },
        {
            name: 'Calcium + D3',
            code: 'CAL-D3-600',
            genericName: 'Calcium Carbonate + Vitamin D3',
            categoryId: createdCategories.VITAMIN.id,
            manufacturer: 'Traphaco',
            countryOfOrigin: 'Việt Nam',
            unit: 'Viên',
            packingSpec: 'Hộp 6 vỉ x 10 viên',
            price: 120000,
            costPrice: 95000,
            retailPrice: 135000,
            concentration: '600mg + 400IU',
            usage: 'Uống',
            indications: 'Bổ sung canxi, phòng loãng xương',
            isPrescription: false
        },
        {
            name: 'Omega 3 Fish Oil',
            code: 'OMEGA3-1000',
            genericName: 'Omega-3 Fatty Acids',
            categoryId: createdCategories.VITAMIN.id,
            manufacturer: 'Blackmores',
            countryOfOrigin: 'Úc',
            unit: 'Viên',
            packingSpec: 'Hộp 100 viên',
            price: 450000,
            costPrice: 380000,
            retailPrice: 495000,
            concentration: '1000mg',
            usage: 'Uống',
            indications: 'Hỗ trợ tim mạch, não bộ',
            isPrescription: false
        },
        {
            name: 'Multivitamin Tổng Hợp',
            code: 'MULTI-VIT-DAILY',
            genericName: 'Multivitamins & Minerals',
            categoryId: createdCategories.VITAMIN.id,
            manufacturer: 'Centrum',
            countryOfOrigin: 'Mỹ',
            unit: 'Viên',
            packingSpec: 'Hộp 60 viên',
            price: 380000,
            costPrice: 320000,
            retailPrice: 420000,
            usage: 'Uống',
            indications: 'Bổ sung vitamin và khoáng chất hàng ngày',
            isPrescription: false
        },

        // GIẢM ĐAU - HẠ SỐT
        {
            name: 'Paracetamol 500mg',
            code: 'PARA-500',
            genericName: 'Paracetamol',
            categoryId: createdCategories.PAIN_RELIEF.id,
            manufacturer: 'Hasan Pharma',
            countryOfOrigin: 'Việt Nam',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 25000,
            costPrice: 18000,
            retailPrice: 30000,
            concentration: '500mg',
            usage: 'Uống',
            indications: 'Giảm đau, hạ sốt',
            isPrescription: false
        },
        {
            name: 'Efferalgan 500mg',
            code: 'EFFE-500',
            genericName: 'Paracetamol',
            categoryId: createdCategories.PAIN_RELIEF.id,
            manufacturer: 'Sanofi',
            countryOfOrigin: 'Pháp',
            unit: 'Viên',
            packingSpec: 'Hộp 4 vỉ x 4 viên',
            price: 45000,
            costPrice: 35000,
            retailPrice: 52000,
            concentration: '500mg',
            usage: 'Uống',
            indications: 'Giảm đau, hạ sốt',
            isPrescription: false
        },
        {
            name: 'Ibuprofen 400mg',
            code: 'IBU-400',
            genericName: 'Ibuprofen',
            categoryId: createdCategories.PAIN_RELIEF.id,
            manufacturer: 'Pymepharco',
            countryOfOrigin: 'Việt Nam',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 55000,
            costPrice: 42000,
            retailPrice: 65000,
            concentration: '400mg',
            usage: 'Uống',
            indications: 'Giảm đau, chống viêm',
            isPrescription: false
        },

        // KHÁNG SINH
        {
            name: 'Amoxicillin 500mg',
            code: 'AMOX-500',
            genericName: 'Amoxicillin',
            categoryId: createdCategories.ANTIBIOTICS.id,
            manufacturer: 'Imexpharm',
            countryOfOrigin: 'Việt Nam',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 45000,
            costPrice: 35000,
            retailPrice: 52000,
            concentration: '500mg',
            usage: 'Uống',
            indications: 'Điều trị nhiễm khuẩn',
            isPrescription: true
        },
        {
            name: 'Augmentin 625mg',
            code: 'AUG-625',
            genericName: 'Amoxicillin + Clavulanic Acid',
            categoryId: createdCategories.ANTIBIOTICS.id,
            manufacturer: 'GSK',
            countryOfOrigin: 'Anh',
            unit: 'Viên',
            packingSpec: 'Hộp 2 vỉ x 7 viên',
            price: 125000,
            costPrice: 98000,
            retailPrice: 145000,
            concentration: '625mg',
            usage: 'Uống',
            indications: 'Điều trị nhiễm khuẩn',
            isPrescription: true
        },
        {
            name: 'Cefixime 200mg',
            code: 'CEFI-200',
            genericName: 'Cefixime',
            categoryId: createdCategories.ANTIBIOTICS.id,
            manufacturer: 'Domesco',
            countryOfOrigin: 'Việt Nam',
            unit: 'Viên',
            packingSpec: 'Hộp 2 vỉ x 5 viên',
            price: 85000,
            costPrice: 68000,
            retailPrice: 98000,
            concentration: '200mg',
            usage: 'Uống',
            indications: 'Điều trị nhiễm khuẩn đường hô hấp',
            isPrescription: true
        },

        // TIÊU HÓA
        {
            name: 'Bioflora Sachet',
            code: 'BIO-SAC',
            genericName: 'Lactobacillus',
            categoryId: createdCategories.DIGESTIVE.id,
            manufacturer: 'Biocodex',
            countryOfOrigin: 'Pháp',
            unit: 'Gói',
            packingSpec: 'Hộp 10 gói',
            price: 95000,
            costPrice: 75000,
            retailPrice: 110000,
            usage: 'Uống',
            indications: 'Cân bằng hệ vi sinh đường ruột',
            isPrescription: false
        },
        {
            name: 'Smecta',
            code: 'SMEC-3G',
            genericName: 'Diosmectite',
            categoryId: createdCategories.DIGESTIVE.id,
            manufacturer: 'Ipsen',
            countryOfOrigin: 'Pháp',
            unit: 'Gói',
            packingSpec: 'Hộp 30 gói x 3g',
            price: 145000,
            costPrice: 118000,
            retailPrice: 165000,
            concentration: '3g',
            usage: 'Uống',
            indications: 'Điều trị tiêu chảy cấp',
            isPrescription: false
        },
        {
            name: 'Kremil S',
            code: 'KREM-S',
            genericName: 'Aluminum Hydroxide + Magnesium Hydroxide',
            categoryId: createdCategories.DIGESTIVE.id,
            manufacturer: 'Unilab',
            countryOfOrigin: 'Philippines',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 65000,
            costPrice: 52000,
            retailPrice: 75000,
            usage: 'Uống',
            indications: 'Điều trị đau dạ dày, trào ngược',
            isPrescription: false
        },

        // HÔ HẤP
        {
            name: 'Prospan Siro',
            code: 'PROS-SIR-100',
            genericName: 'Hedera Helix Extract',
            categoryId: createdCategories.RESPIRATORY.id,
            manufacturer: 'Engelhard',
            countryOfOrigin: 'Đức',
            unit: 'Chai',
            packingSpec: 'Chai 100ml',
            price: 125000,
            costPrice: 98000,
            retailPrice: 145000,
            usage: 'Uống',
            indications: 'Điều trị ho có đờm',
            isPrescription: false
        },
        {
            name: 'Bisolvon 8mg',
            code: 'BISO-8',
            genericName: 'Bromhexine',
            categoryId: createdCategories.RESPIRATORY.id,
            manufacturer: 'Boehringer Ingelheim',
            countryOfOrigin: 'Đức',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 85000,
            costPrice: 68000,
            retailPrice: 98000,
            concentration: '8mg',
            usage: 'Uống',
            indications: 'Làm loãng đờm, long đờm',
            isPrescription: false
        },
        {
            name: 'Decolgen',
            code: 'DECO-ND',
            genericName: 'Paracetamol + Phenylephrine + Chlorpheniramine',
            categoryId: createdCategories.RESPIRATORY.id,
            manufacturer: 'Unilab',
            countryOfOrigin: 'Philippines',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 55000,
            costPrice: 42000,
            retailPrice: 65000,
            usage: 'Uống',
            indications: 'Điều trị cảm cúm, sổ mũi',
            isPrescription: false
        },

        // TIM MẠCH
        {
            name: 'Amlodipine 5mg',
            code: 'AMLO-5',
            genericName: 'Amlodipine',
            categoryId: createdCategories.CARDIOVASCULAR.id,
            manufacturer: 'Stada',
            countryOfOrigin: 'Đức',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 75000,
            costPrice: 58000,
            retailPrice: 88000,
            concentration: '5mg',
            usage: 'Uống',
            indications: 'Điều trị tăng huyết áp',
            isPrescription: true
        },
        {
            name: 'Atorvastatin 20mg',
            code: 'ATOR-20',
            genericName: 'Atorvastatin',
            categoryId: createdCategories.CARDIOVASCULAR.id,
            manufacturer: 'Pfizer',
            countryOfOrigin: 'Mỹ',
            unit: 'Viên',
            packingSpec: 'Hộp 3 vỉ x 10 viên',
            price: 185000,
            costPrice: 148000,
            retailPrice: 210000,
            concentration: '20mg',
            usage: 'Uống',
            indications: 'Giảm cholesterol máu',
            isPrescription: true
        },

        // TIỂU ĐƯỜNG
        {
            name: 'Metformin 500mg',
            code: 'METF-500',
            genericName: 'Metformin HCl',
            categoryId: createdCategories.DIABETES.id,
            manufacturer: 'Merck',
            countryOfOrigin: 'Đức',
            unit: 'Viên',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            price: 45000,
            costPrice: 35000,
            retailPrice: 52000,
            concentration: '500mg',
            usage: 'Uống',
            indications: 'Điều trị đái tháo đường type 2',
            isPrescription: true
        },
        {
            name: 'Glimepiride 2mg',
            code: 'GLIM-2',
            genericName: 'Glimepiride',
            categoryId: createdCategories.DIABETES.id,
            manufacturer: 'Sanofi',
            countryOfOrigin: 'Pháp',
            unit: 'Viên',
            packingSpec: 'Hộp 3 vỉ x 10 viên',
            price: 95000,
            costPrice: 75000,
            retailPrice: 110000,
            concentration: '2mg',
            usage: 'Uống',
            indications: 'Điều trị đái tháo đường type 2',
            isPrescription: true
        },

        // CHĂM SÓC DA
        {
            name: 'Acnes Gel',
            code: 'ACNE-GEL-25',
            genericName: 'Benzoyl Peroxide',
            categoryId: createdCategories.SKINCARE.id,
            manufacturer: 'Rohto',
            countryOfOrigin: 'Nhật Bản',
            unit: 'Tuýp',
            packingSpec: 'Tuýp 25g',
            price: 65000,
            costPrice: 52000,
            retailPrice: 75000,
            usage: 'Bôi ngoài da',
            indications: 'Điều trị mụn trứng cá',
            isPrescription: false
        },
        {
            name: 'Betnovate Cream',
            code: 'BETN-CR-20',
            genericName: 'Betamethasone',
            categoryId: createdCategories.SKINCARE.id,
            manufacturer: 'GSK',
            countryOfOrigin: 'Anh',
            unit: 'Tuýp',
            packingSpec: 'Tuýp 20g',
            price: 85000,
            costPrice: 68000,
            retailPrice: 98000,
            usage: 'Bôi ngoài da',
            indications: 'Điều trị viêm da, dị ứng da',
            isPrescription: false
        },

        // NHÃN KHOA
        {
            name: 'Rohto Eye Drops',
            code: 'ROHTO-EYE-13',
            genericName: 'Tetrahydrozoline',
            categoryId: createdCategories.EYECARE.id,
            manufacturer: 'Rohto',
            countryOfOrigin: 'Nhật Bản',
            unit: 'Chai',
            packingSpec: 'Chai 13ml',
            price: 55000,
            costPrice: 42000,
            retailPrice: 65000,
            usage: 'Nhỏ mắt',
            indications: 'Giảm mỏi mắt, mắt đỏ',
            isPrescription: false
        },
        {
            name: 'Systane Ultra',
            code: 'SYST-UL-10',
            genericName: 'Polyethylene Glycol',
            categoryId: createdCategories.EYECARE.id,
            manufacturer: 'Alcon',
            countryOfOrigin: 'Mỹ',
            unit: 'Chai',
            packingSpec: 'Chai 10ml',
            price: 145000,
            costPrice: 118000,
            retailPrice: 165000,
            usage: 'Nhỏ mắt',
            indications: 'Điều trị khô mắt',
            isPrescription: false
        },

        // THỰC PHẨM CHỨC NĂNG
        {
            name: 'Blackmores Glucosamine',
            code: 'BLK-GLUCO-180',
            genericName: 'Glucosamine Sulfate',
            categoryId: createdCategories.SUPPLEMENTS.id,
            manufacturer: 'Blackmores',
            countryOfOrigin: 'Úc',
            unit: 'Viên',
            packingSpec: 'Hộp 180 viên',
            price: 650000,
            costPrice: 550000,
            retailPrice: 720000,
            concentration: '1500mg',
            usage: 'Uống',
            indications: 'Hỗ trợ xương khớp',
            isPrescription: false
        },
        {
            name: 'Ginkgo Biloba',
            code: 'GINK-120',
            genericName: 'Ginkgo Biloba Extract',
            categoryId: createdCategories.SUPPLEMENTS.id,
            manufacturer: 'Nature Made',
            countryOfOrigin: 'Mỹ',
            unit: 'Viên',
            packingSpec: 'Hộp 60 viên',
            price: 380000,
            costPrice: 320000,
            retailPrice: 420000,
            concentration: '120mg',
            usage: 'Uống',
            indications: 'Hỗ trợ tuần hoàn não',
            isPrescription: false
        }
    ];

    console.log('');
    let created = 0;
    for (const prod of products) {
        try {
            await prisma.product.upsert({
                where: { code: prod.code },
                update: prod,
                create: {
                    ...prod,
                    isActive: true,
                    barcode: `BAR${prod.code}`,
                    sku: `SKU${prod.code}`
                }
            });
            created++;
            console.log(`  ✅ ${prod.name} (${prod.manufacturer})`);
        } catch (error) {
            console.log(`  ⚠️  ${prod.name}: ${error.message}`);
        }
    }

    console.log('\n========================================');
    console.log('✅ Products & Categories Seeded!');
    console.log('========================================');
    console.log(`📁 Categories: ${categories.length}`);
    console.log(`💊 Products: ${created}`);
    console.log('========================================');
}

async function main() {
    try {
        await seedProductsAndCategories();
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
