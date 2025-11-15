import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/customer-segments - Lấy danh sách phân nhóm
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const segments = await prisma.customerSegment.findMany({
      where,
      include: {
        pharmacies: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    res.json(segments);
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phân nhóm' });
  }
});

// GET /api/customer-segments/:id - Lấy chi tiết phân nhóm
router.get('/:id', async (req, res) => {
  try {
    const segment = await prisma.customerSegment.findUnique({
      where: { id: req.params.id },
      include: {
        pharmacies: true,
      },
    });

    if (!segment) {
      return res.status(404).json({ error: 'Không tìm thấy phân nhóm' });
    }

    res.json(segment);
  } catch (error) {
    console.error('Error fetching customer segment:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin phân nhóm' });
  }
});

// POST /api/customer-segments - Tạo phân nhóm mới
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      criteria,
      minOrderAmount,
      minOrderCount,
      benefits,
      isActive,
    } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const segment = await prisma.customerSegment.create({
      data: {
        code,
        name,
        description,
        criteria,
        minOrderAmount,
        minOrderCount,
        benefits: benefits || [],
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(segment);
  } catch (error) {
    console.error('Error creating customer segment:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã phân nhóm đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi khi tạo phân nhóm' });
  }
});

// PUT /api/customer-segments/:id - Cập nhật phân nhóm
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      criteria,
      minOrderAmount,
      minOrderCount,
      benefits,
      isActive,
    } = req.body;

    const segment = await prisma.customerSegment.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        criteria,
        minOrderAmount,
        minOrderCount,
        benefits,
        isActive,
      },
    });

    res.json(segment);
  } catch (error) {
    console.error('Error updating customer segment:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật phân nhóm' });
  }
});

// DELETE /api/customer-segments/:id - Xóa phân nhóm
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customerSegment.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Xóa phân nhóm thành công' });
  } catch (error) {
    console.error('Error deleting customer segment:', error);
    res.status(500).json({ error: 'Lỗi khi xóa phân nhóm' });
  }
});

// POST /api/customer-segments/auto-assign - Tự động phân nhóm khách hàng
router.post('/auto-assign', async (req, res) => {
  try {
    const segments = await prisma.customerSegment.findMany({
      where: { isActive: true },
      orderBy: { minOrderAmount: 'desc' }, // Từ cao xuống thấp
    });

    const pharmacies = await prisma.pharmacy.findMany({
      include: {
        orders: {
          where: {
            status: { not: 'CANCELLED' },
          },
        },
      },
    });

    let assigned = 0;
    for (const pharmacy of pharmacies) {
      const totalAmount = pharmacy.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const orderCount = pharmacy.orders.length;

      // Tìm phân nhóm phù hợp
      let matchedSegment = null;
      for (const segment of segments) {
        if (
          (segment.minOrderAmount === null || totalAmount >= segment.minOrderAmount) &&
          (segment.minOrderCount === null || orderCount >= segment.minOrderCount)
        ) {
          matchedSegment = segment;
          break;
        }
      }

      if (matchedSegment) {
        await prisma.pharmacy.update({
          where: { id: pharmacy.id },
          data: { customerSegmentId: matchedSegment.id },
        });
        assigned++;
      }
    }

    res.json({ message: `Đã phân nhóm ${assigned} khách hàng` });
  } catch (error) {
    console.error('Error auto-assigning segments:', error);
    res.status(500).json({ error: 'Lỗi khi tự động phân nhóm' });
  }
});

export default router;

