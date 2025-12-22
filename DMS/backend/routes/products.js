import express from 'express';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import logger from '../lib/logger.js';
import multer from 'multer';
import ExcelJS from 'exceljs';

const upload = multer({ storage: multer.memoryStorage() });

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

// Lấy danh sách danh mục (Category)
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.json([]);
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
        category: {
          select: { id: true, name: true },
        },
        bundleItems: {
          include: {
            child: {
              select: { id: true, name: true, code: true, unit: true }
            }
          }
        }
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
      name, code, description, groupId, categoryId, unit, price,
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
        categoryId: categoryId || null,
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
      name, code, description, groupId, categoryId, unit, price, isActive,
      isPrescription, concentration, usage, genericName, manufacturer, countryOfOrigin,
      registrationNo, packingSpec, storageCondition, indications, contraindications,
      dosage, sideEffects, shelfLife, vat, images
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code || null;
    if (description !== undefined) updateData.description = description || null;
    if (groupId !== undefined) updateData.groupId = groupId;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
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

// Admin: Import sản phẩm từ Excel
router.post('/admin/products/import', [adminAuth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Chưa chọn file' });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet(1);

    if (!sheet) return res.status(400).json({ error: 'File không đúng định dạng' });

    let count = 0;
    const errors = [];

    // Iterate rows (skip header row 1)
    // Using eachRow
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) rows.push(row);
    });

    for (const row of rows) {
      // Helper to get cell value safely
      const getVal = (idx) => {
        const val = row.getCell(idx).value;
        return (val && typeof val === 'object' && val.text) ? val.text : val;
      };

      // Map columns based on Template
      // 1:Code, 2:Name, 3:Generic, 4:GroupCode, 5:CatCode, 6:Unit, 7:Packing, 8:Cost, 9:Price, 10:Wholesale, 11:Retail, 12:VAT, 13:Manuf, 14:Country, 15:RegNo, 16:Barcode, 17:Min, 18:Max, 19:Rx, 20:Storage, 21:Conc, 22:Usage, 23:Ind

      const code = getVal(1)?.toString();
      const name = getVal(2)?.toString();

      if (!name) continue; // Name mandatory

      const productData = {
        code: code || null,
        name: name,
        genericName: getVal(3)?.toString() || null,
        // groupCode: getVal(4) handled below
        // categoryCode: getVal(5) handled below
        unit: getVal(6)?.toString() || 'Hộp',
        packingSpec: getVal(7)?.toString() || null,
        // costPrice: 8
        price: Number(getVal(9)) || 0,
        vat: Number(getVal(12)) || null,
        manufacturer: getVal(13)?.toString() || null,
        countryOfOrigin: getVal(14)?.toString() || null,
        registrationNo: getVal(15)?.toString() || null,
        // barcode: 16
        minStock: Number(getVal(17)) || 10,
        // maxStock: 18
        isPrescription: getVal(19) === 'TRUE' || getVal(19) === true || getVal(19) === 'Có',
        storageCondition: getVal(20)?.toString() || null,
        concentration: getVal(21)?.toString() || null,
        usage: getVal(22)?.toString() || null,
        indications: getVal(23)?.toString() || null,
        isActive: true
      };

      // Resolve Group
      const groupCode = getVal(4)?.toString();
      let groupId = null;
      if (groupCode) {
        let group = await prisma.productGroup.findFirst({
          where: { name: { equals: groupCode, mode: 'insensitive' } }
        });
        if (!group) {
          group = await prisma.productGroup.create({
            data: { name: groupCode, code: groupCode.toUpperCase().replace(/\s+/g, '_') }
          });
        }
        groupId = group.id;
      }
      // If still no group, check default or skip (Mandatory)
      if (!groupId) {
        let defGroup = await prisma.productGroup.findFirst({ where: { name: 'Chung' } });
        if (!defGroup) defGroup = await prisma.productGroup.create({ data: { name: 'Chung', code: 'GENERAL' } });
        groupId = defGroup.id;
      }
      productData.groupId = groupId; // Mandatory

      // Resolve Category
      const catCode = getVal(5)?.toString();
      let categoryId = null;
      if (catCode) {
        let cat = await prisma.category.findFirst({
          where: { name: { equals: catCode, mode: 'insensitive' } }
        });
        if (!cat) {
          cat = await prisma.category.create({
            data: { name: catCode, code: catCode.toUpperCase().replace(/\s+/g, '_') }
          });
        }
        categoryId = cat.id;
      }
      productData.categoryId = categoryId;

      // Upsert
      if (code) {
        await prisma.product.upsert({
          where: { code: code },
          update: productData,
          create: productData
        }).catch(e => errors.push(`Row ${row.number}: ${e.message}`));
        count++;
      } else {
        // Create only if no code
        await prisma.product.create({ data: productData })
          .then(() => count++)
          .catch(e => errors.push(`Row ${row.number}: ${e.message}`));
      }
    }

    res.json({ message: `Import thành công ${count} sản phẩm`, errors });
  } catch (error) {
    logger.error('Import error:', error);
    res.status(500).json({ error: 'Lỗi server khi import' });
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

