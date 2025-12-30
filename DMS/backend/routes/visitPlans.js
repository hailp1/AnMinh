import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import { getSafeUserIds } from '../lib/dataScope.js';

const router = express.Router();

// Helper: Get ISO Week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

// Generate Visit Plans (Sinh Lịch)
router.post('/generate', auth, async (req, res) => {
  try {
    const { userId, pharmacyIds, startDate, endDate, daysOfWeek, frequency } = req.body;

    if (!userId || !pharmacyIds || !startDate || !endDate || !daysOfWeek) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const pharmacyMap = {};

    const pharmacies = await prisma.pharmacy.findMany({
      where: { id: { in: pharmacyIds } }
    });
    pharmacies.forEach(p => pharmacyMap[p.id] = p);

    const createdPlans = [];

    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const day = dt.getDay(); // 0-6
      // Frontend might send 0-6 or 1-7. Usually JS is 0=Sun. 
      // AdminRoutes sends: [day === 8 ? 0 : day - 1]. So 0=Sun, 1=Mon. Matches JS getDay().
      if (daysOfWeek.includes(day)) {
        if (frequency === 'F2-ODD' && getWeekNumber(dt) % 2 === 0) continue;
        if (frequency === 'F2-EVEN' && getWeekNumber(dt) % 2 !== 0) continue;

        for (const pId of pharmacyIds) {
          const pharm = pharmacyMap[pId];
          if (!pharm) continue;

          // Check duplicate
          const exists = await prisma.visitPlan.findFirst({
            where: { userId, pharmacyId: pId, visitDate: dt }
          });

          if (!exists) {
            const plan = await prisma.visitPlan.create({
              data: {
                userId,
                pharmacyId: pId,
                visitDate: new Date(dt), // Create new Date instance
                visitTime: '09:00', // String format as per schema
                status: 'PLANNED',
                territoryId: pharm.territoryId
              }
            });
            createdPlans.push(plan);
          }
        }
      }
    }
    res.json({ message: `Đã sinh ${createdPlans.length} lượt viếng thăm`, count: createdPlans.length });

  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import Routes to Visit Plans (if used)
router.post('/import-routes', auth, async (req, res) => {
  // Logic to import from Route table to Visit Plan directly? 
  // Currently AdminRoutes calls /generate directly.
  res.json({ message: 'Not implemented, use /generate' });
});

// Check-in
router.post('/check-in', auth, async (req, res) => {
  try {
    const { visitPlanId, latitude, longitude, address } = req.body;
    const plan = await prisma.visitPlan.update({
      where: { id: visitPlanId },
      data: {
        status: 'CHECKED_IN',
        checkInTime: new Date(),
        checkInLat: latitude,
        checkInLng: longitude,
        checkInAddress: address
      }
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-out
router.post('/check-out', auth, async (req, res) => {
  try {
    const { visitPlanId, notes, image } = req.body; // Image upload handling needed separately if raw file
    const plan = await prisma.visitPlan.update({
      where: { id: visitPlanId },
      data: {
        status: 'COMPLETED',
        checkOutTime: new Date(),
        notes
      }
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current Visit
router.get('/current/:userId', auth, async (req, res) => {
  try {
    const visit = await prisma.visitPlan.findFirst({
      where: {
        userId: req.params.userId,
        status: 'CHECKED_IN'
      },
      include: { pharmacy: true },
      orderBy: { checkInTime: 'desc' }
    });
    res.json(visit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD Endpoints (Standard)

// List
router.get('/', auth, async (req, res) => {
  try {
    const { userId, pharmacyId, visitDate, status } = req.query;
    let where = {};
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds) where.userId = { in: allowedIds };
    if (userId) {
      if (allowedIds && !allowedIds.includes(userId)) return res.json([]);
      where.userId = userId;
    }
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (visitDate) {
      const date = new Date(visitDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.visitDate = { gte: startOfDay, lte: endOfDay };
    }
    if (status) where.status = status;

    const items = await prisma.visitPlan.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, employeeCode: true } },
        pharmacy: true,
        territory: { include: { region: true, businessUnit: true } }
      },
      orderBy: [{ visitDate: 'asc' }, { visitTime: 'asc' }]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get By ID
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await prisma.visitPlan.findUnique({
      where: { id: req.params.id },
      include: { pharmacy: true, user: true, orders: true }
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Manual
router.post('/', auth, async (req, res) => {
  try {
    const plan = await prisma.visitPlan.create({ data: req.body });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await prisma.visitPlan.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.visitPlan.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daily for TDV
router.get('/daily/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds && !allowedIds.includes(userId)) return res.status(403).json({ error: 'Forbidden' });

    const visitDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(visitDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(visitDate.setHours(23, 59, 59, 999));

    const visitPlans = await prisma.visitPlan.findMany({
      where: {
        userId,
        visitDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' }
      },
      include: { pharmacy: true, territory: true },
      orderBy: [{ visitTime: 'asc' }]
    });

    const assignments = await prisma.customerAssignment.findMany({
      where: { userId, isActive: true },
      include: { pharmacy: true, territory: true }
    });

    const assignedPharmacyIds = visitPlans.map(vp => vp.pharmacyId);
    const unplannedCustomers = assignments
      .filter(a => !assignedPharmacyIds.includes(a.pharmacyId))
      .map(a => ({ ...a.pharmacy, assignment: a, isPlanned: false }));

    res.json({ planned: visitPlans, unplanned: unplannedCustomers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route Summary for Admin Map
router.get('/route-summary', auth, async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const visitDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(visitDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(visitDate.setHours(23, 59, 59, 999));
    const dayOfWeekIdx = visitDate.getDay();
    const vnDay = dayOfWeekIdx === 0 ? 8 : dayOfWeekIdx + 1;

    const [visits, routes, orders] = await Promise.all([
      prisma.visitPlan.findMany({ where: { userId, visitDate: { gte: startOfDay, lte: endOfDay } }, include: { pharmacy: true } }),
      prisma.route.findMany({ where: { userId, dayOfWeek: vnDay, isActive: true }, include: { pharmacy: true } }),
      prisma.order.findMany({ where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } } })
    ]);

    const combined = {};
    routes.forEach(r => {
      if (r.pharmacy) combined[r.pharmacyId] = { id: 'route-' + r.id, pharmacy: r.pharmacy, status: 'PLANNED', visitPlan: null, order: null };
    });
    visits.forEach(v => {
      if (combined[v.pharmacyId]) { combined[v.pharmacyId].status = v.status; combined[v.pharmacyId].visitPlan = v; }
      else if (v.pharmacy) { combined[v.pharmacyId] = { id: 'visit-' + v.id, pharmacy: v.pharmacy, status: v.status, visitPlan: v, order: null }; }
    });
    orders.forEach(o => {
      if (combined[o.pharmacyId]) combined[o.pharmacyId].order = o;
    });

    res.json(Object.values(combined));
  } catch (error) {
    console.error('Error fetching route summary:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
