import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Lấy danh sách kế hoạch viếng thăm
router.get('/', async (req, res) => {
  try {
    const { userId, pharmacyId, visitDate, status } = req.query;
    const where = {};
    
    if (userId) where.userId = userId;
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (visitDate) {
      const date = new Date(visitDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.visitDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    if (status) where.status = status;

    const visitPlans = await prisma.visitPlan.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true }
        },
        pharmacy: true,
        territory: {
          include: {
            region: true,
            businessUnit: true
          }
        }
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
router.get('/daily/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    const visitDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(visitDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(visitDate.setHours(23, 59, 59, 999));

    const visitPlans = await prisma.visitPlan.findMany({
      where: {
        userId,
        visitDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        pharmacy: true,
        territory: true
      },
      orderBy: [
        { visitTime: 'asc' }
      ]
    });

    // Lấy danh sách khách hàng đã được phân bổ nhưng chưa có kế hoạch viếng thăm
    const assignments = await prisma.customerAssignment.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        pharmacy: true,
        territory: true
      }
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
      visitPlans,
      unplannedCustomers,
      date: visitDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching daily visit plans:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo kế hoạch viếng thăm
router.post('/', async (req, res) => {
  try {
    const { userId, pharmacyId, territoryId, visitDate, visitTime, purpose, notes } = req.body;
    
    const visitPlan = await prisma.visitPlan.create({
      data: {
        userId,
        pharmacyId,
        territoryId,
        visitDate: new Date(visitDate),
        visitTime,
        purpose,
        notes,
        status: 'PLANNED'
      },
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true }
        },
        pharmacy: true,
        territory: true
      }
    });
    res.json(visitPlan);
  } catch (error) {
    console.error('Error creating visit plan:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo nhiều kế hoạch viếng thăm cùng lúc
router.post('/bulk', async (req, res) => {
  try {
    const { plans } = req.body; // Array of { userId, pharmacyId, visitDate, visitTime, purpose, notes }
    
    const created = await prisma.visitPlan.createMany({
      data: plans.map(plan => ({
        ...plan,
        visitDate: new Date(plan.visitDate),
        status: 'PLANNED'
      }))
    });

    res.json({ 
      message: `Đã tạo ${created.count} kế hoạch viếng thăm`,
      count: created.count
    });
  } catch (error) {
    console.error('Error bulk creating visit plans:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật kế hoạch viếng thăm
router.put('/:id', async (req, res) => {
  try {
    const { visitDate, visitTime, purpose, notes, status } = req.body;
    const updateData = {};
    
    if (visitDate) updateData.visitDate = new Date(visitDate);
    if (visitTime !== undefined) updateData.visitTime = visitTime;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (notes !== undefined) updateData.notes = notes;
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    const visitPlan = await prisma.visitPlan.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true }
        },
        pharmacy: true,
        territory: true
      }
    });
    res.json(visitPlan);
  } catch (error) {
    console.error('Error updating visit plan:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa kế hoạch viếng thăm
router.delete('/:id', async (req, res) => {
  try {
    await prisma.visitPlan.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });
    res.json({ message: 'Đã hủy kế hoạch viếng thăm' });
  } catch (error) {
    console.error('Error deleting visit plan:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;

