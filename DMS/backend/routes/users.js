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

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        role: true,
        phone: true,
        email: true,
        routeCode: true,
        channel: true,
        region: { select: { id: true, name: true } }
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
        phone: true,
        // avatar: true, // Removed as not in schema yet
        createdAt: true,
        manager: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } },
        channel: true
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
        phone: true,
        // avatar: true,
        createdAt: true
      }
    });

    res.json(user);
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
        username: true,
        routeCode: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        channel: true,
        manager: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } }
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
    const { name, employeeCode, routeCode, email, phone, role, password, managerId, regionId, channel } = req.body;

    if (!name || !employeeCode || !role || !password) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username: employeeCode.toUpperCase(), // Username defaults to employeeCode
        employeeCode: employeeCode.toUpperCase(),
        routeCode: routeCode || null,
        email: email || null,
        phone: phone || null,
        role,
        password: hashedPassword,
        isActive: true,
        managerId: managerId || null,
        regionId: regionId || null,
        channel: channel || null
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
        createdAt: true,
        channel: true,
        manager: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã nhân viên hoặc Email đã tồn tại' });
    }
    console.error(error.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Cập nhật user
router.put('/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, employeeCode, routeCode, email, phone, role, password, isActive, managerId, regionId, channel } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (employeeCode !== undefined) {
      updateData.employeeCode = employeeCode.toUpperCase();
      updateData.username = employeeCode.toUpperCase(); // Sync username
    }
    if (routeCode !== undefined) updateData.routeCode = routeCode || null;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (managerId !== undefined) updateData.managerId = managerId || null;
    if (regionId !== undefined) updateData.regionId = regionId || null;
    if (channel !== undefined) updateData.channel = channel || null;

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
        createdAt: true,
        channel: true,
        manager: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } }
      }
    });

    res.json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã nhân viên hoặc Email đã tồn tại' });
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

export default router;