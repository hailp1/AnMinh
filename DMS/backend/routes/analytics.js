import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Helper: Build Date Filter
const getDateFilter = (range, startDate, endDate) => {
    const NOW = new Date();
    let start = new Date(0);
    let end = new Date();

    if (range === 'today') {
        start = new Date(NOW.setHours(0, 0, 0, 0));
    } else if (range === 'this_month') {
        start = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
    } else if (range === 'custom' && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    }

    return {
        createdAt: {
            gte: start,
            lte: end
        }
    };
};

// GET /api/analytics/dashboard
// Summary Cards & Charts
router.get('/dashboard', auth, async (req, res) => {
    try {
        const { range, startDate, endDate, userId } = req.query;
        const dateFilter = getDateFilter(range, startDate, endDate);

        // Scope Filter (If Admin/Manager querying specific user, else own data if not Manager)
        let userFilter = {};
        if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER' && !userId) {
            userFilter = { userId: req.user.id };
        } else if (userId) {
            // Manager/Admin filtering by specific staff
            userFilter = { userId: userId };
        }

        const whereCondition = {
            ...dateFilter,
            ...userFilter,
            status: { not: 'CANCELLED' } // Don't count cancelled orders
        };

        // 1. Summary Metrics
        const summary = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            _count: { id: true },
            where: whereCondition
        });

        // 2. Sales Trend (Daily) - Using raw query for efficiency or JS aggregation for simplicity
        // Let's use JS aggregation to be DB-agnostic safe for now (unless dataset huge)
        const orders = await prisma.order.findMany({
            where: whereCondition,
            select: { createdAt: true, totalAmount: true }
        });

        const trendMap = {};
        orders.forEach(o => {
            const dateStr = o.createdAt.toISOString().split('T')[0];
            trendMap[dateStr] = (trendMap[dateStr] || 0) + o.totalAmount;
        });
        const salesTrend = Object.entries(trendMap)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => a.date.localeCompare(b.date));


        // 3. Sales by Category (Need to join OrderItems -> Product -> ProductGroup)
        // Prisma groupBy is good for single table, but across tables we need findMany
        const categoryStats = await prisma.orderItem.findMany({
            where: {
                order: whereCondition
            },
            include: {
                product: {
                    include: { group: true } // Product Group
                }
            }
        });

        const catMap = {};
        categoryStats.forEach(item => {
            const groupName = item.product.group?.name || 'Khác';
            catMap[groupName] = (catMap[groupName] || 0) + item.subtotal;
        });
        const salesByCategory = Object.entries(catMap).map(([name, value]) => ({ name, value }));


        res.json({
            summary: {
                totalRevenue: summary._sum.totalAmount || 0,
                totalOrders: summary._count.id || 0,
            },
            salesTrend,
            salesByCategory
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Lỗi lấy dữ liệu dashboard' });
    }
});

// GET /api/analytics/reports/:type
router.get('/reports/:type', auth, async (req, res) => {
    try {
        const { type } = req.params;
        const { range, startDate, endDate } = req.query;
        const dateFilter = getDateFilter(range, startDate, endDate);

        // Scope Permissions
        if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
            // Regular users only see their own data
            dateFilter.userId = req.user.id;
        }

        let data = [];

        if (type === 'orders-detail') {
            data = await prisma.order.findMany({
                where: { ...dateFilter },
                include: {
                    user: { select: { name: true, employeeCode: true } },
                    pharmacy: { select: { name: true, address: true } },
                    items: {
                        include: { product: { select: { name: true, code: true } } }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Flatten for Excel
            data = data.map(o => ({
                'Mã Đơn': o.orderNumber || o.id.slice(0, 8),
                'Ngày tạo': new Date(o.createdAt).toLocaleDateString('vi-VN'),
                'Nhân viên': o.user?.name,
                'Khách hàng': o.pharmacy?.name,
                'Tổng tiền': o.totalAmount,
                'Trạng thái': o.status,
                'Ghi chú': o.notes
            }));

        } else if (type === 'sales-by-staff') {
            // For Managers/Admin to see performance list
            const stats = await prisma.order.groupBy({
                by: ['userId'],
                where: { ...dateFilter, status: { not: 'CANCELLED' } },
                _sum: { totalAmount: true },
                _count: { id: true }
            });

            // Enrich with User info
            const userIds = stats.map(s => s.userId);
            const users = await prisma.user.findMany({ where: { id: { in: userIds } } });

            data = stats.map(s => {
                const u = users.find(user => user.id === s.userId);
                return {
                    'Mã NV': u?.employeeCode,
                    'Tên NV': u?.name,
                    'Số đơn hàng': s._count.id,
                    'Doanh số': s._sum.totalAmount
                };
            });
        } else if (type === 'sales-by-territory') {
            // Territory Performance
            // Note: Orders link to Pharmacy -> Territory
            // We need to fetch orders with Pharmacy.Territory
            const orders = await prisma.order.findMany({
                where: { ...dateFilter, status: { not: 'CANCELLED' } },
                include: {
                    pharmacy: {
                        include: { territory: true }
                    }
                }
            });

            // Aggregation in JS (flexible)
            const map = {};
            orders.forEach(o => {
                const tName = o.pharmacy?.territory?.name || 'Chưa phân vùng';
                if (!map[tName]) map[tName] = { count: 0, total: 0 };
                map[tName].count++;
                map[tName].total += o.totalAmount;
            });

            data = Object.entries(map).map(([name, val]) => ({
                'Khu vực / Địa bàn': name,
                'Số đơn hàng': val.count,
                'Doanh số': val.total
            }));

        } else if (type === 'sales-by-product') {
            // Product Performance
            const items = await prisma.orderItem.findMany({
                where: {
                    order: { ...dateFilter, status: { not: 'CANCELLED' } }
                },
                include: {
                    product: { include: { group: true } }
                }
            });

            const map = {};
            items.forEach(item => {
                const name = item.product.name;
                const group = item.product.group?.name || 'Khác';
                const key = `${group} - ${name}`; // Composite key for Excel
                if (!map[key]) map[key] = { group, name, qty: 0, total: 0 };
                map[key].qty += item.quantity;
                map[key].total += item.subtotal;
            });

            data = Object.values(map).map(val => ({
                'Nhóm hàng': val.group,
                'Sản phẩm': val.name,
                'Số lượng bán': val.qty,
                'Doanh số': val.total
            }));
        }

        res.json(data);

    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ error: 'Lỗi trích xuất báo cáo' });
    }
});


export default router;
