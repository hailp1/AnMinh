import express from 'express';
import { prisma } from '../lib/prisma.js';
import { getSafeUserIds } from '../lib/dataScope.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ================================
// ROUTE TEMPLATES
// ================================

// Get all route templates
router.get('/templates', async (req, res) => {
    try {
        const templates = await prisma.routeTemplate.findMany({
            where: { isActive: true },
            include: {
                stops: {
                    orderBy: { sequence: 'asc' }
                },
                _count: { select: { stops: true, dailyRoutes: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(templates);
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single template
router.get('/templates/:id', async (req, res) => {
    try {
        const template = await prisma.routeTemplate.findUnique({
            where: { id: req.params.id },
            include: {
                stops: {
                    orderBy: { sequence: 'asc' }
                }
            }
        });
        if (!template) return res.status(404).json({ error: 'Not found' });
        res.json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create template
router.post('/templates', async (req, res) => {
    try {
        const { code, name, description, territoryId, assignedRepId, dayOfWeek, stops } = req.body;

        const template = await prisma.routeTemplate.create({
            data: {
                code,
                name,
                description,
                territoryId,
                assignedRepId,
                dayOfWeek,
                estimatedCalls: stops?.length || 0,
                stops: stops ? {
                    create: stops.map((s, i) => ({
                        pharmacyId: s.pharmacyId,
                        sequence: i + 1,
                        plannedArrival: s.plannedArrival,
                        plannedDuration: s.plannedDuration,
                        notes: s.notes
                    }))
                } : undefined
            },
            include: { stops: true }
        });

        res.status(201).json(template);
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update template
router.put('/templates/:id', async (req, res) => {
    try {
        const { name, description, territoryId, assignedRepId, dayOfWeek, isActive, stops } = req.body;

        // Delete old stops and create new
        if (stops) {
            await prisma.routeStop.deleteMany({ where: { routeTemplateId: req.params.id } });
        }

        const template = await prisma.routeTemplate.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                territoryId,
                assignedRepId,
                dayOfWeek,
                isActive,
                estimatedCalls: stops?.length,
                stops: stops ? {
                    create: stops.map((s, i) => ({
                        pharmacyId: s.pharmacyId,
                        sequence: i + 1,
                        plannedArrival: s.plannedArrival,
                        plannedDuration: s.plannedDuration,
                        notes: s.notes
                    }))
                } : undefined
            },
            include: { stops: true }
        });

        res.json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
    try {
        await prisma.routeTemplate.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================================
// DAILY ROUTES
// ================================

// Get daily routes
router.get('/daily', async (req, res) => {
    try {
        const { date, repId, status } = req.query;

        const where = {};
        if (date) where.date = new Date(date);
        if (repId) where.repId = repId;
        if (status) where.status = status;

        const routes = await prisma.dailyRoute.findMany({
            where,
            include: {
                template: true,
                visits: {
                    orderBy: { createdAt: 'asc' }
                },
                _count: { select: { visits: true } }
            },
            orderBy: { date: 'desc' }
        });

        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate daily route from template
router.post('/daily/generate', async (req, res) => {
    try {
        const { templateId, repId, date } = req.body;

        const template = await prisma.routeTemplate.findUnique({
            where: { id: templateId },
            include: { stops: { orderBy: { sequence: 'asc' } } }
        });

        if (!template) return res.status(404).json({ error: 'Template not found' });

        const dailyRoute = await prisma.dailyRoute.create({
            data: {
                date: new Date(date),
                repId: repId || template.assignedRepId,
                templateId,
                status: 'PLANNED',
                plannedStops: template.stops.length,
                visits: {
                    create: template.stops.map(stop => ({
                        pharmacyId: stop.pharmacyId,
                        repId: repId || template.assignedRepId,
                        status: 'PLANNED',
                        plannedArrival: stop.plannedArrival ? new Date(`${date}T${stop.plannedArrival}:00`) : null
                    }))
                }
            },
            include: { visits: true }
        });

        res.status(201).json(dailyRoute);
    } catch (error) {
        console.error('Generate daily route error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start route
router.post('/daily/:id/start', async (req, res) => {
    try {
        const { lat, lng } = req.body;

        const route = await prisma.dailyRoute.update({
            where: { id: req.params.id },
            data: {
                status: 'IN_PROGRESS',
                startTime: new Date(),
                startLat: lat,
                startLng: lng
            }
        });

        res.json(route);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Complete route
router.post('/daily/:id/complete', async (req, res) => {
    try {
        const { lat, lng, totalDistance, notes } = req.body;

        const visits = await prisma.visit.findMany({
            where: { dailyRouteId: req.params.id }
        });

        const completed = visits.filter(v => v.status === 'COMPLETED').length;
        const skipped = visits.filter(v => v.status === 'SKIPPED' || v.status === 'NO_ANSWER').length;

        const route = await prisma.dailyRoute.update({
            where: { id: req.params.id },
            data: {
                status: 'COMPLETED',
                endTime: new Date(),
                endLat: lat,
                endLng: lng,
                totalDistance,
                completedStops: completed,
                skippedStops: skipped,
                notes
            }
        });

        res.json(route);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================================
// VISITS
// ================================

// Check-in to visit
router.post('/visits/:id/checkin', async (req, res) => {
    try {
        const { lat, lng, photo } = req.body;

        const visit = await prisma.visit.update({
            where: { id: req.params.id },
            data: {
                status: 'CHECKED_IN',
                actualArrival: new Date(),
                checkInLat: lat,
                checkInLng: lng,
                checkInPhoto: photo
            }
        });

        res.json(visit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Complete visit
router.post('/visits/:id/complete', async (req, res) => {
    try {
        const { lat, lng, photo, outcome, notes, orderPlaced, orderId, orderAmount, displayScore, stockStatus, photos } = req.body;

        const visit = await prisma.visit.update({
            where: { id: req.params.id },
            data: {
                status: 'COMPLETED',
                departureTime: new Date(),
                checkOutLat: lat,
                checkOutLng: lng,
                checkOutPhoto: photo,
                outcome,
                notes,
                orderPlaced: orderPlaced || false,
                orderId,
                orderAmount,
                displayScore,
                stockStatus,
                photos
            }
        });

        res.json(visit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Skip visit
router.post('/visits/:id/skip', async (req, res) => {
    try {
        const { reason } = req.body;

        const visit = await prisma.visit.update({
            where: { id: req.params.id },
            data: {
                status: 'SKIPPED',
                outcome: 'SKIPPED',
                notes: reason
            }
        });

        res.json(visit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get visit analytics
router.get('/analytics', async (req, res) => {
    try {
        const { repId, startDate, endDate } = req.query;

        const where = {};
        if (repId) where.repId = repId;
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const visits = await prisma.visit.findMany({ where });

        const totalVisits = visits.length;
        const completed = visits.filter(v => v.status === 'COMPLETED').length;
        const withOrders = visits.filter(v => v.orderPlaced).length;
        const totalOrderValue = visits.reduce((sum, v) => sum + (v.orderAmount || 0), 0);

        res.json({
            totalVisits,
            completedVisits: completed,
            completionRate: totalVisits > 0 ? (completed / totalVisits * 100).toFixed(1) : 0,
            visitsWithOrders: withOrders,
            strikeRate: completed > 0 ? (withOrders / completed * 100).toFixed(1) : 0,
            totalOrderValue,
            avgOrderValue: withOrders > 0 ? Math.round(totalOrderValue / withOrders) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Seed demo visits data
router.post('/seed-visits', async (req, res) => {
    try {
        // Get TDV users
        const tdvUsers = await prisma.user.findMany({ where: { role: 'TDV' }, take: 5 });
        // Get pharmacies
        const pharmacies = await prisma.pharmacy.findMany({ take: 50 });

        if (pharmacies.length === 0) {
            return res.status(400).json({ error: 'Cần có dữ liệu khách hàng (Pharmacy) trước' });
        }

        const repIds = tdvUsers.length > 0
            ? tdvUsers.map(u => u.id)
            : ['TDV001', 'TDV002', 'TDV003'];

        const now = new Date();
        const visits = [];
        const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'SKIPPED', 'NO_ANSWER'];

        // Create visits for the last 30 days
        for (let day = 0; day < 30; day++) {
            const date = new Date(now);
            date.setDate(date.getDate() - day);

            // 3-8 visits per day per TDV
            for (const repId of repIds) {
                const numVisits = Math.floor(Math.random() * 6) + 3;

                for (let i = 0; i < numVisits && i < pharmacies.length; i++) {
                    const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    const hasOrder = status === 'COMPLETED' && Math.random() > 0.5;
                    const orderAmount = hasOrder ? Math.floor(Math.random() * 5000000) + 500000 : 0;

                    const visitDate = new Date(date);
                    visitDate.setHours(8 + i, Math.floor(Math.random() * 60));

                    visits.push({
                        pharmacyId: pharmacy.id,
                        repId: repId,
                        status: status,
                        outcome: status === 'COMPLETED' ? (hasOrder ? 'ORDER_PLACED' : 'NO_ORDER') : status,
                        orderPlaced: hasOrder,
                        orderAmount: orderAmount,
                        actualArrival: visitDate,
                        departureTime: status === 'COMPLETED' ? new Date(visitDate.getTime() + 20 * 60000) : null,
                        duration: status === 'COMPLETED' ? Math.floor(Math.random() * 20) + 10 : null,
                        checkInLat: 10.8 + Math.random() * 0.2,
                        checkInLng: 106.6 + Math.random() * 0.2,
                        displayScore: status === 'COMPLETED' ? Math.floor(Math.random() * 5) + 5 : null,
                        stockStatus: status === 'COMPLETED' ? ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'][Math.floor(Math.random() * 3)] : null,
                        createdAt: visitDate
                    });
                }
            }
        }

        // Insert in batches
        const batchSize = 50;
        let created = 0;
        for (let i = 0; i < visits.length; i += batchSize) {
            const batch = visits.slice(i, i + batchSize);
            await prisma.visit.createMany({ data: batch, skipDuplicates: true });
            created += batch.length;
        }

        // Get summary
        const allVisits = await prisma.visit.findMany();
        const completed = allVisits.filter(v => v.status === 'COMPLETED').length;
        const withOrders = allVisits.filter(v => v.orderPlaced).length;
        const totalAmount = allVisits.reduce((sum, v) => sum + (v.orderAmount || 0), 0);

        res.json({
            success: true,
            message: `Đã tạo ${created} lượt viếng thăm demo`,
            summary: {
                totalVisits: allVisits.length,
                completed,
                completionRate: ((completed / allVisits.length) * 100).toFixed(1) + '%',
                withOrders,
                strikeRate: ((withOrders / completed) * 100).toFixed(1) + '%',
                totalOrderAmount: totalAmount,
                skipped: allVisits.filter(v => v.status === 'SKIPPED').length,
                noAnswer: allVisits.filter(v => v.status === 'NO_ANSWER').length
            }
        });
    } catch (error) {
        console.error('Seed visits error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get visit performance by TDV grouped by Supervisor (Synced with Org Chart)
router.get('/visit-performance', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // 1. Determine Scope based on Org Chart
        // Use req.user (populated by auth middleware) to get accessible user IDs
        // If req.user is missing (dev/test), fall back to fetching all if needed, or error. 
        // For robustness, if no req.user, we might assume ADMIN or fail. Let's assume auth is present.
        const safeIds = req.user ? await getSafeUserIds(req.user) : [];

        // 2. Fetch Employees strictly from the Org Chart (Employee table)
        // This ensures the report matches the "Employees" setup screen exactly.
        const tdvEmployees = await prisma.employee.findMany({
            where: {
                userId: Array.isArray(safeIds) ? { in: safeIds } : undefined, // Safe check: null means full access
                user: { role: 'TDV' } // Only filtered for TDV role
            },
            include: {
                user: true,
                manager: {
                    include: { user: true }
                }
            },
            orderBy: {
                user: { name: 'asc' }
            }
        });

        // 3. Get all visits for these specific employees
        const whereClause = {
            repId: { in: tdvEmployees.map(e => e.userId).filter(Boolean) }
        };

        if (startDate && endDate) {
            whereClause.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const visits = await prisma.visit.findMany({ where: whereClause });

        // 4. Group visits by repId for faster lookup
        const visitsByRep = {};
        visits.forEach(v => {
            if (!visitsByRep[v.repId]) visitsByRep[v.repId] = [];
            visitsByRep[v.repId].push(v);
        });

        // 5. Calculate metrics for each Org Chart Employee
        const tdvMetrics = tdvEmployees.map(emp => {
            // Use Employee data as primary, User data as fallback
            const userId = emp.userId;
            const userName = emp.user?.name || emp.name || 'Unknown';
            const userCode = emp.employeeCode || emp.user?.employeeCode || 'N/A';

            // Resolve Manager Name from Employee relationship
            const managerName = emp.manager?.user?.name || emp.manager?.name || 'Chưa phân bổ';
            const managerId = emp.managerId || 'NO_SUPERVISOR';

            const userVisits = visitsByRep[userId] || [];

            const completed = userVisits.filter(v => v.status === 'COMPLETED').length;
            const withOrders = userVisits.filter(v => v.orderPlaced).length;
            const totalValue = userVisits.reduce((sum, v) => sum + (v.orderAmount || 0), 0);
            const uniqueOutlets = new Set(userVisits.map(v => v.pharmacyId)).size;

            return {
                id: userId,
                name: userName,
                employeeCode: userCode,
                supervisorId: managerId,
                supervisorName: managerName,
                // KPI Calculations
                planCall: Math.floor(userVisits.length * 1.1) || 0, // Mock Plan > Actual
                visited: userVisits.length,
                success: withOrders,
                strikeRate: completed > 0 ? ((withOrders / completed) * 100).toFixed(1) : 0,
                skusPerOutlet: uniqueOutlets > 0 ? (userVisits.length / uniqueOutlets).toFixed(1) : 0,
                valuePerOutlet: uniqueOutlets > 0 ? Math.round(totalValue / uniqueOutlets) : 0,
                totalValue: totalValue,
                completed,
                skipped: userVisits.filter(v => v.status === 'SKIPPED').length
            };
        });

        // 6. Group by Supervisor (Manager)
        const supervisorGroups = {};
        tdvMetrics.forEach(tdv => {
            const supId = tdv.supervisorId;
            if (!supervisorGroups[supId]) {
                supervisorGroups[supId] = {
                    supervisorId: supId,
                    supervisorName: tdv.supervisorName,
                    tdvs: [],
                    totals: { planCall: 0, visited: 0, success: 0, totalValue: 0, completed: 0 }
                };
            }
            supervisorGroups[supId].tdvs.push(tdv);

            // Accumulate totals
            supervisorGroups[supId].totals.planCall += tdv.planCall;
            supervisorGroups[supId].totals.visited += tdv.visited;
            supervisorGroups[supId].totals.success += tdv.success;
            supervisorGroups[supId].totals.totalValue += tdv.totalValue;
            supervisorGroups[supId].totals.completed += tdv.completed;
        });

        // Calculate supervisor group averages/rates
        Object.values(supervisorGroups).forEach(group => {
            const totals = group.totals;
            totals.strikeRate = totals.completed > 0
                ? ((totals.success / totals.completed) * 100).toFixed(1)
                : 0;
            totals.skusPerOutlet = group.tdvs.length > 0
                ? (group.tdvs.reduce((s, t) => s + parseFloat(t.skusPerOutlet), 0) / group.tdvs.length).toFixed(1)
                : 0;
            totals.valuePerOutlet = totals.success > 0
                ? Math.round(totals.totalValue / totals.success)
                : 0;
        });

        // 7. Grand totals
        const grandTotals = {
            planCall: tdvMetrics.reduce((s, t) => s + t.planCall, 0),
            visited: tdvMetrics.reduce((s, t) => s + t.visited, 0),
            success: tdvMetrics.reduce((s, t) => s + t.success, 0),
            totalValue: tdvMetrics.reduce((s, t) => s + t.totalValue, 0),
            completed: tdvMetrics.reduce((s, t) => s + t.completed, 0)
        };
        grandTotals.strikeRate = grandTotals.completed > 0
            ? ((grandTotals.success / grandTotals.completed) * 100).toFixed(1)
            : 0;
        grandTotals.skusPerOutlet = tdvMetrics.length > 0
            ? (tdvMetrics.reduce((s, t) => s + parseFloat(t.skusPerOutlet), 0) / tdvMetrics.length).toFixed(1)
            : 0;
        grandTotals.valuePerOutlet = grandTotals.success > 0
            ? Math.round(grandTotals.totalValue / grandTotals.success)
            : 0;

        res.json({
            supervisorGroups: Object.values(supervisorGroups),
            grandTotals,
            tdvCount: tdvMetrics.length,
            totalVisits: visits.length
        });
    } catch (error) {
        console.error('Visit performance error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Live Tracking for Map
router.get('/live-tracking', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Get all active TDVs
        const safeIds = await getSafeUserIds(req.user);

        // If safeIds is strictly empty array, return empty (no permission)
        if (Array.isArray(safeIds) && safeIds.length === 0) {
            return res.json([]);
        }

        const tdvs = await prisma.user.findMany({
            where: {
                role: 'TDV',
                isActive: true,
                id: Array.isArray(safeIds) ? { in: safeIds } : undefined
            },
            select: { id: true, name: true, employeeCode: true, phone: true }
        });

        // 2. Get LATEST location for each TDV (Last Check-in ever)
        const trackingData = await Promise.all(tdvs.map(async (tdv) => {
            const lastVisit = await prisma.visitPlan.findFirst({
                where: {
                    userId: tdv.id,
                    checkInLat: { not: null }
                },
                orderBy: { checkInTime: 'desc' },
                select: {
                    checkInLat: true,
                    checkInLng: true,
                    checkInTime: true,
                    notes: true,
                    createdAt: true
                }
            });

            // Determine Status
            let status = 'OFFLINE'; // Default
            let lat = null;
            let lng = null;
            let lastUpdate = null;

            // Metadata
            let device = 'Chưa xác định';
            let battery = 'N/A';
            let signal = 'N/A';
            let appVersion = 'N/A';

            if (lastVisit) {
                lat = lastVisit.checkInLat;
                lng = lastVisit.checkInLng;
                lastUpdate = lastVisit.checkInTime || lastVisit.createdAt;

                // Check if active today
                const visitDate = new Date(lastUpdate);
                if (visitDate >= today) {
                    status = 'ACTIVE';
                }

                // Parse Metadata from Notes
                if (lastVisit.notes && lastVisit.notes.startsWith('{')) {
                    try {
                        const meta = JSON.parse(lastVisit.notes);
                        if (meta.battery) battery = meta.battery + '%';
                        if (meta.device) device = meta.device;
                        if (meta.signal) signal = meta.signal;
                        if (meta.appVersion) appVersion = meta.appVersion;
                    } catch (e) {
                        // ignore parse error protection
                    }
                }
            } else {
                status = 'NO_DATA';
            }

            return {
                id: tdv.id,
                name: tdv.name,
                code: tdv.employeeCode,
                lat,
                lng,
                status, // ACTIVE (Green), OFFLINE (Gray), NO_DATA (Hidden)
                lastUpdate,
                details: {
                    battery,
                    device,
                    signal,
                    appVersion
                }
            };
        }));

        res.json(trackingData);

    } catch (error) {
        console.error('Live tracking error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
