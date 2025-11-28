import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Lấy danh sách routes (lộ trình)
router.get('/', adminAuth, async (req, res) => {
    try {
        // Lấy danh sách customer assignments và group theo user
        const assignments = await prisma.customerAssignment.findMany({
            where: {
                isActive: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        employeeCode: true,
                        routeCode: true
                    }
                },
                pharmacy: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        address: true
                    }
                },
                territory: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group by user to create routes
        const routesMap = new Map();

        assignments.forEach(assignment => {
            const userId = assignment.userId;
            if (!routesMap.has(userId)) {
                routesMap.set(userId, {
                    id: userId,
                    name: `Lộ trình ${assignment.user.routeCode || assignment.user.employeeCode}`,
                    repId: userId,
                    repName: assignment.user.name,
                    repCode: assignment.user.employeeCode,
                    routeCode: assignment.user.routeCode,
                    customerIds: [],
                    customers: [],
                    territories: new Set(),
                    status: 'active',
                    createdAt: assignment.createdAt
                });
            }

            const route = routesMap.get(userId);
            route.customerIds.push(assignment.pharmacyId);
            route.customers.push({
                id: assignment.pharmacyId,
                code: assignment.pharmacy.code,
                name: assignment.pharmacy.name,
                address: assignment.pharmacy.address,
                territory: assignment.territory?.name
            });
            if (assignment.territory) {
                route.territories.add(assignment.territory.name);
            }
        });

        // Convert to array and format
        const routes = Array.from(routesMap.values()).map(route => ({
            ...route,
            territories: Array.from(route.territories),
            customerCount: route.customers.length
        }));

        res.json(routes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Tạo route mới (gán khách hàng cho TDV)
router.post('/', adminAuth, async (req, res) => {
    try {
        const { name, repId, customerIds, territoryId } = req.body;

        if (!repId || !customerIds || customerIds.length === 0) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Xóa các assignments cũ của rep này
        await prisma.customerAssignment.deleteMany({
            where: { userId: repId }
        });

        // Tạo assignments mới
        const assignments = await prisma.customerAssignment.createMany({
            data: customerIds.map(pharmacyId => ({
                userId: repId,
                pharmacyId: pharmacyId,
                territoryId: territoryId || null,
                assignedBy: req.user.id,
                notes: name || `Lộ trình tự động`
            }))
        });

        res.status(201).json({
            message: `Đã tạo lộ trình với ${assignments.count} khách hàng`,
            count: assignments.count
        });
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Cập nhật route
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const { customerIds, territoryId } = req.body;

        if (!customerIds || customerIds.length === 0) {
            return res.status(400).json({ error: 'Thiếu danh sách khách hàng' });
        }

        // Xóa assignments cũ
        await prisma.customerAssignment.deleteMany({
            where: { userId: userId }
        });

        // Tạo assignments mới
        const assignments = await prisma.customerAssignment.createMany({
            data: customerIds.map(pharmacyId => ({
                userId: userId,
                pharmacyId: pharmacyId,
                territoryId: territoryId || null,
                assignedBy: req.user.id,
                notes: `Cập nhật lộ trình`
            }))
        });

        res.json({
            message: `Đã cập nhật lộ trình với ${assignments.count} khách hàng`,
            count: assignments.count
        });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Xóa route (xóa tất cả assignments của user)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;

        await prisma.customerAssignment.deleteMany({
            where: { userId: userId }
        });

        res.json({ message: 'Đã xóa lộ trình' });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
