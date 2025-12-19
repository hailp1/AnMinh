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
    const { status, warehouseId } = req.body;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Order Status
      const order = await tx.order.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          items: true // We need items for stock deduction
        }
      });

      // 2. If CONFIRMED, deduct stock
      if (status === 'CONFIRMED') {
        // Find warehouse: Use provided ID or find 'MAIN' or first active
        let targetWarehouseId = warehouseId;
        if (!targetWarehouseId) {
          const mainWarehouse = await tx.warehouse.findFirst({
            where: { isActive: true },
            orderBy: { code: 'asc' } // Assume first code is Main or similar
          });
          targetWarehouseId = mainWarehouse?.id;
        }

        if (targetWarehouseId) {
          const transactionGroupCode = `OUT-${order.orderNumber}`;

          for (const item of order.items) {
            let remainingQty = item.quantity;

            // Find batches FIFO
            const batches = await tx.productBatch.findMany({
              where: {
                productId: item.productId,
                warehouseId: targetWarehouseId,
                currentQuantity: { gt: 0 },
                status: 'ACTIVE'
              },
              orderBy: { expiryDate: 'asc' }
            });

            // Deduct from batches
            for (const batch of batches) {
              if (remainingQty <= 0) break;

              const deduct = Math.min(remainingQty, batch.currentQuantity);

              // Update Batch
              await tx.productBatch.update({
                where: { id: batch.id },
                data: { currentQuantity: { decrement: deduct } }
              });

              // Create Transaction Record
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

            // Update InventoryItem (Total Stock in Warehouse)
            // Use upsert to be safe, though usually it should exist if batches exist
            // But if batches are missing (e.g. data inconsistency), we still assume stock might be tracked roughly
            // actually, if batches don't cover it, we might go negative or just record what we can?
            // For now, simple decrement of warehouse total
            const totalDeducted = item.quantity; // Deduct the full amount from 'currentQty' even if batches didn't cover it? 
            // Or match batches? Standard is strict: if not enough stock, maybe fail? 
            // Logic here: Deduct full amount from InventoryItem, allow negative if allowed (schema doesn't forbid int negative but logic might).
            // Let's deduct full amount to keep aggregate in sync with order.

            const invItem = await tx.inventoryItem.findUnique({
              where: { productId_warehouseId: { productId: item.productId, warehouseId: targetWarehouseId } }
            });

            if (invItem) {
              await tx.inventoryItem.update({
                where: { id: invItem.id },
                data: {
                  currentQty: { decrement: totalDeducted },
                  issuedQty: { increment: totalDeducted },
                  lastUpdated: new Date()
                }
              });
            } else {
              // Create if not exists (negative stock scenario)
              await tx.inventoryItem.create({
                data: {
                  productId: item.productId,
                  warehouseId: targetWarehouseId,
                  currentQty: -totalDeducted,
                  issuedQty: totalDeducted
                }
              });
            }
          }
        }
      }

      return order;
    });

    // Fetch final result to return (with relations)
    const finalOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        pharmacy: { select: { id: true, name: true, phone: true, address: true } },
        items: { include: { product: { select: { id: true, name: true, code: true, unit: true } } } }
      }
    });

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

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Chỉ có thể xóa đơn hàng khi đang chờ xử lý' });
    }

    if (req.user.role === 'PHARMACY_REP' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xóa đơn hàng này' });
    }

    // Delete items first (Cascade usually handles this, but safe to be explicit if not)
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });

    await prisma.order.delete({
      where: { id }
    });

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
    const { items, totalAmount, notes, discount, finalAmount, promotions } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Chỉ có thể sửa đơn hàng khi đang chờ xử lý' });
    }

    // Update Transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.order.update({
        where: { id },
        data: {
          totalAmount,
          notes,
          discount, // Make sure Schema has this (if not present, standard schema might need update, check below)
          // Store promotions in notes or separate field if Schema not updated for JSON
        }
      });

      // 2. Delete old items
      await tx.orderItem.deleteMany({ where: { orderId: id } });

      // 3. Create new items
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

      return tx.order.findUnique({
        where: { id },
        include: { items: true }
      });
    });

    res.json(updatedOrder);

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;

