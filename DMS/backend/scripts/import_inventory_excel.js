import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function importFromExcel(filePath) {
    console.log(`📊 Đọc file Excel từ: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('❌ File không tồn tại!');
        process.exit(1);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`✅ Đọc được ${data.length} dòng dữ liệu`);

    let stats = {
        warehouses: 0,
        products: 0,
        batches: 0,
        inventory: 0,
        errors: []
    };

    for (const row of data) {
        try {
            // 1. Tạo/Cập nhật Warehouse
            // Giả sử cột 'Mã kho' và 'Tên kho'
            const warehouseCode = row['Mã kho'] || 'MAIN';
            const warehouseName = row['Tên kho'] || 'Kho chính';

            const warehouse = await prisma.warehouse.upsert({
                where: { code: warehouseCode },
                update: {},
                create: {
                    code: warehouseCode,
                    name: warehouseName,
                    isActive: true,
                    type: 'MAIN'
                }
            });
            stats.warehouses++;

            // 2. Parse tên sản phẩm để tách manufacturer
            const fullName = row['Tên hàng'] || 'Unknown Product';
            const parts = fullName.split(' - ');
            const productName = parts[0] || fullName;
            const manufacturer = parts.length > 1 ? parts[parts.length - 1] : null;

            const productCode = row['Mã hàng'] || `P${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            // 3. Tạo/Cập nhật Product
            const product = await prisma.product.upsert({
                where: { code: productCode },
                update: {
                    name: productName,
                    manufacturer: manufacturer,
                    unit: row['ĐVT'] || 'Viên'
                },
                create: {
                    code: productCode,
                    name: productName,
                    manufacturer: manufacturer,
                    unit: row['ĐVT'] || 'Viên',
                    price: 0,
                    isActive: true
                }
            });
            stats.products++;

            // 4. Tạo ProductBatch (nếu có số lô)
            const batchNumber = row['Số lô'];
            const expiryDateStr = row['Hạn sử dụng'];
            const quantity = parseFloat(row['Số lượng'] || row['Cuối kỳ - Số lượng'] || 0);

            if (batchNumber) {
                const expiryDate = parseExcelDate(expiryDateStr);

                await prisma.productBatch.upsert({
                    where: {
                        productId_batchNumber: {
                            productId: product.id,
                            batchNumber: batchNumber.toString()
                        }
                    },
                    update: {
                        currentQuantity: quantity
                    },
                    create: {
                        productId: product.id,
                        batchNumber: batchNumber.toString(),
                        expiryDate: expiryDate,
                        initialQuantity: quantity,
                        currentQuantity: quantity,
                        warehouseId: warehouse.id
                    }
                });
                stats.batches++;
            }

            // 5. Cập nhật InventoryItem
            await prisma.inventoryItem.upsert({
                where: {
                    productId_warehouseId: {
                        productId: product.id,
                        warehouseId: warehouse.id
                    }
                },
                update: {
                    currentQty: { increment: quantity }, // Cộng dồn nếu nhiều lô
                    lastUpdated: new Date()
                },
                create: {
                    productId: product.id,
                    warehouseId: warehouse.id,
                    currentQty: quantity,
                    beginningQty: quantity
                }
            });
            stats.inventory++;

        } catch (error) {
            stats.errors.push({
                row: row['Mã hàng'],
                error: error.message
            });
        }
    }

    console.log('\n✅ Import hoàn tất!');
    console.log(`   - Warehouses: ${stats.warehouses}`);
    console.log(`   - Products: ${stats.products}`);
    console.log(`   - Batches: ${stats.batches}`);
    console.log(`   - Inventory: ${stats.inventory}`);
    console.log(`   - Errors: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
        console.log('\n❌ Lỗi:');
        stats.errors.forEach(e => console.log(`   - ${e.row}: ${e.error}`));
    }
}

function parseExcelDate(dateStr) {
    if (!dateStr) return new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // Default 1 year

    if (dateStr instanceof Date) return dateStr;

    // Excel serial date
    if (typeof dateStr === 'number') {
        return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
    }

    // Parse "8/5/2028" format
    const parts = dateStr.toString().split('/');
    if (parts.length === 3) {
        // Assuming D/M/Y or M/D/Y? Usually D/M/Y in VN
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    return new Date(dateStr);
}

// Get file path from args
const filePath = process.argv[2];
if (!filePath) {
    console.log('Usage: node import_inventory_excel.js <path_to_excel_file>');
    process.exit(0);
}

importFromExcel(filePath)
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
