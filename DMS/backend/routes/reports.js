import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Helper: Get Date Range
const getDateRange = (period, customStart, customEnd) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'this_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'custom' && customStart && customEnd) {
        start = new Date(customStart);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
    } else {
        // Default: This Month
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    return { start, end };
};

// 1. SALES REPORTS
router.get('/sales', async (req, res) => {
    try {
        const { type, period, startDate, endDate } = req.query;
        const { start, end } = getDateRange(period, startDate, endDate);

        // Common Where Clause
        const whereClause = {
            createdAt: { gte: start, lte: end },
            status: { not: 'CANCELLED' }
        };

        if (type === 'by_rep') {
            // Fetch Orders with User and Items->Product->Group
            const orders = await prisma.order.findMany({
                where: whereClause,
                include: {
                    user: {
                        include: {
                            manager: true // Get Manager Info
                        }
                    },
                    items: {
                        include: {
                            product: {
                                include: {
                                    group: true,
                                    category: true
                                }
                            }
                        }
                    }
                }
            });

            // Aggregate
            const repStats = {};

            orders.forEach(order => {
                const userId = order.userId;
                if (!repStats[userId]) {
                    repStats[userId] = {
                        id: userId,
                        name: order.user?.name || 'Unknown',
                        code: order.user?.employeeCode,
                        managerName: order.user?.manager?.name || 'N/A',
                        total: 0,
                        count: 0,
                        productGroups: {}
                    };
                }

                repStats[userId].total += order.totalAmount;
                repStats[userId].count += 1;

                // Breakdown by Product Group
                order.items.forEach(item => {
                    const groupName = item.product?.group?.name || 'Khác';
                    if (!repStats[userId].productGroups[groupName]) {
                        repStats[userId].productGroups[groupName] = 0;
                    }
                    repStats[userId].productGroups[groupName] += item.subtotal;
                });
            });

            return res.json(Object.values(repStats));
        }

        if (type === 'by_customer') {
            const orders = await prisma.order.findMany({
                where: whereClause,
                include: {
                    pharmacy: {
                        include: {
                            territory: {
                                include: {
                                    businessUnit: true,
                                    region: true
                                }
                            }
                        }
                    }
                }
            });

            const custStats = {};

            orders.forEach(order => {
                const pharmId = order.pharmacyId;
                if (!custStats[pharmId]) {
                    const p = order.pharmacy;
                    const t = p?.territory;
                    custStats[pharmId] = {
                        id: pharmId,
                        name: p?.name || 'Unknown',
                        code: p?.code,
                        region: t?.region?.name || 'N/A',
                        area: t?.businessUnit?.name || 'N/A', // Vùng/Khu vực
                        territory: t?.name || 'N/A',
                        total: 0,
                        count: 0
                    };
                }
                custStats[pharmId].total += order.totalAmount;
                custStats[pharmId].count += 1;
            });

            // Sort by Total Desc
            return res.json(Object.values(custStats).sort((a, b) => b.total - a.total));
        }

        if (type === 'by_product') {
            const orders = await prisma.order.findMany({
                where: whereClause,
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    group: true,
                                    category: true
                                }
                            }
                        }
                    }
                }
            });

            const prodStats = {};

            orders.forEach(order => {
                order.items.forEach(item => {
                    const prodId = item.productId;
                    const p = item.product;
                    if (!prodStats[prodId]) {
                        prodStats[prodId] = {
                            id: prodId,
                            name: p?.name || 'Unknown',
                            code: p?.code,
                            manufacturer: p?.manufacturer || 'N/A',
                            activeIngredient: p?.genericName || 'N/A',
                            group: p?.group?.name || 'N/A',
                            category: p?.category?.name || 'N/A',
                            total: 0,
                            quantity: 0
                        };
                    }
                    prodStats[prodId].total += item.subtotal;
                    prodStats[prodId].quantity += item.quantity;
                });
            });

            return res.json(Object.values(prodStats).sort((a, b) => b.total - a.total));
        }

        res.status(400).json({ message: 'Invalid report type' });
    } catch (error) {
        console.error('Error sales report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. VISIT REPORTS
router.get('/visits', async (req, res) => {
    try {
        const { type, period, startDate, endDate } = req.query;
        const { start, end } = getDateRange(period, startDate, endDate);

        if (type === 'compliance') {
            // Get all plans
            const plans = await prisma.visitPlan.findMany({
                where: {
                    visitDate: { gte: start, lte: end },
                    status: { not: 'CANCELLED' }
                },
                select: { userId: true, status: true }
            });

            // Aggregate in JS
            const stats = {};
            plans.forEach(p => {
                if (!stats[p.userId]) stats[p.userId] = { total: 0, completed: 0 };
                stats[p.userId].total++;
                if (p.status === 'COMPLETED') stats[p.userId].completed++;
            });

            // Enrich
            const result = await Promise.all(Object.keys(stats).map(async (userId) => {
                const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, employeeCode: true } });
                const s = stats[userId];
                return {
                    userId,
                    name: user?.name || 'Unknown',
                    code: user?.employeeCode,
                    total: s.total,
                    completed: s.completed,
                    rate: s.total ? Math.round((s.completed / s.total) * 100) : 0
                };
            }));

            return res.json(result.sort((a, b) => b.rate - a.rate));
        }

        res.status(400).json({ message: 'Invalid report type' });
    } catch (error) {
        console.error('Error visit report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. DASHBOARD METRICS
router.get('/dashboard', async (req, res) => {
    try {
        const { period } = req.query;
        const { start, end } = getDateRange(period || 'this_month');

        // 1. KPIs
        const totalRevenue = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } }
        });

        const totalOrders = await prisma.order.count({
            where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } }
        });

        // Active Customers (placed at least one order in period)
        const activeCustomers = await prisma.order.findMany({
            where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
            distinct: ['pharmacyId'],
            select: { pharmacyId: true }
        });

        const totalVisits = await prisma.visitPlan.count({
            where: { visitDate: { gte: start, lte: end } }
        });
        const completedVisits = await prisma.visitPlan.count({
            where: { visitDate: { gte: start, lte: end }, status: 'COMPLETED' }
        });

        // 2. Sales Trend (Daily) - Raw data for frontend to process or group here
        // Using raw query might be faster for grouping by date, but Prisma works too.
        // Let's grouping by JS for simplicity as dataset isn't huge yet.
        const dailySales = await prisma.order.findMany({
            where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
            select: { createdAt: true, totalAmount: true }
        });

        const trend = {}; // 'YYYY-MM-DD' -> amount
        dailySales.forEach(o => {
            const date = o.createdAt.toISOString().split('T')[0];
            trend[date] = (trend[date] || 0) + o.totalAmount;
        });
        const salesTrend = Object.keys(trend).sort().map(date => ({ date, amount: trend[date] }));

        // 3. Top Products
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: { order: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } } },
            _sum: { subtotal: true, quantity: true },
            orderBy: { _sum: { subtotal: 'desc' } },
            take: 5
        });
        // Enrich
        const enrichedTopProducts = await Promise.all(topProducts.map(async p => {
            const product = await prisma.product.findUnique({ where: { id: p.productId }, select: { name: true, code: true } });
            return {
                name: product?.name,
                code: product?.code,
                revenue: p._sum.subtotal,
                quantity: p._sum.quantity
            };
        }));

        // 4. Order Status Status
        const statusBreakdown = await prisma.order.groupBy({
            by: ['status'],
            where: { createdAt: { gte: start, lte: end } },
            _count: { id: true }
        });


        res.json({
            kpi: {
                revenue: totalRevenue._sum.totalAmount || 0,
                orders: totalOrders,
                customers: activeCustomers.length,
                visits: { total: totalVisits, completed: completedVisits }
            },
            charts: {
                salesTrend,
                topProducts: enrichedTopProducts,
                orderStatus: statusBreakdown.map(s => ({ status: s.status, count: s._count.id }))
            }
        });

    } catch (error) {
        console.error('Error dashboard data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
