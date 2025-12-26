import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkProducts() {
    console.log('💊 Checking Products & Categories...\n');

    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();

    console.log(`📁 Total Categories: ${totalCategories}`);
    console.log(`💊 Total Products: ${totalProducts}\n`);

    // List categories with product count
    console.log('📋 Categories:');
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { order: 'asc' }
    });

    for (const cat of categories) {
        console.log(`  ✅ ${cat.name.padEnd(30)} (${cat._count.products} sản phẩm)`);
    }

    // Sample products
    console.log('\n💊 Sample Products:');
    const products = await prisma.product.findMany({
        take: 10,
        include: {
            category: true
        }
    });

    for (const prod of products) {
        console.log(`  ✅ ${prod.name} - ${prod.category?.name || 'N/A'} - ${(prod.price / 1000).toFixed(0)}K`);
    }

    await prisma.$disconnect();
}

checkProducts().catch(console.error);
