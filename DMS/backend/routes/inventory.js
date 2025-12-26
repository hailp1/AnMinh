import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { validate, inventoryValidators } from '../middleware/validators.js';

const router = express.Router();

// --- WAREHOUSES ---

// Get all warehouses
router.get('/warehouses', auth, async (req, res) => {
    try {
        const warehouses = await prisma.warehouse.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(warehouses);
    } catch (error) {
        console.error('Get warehouses error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create warehouse
router.post('/warehouses', [adminAuth, ...inventoryValidators.createWarehouse, validate], async (req, res) => {
    try {
        console.log('Creating warehouse with data:', req.body);
        const { code, name, address, type, managerId } = req.body;

        // Check if warehouse code already exists
        const existing = await prisma.warehouse.findUnique({ where: { code } });
        if (existing) {
            return res.status(400).json({ error: 'Mã kho đã tồn tại' });
        }

        const warehouse = await prisma.warehouse.create({
            data: {
                code,
                name,
                address: address || null,
                type: type || 'BRANCH',
                managerId: managerId || null
            }
        });

        console.log('Warehouse created:', warehouse);
        res.json(warehouse);
    } catch (error) {
        console.error('Error creating warehouse:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update warehouse
router.put('/warehouses/:id', adminAuth, async (req, res) => {
    try {
        const { name, address, type, managerId, isActive } = req.body;
        const warehouse = await prisma.warehouse.update({
            where: { id: req.params.id },
            data: { name, address, type, managerId, isActive }
        });
        res.json(warehouse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete warehouse
router.delete('/warehouses/:id', adminAuth, async (req, res) => {
    try {
        const hasItems = await prisma.inventoryItem.findFirst({
            where: { warehouseId: req.params.id, currentQty: { gt: 0 } }
        });
        if (hasItems) return res.status(400).json({ error: 'Kho còn hàng, không thể xóa' });

        await prisma.warehouse.delete({ where: { id: req.params.id } });
        res.json({ message: 'Deleted warehouse' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- STOCK & INVENTORY ---

// Get inventory items (stock overview)
router.get('/stock', auth, async (req, res) => {
    try {
        const { warehouseId, search } = req.query;
        const where = {};

        if (warehouseId && warehouseId !== 'all') where.warehouseId = warehouseId;

        if (search) {
            where.product = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { code: { contains: search, mode: 'insensitive' } }
                ]
            };
        }

        const stock = await prisma.inventoryItem.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        unit: true,
                        minStock: true,
                        maxStock: true,
                        manufacturer: true,
                        group: { select: { name: true } }
                    }
                },
                warehouse: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { product: { name: 'asc' } }
        });
        res.json(stock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- BATCHES ---

// Get batches
router.get('/batches', auth, async (req, res) => {
    try {
        const { productId, warehouseId, expiringSoon } = req.query;
        const where = {};

        if (productId) where.productId = productId;
        if (warehouseId && warehouseId !== 'all') where.warehouseId = warehouseId;

        if (expiringSoon === 'true') {
            const threeMonthsFromNow = new Date();
            threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
            where.expiryDate = {
                lte: threeMonthsFromNow,
                gte: new Date()
            };
        }

        const batches = await prisma.productBatch.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, code: true, unit: true } },
                warehouse: { select: { id: true, name: true } }
            },
            orderBy: { expiryDate: 'asc' }
        });
        res.json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- STATISTICS ---
// Get Dashboard Stats
router.get('/dashboard', auth, async (req, res) => {
    try {
        const warehouseId = req.query.warehouseId;
        const whereWarehouse = (warehouseId && warehouseId !== 'all') ? { warehouseId } : {};

        // 1. Inventory Value & Low Stock
        const items = await prisma.inventoryItem.findMany({
            where: whereWarehouse,
            include: { product: { select: { price: true, minStock: true } } }
        });

        let totalValue = 0;
        let lowStockCount = 0;

        items.forEach(item => {
            const price = Number(item.product?.price || 0);
            totalValue += (item.currentQty * price);
            if (item.currentQty < (item.product?.minStock || 10)) {
                lowStockCount++;
            }
        });

        // 2. Transactions This Month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const trxs = await prisma.inventoryTransaction.groupBy({
            by: ['type'],
            _sum: { totalAmount: true },
            where: {
                ...whereWarehouse,
                transactionDate: { gte: startOfMonth }
            }
        });

        let importVal = 0;
        let exportVal = 0;
        trxs.forEach(t => {
            if (t.type === 'IMPORT') importVal = Number(t._sum.totalAmount || 0);
            if (t.type === 'EXPORT') exportVal = Number(t._sum.totalAmount || 0);
        });

        // 3. Expiring Batches
        const expiringDate = new Date();
        expiringDate.setDate(expiringDate.getDate() + 30);

        const expiringCount = await prisma.productBatch.count({
            where: {
                ...whereWarehouse,
                expiryDate: { lte: expiringDate, gte: now },
                currentQuantity: { gt: 0 }
            }
        });

        // 4. Chart Data (Last 30 days transactions trend)
        const startOf30d = new Date();
        startOf30d.setDate(startOf30d.getDate() - 30);

        const dailyTrx = await prisma.inventoryTransaction.groupBy({
            by: ['transactionDate', 'type'],
            _sum: { totalAmount: true },
            where: {
                ...whereWarehouse,
                transactionDate: { gte: startOf30d }
            },
            orderBy: { transactionDate: 'asc' }
        });

        res.json({
            stats: {
                totalValue,
                lowStockCount,
                importMonth: importVal,
                exportMonth: exportVal,
                expiringCount
            },
            chart: dailyTrx
        });

    } catch (error) {
        console.error('Inventory dashboard stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- TRANSACTIONS ---

// Get transactions history
router.get('/transactions', [auth, ...inventoryValidators.getTransactions, validate], async (req, res) => {
    try {
        const { warehouseId, type, startDate, endDate } = req.query;
        const where = {};

        if (warehouseId && warehouseId !== 'all') where.warehouseId = warehouseId;
        if (type && type !== 'all') where.type = type;

        if (startDate && endDate) {
            where.transactionDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const transactions = await prisma.inventoryTransaction.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, code: true } },
                warehouse: { select: { id: true, name: true } },
                order: { select: { id: true, orderNumber: true } }
            },
            orderBy: { transactionDate: 'desc' },
            take: 100 // Limit to last 100
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create stock transaction (Import/Export/Transfer)
router.post('/transactions', [auth, ...inventoryValidators.createTransaction, validate], async (req, res) => {
    const {
        type, // IMPORT, EXPORT, TRANSFER
        warehouseId,
        toWarehouseId, // Required for TRANSFER
        items, // Array of { productId, quantity, batchNumber, expiryDate, price, unitPrice }
        reason,
        notes,
        supplierId,
        orderId // Optional
    } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Danh sách sản phẩm trống' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const createdTransactions = [];
            const transactionGroupCode = `TRX${Date.now()}`;

            for (const item of items) {
                const { productId, quantity, batchNumber, expiryDate, unitPrice } = item;
                const qty = parseInt(quantity);

                // Validation for TRANSFER
                if (type === 'TRANSFER' && !toWarehouseId) {
                    throw new Error('Thiếu kho đích cho chuyển kho');
                }
                const targetWarehouseId = type === 'TRANSFER' ? toWarehouseId : warehouseId;

                // 1. Create Transaction Logs
                // For TRANSFER, we might want to log Source Out and Dest In? 
                // Currently schema supports single record with from/to.
                const transaction = await tx.inventoryTransaction.create({
                    data: {
                        type,
                        transactionNo: `${transactionGroupCode}-${productId}`,
                        productId,
                        warehouseId: warehouseId, // Source / Main Point
                        fromWarehouseId: (type === 'TRANSFER' || type === 'EXPORT') ? warehouseId : null,
                        toWarehouseId: (type === 'TRANSFER' || type === 'IMPORT') ? targetWarehouseId : null,
                        quantity: qty,
                        unitPrice: parseFloat(unitPrice || 0),
                        totalAmount: parseFloat(unitPrice || 0) * qty,
                        batchNumber: batchNumber || null,
                        reason,
                        notes,
                        supplierId,
                        orderId,
                        createdBy: req.user.id
                    }
                });
                createdTransactions.push(transaction);

                // --- STOCK MOVEMENTS ---

                // A. SOURCE (Decrease) - For EXPORT and TRANSFER
                if (type === 'EXPORT' || type === 'TRANSFER') {
                    // Check Stock
                    const sourceItem = await tx.inventoryItem.findUnique({
                        where: { productId_warehouseId: { productId, warehouseId } }
                    });
                    if (!sourceItem || sourceItem.currentQty < qty) {
                        throw new Error(`Kho nguồn không đủ hàng: SP ${productId}`);
                    }

                    // Decrement Source
                    await tx.inventoryItem.update({
                        where: { id: sourceItem.id },
                        data: {
                            currentQty: { decrement: qty },
                            issuedQty: { increment: type === 'EXPORT' ? qty : 0 },
                            lastUpdated: new Date()
                        }
                    });

                    // Decrement Source Batch
                    if (batchNumber) {
                        const sourceBatch = await tx.productBatch.findFirst({
                            where: { productId, batchNumber, warehouseId }
                        });
                        if (!sourceBatch || sourceBatch.currentQuantity < qty) {
                            throw new Error(`Lô ${batchNumber} không đủ hàng tại kỹ nguồn`);
                        }
                        await tx.productBatch.update({
                            where: { id: sourceBatch.id },
                            data: { currentQuantity: { decrement: qty } }
                        });
                    }
                }

                // B. DESTINATION (Increase) - For IMPORT and TRANSFER
                if (type === 'IMPORT' || type === 'TRANSFER') {
                    const destWhId = type === 'TRANSFER' ? targetWarehouseId : warehouseId;

                    // Increment Dest Item
                    const destItem = await tx.inventoryItem.findUnique({
                        where: { productId_warehouseId: { productId, warehouseId: destWhId } }
                    });

                    if (destItem) {
                        await tx.inventoryItem.update({
                            where: { id: destItem.id },
                            data: {
                                currentQty: { increment: qty },
                                receivedQty: { increment: type === 'IMPORT' ? qty : 0 }, // For Transfer, we don't count as "received" in Purchase sense, but maybe we should? Let's skip for now to distinct.
                                lastUpdated: new Date()
                            }
                        });
                    } else {
                        await tx.inventoryItem.create({
                            data: {
                                productId,
                                warehouseId: destWhId,
                                currentQty: qty,
                                receivedQty: type === 'IMPORT' ? qty : 0,
                                issuedQty: 0
                            }
                        });
                    }

                    // Increment Dest Batch
                    if (batchNumber) {
                        const destBatch = await tx.productBatch.findFirst({
                            where: { productId, batchNumber, warehouseId: destWhId }
                        });

                        if (destBatch) {
                            await tx.productBatch.update({
                                where: { id: destBatch.id },
                                data: { currentQuantity: { increment: qty } }
                            });
                        } else {
                            await tx.productBatch.create({
                                data: {
                                    productId,
                                    batchNumber,
                                    expiryDate: expiryDate ? new Date(expiryDate) : null,
                                    initialQuantity: qty,
                                    currentQuantity: qty,
                                    warehouseId: destWhId,
                                    status: 'ACTIVE'
                                }
                            });
                        }
                    }
                }
            }

            return createdTransactions;
        });

        res.json(result);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
