import express from 'express';
import prisma from '../lib/prisma.js';
import { getCache, setCache } from '../lib/cache.js';

const router = express.Router();

/**
 * Dashboard Summary - Batched Queries
 * Returns all dashboard metrics in a single API call
 */
router.get('/summary', async (req, res) => {
    try {
        // Check cache first
        const cacheKey = 'dashboard:summary';
        const cached = await getCache(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        // Execute all queries in parallel
        const [
            totalCustomers,
            activeCustomers,
            totalProducts,
            totalOrders,
            monthlyOrders,
            totalRevenue,
            monthlyRevenue,
            totalUsers,
            recentOrders
        ] = await Promise.all([
            // Total customers
            prisma.pharmacy.count(),

            // Active customers (with orders in last 30 days)
            prisma.pharmacy.count({
                where: {
                    orders: {
                        some: {
                            createdAt: {
                                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            }
                        }
                    }
                }
            }),

            // Total products
            prisma.product.count(),

            // Total orders
            prisma.order.count(),

            // Monthly orders
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),

            // Total revenue
            prisma.order.aggregate({
                _sum: {
                    totalAmount: true
                }
            }),

            // Monthly revenue
            prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                },
                _sum: {
                    totalAmount: true
                }
            }),

            // Total users
            prisma.user.count(),

            // Recent orders (last 10)
            prisma.order.findMany({
                take: 10,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    pharmacy: {
                        select: {
                            name: true,
                            code: true
                        }
                    },
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        ]);

        const summary = {
            customers: {
                total: totalCustomers,
                active: activeCustomers,
                inactive: totalCustomers - activeCustomers
            },
            products: {
                total: totalProducts
            },
            orders: {
                total: totalOrders,
                monthly: monthlyOrders
            },
            revenue: {
                total: totalRevenue._sum.totalAmount || 0,
                monthly: monthlyRevenue._sum.totalAmount || 0
            },
            users: {
                total: totalUsers
            },
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                customerName: order.pharmacy?.name,
                customerCode: order.pharmacy?.code,
                repName: order.user?.name,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt
            }))
        };

        // Cache for 5 minutes
        await setCache(cacheKey, summary, 300);

        res.json(summary);
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ error: 'Failed to load dashboard summary' });
    }
});

export default router;
