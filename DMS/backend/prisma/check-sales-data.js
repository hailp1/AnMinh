import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSalesData() {
    console.log('📊 Checking Sales Data...\n');

    // Count total orders
    const totalOrders = await prisma.order.count();
    console.log(`📦 Total Orders: ${totalOrders}`);

    // Count orders in 2024
    const orders2024 = await prisma.order.count({
        where: {
            createdAt: {
                gte: new Date('2024-01-01'),
                lt: new Date('2025-01-01')
            }
        }
    });
    console.log(`📅 Orders in 2024: ${orders2024}`);

    // Get monthly breakdown
    console.log('\n📈 Monthly Breakdown (2024):');

    for (let month = 1; month <= 12; month++) {
        const startDate = new Date(2024, month - 1, 1);
        const endDate = new Date(2024, month, 1);

        const monthOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lt: endDate
                }
            },
            select: {
                totalAmount: true
            }
        });

        const count = monthOrders.length;
        const revenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        const monthName = startDate.toLocaleString('en-US', { month: 'short' });
        console.log(`  ${monthName} 2024: ${count.toString().padStart(3)} orders, ${(revenue / 1000000).toFixed(2).padStart(8)}M VND`);
    }

    // Total revenue
    const allOrders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: new Date('2024-01-01'),
                lt: new Date('2025-01-01')
            }
        },
        select: {
            totalAmount: true
        }
    });

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalRevenue / allOrders.length;

    console.log('\n========================================');
    console.log(`💰 Total Revenue 2024: ${(totalRevenue / 1000000).toFixed(2)}M VND`);
    console.log(`📊 Average Order Value: ${(avgOrderValue / 1000).toFixed(0)}K VND`);
    console.log('========================================');

    await prisma.$disconnect();
}

checkSalesData().catch(console.error);
