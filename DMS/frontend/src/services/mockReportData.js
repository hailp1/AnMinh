// MOCK DATA for Reports
const MOCK_SALES_DETAIL = [
    { id: 'ORD-001', date: '2025-10-01 09:30', user: 'TDV001', customer: 'Nhà thuốc An Khang', product: 'Panadol Extra', qty: 50, price: 120000, total: 6000000, status: 'Completed' },
    { id: 'ORD-001', date: '2025-10-01 09:30', user: 'TDV001', customer: 'Nhà thuốc An Khang', product: 'Vitamin C', qty: 20, price: 45000, total: 900000, status: 'Completed' },
    { id: 'ORD-002', date: '2025-10-01 10:15', user: 'TDV002', customer: 'Nhà thuốc Long Châu', product: 'Hapacol Blue', qty: 100, price: 85000, total: 8500000, status: 'Pending' },
    { id: 'ORD-003', date: '2025-10-02 08:45', user: 'TDV003', customer: 'Phòng khám Đa khoa', product: 'Antibiotic X', qty: 10, price: 250000, total: 2500000, status: 'Completed' },
    // ... more mock data
];

const MOCK_VISIT_COMPLIANCE = [
    { id: 'VIS-001', date: '2025-10-01', user: 'TDV001', customer: 'Nhà thuốc A', planTime: '09:00', checkIn: '09:05', distance: 15, duration: 25, status: 'Valid', hasPhoto: 'Yes' },
    { id: 'VIS-002', date: '2025-10-01', user: 'TDV001', customer: 'Nhà thuốc B', planTime: '10:00', checkIn: '10:45', distance: 550, duration: 5, status: 'Late/Far', hasPhoto: 'No' },
];

const MOCK_INVENTORY_LEDGER = [
    { id: 'TXN-001', date: '2025-10-01', type: 'IMPORT', warehouse: 'Kho Tổng', product: 'Panadol Extra', batch: 'BATCH-A1', qty: 1000, ref: 'PO-999' },
    { id: 'TXN-002', date: '2025-10-02', type: 'EXPORT', warehouse: 'Kho Tổng', product: 'Panadol Extra', batch: 'BATCH-A1', qty: -50, ref: 'ORD-001' },
];

const MOCK_INVENTORY_SUMMARY = [
    { 'Mã VT': 'P-001', 'Tên Vật tư': 'Panadol Extra', 'ĐVT': 'Hộp', 'Tồn đầu': 100, 'Nhập': 500, 'Xuất': 200, 'Tồn cuối': 400 },
    { 'Mã VT': 'P-002', 'Tên Vật tư': 'Vitamin C UPSA', 'ĐVT': 'Tube', 'Tồn đầu': 50, 'Nhập': 100, 'Xuất': 120, 'Tồn cuối': 30 },
    { 'Mã VT': 'P-003', 'Tên Vật tư': 'Hapacol 650', 'ĐVT': 'Vỉ', 'Tồn đầu': 1000, 'Nhập': 0, 'Xuất': 150, 'Tồn cuối': 850 },
    { 'Mã VT': 'P-004', 'Tên Vật tư': 'Augmentin 1g', 'ĐVT': 'Hộp', 'Tồn đầu': 20, 'Nhập': 50, 'Xuất': 10, 'Tồn cuối': 60 },
];

const MOCK_STOCK_LEDGER = [
    { 'Ngày': '2025-10-01', 'Số CT': '-', 'Diễn giải': 'Tồn đầu kỳ', 'Nhập': 0, 'Xuất': 0, 'Tồn': 100 },
    { 'Ngày': '2025-10-02', 'Số CT': 'PN001', 'Diễn giải': 'Nhập kho từ NCC', 'Nhập': 500, 'Xuất': 0, 'Tồn': 600 },
    { 'Ngày': '2025-10-03', 'Số CT': 'PX001', 'Diễn giải': 'Xuất bán hàng', 'Nhập': 0, 'Xuất': 50, 'Tồn': 550 },
    { 'Ngày': '2025-10-05', 'Số CT': 'PX002', 'Diễn giải': 'Xuất bán hàng', 'Nhập': 0, 'Xuất': 150, 'Tồn': 400 },
];

export const getMockReportData = (type) => {
    if (type === 'orders') return MOCK_SALES_DETAIL;
    if (type === 'compliance') return MOCK_VISIT_COMPLIANCE;
    if (type === 'inventory') return MOCK_INVENTORY_LEDGER;
    if (type === 'inventory_summary') return MOCK_INVENTORY_SUMMARY;
    if (type === 'inventory_ledger') return MOCK_STOCK_LEDGER;
    return [];
};
