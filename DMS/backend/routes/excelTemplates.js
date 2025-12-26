import express from 'express';
import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// ================================
// EXCEL EXPORT TEMPLATES
// ================================

// Export Customer Template
router.get('/template/customers', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách Khách hàng');

        // Define columns (CRM Standard)
        sheet.columns = [
            { header: 'Mã KH*', key: 'code', width: 15 },
            { header: 'Tên KH*', key: 'name', width: 30 },
            { header: 'Tên Thương mại', key: 'tradeName', width: 25 },
            { header: 'Loại', key: 'type', width: 15 },
            { header: 'Kênh', key: 'channel', width: 12 },
            { header: 'Phân khúc', key: 'segment', width: 12 },
            { header: 'Hạng', key: 'tier', width: 12 },
            { header: 'Điện thoại', key: 'phone', width: 15 },
            { header: 'SĐT Đặt hàng', key: 'orderPhone', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Địa chỉ', key: 'address', width: 40 },
            { header: 'Phường/Xã', key: 'ward', width: 20 },
            { header: 'Quận/Huyện', key: 'district', width: 20 },
            { header: 'Tỉnh/TP', key: 'province', width: 20 },
            { header: 'Mã số thuế', key: 'taxCode', width: 15 },
            { header: 'Số GP KD', key: 'licenseNumber', width: 15 },
            { header: 'Hạn GP', key: 'licenseExpiry', width: 12 },
            { header: 'Dược sĩ PT', key: 'pharmacistName', width: 20 },
            { header: 'Chủ sở hữu', key: 'ownerName', width: 20 },
            { header: 'Hạn mức CN', key: 'creditLimit', width: 15 },
            { header: 'Số ngày TT', key: 'paymentTermDays', width: 12 },
            { header: 'Tần độ ghé', key: 'visitFrequency', width: 12 },
            { header: 'Mã Territory', key: 'territoryCode', width: 15 },
            { header: 'Mã TDV', key: 'primaryRepCode', width: 12 },
            { header: 'Trạng thái', key: 'status', width: 12 },
            { header: 'Nguồn', key: 'source', width: 12 },
            { header: 'Ghi chú', key: 'notes', width: 30 },
        ];

        // Style header
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(1).height = 25;

        // Add instruction row
        sheet.addRow({
            code: 'Hướng dẫn:',
            name: 'Các cột có dấu * là bắt buộc. Loại: PHARMACY/CLINIC/HOSPITAL. Kênh: OTC/ETC. Phân khúc: A/B/C/D. Hạng: VIP/GOLD/SILVER/BRONZE/STANDARD'
        });
        sheet.getRow(2).font = { italic: true, color: { argb: '666666' } };

        // Sample data
        sheet.addRow({
            code: 'KH-HCM-001',
            name: 'Nhà thuốc ABC',
            tradeName: 'ABC Pharmacy',
            type: 'PHARMACY',
            channel: 'OTC',
            segment: 'A',
            tier: 'VIP',
            phone: '0901234567',
            orderPhone: '0901234568',
            email: 'abc@email.com',
            address: '123 Nguyễn Huệ',
            ward: 'Bến Nghé',
            district: 'Quận 1',
            province: 'Hồ Chí Minh',
            taxCode: '0123456789',
            licenseNumber: 'GP-001',
            licenseExpiry: '2025-12-31',
            pharmacistName: 'Nguyễn Văn A',
            ownerName: 'Trần Thị B',
            creditLimit: 50000000,
            paymentTermDays: 30,
            visitFrequency: 2,
            territoryCode: 'TER_HCM_Q1',
            primaryRepCode: 'TDV001',
            status: 'ACTIVE',
            source: 'REFERRAL',
            notes: 'Khách VIP'
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Template_KhachHang.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export Product Template
router.get('/template/products', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách Sản phẩm');

        sheet.columns = [
            { header: 'Mã SP (SKU)*', key: 'code', width: 15 },
            { header: 'Tên SP*', key: 'name', width: 35 },
            { header: 'Hoạt chất', key: 'genericName', width: 25 },
            { header: 'Mã Nhóm', key: 'groupCode', width: 12 },
            { header: 'Mã Danh Mục', key: 'categoryCode', width: 12 },
            { header: 'Đơn vị', key: 'unit', width: 10 },
            { header: 'Quy cách', key: 'packingSpec', width: 20 },
            { header: 'Giá nhập', key: 'costPrice', width: 15 },
            { header: 'Giá bán', key: 'price', width: 15 },
            { header: 'Giá sỉ', key: 'wholesalePrice', width: 15 },
            { header: 'Giá lẻ', key: 'retailPrice', width: 15 },
            { header: 'VAT (%)', key: 'vat', width: 10 },
            { header: 'NSX (Hãng)', key: 'manufacturer', width: 20 },
            { header: 'Nước SX', key: 'countryOfOrigin', width: 12 },
            { header: 'Số ĐK', key: 'registrationNo', width: 15 },
            { header: 'Barcode', key: 'barcode', width: 15 },
            { header: 'Tồn Min', key: 'minStock', width: 10 },
            { header: 'Tồn Max', key: 'maxStock', width: 10 },
            { header: 'Thuốc kê đơn', key: 'isPrescription', width: 12 },
            { header: 'Bảo quản', key: 'storageCondition', width: 20 },
            { header: 'Hàm lượng', key: 'concentration', width: 15 },
            { header: 'Công dụng (Usage)', key: 'usage', width: 25 },
            { header: 'Chỉ định', key: 'indications', width: 40 },
        ];

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(1).height = 25;

        sheet.addRow({
            code: 'Hướng dẫn:',
            name: 'Các cột có dấu * là bắt buộc. Thuốc kê đơn: TRUE/FALSE'
        });
        sheet.getRow(2).font = { italic: true };

        sheet.addRow({
            code: 'SP-001',
            name: 'Paracetamol 500mg',
            genericName: 'Paracetamol',
            groupCode: 'GD',
            unit: 'Hộp',
            packingSpec: 'Hộp 10 vỉ x 10 viên',
            costPrice: 25000,
            price: 35000,
            wholesalePrice: 32000,
            retailPrice: 38000,
            vat: 8,
            manufacturer: 'NADYPHAR',
            countryOfOrigin: 'Việt Nam',
            registrationNo: 'VD-12345-20',
            barcode: '8934561234567',
            minStock: 100,
            maxStock: 5000,
            isPrescription: 'FALSE',
            storageCondition: 'Dưới 30°C',
            concentration: '500mg',
            indications: 'Giảm đau, hạ sốt'
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Template_SanPham.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export Route Template
router.get('/template/routes', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Lộ trình');

        sheet.columns = [
            { header: 'Mã Route*', key: 'routeCode', width: 15 },
            { header: 'Tên Route*', key: 'routeName', width: 25 },
            { header: 'Mã Territory', key: 'territoryCode', width: 15 },
            { header: 'Mã TDV', key: 'repCode', width: 12 },
            { header: 'Thứ trong tuần', key: 'dayOfWeek', width: 15 },
            { header: 'STT', key: 'sequence', width: 8 },
            { header: 'Mã KH*', key: 'customerCode', width: 15 },
            { header: 'Giờ ghé', key: 'plannedTime', width: 10 },
            { header: 'Thời gian (phút)', key: 'duration', width: 15 },
            { header: 'Ghi chú', key: 'notes', width: 30 },
        ];

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DC2626' } };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        sheet.addRow({
            routeCode: 'Hướng dẫn:',
            routeName: 'Thứ: MONDAY/TUESDAY/WEDNESDAY/THURSDAY/FRIDAY/SATURDAY'
        });

        sheet.addRow({
            routeCode: 'RT-HCM-Q1-MON',
            routeName: 'Lộ trình Q1 Thứ 2',
            territoryCode: 'TER_HCM_Q1',
            repCode: 'TDV001',
            dayOfWeek: 'MONDAY',
            sequence: 1,
            customerCode: 'KH-HCM-001',
            plannedTime: '08:00',
            duration: 30,
            notes: 'Khách VIP'
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Template_LoTrinh.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export Order Template  
router.get('/template/orders', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Đơn hàng');

        sheet.columns = [
            { header: 'Mã ĐH*', key: 'orderNumber', width: 20 },
            { header: 'Ngày*', key: 'date', width: 12 },
            { header: 'Mã KH*', key: 'customerCode', width: 15 },
            { header: 'Tên KH', key: 'customerName', width: 25 },
            { header: 'Địa chỉ', key: 'address', width: 35 },
            { header: 'Mã TDV', key: 'repCode', width: 12 },
            { header: 'Trạng thái', key: 'status', width: 12 },
            { header: 'Mã SP*', key: 'productCode', width: 12 },
            { header: 'Tên SP', key: 'productName', width: 25 },
            { header: 'SL*', key: 'quantity', width: 8 },
            { header: 'Đơn giá', key: 'price', width: 12 },
            { header: 'Thành tiền', key: 'subtotal', width: 15 },
            { header: 'Chiết khấu', key: 'discount', width: 12 },
            { header: 'Tổng ĐH', key: 'totalAmount', width: 15 },
            { header: 'Ghi chú', key: 'notes', width: 30 },
        ];

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F59E0B' } };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        sheet.addRow({
            orderNumber: 'Hướng dẫn:',
            date: 'Trạng thái: PENDING/CONFIRMED/SHIPPING/COMPLETED/CANCELLED'
        });

        sheet.addRow({
            orderNumber: 'ORD-20231221-001',
            date: '2023-12-21',
            customerCode: 'KH-HCM-001',
            customerName: 'Nhà thuốc ABC',
            address: '123 Nguyễn Huệ, Q1',
            repCode: 'TDV001',
            status: 'CONFIRMED',
            productCode: 'SP-001',
            productName: 'Paracetamol 500mg',
            quantity: 10,
            price: 35000,
            subtotal: 350000,
            discount: 0,
            totalAmount: 350000,
            notes: ''
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Template_DonHang.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export Visit Plan Template
router.get('/template/visit-plans', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Kế hoạch ghé thăm');

        sheet.columns = [
            { header: 'Ngày ghé*', key: 'visitDate', width: 12 },
            { header: 'Giờ ghé', key: 'visitTime', width: 10 },
            { header: 'Mã KH*', key: 'customerCode', width: 15 },
            { header: 'Tên KH', key: 'customerName', width: 30 },
            { header: 'Mã TDV*', key: 'repCode', width: 12 },
            { header: 'Tên TDV', key: 'repName', width: 25 },
            { header: 'Mã Territory', key: 'territoryCode', width: 15 },
            { header: 'Thứ', key: 'dayOfWeek', width: 12 },
            { header: 'Tần suất', key: 'frequency', width: 12 },
            { header: 'Mục đích', key: 'purpose', width: 30 },
            { header: 'Trạng thái', key: 'status', width: 12 },
            { header: 'Ghi chú', key: 'notes', width: 35 },
        ];

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(1).height = 25;

        sheet.addRow({
            visitDate: 'Hướng dẫn:',
            visitTime: 'Ngày: YYYY-MM-DD. Giờ: HH:MM. Thứ: MONDAY/TUESDAY/WEDNESDAY/THURSDAY/FRIDAY/SATURDAY. Tần suất: F1/F2/F4/F8. Trạng thái: PLANNED/IN_PROGRESS/COMPLETED/CANCELLED/MISSED'
        });
        sheet.getRow(2).font = { italic: true, color: { argb: '666666' } };

        // Sample data rows
        sheet.addRow({
            visitDate: '2025-01-02',
            visitTime: '08:30',
            customerCode: 'KH-HCM-001',
            customerName: 'Nhà thuốc ABC',
            repCode: 'TDV001',
            repName: 'Nguyễn Văn A',
            territoryCode: 'TER_HCM_Q1',
            dayOfWeek: 'MONDAY',
            frequency: 'F2',
            purpose: 'Giới thiệu sản phẩm mới',
            status: 'PLANNED',
            notes: 'Khách VIP, cần chuẩn bị catalog'
        });

        sheet.addRow({
            visitDate: '2025-01-02',
            visitTime: '10:00',
            customerCode: 'KH-HCM-002',
            customerName: 'Nhà thuốc XYZ',
            repCode: 'TDV001',
            repName: 'Nguyễn Văn A',
            territoryCode: 'TER_HCM_Q1',
            dayOfWeek: 'MONDAY',
            frequency: 'F1',
            purpose: 'Thu tiền công nợ',
            status: 'PLANNED',
            notes: 'Công nợ 15 triệu'
        });

        sheet.addRow({
            visitDate: '2025-01-03',
            visitTime: '09:00',
            customerCode: 'KH-HCM-003',
            customerName: 'Phòng khám DEF',
            repCode: 'TDV002',
            repName: 'Trần Thị B',
            territoryCode: 'TER_HCM_Q2',
            dayOfWeek: 'TUESDAY',
            frequency: 'F4',
            purpose: 'Kiểm tra tồn kho',
            status: 'PLANNED',
            notes: 'Ghé 2 tuần/lần'
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Template_KeHoachGheTham.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Visit plan template error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export User/Employee Template
router.get('/template/users', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách Nhân viên');

        sheet.columns = [
            { header: 'Mã NV*', key: 'employeeCode', width: 12 },
            { header: 'Username*', key: 'username', width: 15 },
            { header: 'Mật khẩu*', key: 'password', width: 15 },
            { header: 'Họ tên*', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Điện thoại', key: 'phone', width: 15 },
            { header: 'Vai trò*', key: 'role', width: 12 },
            { header: 'Mã Quản lý', key: 'managerCode', width: 12 },
            { header: 'Tên Quản lý', key: 'managerName', width: 25 },
            { header: 'Mã Region', key: 'regionCode', width: 15 },
            { header: 'Mã Route', key: 'routeCode', width: 15 },
            { header: 'Kênh', key: 'channel', width: 12 },
            { header: 'Trạng thái', key: 'isActive', width: 12 },
        ];

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0891B2' } };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(1).height = 25;

        sheet.addRow({
            employeeCode: 'Hướng dẫn:',
            username: 'Các cột có * là bắt buộc. Vai trò: ADMIN/TDV/QL/KT/DELIVERY. Kênh: OTC/ETC. Trạng thái: TRUE/FALSE'
        });
        sheet.getRow(2).font = { italic: true, color: { argb: '666666' } };

        // Sample data - Admin
        sheet.addRow({
            employeeCode: 'ADMIN001',
            username: 'admin.hcm',
            password: '123456',
            name: 'Nguyễn Văn Admin',
            email: 'admin@ammedtech.com',
            phone: '0901234567',
            role: 'ADMIN',
            managerCode: '',
            managerName: '',
            regionCode: 'MIEN_NAM',
            routeCode: '',
            channel: '',
            isActive: 'TRUE'
        });

        // Sample data - Manager
        sheet.addRow({
            employeeCode: 'QL001',
            username: 'ql.hcm',
            password: '123456',
            name: 'Trần Thị Quản Lý',
            email: 'ql001@ammedtech.com',
            phone: '0901234568',
            role: 'QL',
            managerCode: 'ADMIN001',
            managerName: 'Nguyễn Văn Admin',
            regionCode: 'MIEN_NAM',
            routeCode: '',
            channel: '',
            isActive: 'TRUE'
        });

        // Sample data - TDV
        sheet.addRow({
            employeeCode: 'TDV001',
            username: 'tdv001',
            password: '123456',
            name: 'Lê Văn TDV',
            email: 'tdv001@ammedtech.com',
            phone: '0901234569',
            role: 'TDV',
            managerCode: 'QL001',
            managerName: 'Trần Thị Quản Lý',
            regionCode: 'MIEN_NAM',
            routeCode: 'RT-HCM-Q1',
            channel: 'OTC',
            isActive: 'TRUE'
        });

        // Sample data - Accountant
        sheet.addRow({
            employeeCode: 'KT001',
            username: 'kt001',
            password: '123456',
            name: 'Phạm Thị Kế Toán',
            email: 'kt001@ammedtech.com',
            phone: '0901234570',
            role: 'KT',
            managerCode: 'ADMIN001',
            managerName: 'Nguyễn Văn Admin',
            regionCode: 'MIEN_NAM',
            routeCode: '',
            channel: '',
            isActive: 'TRUE'
        });

        // Sample data - Delivery
        sheet.addRow({
            employeeCode: 'DLV001',
            username: 'dlv001',
            password: '123456',
            name: 'Hoàng Văn Giao Hàng',
            email: 'dlv001@ammedtech.com',
            phone: '0901234571',
            role: 'DELIVERY',
            managerCode: 'QL001',
            managerName: 'Trần Thị Quản Lý',
            regionCode: 'MIEN_NAM',
            routeCode: '',
            channel: '',
            isActive: 'TRUE'
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Template_NhanVien.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('User template error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ================================
// FULL DATA EXPORT
// ================================

// Export all customers
router.get('/export/customers', async (req, res) => {
    try {
        const customers = await prisma.pharmacy.findMany({
            include: { territory: { include: { region: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Khách hàng');

        sheet.columns = [
            { header: 'Mã KH', key: 'code', width: 15 },
            { header: 'Tên', key: 'name', width: 30 },
            { header: 'Loại', key: 'type', width: 12 },
            { header: 'Kênh', key: 'channel', width: 10 },
            { header: 'Phân khúc', key: 'segment', width: 10 },
            { header: 'Hạng', key: 'tier', width: 10 },
            { header: 'ĐT', key: 'phone', width: 12 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Địa chỉ', key: 'address', width: 40 },
            { header: 'Quận', key: 'district', width: 15 },
            { header: 'Tỉnh', key: 'province', width: 15 },
            { header: 'Territory', key: 'territory', width: 15 },
            { header: 'Region', key: 'region', width: 12 },
            { header: 'Trạng thái', key: 'status', width: 12 },
            { header: 'Ngày tạo', key: 'createdAt', width: 12 },
        ];

        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } };

        customers.forEach(c => {
            sheet.addRow({
                code: c.code,
                name: c.name,
                type: c.type,
                channel: c.channel,
                segment: c.segment,
                tier: c.tier,
                phone: c.phone,
                email: c.email,
                address: c.address,
                district: c.district,
                province: c.province,
                territory: c.territory?.name,
                region: c.territory?.region?.name,
                status: c.status,
                createdAt: c.createdAt?.toISOString().slice(0, 10)
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=KhachHang_${new Date().toISOString().slice(0, 10)}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export all products
router.get('/export/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { group: true, category: true },
            orderBy: { name: 'asc' }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Sản phẩm');

        sheet.columns = [
            { header: 'Mã SP', key: 'code', width: 12 },
            { header: 'Tên', key: 'name', width: 35 },
            { header: 'Hoạt chất', key: 'genericName', width: 25 },
            { header: 'Nhóm', key: 'group', width: 15 },
            { header: 'Danh Mục', key: 'category', width: 15 },
            { header: 'Đơn vị', key: 'unit', width: 10 },
            { header: 'Giá nhập', key: 'costPrice', width: 12 },
            { header: 'Giá bán', key: 'price', width: 12 },
            { header: 'NSX (Hãng)', key: 'manufacturer', width: 20 },
            { header: 'Công dụng', key: 'usage', width: 25 },
            { header: 'Tồn Min', key: 'minStock', width: 10 },
            { header: 'Kê đơn', key: 'isPrescription', width: 10 },
        ];

        sheet.getRow(1).font = { bold: true };

        products.forEach(p => {
            sheet.addRow({
                code: p.code,
                name: p.name,
                genericName: p.genericName,
                group: p.group?.name,
                category: p.category?.name,
                unit: p.unit,
                costPrice: p.costPrice,
                price: p.price,
                manufacturer: p.manufacturer,
                usage: p.usage,
                minStock: p.minStock,
                isPrescription: p.isPrescription ? 'Có' : 'Không'
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=SanPham_${new Date().toISOString().slice(0, 10)}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
