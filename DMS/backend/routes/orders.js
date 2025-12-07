import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Lấy tổng quan đơn hàng (cho Dashboard)
router.get('/summary', auth, async (req, res) => {
  try {
    const { userId } = req.query;
    let where = {};

    if (req.user.role === 'PHARMACY_REP') {
      where.userId = req.user.id;
    } else if (req.user.role === 'PHARMACY') {
      const pharmacy = await prisma.pharmacy.findFirst({
        where: { phone: req.user.phone },
      });
      if (pharmacy) {
        where.pharmacyId = pharmacy.id;
      } else {
        return res.json({ count: 0, revenue: 0 });
      }
    } else if (userId) {
      where.userId = userId;
    }

    const count = await prisma.order.count({ where });
    const aggregations = await prisma.order.aggregate({
      where,
      _sum: {
        totalAmount: true,
      },
    });

    res.json({
      count,
      revenue: aggregations._sum.totalAmount || 0
    });
  } catch (error) {
    console.error('Error fetching order summary:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy danh sách đơn hàng
router.get('/', auth, async (req, res) => {
  try {
    const { status, pharmacyId, userId } = req.query;

    let where = {};

    // Filter by role
    if (req.user.role === 'PHARMACY_REP') {
      where.userId = req.user.id;
    } else if (req.user.role === 'PHARMACY') {
      // Lấy đơn hàng của nhà thuốc (cần join với Pharmacy)
      const pharmacy = await prisma.pharmacy.findFirst({
        where: { phone: req.user.phone },
      });
      if (pharmacy) {
        where.pharmacyId = pharmacy.id;
      }
    } else if (req.user.role === 'DELIVERY') {
      // Delivery xem tất cả đơn hàng đang cần giao
      where.status = { in: ['CONFIRMED', 'PROCESSING', 'SHIPPING'] };
    } else if (req.user.role === 'ADMIN') {
      // Admin xem tất cả
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (pharmacyId) {
      where.pharmacyId = pharmacyId;
    }

    if (userId) {
      where.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        pharmacy: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            code: true,
            territory: {
              include: {
                businessUnit: true
              }
            }
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, code: true, unit: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Tạo đơn hàng mới
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'PHARMACY_REP' && req.user.role !== 'TDV') {
      return res.status(403).json({ error: 'Chỉ trình dược viên mới có thể tạo đơn hàng' });
    }

    const { pharmacyId, items, notes } = req.body;

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    // Calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(400).json({ error: `Sản phẩm ${item.productId} không tồn tại` });
      }

      const quantity = parseInt(item.quantity);
      const price = product.price;
      const subtotal = quantity * price;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        quantity,
        price,
        subtotal,
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        pharmacyId,
        status: 'PENDING',
        totalAmount,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        pharmacy: {
          select: { id: true, name: true, phone: true, address: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, code: true, unit: true },
            },
          },
        },
      },
    });

    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy chi tiết đơn hàng
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
        pharmacy: {
          select: { id: true, name: true, phone: true, address: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, code: true, unit: true, price: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Cập nhật trạng thái đơn hàng
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        pharmacy: {
          select: { id: true, name: true, phone: true, address: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, code: true, unit: true },
            },
          },
        },
      },
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;

