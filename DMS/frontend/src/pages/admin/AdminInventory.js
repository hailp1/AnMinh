import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { inventoryAPI, productsAPI, usersAPI } from '../../services/api';

const AdminInventory = () => {
    const [activeTab, setActiveTab] = useState('stock'); // stock, batches, warehouses, transactions
    const [warehouses, setWarehouses] = useState([]);
    const [stock, setStock] = useState([]);
    const [batches, setBatches] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Modals state
    const [showImportModal, setShowImportModal] = useState(false);
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);

    // Form data
    const [importData, setImportData] = useState({
        warehouseId: '',
        items: [{
            productId: '',
            batchNumber: '',
            expiryDate: '',
            orderedQty: 0,
            deliveredQty: 0,
            unitPrice: 0,
            discountedPrice: 0,
            quantity: 0,
            totalAmount: 0
        }],
        reason: '',
        notes: ''
    });
    const [warehouseData, setWarehouseData] = useState({
        code: '', name: '', type: 'BRANCH', address: '', managerId: ''
    });

    const [products, setProducts] = useState([]); // For product selection in import

    // Transaction filters
    const [transactionFilters, setTransactionFilters] = useState({
        startDate: '',
        endDate: '',
        warehouseId: 'all',
        type: 'all'
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await inventoryAPI.getProducts ? inventoryAPI.getProducts() : [];
            // Warning: inventoryAPI might not have getProducts directly, assumes it exists or use productsAPI
            // Let's use valid API. api.js usually exports productsAPI.
            // But we need to import productsAPI if not available.
            // Ideally we check if we can import it. The file imports inventoryAPI.
            // Let's assume we can add productsAPI to imports later or use what we have.
            // For now, let's leave this placeholder and fix import in next block.
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    useEffect(() => {
        if (activeTab === 'stock') fetchStock();
        if (activeTab === 'batches') fetchBatches();
        if (activeTab === 'transactions') fetchTransactions();
    }, [activeTab, selectedWarehouse, searchTerm]);

    const fetchWarehouses = async () => {
        try {
            const data = await inventoryAPI.getWarehouses();
            setWarehouses(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStock = async () => {
        setLoading(true);
        try {
            const data = await inventoryAPI.getStock({
                warehouseId: selectedWarehouse,
                search: searchTerm
            });
            setStock(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const data = await inventoryAPI.getBatches({
                warehouseId: selectedWarehouse,
                productId: searchTerm ? undefined : undefined // TODO: Handle product search for batches
            });
            setBatches(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (transactionFilters.warehouseId && transactionFilters.warehouseId !== 'all') {
                params.warehouseId = transactionFilters.warehouseId;
            }
            if (transactionFilters.type && transactionFilters.type !== 'all') {
                params.type = transactionFilters.type;
            }
            if (transactionFilters.startDate) {
                params.startDate = transactionFilters.startDate;
            }
            if (transactionFilters.endDate) {
                params.endDate = transactionFilters.endDate;
            }

            const data = await inventoryAPI.getTransactions(params);
            setTransactions(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchProducts = async () => {
        try {
            // using productsAPI from imports
            const data = await productsAPI.getAll({ isActive: true });
            setProducts(data || []);
        } catch (e) {
            console.error(e);
        }
    }

    // Load products when opening import modal
    useEffect(() => {
        if (showImportModal && products.length === 0) {
            handleFetchProducts();
        }
    }, [showImportModal]);

    const handleAddWarehouse = async () => {
        try {
            console.log('Creating warehouse:', warehouseData);
            await inventoryAPI.createWarehouse(warehouseData);
            alert('Tạo kho thành công!');
            setShowWarehouseModal(false);
            fetchWarehouses();
            setWarehouseData({ code: '', name: '', type: 'BRANCH', address: '', managerId: '' });
        } catch (error) {
            console.error('Warehouse creation error:', error);
            alert('Lỗi: ' + (error.message || error.toString() || 'Không xác định'));
        }
    };

    const handleImportStock = async () => {
        try {
            if (!importData.warehouseId) return alert('Vui lòng chọn kho nhập');
            if (importData.items.length === 0) return alert('Chưa có sản phẩm');

            await inventoryAPI.createTransaction({
                type: 'IMPORT',
                ...importData
            });
            alert('Nhập kho thành công!');
            setShowImportModal(false);
            setImportData({
                warehouseId: '',
                items: [{
                    productId: '',
                    batchNumber: '',
                    expiryDate: '',
                    orderedQty: 0,
                    deliveredQty: 0,
                    unitPrice: 0,
                    discountedPrice: 0,
                    quantity: 0,
                    totalAmount: 0
                }],
                reason: '',
                notes: ''
            });
            if (activeTab === 'stock') fetchStock();
            if (activeTab === 'batches') fetchBatches();
            if (activeTab === 'transactions') fetchTransactions();
        } catch (error) {
            alert('Lỗi: ' + (error.message || 'Unknown'));
        }
    };

    const addImportItem = () => {
        setImportData({
            ...importData,
            items: [...importData.items, {
                productId: '',
                batchNumber: '',
                expiryDate: '',
                orderedQty: 0,
                deliveredQty: 0,
                unitPrice: 0,
                discountedPrice: 0,
                quantity: 0,
                totalAmount: 0
            }]
        });
    };

    const removeImportItem = (index) => {
        const newItems = [...importData.items];
        newItems.splice(index, 1);
        setImportData({ ...importData, items: newItems });
    };

    const updateImportItem = (index, field, value) => {
        const newItems = [...importData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setImportData({ ...importData, items: newItems });
    };

    // Download template for stock import
    const handleDownloadImportTemplate = () => {
        const headers = [
            {
                'Mã kho': 'MAIN',
                'Mã SP': 'SP001',
                'Số lượng': 100,
                'Giá nhập': 50000,
                'Số lô': 'LOT001',
                'Hạn dùng': '2025-12-31',
                'Lý do': 'Nhập hàng đầu kỳ',
                'Ghi chú': 'Hàng mới'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'Template_Nhap_Kho.xlsx');
    };

    // Import Excel for stock import
    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                if (data.length === 0) {
                    alert('File Excel trống!');
                    return;
                }

                // Group by warehouse
                const groupedByWarehouse = {};
                data.forEach(row => {
                    const warehouseCode = row['Mã kho'];
                    if (!groupedByWarehouse[warehouseCode]) {
                        groupedByWarehouse[warehouseCode] = [];
                    }
                    groupedByWarehouse[warehouseCode].push(row);
                });

                // Process each warehouse group
                for (const [warehouseCode, rows] of Object.entries(groupedByWarehouse)) {
                    // Find warehouse by code
                    const warehouse = warehouses.find(w => w.code === warehouseCode);
                    if (!warehouse) {
                        alert(`Không tìm thấy kho: ${warehouseCode}`);
                        continue;
                    }

                    const items = [];
                    for (const row of rows) {
                        // Find product by code
                        const product = products.find(p => p.code === row['Mã SP']);
                        if (!product) {
                            alert(`Không tìm thấy sản phẩm: ${row['Mã SP']}`);
                            continue;
                        }

                        items.push({
                            productId: product.id,
                            quantity: parseInt(row['Số lượng']) || 0,
                            unitPrice: parseFloat(row['Giá nhập']) || 0,
                            batchNumber: row['Số lô'] || '',
                            expiryDate: row['Hạn dùng'] || ''
                        });
                    }

                    if (items.length > 0) {
                        // Create transaction
                        await inventoryAPI.createTransaction({
                            type: 'IMPORT',
                            warehouseId: warehouse.id,
                            items,
                            reason: rows[0]['Lý do'] || 'Import từ Excel',
                            notes: rows[0]['Ghi chú'] || ''
                        });
                    }
                }

                alert('Import thành công!');
                // Refresh data
                if (activeTab === 'stock') fetchStock();
                if (activeTab === 'batches') fetchBatches();
                if (activeTab === 'transactions') fetchTransactions();

            } catch (error) {
                console.error(error);
                alert('Lỗi khi xử lý file Excel: ' + error.message);
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    // Export transaction to PDF/Print
    const handleExportTransaction = (transaction) => {
        // Create printable HTML
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Phiếu ${transaction.type === 'IMPORT' ? 'Nhập' : 'Xuất'} Kho</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #1E4A8B; }
                    .info { margin: 20px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; text-align: right; }
                </style>
            </head>
            <body>
                <h1>PHIẾU ${transaction.type === 'IMPORT' ? 'NHẬP' : 'XUẤT'} KHO</h1>
                <div class="info">
                    <p><strong>Mã phiếu:</strong> ${transaction.transactionNo || transaction.id}</p>
                    <p><strong>Kho:</strong> ${transaction.warehouse?.name || 'N/A'}</p>
                    <p><strong>Ngày:</strong> ${new Date(transaction.createdAt).toLocaleString('vi-VN')}</p>
                    <p><strong>Người tạo:</strong> ${transaction.creator?.name || 'N/A'}</p>
                    <p><strong>Lý do:</strong> ${transaction.reason || ''}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Sản phẩm</th>
                            <th>Số lô</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>${transaction.product?.name || 'N/A'}</td>
                            <td>${transaction.batchNumber || '-'}</td>
                            <td>${transaction.quantity}</td>
                            <td>${formatCurrency(transaction.unitPrice || 0)}</td>
                            <td>${formatCurrency(transaction.totalAmount || 0)}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="total">
                    <p><strong>Tổng cộng:</strong> ${formatCurrency(transaction.totalAmount || 0)}</p>
                </div>
                <div class="info" style="margin-top: 40px;">
                    <p><strong>Ghi chú:</strong> ${transaction.notes || ''}</p>
                </div>
                <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                    <div style="text-align: center;">
                        <p>Người lập phiếu</p>
                        <p style="margin-top: 60px;">${transaction.creator?.name || ''}</p>
                    </div>
                    <div style="text-align: center;">
                        <p>Thủ kho</p>
                        <p style="margin-top: 60px;">_____________</p>
                    </div>
                    <div style="text-align: center;">
                        <p>Giám đốc</p>
                        <p style="margin-top: 60px;">_____________</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

    const renderStockTable = () => (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Mã SP</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tên sản phẩm</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Danh mục</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Kho</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Tồn kho</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>ĐVT</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {stock.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#1E4A8B' }}>{item.product?.code}</td>
                            <td style={{ padding: '12px' }}>
                                <div>{item.product?.name}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{item.product?.manufacturer}</div>
                            </td>
                            <td style={{ padding: '12px' }}>{item.product?.group?.name}</td>
                            <td style={{ padding: '12px' }}>{item.warehouse?.name}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{item.currentQty}</td>
                            <td style={{ padding: '12px' }}>{item.product?.unit}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                {item.currentQty <= (item.product?.minStock || 10) ? (
                                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>Sắp hết</span>
                                ) : (
                                    <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>Còn hàng</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {stock.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Không có dữ liệu</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderBatchesTable = () => (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Sản phẩm</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Số lô</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Hạn sử dụng</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Số lượng</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Kho</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.map(batch => {
                        const isExpiring = new Date(batch.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 6));
                        return (
                            <tr key={batch.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '12px' }}>{batch.product?.name}</td>
                                <td style={{ padding: '12px', fontWeight: '600' }}>{batch.batchNumber}</td>
                                <td style={{ padding: '12px', color: isExpiring ? '#dc2626' : 'inherit' }}>
                                    {formatDate(batch.expiryDate)}
                                    {isExpiring && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px' }}>Cận date</span>}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{batch.currentQuantity}</td>
                                <td style={{ padding: '12px' }}>{batch.warehouse?.name}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>{batch.status}</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const renderTransactionsTable = () => (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Ngày</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Loại</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Sản phẩm</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Số lượng</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Kho</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Chứng từ</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px' }}>{formatDate(tx.transactionDate)}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    background: tx.type === 'IMPORT' ? '#d1fae5' : '#fee2e2',
                                    color: tx.type === 'IMPORT' ? '#059669' : '#dc2626'
                                }}>
                                    {tx.type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                                </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                                <div>{tx.product?.name}</div>
                                <div style={{ fontSize: '11px', color: '#666' }}>{tx.product?.code}</div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{tx.quantity}</td>
                            <td style={{ padding: '12px' }}>{tx.warehouse?.name}</td>
                            <td style={{ padding: '12px' }}>{tx.order?.orderNumber || '-'}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                    onClick={() => handleExportTransaction(tx)}
                                    style={{
                                        padding: '6px 12px',
                                        background: '#3b82f6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    🖨️ In
                                </button>
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Chưa có giao dịch nào</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderWarehouses = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            <div
                onClick={() => setShowWarehouseModal(true)}
                style={{
                    border: '2px dashed #e5e7eb',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#f9fafb',
                    color: '#666',
                    minHeight: '150px'
                }}
            >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>+</div>
                <div style={{ fontWeight: '600' }}>Thêm kho mới</div>
            </div>
            {warehouses.map(wh => (
                <div key={wh.id} style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>{wh.name}</h3>
                        <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>{wh.code}</span>
                    </div>
                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>📍 {wh.address || 'Chưa cập nhật địa chỉ'}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>👤 Quản lý: {wh.manager?.name || 'Chưa có'}</div>
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#888' }}>
                        Loại: {wh.type === 'MAIN' ? 'Kho Tổng' : 'Kho Chi Nhánh'}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ padding: isMobile ? '0' : '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>🏭 Quản lý kho hàng</h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Theo dõi tồn kho, lô hạn và luân chuyển hàng hóa</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowImportModal(true)}
                        style={{
                            padding: '10px 16px',
                            background: '#1E4A8B',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        📥 Nhập kho
                    </button>
                    <button
                        onClick={handleDownloadImportTemplate}
                        style={{
                            padding: '10px 16px',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        📄 Template
                    </button>
                    <label style={{ position: 'relative', cursor: 'pointer' }}>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleImportExcel}
                            style={{ display: 'none' }}
                        />
                        <div style={{
                            padding: '10px 16px',
                            background: '#f59e0b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-block'
                        }}>
                            📤 Import Excel
                        </div>
                    </label>
                    <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }}
                    >
                        <option value="all">Tất cả kho</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '1px', overflowX: 'auto' }}>
                {[
                    { id: 'stock', label: '📦 Tồn kho', icon: '📦' },
                    { id: 'batches', label: '📅 Lô & Hạn dùng', icon: '📅' },
                    { id: 'warehouses', label: '🏭 Danh sách kho', icon: '🏭' },
                    { id: 'transactions', label: '📝 Lịch sử nhập xuất', icon: '📝' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === tab.id ? '#fff' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                            color: activeTab === tab.id ? '#3b82f6' : '#666',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Filters for Stock/Batches */}
            {(activeTab === 'stock' || activeTab === 'batches') && (
                <div style={{ marginBottom: '24px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Tìm kiếm sản phẩm, mã SP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }}
                    />
                </div>
            )}

            {/* Filters for Transactions */}
            {activeTab === 'transactions' && (
                <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <input
                        type="date"
                        value={transactionFilters.startDate}
                        onChange={(e) => setTransactionFilters({ ...transactionFilters, startDate: e.target.value })}
                        placeholder="Từ ngày"
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }}
                    />
                    <input
                        type="date"
                        value={transactionFilters.endDate}
                        onChange={(e) => setTransactionFilters({ ...transactionFilters, endDate: e.target.value })}
                        placeholder="Đến ngày"
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }}
                    />
                    <select
                        value={transactionFilters.warehouseId}
                        onChange={(e) => setTransactionFilters({ ...transactionFilters, warehouseId: e.target.value })}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }}
                    >
                        <option value="all">Tất cả kho</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <select
                        value={transactionFilters.type}
                        onChange={(e) => setTransactionFilters({ ...transactionFilters, type: e.target.value })}
                        style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }}
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="IMPORT">Nhập kho</option>
                        <option value="EXPORT">Xuất kho</option>
                    </select>
                    <button
                        onClick={fetchTransactions}
                        style={{
                            padding: '12px 16px',
                            background: '#1E4A8B',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        🔍 Lọc
                    </button>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải dữ liệu...</div>
            ) : (
                <>
                    {activeTab === 'stock' && renderStockTable()}
                    {activeTab === 'batches' && renderBatchesTable()}
                    {activeTab === 'warehouses' && renderWarehouses()}
                    {activeTab === 'transactions' && renderTransactionsTable()}
                </>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '20px' }}>📥 Lập phiếu nhập kho</h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label>Kho nhập</label>
                                <select
                                    value={importData.warehouseId}
                                    onChange={(e) => setImportData({ ...importData, warehouseId: e.target.value })}
                                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    <option value="">Chọn kho...</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label>Sản phẩm</label>
                                {importData.items.map((item, index) => (
                                    <div key={index} style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px', marginBottom: '12px', background: '#f9fafb' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>

                                            {/* Mã SP */}
                                            <div style={{ gridColumn: '1/-1' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Mã sản phẩm *</label>
                                                <select
                                                    value={item.productId}
                                                    onChange={(e) => {
                                                        updateImportItem(index, 'productId', e.target.value);
                                                        // Auto-fill price from product
                                                        const product = products.find(p => p.id === e.target.value);
                                                        if (product) {
                                                            updateImportItem(index, 'unitPrice', product.salePrice || 0);
                                                        }
                                                    }}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '4px' }}
                                                >
                                                    <option value="">Chọn sản phẩm...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                                                </select>
                                            </div>

                                            {/* Số lô */}
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Số lô *</label>
                                                <input
                                                    type="text"
                                                    placeholder="LOT001"
                                                    value={item.batchNumber || ''}
                                                    onChange={(e) => updateImportItem(index, 'batchNumber', e.target.value)}
                                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '4px' }}
                                                />
                                            </div>

                                            {/* HSD */}
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Hạn sử dụng *</label>
                                                <input
                                                    type="date"
                                                    value={item.expiryDate ? item.expiryDate.split('T')[0] : ''}
                                                    onChange={(e) => updateImportItem(index, 'expiryDate', e.target.value)}
                                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '4px' }}
                                                />
                                            </div>

                                            {/* Đơn giá */}
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Đơn giá *</label>
                                                <input
                                                    type="number"
                                                    placeholder="50000"
                                                    value={item.unitPrice || 0}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        updateImportItem(index, 'unitPrice', val);
                                                        // Auto calc totalAmount
                                                        const qty = item.deliveredQty || item.quantity || 0;
                                                        const price = item.discountedPrice || val;
                                                        updateImportItem(index, 'totalAmount', qty * price);
                                                    }}
                                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '4px' }}
                                                />
                                            </div>

                                            {/* Giá sau CK */}
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Giá sau CK</label>
                                                <input
                                                    type="number"
                                                    placeholder="45000"
                                                    value={item.discountedPrice || 0}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        updateImportItem(index, 'discountedPrice', val);
                                                        // Auto calc totalAmount
                                                        const qty = item.deliveredQty || item.quantity || 0;
                                                        updateImportItem(index, 'totalAmount', qty * val);
                                                    }}
                                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '4px' }}
                                                />
                                            </div>

                                            {/* SL đặt */}
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>SL đặt</label>
                                                <input
                                                    type="number"
                                                    placeholder="100"
                                                    value={item.orderedQty || 0}
                                                    onChange={(e) => updateImportItem(index, 'orderedQty', parseFloat(e.target.value) || 0)}
                                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '4px' }}
                                                />
                                            </div>

                                            {/* SL giao */}
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>SL giao *</label>
                                                <input
                                                    type="number"
                                                    placeholder="98"
                                                    value={item.deliveredQty || 0}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        updateImportItem(index, 'deliveredQty', val);
                                                        updateImportItem(index, 'quantity', val); // quantity = deliveredQty
                                                        // Auto calc totalAmount
                                                        const price = item.discountedPrice || item.unitPrice || 0;
                                                        updateImportItem(index, 'totalAmount', val * price);
                                                    }}
                                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '4px' }}
                                                />
                                            </div>

                                            {/* Thành tiền (readonly) */}
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Thành tiền</label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={formatCurrency(item.totalAmount || 0)}
                                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '4px', background: '#f3f4f6', fontWeight: '600', color: '#059669' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Remove button */}
                                        <div style={{ marginTop: '12px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => removeImportItem(index)}
                                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                🗑️ Xóa dòng
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addImportItem}
                                    style={{ marginTop: '8px', color: '#1E4A8B', background: '#dbeafe', border: '1px solid #3b82f6', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    + Thêm sản phẩm
                                </button>
                            </div>

                            <div>
                                <label>Ghi chú</label>
                                <textarea
                                    value={importData.notes}
                                    onChange={(e) => setImportData({ ...importData, notes: e.target.value })}
                                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setShowImportModal(false)} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Hủy</button>
                            <button onClick={handleImportStock} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#1E4A8B', color: '#fff', cursor: 'pointer' }}>Xác nhận nhập kho</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warehouse Modal */}
            {showWarehouseModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Thêm kho mới</h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <input
                                placeholder="Mã kho (VD: MAIN)"
                                value={warehouseData.code}
                                onChange={(e) => setWarehouseData({ ...warehouseData, code: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <input
                                placeholder="Tên kho"
                                value={warehouseData.name}
                                onChange={(e) => setWarehouseData({ ...warehouseData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <select
                                value={warehouseData.type}
                                onChange={(e) => setWarehouseData({ ...warehouseData, type: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                <option value="MAIN">Kho Tổng</option>
                                <option value="BRANCH">Kho Chi Nhánh</option>
                            </select>
                            <input
                                placeholder="Địa chỉ"
                                value={warehouseData.address}
                                onChange={(e) => setWarehouseData({ ...warehouseData, address: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setShowWarehouseModal(false)} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Hủy</button>
                            <button onClick={handleAddWarehouse} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#1E4A8B', color: '#fff', cursor: 'pointer' }}>Tạo kho</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminInventory;
