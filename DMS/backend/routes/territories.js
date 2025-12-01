import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Lấy danh sách địa bàn
router.get('/', async (req, res) => {
  try {
    const { regionId, businessUnitId } = req.query;
    const where = { isActive: true };
    if (regionId) where.regionId = regionId;
    if (businessUnitId) where.businessUnitId = businessUnitId;

    const territories = await prisma.territory.findMany({
      where,
      include: {
        region: true,
        businessUnit: true,
        _count: {
          select: {
            customerAssignments: true,
            visitPlans: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });
    res.json(territories);
  } catch (error) {
    console.error('Error fetching territories:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo địa bàn mới
router.post('/', async (req, res) => {
  try {
    const { code, name, regionId, businessUnitId, description } = req.body;
    const territory = await prisma.territory.create({
      data: { code, name, regionId, businessUnitId, description },
      include: {
        region: true,
        businessUnit: true
      }
    });
    res.json(territory);
  } catch (error) {
    console.error('Error creating territory:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Mã địa bàn đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật địa bàn
router.put('/:id', async (req, res) => {
  try {
    const { code, name, regionId, businessUnitId, description, isActive } = req.body;
    const territory = await prisma.territory.update({
      where: { id: req.params.id },
      data: { code, name, regionId, businessUnitId, description, isActive },
      include: {
        region: true,
        businessUnit: true
      }
    });
    res.json(territory);
  } catch (error) {
    console.error('Error updating territory:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa địa bàn
router.delete('/:id', async (req, res) => {
  try {
    await prisma.territory.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Đã xóa địa bàn' });
  } catch (error) {
    console.error('Error deleting territory:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;

