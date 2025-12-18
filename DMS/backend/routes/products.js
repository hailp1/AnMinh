import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import logger from '../lib/logger.js';

const router = express.Router();

// Lấy danh sách nhóm sản phẩm và sản phẩm
router.get('/groups', auth, async (req, res) => {
  try {
    const groups = await prisma.productGroup.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    res.json(groups);
  } catch (error) {
    logger.error('Error fetching product groups:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy tất cả sản phẩm
router.get('/', auth, async (req, res) => {
  try {
    const { groupId, search } = req.query;

    let where = { isActive: true };

    if (groupId) {
      where.groupId = groupId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        group: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy chi tiết sản phẩm
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        group: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    res.json(product);
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Tạo nhóm sản phẩm
router.post('/admin/groups', adminAuth, async (req, res) => {
  try {
    const { name, description, order } = req.body;
    const group = await prisma.productGroup.create({
      data: {
        name,
        description: description || null,
        order: order || 0,
        isActive: true
      }
    });
    res.status(201).json(group);
  } catch (error) {
    logger.error('Error creating product group:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Cập nhật nhóm sản phẩm
router.put('/admin/groups/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, order, isActive } = req.body;
    const group = await prisma.productGroup.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        order,
        isActive
      }
    });
    res.json(group);
  } catch (error) {
    logger.error('Error updating product group:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Tạo sản phẩm
router.post('/admin/products', adminAuth, async (req, res) => {
  try {
    const {
      name, code, description, groupId, unit, price,
      isPrescription, concentration, usage, genericName, manufacturer, countryOfOrigin,
      registrationNo, packingSpec, storageCondition, indications, contraindications,
      dosage, sideEffects, shelfLife, vat, images
    } = req.body;

    if (!name || !groupId || !price) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        code: code || null,
        description: description || null,
        groupId,
        unit: unit || 'hộp',
        price: parseFloat(price),
        isActive: true,
        // New Pharma Fields
        isPrescription: isPrescription || false,
        concentration,
        usage,
        genericName,
        manufacturer,
        countryOfOrigin,
        registrationNo,
        packingSpec,
        storageCondition,
        indications,
        contraindications,
        dosage,
        sideEffects,
        shelfLife,
        vat: vat ? parseFloat(vat) : null,
        images: images || []
      },
      include: {
        group: true
      }
    });
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã sản phẩm đã tồn tại' });
    }
    logger.error('Error creating product:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Cập nhật sản phẩm
router.put('/admin/products/:id', adminAuth, async (req, res) => {
  try {
    const {
      name, code, description, groupId, unit, price, isActive,
      isPrescription, concentration, usage, genericName, manufacturer, countryOfOrigin,
      registrationNo, packingSpec, storageCondition, indications, contraindications,
      dosage, sideEffects, shelfLife, vat, images
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code || null;
    if (description !== undefined) updateData.description = description || null;
    if (groupId !== undefined) updateData.groupId = groupId;
    if (unit !== undefined) updateData.unit = unit;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Pharma Fields
    if (isPrescription !== undefined) updateData.isPrescription = isPrescription;
    if (concentration !== undefined) updateData.concentration = concentration;
    if (usage !== undefined) updateData.usage = usage;
    if (genericName !== undefined) updateData.genericName = genericName;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (countryOfOrigin !== undefined) updateData.countryOfOrigin = countryOfOrigin;
    if (registrationNo !== undefined) updateData.registrationNo = registrationNo;
    if (packingSpec !== undefined) updateData.packingSpec = packingSpec;
    if (storageCondition !== undefined) updateData.storageCondition = storageCondition;
    if (indications !== undefined) updateData.indications = indications;
    if (contraindications !== undefined) updateData.contraindications = contraindications;
    if (dosage !== undefined) updateData.dosage = dosage;
    if (sideEffects !== undefined) updateData.sideEffects = sideEffects;
    if (shelfLife !== undefined) updateData.shelfLife = shelfLife;
    if (vat !== undefined) updateData.vat = parseFloat(vat);
    if (images !== undefined) updateData.images = images;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        group: true
      }
    });
    res.json(product);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Mã sản phẩm đã tồn tại' });
    }
    logger.error('Error updating product:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin: Xóa sản phẩm
router.delete('/admin/products/:id', adminAuth, async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;

