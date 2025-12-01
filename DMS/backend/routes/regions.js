import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Lấy danh sách vùng
router.get('/', async (req, res) => {
  try {
    const regions = await prisma.region.findMany({
      where: { isActive: true },
      include: {
        businessUnits: {
          where: { isActive: true },
          include: {
            territories: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { code: 'asc' }
    });
    res.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy chi tiết vùng
router.get('/:id', async (req, res) => {
  try {
    const region = await prisma.region.findUnique({
      where: { id: req.params.id },
      include: {
        businessUnits: {
          include: {
            territories: true
          }
        }
      }
    });
    if (!region) {
      return res.status(404).json({ message: 'Không tìm thấy vùng' });
    }
    res.json(region);
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo vùng mới
router.post('/', async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const region = await prisma.region.create({
      data: { code, name, description }
    });
    res.json(region);
  } catch (error) {
    console.error('Error creating region:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Mã vùng đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật vùng
router.put('/:id', async (req, res) => {
  try {
    const { code, name, description, isActive } = req.body;
    const region = await prisma.region.update({
      where: { id: req.params.id },
      data: { code, name, description, isActive }
    });
    res.json(region);
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa vùng
router.delete('/:id', async (req, res) => {
  try {
    await prisma.region.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Đã xóa vùng' });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;

