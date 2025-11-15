import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Lấy danh sách khối kinh doanh
router.get('/', async (req, res) => {
  try {
    const { regionId } = req.query;
    const where = { isActive: true };
    if (regionId) where.regionId = regionId;

    const businessUnits = await prisma.businessUnit.findMany({
      where,
      include: {
        region: true,
        territories: {
          where: { isActive: true }
        }
      },
      orderBy: { code: 'asc' }
    });
    res.json(businessUnits);
  } catch (error) {
    console.error('Error fetching business units:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo khối kinh doanh mới
router.post('/', async (req, res) => {
  try {
    const { code, name, regionId, description } = req.body;
    const businessUnit = await prisma.businessUnit.create({
      data: { code, name, regionId, description },
      include: { region: true }
    });
    res.json(businessUnit);
  } catch (error) {
    console.error('Error creating business unit:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Mã khối đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật khối kinh doanh
router.put('/:id', async (req, res) => {
  try {
    const { code, name, regionId, description, isActive } = req.body;
    const businessUnit = await prisma.businessUnit.update({
      where: { id: req.params.id },
      data: { code, name, regionId, description, isActive },
      include: { region: true }
    });
    res.json(businessUnit);
  } catch (error) {
    console.error('Error updating business unit:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa khối kinh doanh
router.delete('/:id', async (req, res) => {
  try {
    await prisma.businessUnit.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Đã xóa khối kinh doanh' });
  } catch (error) {
    console.error('Error deleting business unit:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;

