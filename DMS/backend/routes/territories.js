import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Lấy danh sách địa bàn
router.get('/', async (req, res) => {
  try {
    const { regionId } = req.query;
    const where = {};
    if (regionId) where.regionId = regionId;

    const territories = await prisma.territory.findMany({
      where,
      include: {
        region: true,
        _count: {
          select: {
            pharmacies: true
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
    const { code, name, regionId } = req.body;
    const territory = await prisma.territory.create({
      data: { code, name, regionId },
      include: {
        region: true
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
    const { code, name, regionId } = req.body;
    const territory = await prisma.territory.update({
      where: { id: req.params.id },
      data: { code, name, regionId },
      include: {
        region: true
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
    await prisma.territory.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Đã xóa địa bàn' });
  } catch (error) {
    console.error('Error deleting territory:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
