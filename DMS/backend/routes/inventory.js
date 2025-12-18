import express from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { validate, inventoryValidators } from '../middleware/validators.js';

const router = express.Router();
const prisma = new PrismaClient();

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

// Create stock transaction (Import/Export)
router.post('/transactions', [auth, ...inventoryValidators.createTransaction, validate], async (req, res) => {
    const {
        type, // IMPORT, EXPORT
        warehouseId,
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

            // Generate a common transaction number group if needed, or specific per item
            // Here we create one Transaction Record per item for simplified tracking, 
            // but usually a ticket has one code. 
            // Let's assume the frontend sends items and we create individual transactions records 
            // but sharing a reference or just simply processed.
            // Requirement says "Tạo phiếu nhập", suggesting a Document model for "InventoryTicket". 
            // Current schema has InventoryTransaction which is effectively line-item based.
            // We can generate a generic transactionNo for this batch.
            const transactionGroupCode = `TRX${Date.now()}`;

            for (const item of items) {
                const { productId, quantity, batchNumber, expiryDate, unitPrice } = item;
                const qty = parseInt(quantity);

                // 1. Create Transaction Record
                const transaction = await tx.inventoryTransaction.create({
                    data: {
                        type,
                        transactionNo: `${transactionGroupCode}-${productId}`,
                        productId,
                        warehouseId,
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

                // 2. Update or Create Batch (If Import)
                if (batchNumber && type === 'IMPORT') {
                    await tx.productBatch.upsert({
                        where: {
                            productId_batchNumber: { productId, batchNumber }
                        },
                        update: {
                            currentQuantity: { increment: qty },
                            warehouseId, // Update current warehouse location
                            status: 'ACTIVE'
                        },
                        create: {
                            productId,
                            batchNumber,
                            expiryDate: new Date(expiryDate),
                            initialQuantity: qty,
                            currentQuantity: qty,
                            warehouseId,
                            status: 'ACTIVE'
                        }
                    });
                } else if (batchNumber && type === 'EXPORT') {
                    // Deduct from batch
                    await tx.productBatch.update({
                        where: {
                            productId_batchNumber: { productId, batchNumber }
                        },
                        data: {
                            currentQuantity: { decrement: qty }
                        }
                    });
                }

                // 3. Update Inventory Item (Stock in Warehouse)
                const inventoryItem = await tx.inventoryItem.findUnique({
                    where: {
                        productId_warehouseId: { productId, warehouseId }
                    }
                });

                if (inventoryItem) {
                    await tx.inventoryItem.update({
                        where: { id: inventoryItem.id },
                        data: {
                            currentQty: type === 'IMPORT'
                                ? { increment: qty }
                                : { decrement: qty },
                            receivedQty: type === 'IMPORT'
                                ? { increment: qty }
                                : undefined,
                            issuedQty: type === 'EXPORT'
                                ? { increment: qty }
                                : undefined,
                            lastUpdated: new Date()
                        }
                    });
                } else if (type === 'IMPORT') {
                    await tx.inventoryItem.create({
                        data: {
                            productId,
                            warehouseId,
                            currentQty: qty,
                            receivedQty: qty,
                            issuedQty: 0
                        }
                    });
                } else {
                    throw new Error(`Không thấy tồn kho cho sản phẩm ${productId} trong kho này để xuất`);
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
