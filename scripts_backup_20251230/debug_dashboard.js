
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDashboardData() {
    try {
        console.log('--- Checking Dashboard Data ---');
        
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        console.log(`Period: ${start.toISOString()} to ${end.toISOString()}`);

        const totalRevenue = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } }
        });
        console.log('Total Revenue:', totalRevenue._sum.totalAmount);

        const totalOrders = await prisma.order.count({
             where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } }
        });
        console.log('Total Orders:', totalOrders);
        
        const statusBreakdown = await prisma.order.groupBy({
            by: ['status'],
            where: { createdAt: { gte: start, lte: end } },
            _count: { id: true }
        });
        console.log('Order Status:', statusBreakdown);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDashboardData();
