import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Lấy thông tin profile user
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        phone: true,
        avatar: true,
        createdAt: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Cập nhật profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        phone: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Lấy danh sách trạm của owner
router.get('/my-stations', auth, async (req, res) => {
  try {
    const stations = await prisma.chargingStation.findMany({
      where: { ownerId: req.user.id }
    });
    res.json(stations);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Tạo khuyến mãi cho trạm (chỉ owner)
router.post('/stations/:id/promotions', auth, async (req, res) => {
  try {
    const { title, description, discount, validFrom, validTo } = req.body;
    
    const station = await prisma.chargingStation.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    });

    if (!station) {
      return res.status(404).json({ message: 'Không tìm thấy trạm sạc hoặc bạn không có quyền' });
    }

    const currentPromotions = station.promotions || [];
    const newPromotion = {
      title,
      description,
      discount,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      isActive: true
    };

    const updatedStation = await prisma.chargingStation.update({
      where: { id: req.params.id },
      data: {
        promotions: [...currentPromotions, newPromotion]
      }
    });

    res.json(updatedStation);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Admin: Lấy danh sách tất cả users
router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        phone: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Admin: Xác minh trạm sạc
router.put('/admin/stations/:id/verify', adminAuth, async (req, res) => {
  try {
    const station = await prisma.chargingStation.update({
      where: { id: req.params.id },
      data: { isVerified: true }
    });

    if (!station) {
      return res.status(404).json({ message: 'Không tìm thấy trạm sạc' });
    }

    // Thưởng điểm cho owner khi trạm được xác minh
    await prisma.user.update({
      where: { id: station.ownerId },
      data: { points: { increment: 200 } }
    });

    res.json(station);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

export default router;