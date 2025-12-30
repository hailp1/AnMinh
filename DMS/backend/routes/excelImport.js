import express from 'express';
import XLSX from 'xlsx';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { upload } from '../middleware/upload.js';
import {
    validateRequired,
    validateEmail,
    validatePhone,
    validateEnum,
    validateDate,
    validateNumber,
    parseBoolean
} from '../utils/excelValidator.js';

const router = express.Router();

// ================================
// CUSTOMER IMPORT
// ================================
router.post('/import/customers', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // Excel row (header is row 1)

            try {
                // Validation
                const errors = [];

                const codeError = validateRequired(row['Mã KH*'], 'Mã KH');
                if (codeError) errors.push(codeError);

                const nameError = validateRequired(row['Tên KH*'], 'Tên KH');
                if (nameError) errors.push(nameError);

                const emailError = validateEmail(row['Email']);
                if (emailError) errors.push(emailError);

                const phoneError = validatePhone(row['Điện thoại']);
                if (phoneError) errors.push(phoneError);

                const typeError = validateEnum(
                    row['Loại'],
                    ['PHARMACY', 'CLINIC', 'HOSPITAL'],
                    'Loại'
                );
                if (typeError) errors.push(typeError);

                if (errors.length > 0) {
                    results.errors.push({
                        row: rowNum,
                        code: row['Mã KH*'],
                        errors
                    });
                    results.failed++;
                    continue;
                }

                // Check duplicate
                const existing = await prisma.pharmacy.findUnique({
                    where: { code: row['Mã KH*'] }
                });

                // Prepare data
                const customerData = {
                    code: row['Mã KH*'],
                    name: row['Tên KH*'],
                    tradeName: row['Tên Thương mại'] || null,
                    type: row['Loại'] || 'PHARMACY',
                    channel: row['Kênh'] || null,
                    segment: row['Phân khúc'] || null,
                    tier: row['Hạng'] || null,
                    phone: row['Điện thoại'] || null,
                    orderPhone: row['SĐT Đặt hàng'] || null,
                    email: row['Email'] || null,
                    address: row['Địa chỉ'] || null,
                    ward: row['Phường/Xã'] || null,
                    district: row['Quận/Huyện'] || null,
                    province: row['Tỉnh/TP'] || null,
                    taxCode: row['Mã số thuế'] || null,
                    licenseNumber: row['Số GP KD'] || null,
                    licenseExpiry: row['Hạn GP'] ? new Date(row['Hạn GP']) : null,
                    pharmacistName: row['Dược sĩ PT'] || null,
                    ownerName: row['Chủ sở hữu'] || null,
                    creditLimit: row['Hạn mức CN'] ? parseFloat(row['Hạn mức CN']) : null,
                    paymentTermDays: row['Số ngày TT'] ? parseInt(row['Số ngày TT']) : null,
                    visitFrequency: row['Tần độ ghé'] || null,
                    status: row['Trạng thái'] || 'ACTIVE',
                    source: row['Nguồn'] || 'IMPORT',
                    notes: row['Ghi chú'] || null
                };

                // Lookup foreign keys
                if (row['Mã Territory']) {
                    const territory = await prisma.territory.findFirst({
                        where: { code: row['Mã Territory'] }
                    });
                    if (territory) {
                        customerData.territoryId = territory.id;
                    }
                }

                if (row['Mã TDV']) {
                    const rep = await prisma.user.findFirst({
                        where: { employeeCode: row['Mã TDV'] }
                    });
                    if (rep) {
                        customerData.primaryRepId = rep.id;
                    }
                }

                // Upsert
                if (existing) {
                    await prisma.pharmacy.update({
                        where: { id: existing.id },
                        data: customerData
                    });
                } else {
                    await prisma.pharmacy.create({
                        data: customerData
                    });
                }

                results.success++;
            } catch (error) {
                results.errors.push({
                    row: rowNum,
                    code: row['Mã KH*'],
                    errors: [error.message]
                });
                results.failed++;
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Customer import error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// PRODUCT IMPORT
// ================================
router.post('/import/products', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2;

            try {
                // Validation
                const errors = [];

                const codeError = validateRequired(row['Mã SP (SKU)*'], 'Mã SP');
                if (codeError) errors.push(codeError);

                const nameError = validateRequired(row['Tên SP*'], 'Tên SP');
                if (nameError) errors.push(nameError);

                if (errors.length > 0) {
                    results.errors.push({ row: rowNum, code: row['Mã SP (SKU)*'], errors });
                    results.failed++;
                    continue;
                }

                // Check duplicate
                const existing = await prisma.product.findUnique({
                    where: { code: row['Mã SP (SKU)*'] }
                });

                // Prepare data
                const productData = {
                    code: row['Mã SP (SKU)*'],
                    name: row['Tên SP*'],
                    genericName: row['Hoạt chất'] || null,
                    unit: row['Đơn vị'] || 'Hộp',
                    packingSpec: row['Quy cách'] || null,
                    costPrice: row['Giá nhập'] ? parseFloat(row['Giá nhập']) : null,
                    price: row['Giá bán'] ? parseFloat(row['Giá bán']) : 0,
                    wholesalePrice: row['Giá sỉ'] ? parseFloat(row['Giá sỉ']) : null,
                    retailPrice: row['Giá lẻ'] ? parseFloat(row['Giá lẻ']) : null,
                    vat: row['VAT (%)'] ? parseFloat(row['VAT (%)']) : 0,
                    manufacturer: row['NSX (Hãng)'] || null,
                    countryOfOrigin: row['Nước SX'] || null,
                    registrationNo: row['Số ĐK'] || null,
                    barcode: row['Barcode'] || null,
                    minStock: row['Tồn Min'] ? parseInt(row['Tồn Min']) : null,
                    maxStock: row['Tồn Max'] ? parseInt(row['Tồn Max']) : null,
                    isPrescription: parseBoolean(row['Thuốc kê đơn']),
                    storageCondition: row['Bảo quản'] || null,
                    concentration: row['Hàm lượng'] || null,
                    usage: row['Công dụng'] || null,
                    indications: row['Chỉ định'] || null
                };

                // Lookup group
                if (row['Mã Nhóm']) {
                    const group = await prisma.productGroup.findFirst({
                        where: { code: row['Mã Nhóm'] }
                    });
                    if (group) productData.groupId = group.id;
                }

                // Lookup category
                if (row['Mã Danh Mục']) {
                    const category = await prisma.productCategory.findFirst({
                        where: { code: row['Mã Danh Mục'] }
                    });
                    if (category) productData.categoryId = category.id;
                }

                // Upsert
                if (existing) {
                    await prisma.product.update({
                        where: { id: existing.id },
                        data: productData
                    });
                } else {
                    await prisma.product.create({
                        data: productData
                    });
                }

                results.success++;
            } catch (error) {
                results.errors.push({
                    row: rowNum,
                    code: row['Mã SP (SKU)*'],
                    errors: [error.message]
                });
                results.failed++;
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Product import error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// USER IMPORT
// ================================
router.post('/import/users', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2;

            try {
                // Validation
                const errors = [];

                const codeError = validateRequired(row['Mã NV*'], 'Mã NV');
                if (codeError) errors.push(codeError);

                const usernameError = validateRequired(row['Username*'], 'Username');
                if (usernameError) errors.push(usernameError);

                const passwordError = validateRequired(row['Mật khẩu*'], 'Mật khẩu');
                if (passwordError) errors.push(passwordError);

                const nameError = validateRequired(row['Họ tên*'], 'Họ tên');
                if (nameError) errors.push(nameError);

                const roleError = validateEnum(
                    row['Vai trò*'],
                    ['ADMIN', 'TDV', 'QL', 'KT', 'DELIVERY'],
                    'Vai trò'
                );
                if (roleError) errors.push(roleError);

                if (errors.length > 0) {
                    results.errors.push({ row: rowNum, code: row['Mã NV*'], errors });
                    results.failed++;
                    continue;
                }

                // Check duplicate
                const existingByCode = await prisma.user.findFirst({
                    where: { employeeCode: row['Mã NV*'] }
                });

                const existingByUsername = await prisma.user.findUnique({
                    where: { username: row['Username*'] }
                });

                if (existingByUsername && !existingByCode) {
                    results.errors.push({
                        row: rowNum,
                        code: row['Mã NV*'],
                        errors: ['Username already exists']
                    });
                    results.failed++;
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(row['Mật khẩu*'].toString(), 10);

                // Prepare data
                const userData = {
                    employeeCode: row['Mã NV*'],
                    username: row['Username*'],
                    password: hashedPassword,
                    name: row['Họ tên*'],
                    email: row['Email'] || null,
                    phone: row['Điện thoại'] || null,
                    role: row['Vai trò*'],
                    channel: row['Kênh'] || null,
                    isActive: parseBoolean(row['Trạng thái']),
                    notes: row['Ghi chú'] || null
                };

                // Lookup manager
                if (row['Mã Quản lý']) {
                    const manager = await prisma.user.findFirst({
                        where: { employeeCode: row['Mã Quản lý'] }
                    });
                    if (manager) userData.managerId = manager.id;
                }

                // Lookup region
                if (row['Mã Vùng']) {
                    const region = await prisma.region.findFirst({
                        where: { code: row['Mã Vùng'] }
                    });
                    if (region) userData.regionId = region.id;
                }

                // Upsert
                if (existingByCode) {
                    // Don't update password if it's the same
                    if (existingByCode.password !== hashedPassword) {
                        userData.password = hashedPassword;
                    }
                    await prisma.user.update({
                        where: { id: existingByCode.id },
                        data: userData
                    });
                } else {
                    await prisma.user.create({
                        data: userData
                    });
                }

                results.success++;
            } catch (error) {
                results.errors.push({
                    row: rowNum,
                    code: row['Mã NV*'],
                    errors: [error.message]
                });
                results.failed++;
            }
        }

        res.json(results);
    } catch (error) {
        console.error('User import error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// ROUTE IMPORT
// ================================
router.post('/import/routes', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2;

            try {
                // Validation
                const errors = [];

                const codeError = validateRequired(row['Mã Route*'], 'Mã Route');
                if (codeError) errors.push(codeError);

                const nameError = validateRequired(row['Tên Route*'], 'Tên Route');
                if (nameError) errors.push(nameError);

                if (errors.length > 0) {
                    results.errors.push({ row: rowNum, code: row['Mã Route*'], errors });
                    results.failed++;
                    continue;
                }

                // Check duplicate
                const existing = await prisma.route.findUnique({
                    where: { routeCode: row['Mã Route*'] }
                });

                // Prepare data
                const routeData = {
                    routeCode: row['Mã Route*'],
                    routeName: row['Tên Route*'],
                    dayOfWeek: row['Thứ'] || null,
                    sequence: row['Thứ tự'] ? parseInt(row['Thứ tự']) : null,
                    plannedTime: row['Giờ dự kiến'] || null,
                    duration: row['Thời gian'] ? parseInt(row['Thời gian']) : null,
                    notes: row['Ghi chú'] || null
                };

                // Lookup territory
                if (row['Mã Territory']) {
                    const territory = await prisma.territory.findFirst({
                        where: { code: row['Mã Territory'] }
                    });
                    if (territory) routeData.territoryId = territory.id;
                }

                // Lookup rep
                if (row['Mã TDV']) {
                    const rep = await prisma.user.findFirst({
                        where: { employeeCode: row['Mã TDV'] }
                    });
                    if (rep) routeData.repId = rep.id;
                }

                // Lookup customer
                if (row['Mã KH']) {
                    const customer = await prisma.pharmacy.findUnique({
                        where: { code: row['Mã KH'] }
                    });
                    if (customer) routeData.customerId = customer.id;
                }

                // Upsert
                if (existing) {
                    await prisma.route.update({
                        where: { id: existing.id },
                        data: routeData
                    });
                } else {
                    await prisma.route.create({
                        data: routeData
                    });
                }

                results.success++;
            } catch (error) {
                results.errors.push({
                    row: rowNum,
                    code: row['Mã Route*'],
                    errors: [error.message]
                });
                results.failed++;
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Route import error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// VISIT PLAN IMPORT
// ================================
router.post('/import/visit-plans', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2;

            try {
                // Validation
                const errors = [];

                const dateError = validateRequired(row['Ngày ghé*'], 'Ngày ghé');
                if (dateError) errors.push(dateError);

                const customerError = validateRequired(row['Mã KH*'], 'Mã KH');
                if (customerError) errors.push(customerError);

                const repError = validateRequired(row['Mã TDV*'], 'Mã TDV');
                if (repError) errors.push(repError);

                if (errors.length > 0) {
                    results.errors.push({ row: rowNum, errors });
                    results.failed++;
                    continue;
                }

                // Lookup customer
                const customer = await prisma.pharmacy.findUnique({
                    where: { code: row['Mã KH*'] }
                });
                if (!customer) {
                    results.errors.push({
                        row: rowNum,
                        errors: [`Customer ${row['Mã KH*']} not found`]
                    });
                    results.failed++;
                    continue;
                }

                // Lookup rep
                const rep = await prisma.user.findFirst({
                    where: { employeeCode: row['Mã TDV*'] }
                });
                if (!rep) {
                    results.errors.push({
                        row: rowNum,
                        errors: [`TDV ${row['Mã TDV*']} not found`]
                    });
                    results.failed++;
                    continue;
                }

                // Prepare data
                const visitData = {
                    visitDate: new Date(row['Ngày ghé*']),
                    visitTime: row['Giờ ghé'] || null,
                    customerId: customer.id,
                    repId: rep.id,
                    dayOfWeek: row['Thứ'] || null,
                    frequency: row['Tần suất'] || null,
                    purpose: row['Mục đích'] || null,
                    status: row['Trạng thái'] || 'PLANNED',
                    notes: row['Ghi chú'] || null
                };

                // Lookup territory
                if (row['Mã Territory']) {
                    const territory = await prisma.territory.findFirst({
                        where: { code: row['Mã Territory'] }
                    });
                    if (territory) visitData.territoryId = territory.id;
                }

                // Create visit plan
                await prisma.visitPlan.create({
                    data: visitData
                });

                results.success++;
            } catch (error) {
                results.errors.push({
                    row: rowNum,
                    errors: [error.message]
                });
                results.failed++;
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Visit plan import error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// ORDER IMPORT
// ================================
router.post('/import/orders', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const results = {
            total: 0,
            success: 0,
            failed: 0,
            errors: []
        };

        // Group by order number
        const orderGroups = {};
        data.forEach((row, i) => {
            const orderNum = row['Số ĐH*'];
            if (!orderGroups[orderNum]) {
                orderGroups[orderNum] = [];
            }
            orderGroups[orderNum].push({ ...row, rowNum: i + 2 });
        });

        results.total = Object.keys(orderGroups).length;

        for (const [orderNumber, rows] of Object.entries(orderGroups)) {
            try {
                const firstRow = rows[0];

                // Validation
                const errors = [];

                const customerError = validateRequired(firstRow['Mã KH*'], 'Mã KH');
                if (customerError) errors.push(customerError);

                const repError = validateRequired(firstRow['Mã TDV*'], 'Mã TDV');
                if (repError) errors.push(repError);

                const dateError = validateRequired(firstRow['Ngày đặt*'], 'Ngày đặt');
                if (dateError) errors.push(dateError);

                if (errors.length > 0) {
                    results.errors.push({ orderNumber, errors });
                    results.failed++;
                    continue;
                }

                // Lookup customer
                const customer = await prisma.pharmacy.findUnique({
                    where: { code: firstRow['Mã KH*'] }
                });
                if (!customer) {
                    results.errors.push({
                        orderNumber,
                        errors: [`Customer ${firstRow['Mã KH*']} not found`]
                    });
                    results.failed++;
                    continue;
                }

                // Lookup rep
                const rep = await prisma.user.findFirst({
                    where: { employeeCode: firstRow['Mã TDV*'] }
                });
                if (!rep) {
                    results.errors.push({
                        orderNumber,
                        errors: [`TDV ${firstRow['Mã TDV*']} not found`]
                    });
                    results.failed++;
                    continue;
                }

                // Process order items
                const items = [];
                let totalAmount = 0;

                for (const row of rows) {
                    const product = await prisma.product.findUnique({
                        where: { code: row['Mã SP*'] }
                    });
                    if (!product) {
                        results.errors.push({
                            orderNumber,
                            row: row.rowNum,
                            errors: [`Product ${row['Mã SP*']} not found`]
                        });
                        results.failed++;
                        continue;
                    }

                    const quantity = parseInt(row['Số lượng*']);
                    const price = row['Đơn giá'] ? parseFloat(row['Đơn giá']) : product.price;
                    const subtotal = quantity * price;
                    totalAmount += subtotal;

                    items.push({
                        productId: product.id,
                        quantity,
                        price,
                        subtotal
                    });
                }

                if (items.length === 0) {
                    results.errors.push({
                        orderNumber,
                        errors: ['No valid items found']
                    });
                    results.failed++;
                    continue;
                }

                // Create order
                await prisma.order.create({
                    data: {
                        orderNumber,
                        pharmacyId: customer.id,
                        userId: rep.id,
                        orderDate: new Date(firstRow['Ngày đặt*']),
                        totalAmount,
                        status: firstRow['Trạng thái'] || 'PENDING',
                        notes: firstRow['Ghi chú'] || null,
                        items: {
                            create: items
                        }
                    }
                });

                results.success++;
            } catch (error) {
                results.errors.push({
                    orderNumber,
                    errors: [error.message]
                });
                results.failed++;
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Order import error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
