import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Lấy danh sách phân bổ khách hàng
router.get('/', async (req, res) => {
  try {
    const { userId, pharmacyId, territoryId } = req.query;
    const where = { isActive: true };
    if (userId) where.userId = userId;
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (territoryId) where.territoryId = territoryId;

    const assignments = await prisma.customerAssignment.findMany({
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
      orderBy: { assignedAt: 'desc' }
    });
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Phân bổ khách hàng cho TDV
router.post('/', async (req, res) => {
  try {
    const { userId, pharmacyId, territoryId, notes } = req.body;
    
    // Kiểm tra đã phân bổ chưa
    const existing = await prisma.customerAssignment.findUnique({
      where: {
        userId_pharmacyId: { userId, pharmacyId }
      }
    });

    if (existing && existing.isActive) {
      return res.status(400).json({ message: 'Khách hàng đã được phân bổ cho TDV này' });
    }

    const assignment = await prisma.customerAssignment.create({
      data: {
        userId,
        pharmacyId,
        territoryId,
        notes,
        assignedBy: req.user?.id
      },
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true }
        },
        pharmacy: true,
        territory: true
      }
    });
    res.json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Khách hàng đã được phân bổ' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Phân bổ nhiều khách hàng cùng lúc
router.post('/bulk', async (req, res) => {
  try {
    const { userId, pharmacyIds, territoryId, notes } = req.body;
    
    const assignments = await Promise.all(
      pharmacyIds.map(async (pharmacyId) => {
        // Kiểm tra đã phân bổ chưa
        const existing = await prisma.customerAssignment.findUnique({
          where: {
            userId_pharmacyId: { userId, pharmacyId }
          }
        });

        if (existing && existing.isActive) {
          return null; // Bỏ qua nếu đã phân bổ
        }

        return prisma.customerAssignment.create({
          data: {
            userId,
            pharmacyId,
            territoryId,
            notes,
            assignedBy: req.user?.id
          }
        });
      })
    );

    const created = assignments.filter(a => a !== null);
    res.json({ 
      message: `Đã phân bổ ${created.length}/${pharmacyIds.length} khách hàng`,
      assignments: created 
    });
  } catch (error) {
    console.error('Error bulk assigning:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Hủy phân bổ
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customerAssignment.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Đã hủy phân bổ' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;

