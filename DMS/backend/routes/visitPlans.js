import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js'; // Ensure auth middleware is used (missing in original file but needed for req.user)
import { getSafeUserIds } from '../lib/dataScope.js';

const router = express.Router();

// Lấy danh sách kế hoạch viếng thăm
// Added auth middleware to ensure we have req.user
router.get('/', auth, async (req, res) => {
  try {
    const { userId, pharmacyId, visitDate, status } = req.query;
    let where = {};

    // --- DATA SCOPING ---
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds) {
      where.userId = { in: allowedIds };
    }

    if (userId) {
      // If requesting specific user, validate permission
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

    const visitPlans = await prisma.visitPlan.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, employeeCode: true } },
        pharmacy: true,
        territory: { include: { region: true, businessUnit: true } }
      },
      orderBy: [
        { visitDate: 'asc' },
        { visitTime: 'asc' }
      ]
    });
    res.json(visitPlans);
  } catch (error) {
    console.error('Error fetching visit plans:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy kế hoạch viếng thăm theo ngày cho TDV
router.get('/daily/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    // --- SCOPE CHECK ---
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds && !allowedIds.includes(userId)) {
      return res.status(403).json({ error: 'Không có quyền xem lịch trình của nhân viên này' });
    }

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

    // Lấy danh sách khách hàng đã được phân bổ nhưng chưa có kế hoạch viếng thăm
    const assignments = await prisma.customerAssignment.findMany({
      where: { userId, isActive: true },
      include: { pharmacy: true, territory: true }
    });

    const assignedPharmacyIds = visitPlans.map(vp => vp.pharmacyId);
    const unplannedCustomers = assignments
      .filter(a => !assignedPharmacyIds.includes(a.pharmacyId))
      .map(a => ({
        ...a.pharmacy,
        assignment: a,
        isPlanned: false
      }));

    res.json({
      planned: visitPlans,
      unplanned: unplannedCustomers
    });

  } catch (error) {
    console.error('Error fetching daily plans:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
