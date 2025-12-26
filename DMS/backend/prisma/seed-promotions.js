// Seed Promotions (CTKM & CTHHTM)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedPromotions() {
    console.log('🎁 Seeding Promotions (CTKM & CTHHTM)...');

    // Get some products for promotions
    const products = await prisma.product.findMany({
        take: 20,
        where: { isActive: true }
    });

    if (products.length === 0) {
        console.log('⚠️  No products found. Please seed products first.');
        return;
    }

    const promotions = [
        // === CHƯƠNG TRÌNH KHUYẾN MÃI (CTKM) ===
        {
            code: 'CTKM_TET2025',
            name: 'Khuyến Mãi Tết Nguyên Đán 2025',
            description: 'Giảm giá đặc biệt mừng Tết Nguyên Đán 2025. Áp dụng cho tất cả đơn hàng từ 5 triệu đồng',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderAmount: 5000000,
            maxDiscountAmount: 1000000,
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-02-15'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTKM_FLASH_Q1',
            name: 'Flash Sale Quý 1/2025',
            description: 'Giảm ngay 500.000đ cho đơn hàng từ 10 triệu. Số lượng có hạn!',
            type: 'DISCOUNT',
            discountType: 'FIXED_AMOUNT',
            discountValue: 500000,
            minOrderAmount: 10000000,
            maxDiscountAmount: 500000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-03-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTKM_NEWCUST',
            name: 'Ưu Đãi Khách Hàng Mới',
            description: 'Giảm 15% cho đơn hàng đầu tiên của khách hàng mới',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 15,
            minOrderAmount: 2000000,
            maxDiscountAmount: 500000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTKM_VIP_Q1',
            name: 'Ưu Đãi Khách Hàng VIP Q1',
            description: 'Giảm 20% cho khách hàng VIP, áp dụng tất cả đơn hàng',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            minOrderAmount: 3000000,
            maxDiscountAmount: 2000000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-03-31'),
            isActive: true,
            applicableTo: 'SEGMENT',
            customerSegmentIds: ['VIP'],
            territoryIds: []
        },
        {
            code: 'CTKM_COMBO_VITAMIN',
            name: 'Combo Vitamin Giá Sốc',
            description: 'Mua 3 tặng 1 cho tất cả sản phẩm Vitamin',
            type: 'BUY_X_GET_Y',
            discountType: null,
            discountValue: null,
            minOrderAmount: 1000000,
            maxDiscountAmount: null,
            startDate: new Date('2025-01-10'),
            endDate: new Date('2025-02-28'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },

        // === CHƯƠNG TRÌNH HỖ TRỢ THƯƠNG MẠI (CTHHTM) ===
        {
            code: 'CTHHTM_LAUNCH_2025',
            name: 'Hỗ Trợ Ra Mắt Sản Phẩm Mới 2025',
            description: 'Hỗ trợ 25% cho đơn hàng sản phẩm mới ra mắt. Áp dụng cho nhà thuốc đạt doanh số tốt',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 25,
            minOrderAmount: 5000000,
            maxDiscountAmount: 3000000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-06-30'),
            isActive: true,
            applicableTo: 'SEGMENT',
            customerSegmentIds: ['A', 'B'],
            territoryIds: []
        },
        {
            code: 'CTHHTM_DISPLAY',
            name: 'Hỗ Trợ Trưng Bày Sản Phẩm',
            description: 'Hỗ trợ 500.000đ cho nhà thuốc cam kết trưng bày sản phẩm tại vị trí đẹp',
            type: 'DISCOUNT',
            discountType: 'FIXED_AMOUNT',
            discountValue: 500000,
            minOrderAmount: 3000000,
            maxDiscountAmount: 500000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTHHTM_TRAINING',
            name: 'Hỗ Trợ Đào Tạo Dược Sĩ',
            description: 'Giảm 15% cho nhà thuốc tham gia chương trình đào tạo sản phẩm',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 15,
            minOrderAmount: 2000000,
            maxDiscountAmount: 1000000,
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTHHTM_LOYALTY',
            name: 'Hỗ Trợ Khách Hàng Trung Thành',
            description: 'Tặng quà và giảm giá cho khách hàng mua hàng đều đặn 6 tháng liên tục',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 18,
            minOrderAmount: 4000000,
            maxDiscountAmount: 2000000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            applicableTo: 'SEGMENT',
            customerSegmentIds: ['A', 'B'],
            territoryIds: []
        },
        {
            code: 'CTHHTM_VOLUME',
            name: 'Hỗ Trợ Khối Lượng Lớn',
            description: 'Giảm 1 triệu cho đơn hàng từ 20 triệu trở lên',
            type: 'DISCOUNT',
            discountType: 'FIXED_AMOUNT',
            discountValue: 1000000,
            minOrderAmount: 20000000,
            maxDiscountAmount: 1000000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTHHTM_REGION_HCM',
            name: 'Hỗ Trợ Khu Vực TP.HCM',
            description: 'Hỗ trợ đặc biệt 12% cho các nhà thuốc tại TP.HCM',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 12,
            minOrderAmount: 3000000,
            maxDiscountAmount: 1500000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-06-30'),
            isActive: true,
            applicableTo: 'TERRITORY',
            customerSegmentIds: [],
            territoryIds: ['HCM']
        },
        {
            code: 'CTHHTM_PAYMENT',
            name: 'Hỗ Trợ Thanh Toán Sớm',
            description: 'Giảm 3% cho khách hàng thanh toán trong vòng 7 ngày',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 3,
            minOrderAmount: 5000000,
            maxDiscountAmount: 500000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTHHTM_BUNDLE',
            name: 'Hỗ Trợ Mua Combo Sản Phẩm',
            description: 'Mua combo 5 sản phẩm trở lên, giảm ngay 800.000đ',
            type: 'DISCOUNT',
            discountType: 'FIXED_AMOUNT',
            discountValue: 800000,
            minOrderAmount: 8000000,
            maxDiscountAmount: 800000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTHHTM_REFERRAL',
            name: 'Hỗ Trợ Giới Thiệu Khách Hàng',
            description: 'Tặng 300.000đ cho mỗi khách hàng mới được giới thiệu',
            type: 'DISCOUNT',
            discountType: 'FIXED_AMOUNT',
            discountValue: 300000,
            minOrderAmount: 2000000,
            maxDiscountAmount: 300000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        },
        {
            code: 'CTHHTM_SEASONAL',
            name: 'Hỗ Trợ Theo Mùa - Mùa Cảm Cúm',
            description: 'Giảm 20% cho các sản phẩm điều trị cảm cúm trong mùa dịch',
            type: 'DISCOUNT',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            minOrderAmount: 3000000,
            maxDiscountAmount: 1500000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-03-31'),
            isActive: true,
            applicableTo: 'ALL',
            customerSegmentIds: [],
            territoryIds: []
        }
    ];

    console.log(`📝 Creating ${promotions.length} promotions...`);

    for (const promo of promotions) {
        try {
            const created = await prisma.promotion.upsert({
                where: { code: promo.code },
                update: promo,
                create: promo
            });

            // Add promotion items for some promotions
            if (promo.code === 'CTKM_COMBO_VITAMIN' && products.length >= 4) {
                // Mua 3 tặng 1
                await prisma.promotionItem.createMany({
                    data: [
                        {
                            promotionId: created.id,
                            productId: products[0].id,
                            quantity: 3,
                            discountValue: 0
                        },
                        {
                            promotionId: created.id,
                            productId: products[1].id,
                            quantity: 1,
                            discountValue: 100 // 100% discount = free
                        }
                    ],
                    skipDuplicates: true
                });
            }

            console.log(`  ✅ ${promo.code}: ${promo.name}`);
        } catch (error) {
            console.log(`  ⚠️  ${promo.code}: ${error.message}`);
        }
    }

    console.log('✅ Promotions seeded successfully!');
}

async function main() {
    try {
        await seedPromotions();
    } catch (error) {
        console.error('❌ Error seeding promotions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
