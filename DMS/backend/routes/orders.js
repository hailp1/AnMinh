import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import { getSafeUserIds } from '../lib/dataScope.js';
import { cache } from '../lib/cache.js';

const router = express.Router();

// Lấy tổng quan đơn hàng (cho Dashboard)
router.get('/summary', auth, async (req, res) => {
  try {
    const { userId } = req.query;
    let where = {};

    // --- DATA SCOPING ---
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds) {
      if (userId) {
        // Cannot view data outside scope
        if (!allowedIds.includes(userId)) return res.json({ count: 0, revenue: 0 });
        where.userId = userId;
      } else {
        where.userId = { in: allowedIds };
      }
    } else if (userId) {
      // Full access user looking at specific user
      where.userId = userId;
    }

    // Legacy/Specific Role Logic
    if (req.user.role === 'PHARMACY_REP') {
      where.userId = req.user.id;
    } else if (req.user.role === 'PHARMACY') {
      const pharmacy = await prisma.pharmacy.findFirst({ where: { phone: req.user.phone } });
      if (pharmacy) where.pharmacyId = pharmacy.id;
      else return res.json({ count: 0, revenue: 0 });
    }

    const count = await prisma.order.count({ where });
    const aggregations = await prisma.order.aggregate({
      where,
      _sum: { totalAmount: true },
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
    const { status, pharmacyId, userId, page = 1, limit = 20 } = req.query;

    // Create cache key
    const cacheKey = `orders:list:${req.user.id}:${status || 'all'}:${pharmacyId || 'all'}:${userId || 'all'}:${page}:${limit}`;

    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let where = {};

    // --- DATA SCOPING ---
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds) {
      where.userId = { in: allowedIds };
    }

    // Additional Filters
    if (req.user.role === 'PHARMACY_REP') {
      where.userId = req.user.id;
    } else if (req.user.role === 'PHARMACY') {
      const pharmacy = await prisma.pharmacy.findFirst({ where: { phone: req.user.phone } });
      if (pharmacy) where.pharmacyId = pharmacy.id;
    } else if (req.user.role === 'DELIVERY') {
      where.status = { in: ['CONFIRMED', 'PROCESSING', 'SHIPPING'] };
    }

    if (status && status !== 'all') where.status = status;
    if (pharmacyId) where.pharmacyId = pharmacyId;

    // If strict userId requested (and passed scope check implicitly by 'AND' query or needs explicit check)
    if (userId) {
      if (allowedIds && !allowedIds.includes(userId)) return res.json({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
      where.userId = userId;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Parallel queries for data and count
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true } },
          pharmacy: {
            select: {
              id: true, name: true, phone: true, address: true, code: true
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              subtotal: true,
              product: { select: { id: true, name: true, code: true, unit: true } }
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where })
    ]);

    const result = {
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };

    // Cache for 2 minutes
    await cache.set(cacheKey, result, 120);

    res.json(result);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Tạo đơn hàng mới
router.post('/', auth, async (req, res) => {
  try {
    // Basic role check (can extend to allow Managers to create for staff?)
    if (!['PHARMACY_REP', 'TDV', 'MANAGER', 'ADMIN', 'BU_HEAD'].includes(req.user.role)) {
      // Legacy check was strict for REP only, but we should allow Managers/Admins too if needed
      // Checking original logic:
      if (req.user.role !== 'PHARMACY_REP' && req.user.role !== 'TDV') {
        // Allow ADMIN for testing
        if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER')
          return res.status(403).json({ error: 'Chỉ trình dược viên mới có thể tạo đơn hàng' });
      }
    }

    const { pharmacyId, items, notes } = req.body;

    const orderCount = await prisma.order.count();
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    // OPTIMIZATION: Batch product lookup instead of N+1 queries
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, name: true, code: true }
    });

    // Create product map for O(1) lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) return res.status(400).json({ error: `Sản phẩm ${item.productId} không tồn tại` });

      const quantity = parseInt(item.quantity);
      const price = product.price;
      const subtotal = quantity * price;
      totalAmount += subtotal;

      orderItems.push({ productId: product.id, quantity, price, subtotal });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        pharmacyId,
        status: 'PENDING',
        totalAmount,
        notes,
        items: { create: orderItems },
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        pharmacy: { select: { id: true, name: true, phone: true, address: true } },
        items: { include: { product: { select: { id: true, name: true, code: true, unit: true } } } },
      },
    });

    // Invalidate order list cache
    await cache.delPattern(`orders:list:${req.user.id}:*`);

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
        user: { select: { id: true, name: true, phone: true, email: true } },
        pharmacy: { select: { id: true, name: true, phone: true, address: true } },
        items: { include: { product: { select: { id: true, name: true, code: true, unit: true, price: true } } } },
      },
    });

    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    // SCOPE CHECK for Single Item
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds && !allowedIds.includes(order.userId)) {
      return res.status(403).json({ error: 'Không có quyền truy cập đơn hàng này' });
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
    const { status, warehouseId } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: req.params.id },
        data: { status },
        include: { items: true }
      });

      if (status === 'CONFIRMED') {
        let targetWarehouseId = warehouseId;
        if (!targetWarehouseId) {
          const mainWarehouse = await tx.warehouse.findFirst({ where: { isActive: true }, orderBy: { code: 'asc' } });
          targetWarehouseId = mainWarehouse?.id;
        }

        if (targetWarehouseId) {
          const transactionGroupCode = `OUT-${order.orderNumber}`;
          for (const item of order.items) {
            let remainingQty = item.quantity;
            const batches = await tx.productBatch.findMany({
              where: { productId: item.productId, warehouseId: targetWarehouseId, currentQuantity: { gt: 0 }, status: 'ACTIVE' },
              orderBy: { expiryDate: 'asc' }
            });

            for (const batch of batches) {
              if (remainingQty <= 0) break;
              const deduct = Math.min(remainingQty, batch.currentQuantity);
              await tx.productBatch.update({ where: { id: batch.id }, data: { currentQuantity: { decrement: deduct } } });
              await tx.inventoryTransaction.create({
                data: {
                  type: 'EXPORT',
                  transactionNo: `${transactionGroupCode}-${item.productId}-${batch.batchNumber}`,
                  productId: item.productId,
                  warehouseId: targetWarehouseId,
                  quantity: deduct,
                  unitPrice: item.price,
                  totalAmount: item.price * deduct,
                  batchNumber: batch.batchNumber,
                  reason: `Xuất kho đơn hàng ${order.orderNumber}`,
                  orderId: order.id,
                  createdBy: req.user.id
                }
              });
              remainingQty -= deduct;
            }

            const totalDeducted = item.quantity;
            const invItem = await tx.inventoryItem.findUnique({
              where: { productId_warehouseId: { productId: item.productId, warehouseId: targetWarehouseId } }
            });
            if (invItem) {
              await tx.inventoryItem.update({
                where: { id: invItem.id },
                data: { currentQty: { decrement: totalDeducted }, issuedQty: { increment: totalDeducted }, lastUpdated: new Date() }
              });
            } else {
              await tx.inventoryItem.create({
                data: { productId: item.productId, warehouseId: targetWarehouseId, currentQty: -totalDeducted, issuedQty: totalDeducted }
              });
            }
          }
        }
      }
      return order;
    });

    const finalOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        pharmacy: { select: { id: true, name: true, phone: true, address: true } },
        items: { include: { product: { select: { id: true, name: true, code: true, unit: true } } } }
      }
    });

    // Invalidate order list cache
    await cache.delPattern(`orders:list:*`);

    res.json(finalOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xóa đơn hàng (Chỉ PENDING)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (order.status !== 'PENDING') return res.status(400).json({ message: 'Chỉ có thể xóa đơn hàng khi đang chờ xử lý' });

    // Check permission
    if (req.user.role === 'PHARMACY_REP' && order.userId !== req.user.id) return res.status(403).json({ message: 'Không có quyền xóa đơn hàng này' });

    // Scope check
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds && !allowedIds.includes(order.userId)) return res.status(403).json({ message: 'Không có quyền truy cập đơn hàng này' });

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    // Invalidate order list cache
    await cache.delPattern(`orders:list:*`);

    res.json({ message: 'Đã xóa đơn hàng thành công' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật đơn hàng (Chỉ PENDING)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { items, totalAmount, notes, discount } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (order.status !== 'PENDING') return res.status(400).json({ message: 'Chỉ có thể sửa đơn hàng khi đang chờ xử lý' });

    // Scope check
    const allowedIds = await getSafeUserIds(req.user);
    if (allowedIds && !allowedIds.includes(order.userId)) return res.status(403).json({ message: 'Không có quyền sửa đơn hàng này' });

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { totalAmount, notes, discount }
      });
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      if (items && items.length > 0) {
        await tx.orderItem.createMany({
          data: items.map(item => ({
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            unit: item.unit
          }))
        });
      }
      return tx.order.findUnique({ where: { id }, include: { items: true } });
    });

    // Invalidate order list cache
    await cache.delPattern(`orders:list:*`);

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
