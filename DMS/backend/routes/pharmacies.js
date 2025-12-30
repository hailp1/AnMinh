import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Lấy tổng quan số lượng nhà thuốc
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let where = {};

    if (req.user.role === 'TDV') {
      const assignedPharmacies = await prisma.customerAssignment.findMany({
        where: { userId },
        select: { pharmacyId: true },
      });
      const pharmacyIds = assignedPharmacies.map(ap => ap.pharmacyId);
      where.id = { in: pharmacyIds };
    }

    const count = await prisma.pharmacy.count({ where });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching pharmacy summary:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy danh sách nhà thuốc
router.get('/', auth, async (req, res) => {
  try {
    const { search, territoryId } = req.query;
    const userId = req.user.id;

    let where = {};

    // Nếu là PHARMACY_REP (TDV), chỉ lấy nhà thuốc được gán
    if (req.user.role === 'TDV') {
      const assignedPharmacies = await prisma.customerAssignment.findMany({
        where: { userId },
        select: { pharmacyId: true },
      });
      const pharmacyIds = assignedPharmacies.map(ap => ap.pharmacyId);
      where.id = { in: pharmacyIds };
    }

    // Filter by territory
    if (territoryId) {
      where.territoryId = territoryId;
    }

    // Search by name or address
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where,
      include: {
        territory: {
          include: { region: true }
        },
        customerSegment: true,
        customerAssignments: {
          include: {
            user: { select: { id: true, name: true, employeeCode: true } }
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    res.json(pharmacies);
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Lấy tất cả nhà thuốc (không filter)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      include: {
        territory: {
          include: {
            region: true
          }
        },
        customerSegment: {
          select: { id: true, name: true }
        },
        customerAssignments: {
          include: {
            user: { select: { id: true, name: true, employeeCode: true } }
          }
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

// Lấy chi tiết nhà thuốc
router.get('/:id', auth, async (req, res) => {
  try {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: req.params.id },
      include: {
        territory: { include: { region: true } },
        customerSegment: true,
        customerAssignments: {
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } }
          }
        },
        visitPlans: {
          take: 3,
          orderBy: { visitDate: 'desc' },
          where: { status: 'COMPLETED' }
        },
        orders: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
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
      territoryId,
      customerSegmentId,
      type,
      description,
      code,
      classification,
      channel,
      rawRegion,
      organizationType,
      pharmacistName,
      staffName,
      orderPhone,
      orderFrequency,
      linkCode,
      isChain
    } = req.body;

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name,
        code,
        ownerName,
        phone,
        email,
        address,
        province,
        district,
        ward,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        territoryId: territoryId || null,
        customerSegmentId: customerSegmentId || null,
        type: type || 'PHARMACY',
        description,
        classification,
        channel,
        rawRegion,
        organizationType,
        pharmacistName,
        staffName,
        orderPhone,
        orderFrequency,
        linkCode,
        isChain: isChain || false,
      },
    });

    // Auto-assign to TDV who created it
    if (req.user.role === 'TDV') {
      await prisma.customerAssignment.create({
        data: {
          userId: req.user.id,
          pharmacyId: pharmacy.id,
          territoryId: territoryId || null,
          isActive: true
        }
      });
      logger.info(`Auto-assigned pharmacy ${pharmacy.id} to TDV ${req.user.id}`);
    }

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
      territoryId,
      customerSegmentId,
      type,
      description,
      code,
      classification,
      channel,
      rawRegion,
      organizationType,
      pharmacistName,
      staffName,
      orderPhone,
      orderFrequency,
      linkCode,
      isChain
    } = req.body;

    const pharmacy = await prisma.pharmacy.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        ownerName,
        phone,
        email,
        address,
        province,
        district,
        ward,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        territoryId: territoryId || null,
        customerSegmentId: customerSegmentId || null,
        type,
        description,
        classification,
        channel,
        rawRegion,
        organizationType,
        pharmacistName,
        staffName,
        orderPhone,
        orderFrequency,
        linkCode,
        isChain,
      },
    });

    res.json(pharmacy);
  } catch (error) {
    console.error('Error updating pharmacy:', error);
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
