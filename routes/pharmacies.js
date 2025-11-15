import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Lấy danh sách nhà thuốc
router.get('/', auth, async (req, res) => {
  try {
    const { hub, search } = req.query;
    const userId = req.user.id;

    let where = { isActive: true };

    // Nếu là PHARMACY_REP, chỉ lấy nhà thuốc được gán
    if (req.user.role === 'PHARMACY_REP') {
      const assignedPharmacies = await prisma.pharmacyRepPharmacy.findMany({
        where: { userId },
        select: { pharmacyId: true },
      });
      const pharmacyIds = assignedPharmacies.map(ap => ap.pharmacyId);
      where.id = { in: pharmacyIds };
    }

    // Filter by hub
    if (hub && hub !== 'all') {
      where.hub = hub;
    }

    // Search by name or address
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where,
      include: {
        pharmacyReps: {
          include: {
            user: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(pharmacies);
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy chi tiết nhà thuốc
router.get('/:id', auth, async (req, res) => {
  try {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: req.params.id },
      include: {
        pharmacyReps: {
          include: {
            user: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
        orders: {
          include: {
            user: {
              select: { id: true, name: true },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        revenueStats: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12,
        },
      },
    });

    if (!pharmacy) {
      return res.status(404).json({ error: 'Không tìm thấy nhà thuốc' });
    }

    res.json(pharmacy);
  } catch (error) {
    console.error('Error fetching pharmacy:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Tạo nhà thuốc mới
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      ownerName,
      phone,
      email,
      address,
      province,
      district,
      ward,
      latitude,
      longitude,
      hub,
      description,
    } = req.body;

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name,
        ownerName,
        phone,
        email,
        address,
        province,
        district,
        ward,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        hub: hub || 'CENTRAL',
        description,
        isVerified: false,
        isActive: true,
        images: [],
      },
    });

    res.json(pharmacy);
  } catch (error) {
    console.error('Error creating pharmacy:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Cập nhật nhà thuốc
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      ownerName,
      phone,
      email,
      address,
      province,
      district,
      ward,
      latitude,
      longitude,
      hub,
      description,
    } = req.body;

    const pharmacy = await prisma.pharmacy.update({
      where: { id: req.params.id },
      data: {
        name,
        ownerName,
        phone,
        email,
        address,
        province,
        district,
        ward,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        hub,
        description,
      },
    });

    res.json(pharmacy);
  } catch (error) {
    console.error('Error updating pharmacy:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Lấy tất cả nhà thuốc (không filter)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      include: {
        territory: {
          select: { id: true, name: true, code: true }
        },
        customerSegment: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(pharmacies);
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Xóa nhà thuốc
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await prisma.pharmacy.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Xóa nhà thuốc thành công' });
  } catch (error) {
    console.error('Error deleting pharmacy:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;

