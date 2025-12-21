import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// ================================
// TERRITORY KPIs
// ================================

// Get all territory KPIs
router.get('/', async (req, res) => {
    try {
        const { year, month, territoryId, areaId, regionId } = req.query;

        const where = {};
        if (year) where.year = parseInt(year);
        if (month) where.month = parseInt(month);
        if (territoryId) where.territoryId = territoryId;
        if (areaId) where.areaId = areaId;
        if (regionId) where.regionId = regionId;

        const kpis = await prisma.territoryKPI.findMany({
            where,
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });

        // Calculate achievements
        const enriched = kpis.map(k => ({
            ...k,
            salesAchievement: k.salesTarget > 0 ? ((k.salesActual / k.salesTarget) * 100).toFixed(1) : 0,
            visitAchievement: k.visitTarget > 0 ? ((k.visitActual / k.visitTarget) * 100).toFixed(1) : 0
        }));

        res.json(enriched);
    } catch (error) {
        console.error('Get KPIs error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get KPI summary by region
router.get('/summary', async (req, res) => {
    try {
        const { year, month } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

        const kpis = await prisma.territoryKPI.findMany({
            where: { year: currentYear, month: currentMonth }
        });

        // Aggregate by region/area/territory
        const summary = {
            total: {
                salesTarget: 0, salesActual: 0,
                visitTarget: 0, visitActual: 0,
                newCustomerTarget: 0, newCustomerActual: 0
            },
            byTerritory: []
        };

        kpis.forEach(k => {
            summary.total.salesTarget += k.salesTarget;
            summary.total.salesActual += k.salesActual;
            summary.total.visitTarget += k.visitTarget;
            summary.total.visitActual += k.visitActual;
            summary.total.newCustomerTarget += k.newCustomerTarget;
            summary.total.newCustomerActual += k.newCustomerActual;

            summary.byTerritory.push({
                territoryId: k.territoryId,
                areaId: k.areaId,
                regionId: k.regionId,
                salesAchievement: k.salesTarget > 0 ? ((k.salesActual / k.salesTarget) * 100).toFixed(1) : 0,
                visitAchievement: k.visitTarget > 0 ? ((k.visitActual / k.visitTarget) * 100).toFixed(1) : 0
            });
        });

        summary.total.salesAchievement = summary.total.salesTarget > 0
            ? ((summary.total.salesActual / summary.total.salesTarget) * 100).toFixed(1)
            : 0;
        summary.total.visitAchievement = summary.total.visitTarget > 0
            ? ((summary.total.visitActual / summary.total.visitTarget) * 100).toFixed(1)
            : 0;

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Update KPI
router.post('/', async (req, res) => {
    try {
        const { territoryId, areaId, regionId, year, month, quarter, ...kpiData } = req.body;

        // Upsert based on territory + year + month
        const kpi = await prisma.territoryKPI.upsert({
            where: {
                territoryId_year_month: {
                    territoryId: territoryId || '',
                    year,
                    month: month || 0
                }
            },
            create: {
                territoryId,
                areaId,
                regionId,
                year,
                month,
                quarter,
                ...kpiData
            },
            update: kpiData
        });

        res.json(kpi);
    } catch (error) {
        console.error('Create KPI error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update actual values
router.patch('/:id/actuals', async (req, res) => {
    try {
        const { salesActual, visitActual, newCustomerActual, activeCustomerActual,
            coverageActual, strikeRateActual, skuActual, dropSizeActual } = req.body;

        const kpi = await prisma.territoryKPI.update({
            where: { id: req.params.id },
            data: {
                salesActual,
                visitActual,
                newCustomerActual,
                activeCustomerActual,
                coverageActual,
                strikeRateActual,
                skuActual,
                dropSizeActual
            }
        });

        res.json(kpi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Recalculate actuals from transactions
router.post('/:id/recalculate', async (req, res) => {
    try {
        const kpi = await prisma.territoryKPI.findUnique({ where: { id: req.params.id } });
        if (!kpi) return res.status(404).json({ error: 'KPI not found' });

        // Get date range for this KPI
        const startDate = new Date(kpi.year, (kpi.month || 1) - 1, 1);
        const endDate = new Date(kpi.year, kpi.month || 12, 0, 23, 59, 59);

        // Calculate from orders
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
                // Add territory filter if applicable
            }
        });

        const salesActual = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Calculate from visits
        const visits = await prisma.visit.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        const visitActual = visits.length;
        const visitsWithOrder = visits.filter(v => v.orderPlaced).length;
        const strikeRateActual = visitActual > 0 ? (visitsWithOrder / visitActual * 100) : 0;

        const updatedKpi = await prisma.territoryKPI.update({
            where: { id: req.params.id },
            data: {
                salesActual,
                visitActual,
                strikeRateActual
            }
        });

        res.json(updatedKpi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Seed demo KPIs
router.post('/seed', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const territories = ['T001', 'T002', 'T003', 'T004', 'T005'];
        const created = [];

        for (const t of territories) {
            const salesTarget = Math.floor(Math.random() * 100000000) + 50000000;
            const salesActual = Math.floor(salesTarget * (Math.random() * 0.4 + 0.6));
            const visitTarget = Math.floor(Math.random() * 100) + 50;
            const visitActual = Math.floor(visitTarget * (Math.random() * 0.3 + 0.7));

            const kpi = await prisma.territoryKPI.upsert({
                where: { territoryId_year_month: { territoryId: t, year: currentYear, month: currentMonth } },
                create: {
                    territoryId: t,
                    year: currentYear,
                    month: currentMonth,
                    salesTarget,
                    salesActual,
                    visitTarget,
                    visitActual,
                    newCustomerTarget: 10,
                    newCustomerActual: Math.floor(Math.random() * 15),
                    activeCustomerTarget: 50,
                    activeCustomerActual: Math.floor(Math.random() * 20) + 40,
                    coverageTarget: 80,
                    coverageActual: Math.random() * 30 + 60,
                    strikeRateTarget: 50,
                    strikeRateActual: Math.random() * 20 + 40,
                    skuTarget: 5,
                    skuActual: Math.random() * 2 + 3.5,
                    dropSizeTarget: 2000000,
                    dropSizeActual: Math.floor(Math.random() * 1000000) + 1500000
                },
                update: {}
            });
            created.push(kpi);
        }

        res.json({
            success: true,
            message: `Created ${created.length} territory KPIs`,
            kpis: created
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
