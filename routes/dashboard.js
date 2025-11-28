import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        // Only allow ADMIN and MANAGER roles
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        // Parallelize queries for performance
        const [
            totalCustomers,
            totalOrders,
            totalRevenueResult,
            activeReps,
            recentOrders,
            recentActivities
        ] = await Promise.all([
            // Total Customers (Pharmacies)
            prisma.pharmacy.count(),

            // Total Orders
            prisma.order.count(),

            // Total Revenue
            prisma.order.aggregate({
                _sum: {
                    totalAmount: true
                },
                where: {
                    status: { not: 'CANCELLED' }
                }
            }),

            // Active Reps (Users with role PHARMACY_REP and isActive=true)
            prisma.user.count({
                where: {
                    role: 'PHARMACY_REP',
                    isActive: true
                }
            }),

            // Recent Orders (Top 5)
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true }
                    },
                    pharmacy: {
                        select: { name: true }
                    }
                }
            }),

            // Recent Activities (Mocked for now, or fetch from logs if available)
            // For now we can infer some activities from recent orders/users
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    createdAt: true,
                    user: { select: { name: true } },
                    status: true
                }
            })
        ]);

        // Format recent activities
        const activities = recentActivities.map(order => ({
            action: `Tạo đơn hàng mới ${order.orderNumber || order.id}`,
            user: order.user?.name || 'Unknown',
            time: order.createdAt,
            type: 'order'
        }));

        res.json({
            stats: {
                totalCustomers,
                totalOrders,
                totalRevenue: totalRevenueResult._sum.totalAmount || 0,
                activeReps
            },
            recentOrders: recentOrders.map(o => ({
                id: o.orderNumber || o.id,
                customerName: o.pharmacy?.name || 'Khách lẻ',
                totalAmount: o.totalAmount,
                status: o.status,
                createdAt: o.createdAt
            })),
            recentActivities: activities
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
