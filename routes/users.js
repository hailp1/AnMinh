import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Lấy danh sách users (cho tính năng tìm đồng nghiệp)
router.get('/', auth, async (req, res) => {
  try {
    const { role, hub } = req.query;
    const where = {};

    if (role) where.role = role;
    // if (hub) where.hub = hub; // User model might not have hub field directly, check schema if needed. 
    // Assuming 'hub' is stored in routeCode or similar, or just ignore for now if schema is unclear.
    // Based on AdminUsers.js, hub seems to be derived or stored. 
    // Let's check AdminUsers.js again... it displays user.hub but where does it come from?
    // In AdminUsers.js: 🏢 {user.hub}
    // In routes/users.js admin endpoint: select includes routeCode. 
    // Maybe hub is mapped from routeCode? Or maybe it's missing in schema?
    // For now, let's just filter by role if provided.

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        role: true,
        phone: true,
        email: true,
        routeCode: true,
        lastLogin: true, // To show online status/last seen
        // latitude: true, // Need to check if these exist in schema
        // longitude: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

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
        employeeCode: true,
        routeCode: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Admin: Tạo user mới
router.post('/admin/users', adminAuth, async (req, res) => {
  try {
    const { name, employeeCode, routeCode, email, phone, role, password } = req.body;

    if (!name || !employeeCode || !role || !password) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        employeeCode: employeeCode.toUpperCase(),
        routeCode: routeCode || null,
        email: email || null,
        phone: phone || null,
        role,
        password: hashedPassword,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        employeeCode: true,
        routeCode: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã nhân viên đã tồn tại' });
    }
    console.error(error.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Cập nhật user
router.put('/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, employeeCode, routeCode, email, phone, role, password, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (employeeCode !== undefined) updateData.employeeCode = employeeCode.toUpperCase();
    if (routeCode !== undefined) updateData.routeCode = routeCode || null;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.default.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        employeeCode: true,
        routeCode: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã nhân viên đã tồn tại' });
    }
    console.error(error.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Xóa user
router.delete('/admin/users/:id', adminAuth, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Xóa user thành công' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Lỗi server' });
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