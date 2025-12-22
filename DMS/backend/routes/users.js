import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { getSafeUserIds } from '../lib/dataScope.js'; // Import Update

const router = express.Router();

// Lấy danh sách users (cho tính năng tìm đồng nghiệp & Dropdown lọc nhân viên của Manager)
router.get('/', auth, async (req, res) => {
  try {
    const { role, hub } = req.query;
    const where = {};

    if (role) where.role = role;

    // --- DATA SCOPING ---
    // Ensure Managers only see their own subordinates in dropdowns/lists
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds) {
      where.id = { in: allowedIds };
    }

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
        region: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } }, // Useful for frontend to show manager
        employeeCode: true
      },
      orderBy: { name: 'asc' }
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
        employeeCode: true,
        routeCode: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        manager: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } },
        channel: true
      }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [salesStats, visitStats, visitTarget] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: {
          userId: req.user.id,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.visitPlan.count({
        where: {
          userId: req.user.id,
          visitDate: { gte: startOfMonth, lte: endOfMonth },
          status: 'COMPLETED'
        }
      }),
      prisma.visitPlan.count({
        where: {
          userId: req.user.id,
          visitDate: { gte: startOfMonth, lte: endOfMonth }
        }
      })
    ]);

    const stats = {
      monthlySales: salesStats._sum.totalAmount || 0,
      monthlyOrders: salesStats._count.id || 0,
      visitCount: visitStats || 0,
      visitTarget: visitTarget || 0
    };

    res.json({ ...user, stats });
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
        id: true, name: true, email: true, role: true, phone: true, createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Admin: Lấy danh sách tất cả users (Full Access)
router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    // Admin always sees all, but we can add scope here if we want 'Super Admin' vs 'Regular Admin'
    // For now, keep as full access
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

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username: employeeCode.toUpperCase(),
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
        id: true, name: true, employeeCode: true, routeCode: true, email: true,
        role: true, phone: true, isActive: true, createdAt: true, channel: true,
        manager: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } }
      }
    });

    // Auto-sync to Employee (Org Chart)
    await syncEmployeeForUser(user.id);

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
      updateData.username = employeeCode.toUpperCase();
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
        id: true, name: true, employeeCode: true, routeCode: true, email: true,
        role: true, phone: true, isActive: true, createdAt: true, channel: true,
        manager: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } }
      }
    });

    // Auto-sync to Employee (Org Chart)
    await syncEmployeeForUser(user.id);

    res.json(user);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Mã nhân viên hoặc Email đã tồn tại' });
    console.error(error.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Xóa user
router.delete('/admin/users/:id', adminAuth, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Xóa user thành công' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;

// --- OPTIMIZED SYNC HELPER ---
async function syncEmployeeForUser(userId) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // 1. Map Role -> Position Code
    const roleToPos = {
      'ADMIN': 'BU_HEAD', 'CEO': 'CEO', 'BU_HEAD': 'BU_HEAD',
      'RSM': 'RSM', 'ASM': 'ASM', 'QL': 'ASM', // Map QL -> ASM generic
      'SS': 'SS', 'TDV': 'TDV'
    };
    let posCode = roleToPos[user.role] || 'TDV';

    // 2. Get Position ID
    let pos = await prisma.orgPosition.findUnique({ where: { code: posCode } });
    // Fallback: If position code not found, try to find ANY existing position or default to TDV
    if (!pos) pos = await prisma.orgPosition.findFirst({ where: { code: 'TDV' } });

    // 3. Find Manager's Employee Record (to link hierarchy)
    let managerEmpId = null;
    if (user.managerId) {
      const managerEmp = await prisma.employee.findUnique({ where: { userId: user.managerId } });
      if (managerEmp) managerEmpId = managerEmp.id;
    }

    // 4. Update or Create Employee Record
    await prisma.employee.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        employeeCode: user.employeeCode || `E${user.username}`,
        name: user.name || user.username,
        email: user.email,
        phone: user.phone,
        status: user.isActive ? 'ACTIVE' : 'INACTIVE',
        positionId: pos ? pos.id : undefined,
        managerId: managerEmpId
      },
      update: {
        name: user.name || user.username,
        email: user.email,
        phone: user.phone,
        status: user.isActive ? 'ACTIVE' : 'INACTIVE',
        positionId: pos ? pos.id : undefined,
        managerId: managerEmpId
      }
    });

  } catch (err) {
    console.error("Auto-Sync Employee Failed:", err.message);
  }
}