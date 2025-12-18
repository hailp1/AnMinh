import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get routes
router.get('/', async (req, res) => {
    try {
        const { userId, dayOfWeek } = req.query;
        const where = { isActive: true };
        if (userId) where.userId = userId;
        if (dayOfWeek) where.dayOfWeek = dayOfWeek;

        const routes = await prisma.route.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, employeeCode: true } },
                pharmacy: { select: { id: true, name: true, code: true, address: true, territory: true } }
            },
            orderBy: { dayOfWeek: 'asc' }
        });
        res.json(routes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create/Update Route
router.post('/', async (req, res) => {
    try {
        const { userId, pharmacyId, dayOfWeek, visitOrder, frequency } = req.body;

        // Check if exists
        const existing = await prisma.route.findFirst({
            where: { userId, pharmacyId, dayOfWeek }
        });

        let route;
        if (existing) {
            route = await prisma.route.update({
                where: { id: existing.id },
                data: { isActive: true, visitOrder, frequency: req.body.frequency }
            });
        } else {
            route = await prisma.route.create({
                data: { userId, pharmacyId, dayOfWeek, visitOrder, frequency: req.body.frequency }
            });
        }
        res.json(route);
    } catch (error) {
        console.error('Error saving route:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Route
router.delete('/:id', async (req, res) => {
    try {
        await prisma.route.delete({ where: { id: req.params.id } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Import Routes
router.post('/import', async (req, res) => {
    try {
        const { data } = req.body; // Array of { employeeCode, customerCode, dayOfWeek }
        let success = 0;
        let errors = [];

        for (const item of data) {
            try {
                const user = await prisma.user.findUnique({ where: { employeeCode: item.employeeCode } });
                if (!user) throw new Error(`User not found: ${item.employeeCode}`);

                const pharmacy = await prisma.pharmacy.findFirst({ where: { code: item.customerCode } });
                if (!pharmacy) throw new Error(`Customer not found: ${item.customerCode}`);

                // item.dayOfWeek should be "T2", "T3"...
                await prisma.route.upsert({
                    where: {
                        userId_pharmacyId_dayOfWeek: {
                            userId: user.id,
                            pharmacyId: pharmacy.id,
                            dayOfWeek: item.dayOfWeek
                        }
                    },
                    update: { isActive: true, frequency: item.frequency },
                    create: {
                        userId: user.id,
                        pharmacyId: pharmacy.id,
                        dayOfWeek: item.dayOfWeek,
                        frequency: item.frequency
                    }
                });
                success++;
            } catch (err) {
                errors.push(err.message);
            }
        }
        res.json({ success, errors });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
