import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/promotions - Lấy danh sách khuyến mãi
router.get('/', async (req, res) => {
  try {
    const { isActive, type, pharmacyId } = req.query;
    
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (type) where.type = type;
    
    const promotions = await prisma.promotion.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        applications: {
          where: pharmacyId ? { pharmacyId } : undefined,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách khuyến mãi' });
  }
});

// GET /api/promotions/:id - Lấy chi tiết khuyến mãi
router.get('/:id', async (req, res) => {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        applications: {
          include: {
            order: true,
            pharmacy: true,
          },
        },
      },
    });

    if (!promotion) {
      return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    }

    res.json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin khuyến mãi' });
  }
});

// POST /api/promotions - Tạo khuyến mãi mới
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      type,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      applicableTo,
      customerSegmentIds = [],
      territoryIds = [],
      items = [],
    } = req.body;

    // Validate
    if (!code || !name || !type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const promotion = await prisma.promotion.create({
      data: {
        code,
        name,
        description,
        type,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        applicableTo: applicableTo || 'ALL',
        customerSegmentIds,
        territoryIds,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            discountValue: item.discountValue,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã khuyến mãi đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi khi tạo khuyến mãi' });
  }
});

// PUT /api/promotions/:id - Cập nhật khuyến mãi
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      applicableTo,
      customerSegmentIds,
      territoryIds,
      isActive,
      items,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (applicableTo !== undefined) updateData.applicableTo = applicableTo;
    if (customerSegmentIds !== undefined) updateData.customerSegmentIds = customerSegmentIds;
    if (territoryIds !== undefined) updateData.territoryIds = territoryIds;
    if (isActive !== undefined) updateData.isActive = isActive;

    const promotion = await prisma.promotion.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Cập nhật items nếu có
    if (items !== undefined) {
      // Xóa items cũ
      await prisma.promotionItem.deleteMany({
        where: { promotionId: req.params.id },
      });

      // Tạo items mới
      if (items.length > 0) {
        await prisma.promotionItem.createMany({
          data: items.map(item => ({
            promotionId: req.params.id,
            productId: item.productId,
            quantity: item.quantity,
            discountValue: item.discountValue,
          })),
        });
      }
    }

    const updatedPromotion = await prisma.promotion.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(updatedPromotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật khuyến mãi' });
  }
});

// DELETE /api/promotions/:id - Xóa khuyến mãi
router.delete('/:id', async (req, res) => {
  try {
    await prisma.promotion.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Xóa khuyến mãi thành công' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Lỗi khi xóa khuyến mãi' });
  }
});

// GET /api/promotions/available/:pharmacyId - Lấy khuyến mãi có thể áp dụng cho nhà thuốc
router.get('/available/:pharmacyId', async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const now = new Date();

    // Lấy thông tin nhà thuốc
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      include: {
        customerSegment: true,
        territory: true,
      },
    });

    if (!pharmacy) {
      return res.status(404).json({ error: 'Không tìm thấy nhà thuốc' });
    }

    // Tìm khuyến mãi có thể áp dụng
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { applicableTo: 'ALL' },
          {
            applicableTo: 'SEGMENT',
            customerSegmentIds: {
              has: pharmacy.customerSegmentId || '',
            },
          },
          {
            applicableTo: 'TERRITORY',
            territoryIds: {
              has: pharmacy.territoryId || '',
            },
          },
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(promotions);
  } catch (error) {
    console.error('Error fetching available promotions:', error);
    res.status(500).json({ error: 'Lỗi khi lấy khuyến mãi có thể áp dụng' });
  }
});

export default router;

