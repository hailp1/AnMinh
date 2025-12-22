
import React, { useState, useEffect } from 'react';
import {
    Box, ArrowUpRight, ArrowDownRight, RefreshCcw, AlertTriangle,
    Truck, TrendingUp, Plus, Save, X, Trash2, Calendar,
    FileText
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// --- STYLES ---
const THEME = {
    primary: '#0f172a',
    secondary: '#334155',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    bg: '#f1f5f9',
    cardBg: 'white',
    text: '#1e293b',
    textLight: '#64748b',
    border: '#cbd5e1'
};

const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const AdminInventory = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, stock, transactions, warehouses
    const [loading, setLoading] = useState(false);

    // Data
    const [inventory, setInventory] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState([]);

    // Modals
    const [modalMode, setModalMode] = useState(null); // 'IMPORT', 'EXPORT', 'TRANSFER', 'WAREHOUSE'
    const [editingWarehouse, setEditingWarehouse] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };

            const [dashRes, stockRes, trxRes, whRes, prodRes] = await Promise.all([
                fetch(`${API_BASE}/inventory/dashboard`, { headers }),
                fetch(`${API_BASE}/inventory/stock`, { headers }),
                fetch(`${API_BASE}/inventory/transactions`, { headers }),
                fetch(`${API_BASE}/inventory/warehouses`, { headers }),
                fetch(`${API_BASE}/products`, { headers })
            ]);

            if (dashRes.ok) {
                const d = await dashRes.json();
                setStats(d.stats || {});
                if (d.chart) {
                    const processed = {};
                    d.chart.forEach(item => {
                        const date = new Date(item.transactionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                        if (!processed[date]) processed[date] = 0;
                        processed[date] += (item._sum.totalAmount || 0);
                    });
                    setChartData(Object.keys(processed).map(k => ({ name: k, value: processed[k] })));
                }
            }
            if (stockRes.ok) setInventory(await stockRes.json());
            if (trxRes.ok) setTransactions(await trxRes.json());
            if (whRes.ok) setWarehouses(await whRes.json());
            if (prodRes.ok) setProducts(await prodRes.json());

        } catch (error) {
            console.error('Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleTransactionSubmit = async (data) => {
        // data: { type, warehouseId, toWarehouseId, items, reason, notes }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/inventory/transactions`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                alert('Tạo giao dịch thành công!');
                setModalMode(null);
                loadData();
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.error}`);
            }
        } catch (error) {
            console.error('Transaction error:', error);
            alert('Lỗi hệ thống');
        }
    };

    const handleSaveWarehouse = async (data) => {
        try {
            const token = localStorage.getItem('token');
            const url = editingWarehouse
                ? `${API_BASE}/inventory/warehouses/${editingWarehouse.id}`
                : `${API_BASE}/inventory/warehouses`;
            const method = editingWarehouse ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert('Lưu kho thành công!');
                setModalMode(null);
                setEditingWarehouse(null);
                loadData();
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.error}`);
            }
        } catch (error) {
            console.error('Warehouse save error:', error);
        }
    };

    const handleDeleteWarehouse = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa kho này?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/inventory/warehouses/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                loadData();
            } else {
                const err = await res.json();
                alert(`Không thể xóa: ${err.error}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- STYLES OBJECT ---
    const ss = {
        container: { fontFamily: 'Inter, sans-serif', background: THEME.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
        header: { padding: '16px 24px', background: 'white', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
        title: { fontSize: '20px', fontWeight: '700', color: THEME.primary, display: 'flex', alignItems: 'center', gap: '10px' },
        main: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' },

        tabBar: { display: 'flex', gap: '4px', borderBottom: `1px solid ${THEME.border}`, marginBottom: '0' },
        tab: (isActive) => ({
            padding: '10px 20px', cursor: 'pointer', fontWeight: isActive ? '600' : '500',
            color: isActive ? THEME.accent : THEME.textLight,
            background: isActive ? 'white' : 'transparent',
            border: isActive ? `1px solid ${THEME.border}` : '1px solid transparent',
            borderBottom: isActive ? '1px solid white' : '1px solid transparent',
            borderRadius: '8px 8px 0 0', marginBottom: '-1px'
        }),
        contentBox: { background: 'white', border: `1px solid ${THEME.border}`, borderRadius: '0 8px 8px 8px', minHeight: '400px', padding: '20px' },

        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { textAlign: 'left', padding: '12px', background: '#f8fafc', borderBottom: `1px solid ${THEME.border}`, fontWeight: '600', color: THEME.textLight, textTransform: 'uppercase', fontSize: '11px' },
        td: { padding: '12px', borderBottom: `1px solid ${THEME.border}`, color: THEME.text },

        btn: (variant = 'primary') => ({
            background: variant === 'primary' ? THEME.accent : variant === 'success' ? THEME.success : variant === 'danger' ? THEME.danger : 'white',
            color: variant === 'outline' ? THEME.text : 'white',
            border: variant === 'outline' ? `1px solid ${THEME.border}` : 'none',
            padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px'
        })
    };

    return (
        <div style={ss.container}>
            <div style={ss.header}>
                <div style={ss.title}><Box size={24} color={THEME.accent} /> Inventory Management</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={ss.btn('success')} onClick={() => setModalMode('IMPORT')}>
                        <ArrowDownRight size={16} /> Nhập Kho (Import)
                    </button>
                    <button style={ss.btn('primary')} onClick={() => setModalMode('TRANSFER')}>
                        <Truck size={16} /> Chuyển Kho (Transfer)
                    </button>
                    <button style={ss.btn('danger')} onClick={() => setModalMode('EXPORT')}>
                        <ArrowUpRight size={16} /> Xuất Kho (Export)
                    </button>
                </div>
            </div>

            <div style={ss.main}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <StatCard title="Tổng Giá Trị Tồn" value={formatMoney(stats.totalValue)} icon={Box} color={THEME.accent} />
                    <StatCard title="Nhập Trong Tháng" value={formatMoney(stats.importMonth)} icon={ArrowDownRight} color={THEME.success} />
                    <StatCard title="Xuất Trong Tháng" value={formatMoney(stats.exportMonth)} icon={ArrowUpRight} color={THEME.warning} />
                    <StatCard title="Cảnh Báo Hết Hạn" value={`${stats.expiringCount || 0} Lô`} icon={AlertTriangle} color={THEME.danger} />
                </div>

                {/* Tabs & Content */}
                <div>
                    <div style={ss.tabBar}>
                        <div style={ss.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Tổng Quan</div>
                        <div style={ss.tab(activeTab === 'stock')} onClick={() => setActiveTab('stock')}>Tồn Kho (Stock)</div>
                        <div style={ss.tab(activeTab === 'transactions')} onClick={() => setActiveTab('transactions')}>Lịch Sử GD</div>
                        <div style={ss.tab(activeTab === 'warehouses')} onClick={() => setActiveTab('warehouses')}>Quản Lý Kho</div>
                    </div>

                    <div style={ss.contentBox}>
                        {activeTab === 'overview' && (
                            <div style={{ height: '400px' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={18} /> Biểu đồ nhập xuất (30 ngày)</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={THEME.accent} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : val} style={{ fontSize: '12px' }} />
                                        <Tooltip formatter={(val) => formatMoney(val)} />
                                        <Area type="monotone" dataKey="value" stroke={THEME.accent} fillOpacity={1} fill="url(#colorVal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {activeTab === 'stock' && (
                            <table style={ss.table}>
                                <thead>
                                    <tr>
                                        <th style={ss.th}>Sản Phẩm</th>
                                        <th style={ss.th}>SKU</th>
                                        <th style={ss.th}>Kho</th>
                                        <th style={ss.th}>Số Lượng</th>
                                        <th style={ss.th}>Min Stock</th>
                                        <th style={ss.th}>Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={ss.td}>
                                                <div style={{ fontWeight: '600' }}>{item.product?.name}</div>
                                                <div style={{ fontSize: '11px', color: THEME.textLight }}>{item.product?.genericName}</div>
                                            </td>
                                            <td style={ss.td}>{item.product?.code}</td>
                                            <td style={ss.td}>{item.warehouse?.name}</td>
                                            <td style={ss.td}>
                                                <span style={{ fontWeight: 'bold', color: item.currentQty < (item.product?.minStock || 0) ? THEME.danger : THEME.text }}>
                                                    {item.currentQty} {item.product?.unit}
                                                </span>
                                            </td>
                                            <td style={ss.td}>{item.product?.minStock}</td>
                                            <td style={ss.td}>{new Date(item.lastUpdated).toLocaleDateString('vi-VN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'transactions' && (
                            <table style={ss.table}>
                                <thead>
                                    <tr>
                                        <th style={ss.th}>Số CT</th>
                                        <th style={ss.th}>Ngày</th>
                                        <th style={ss.th}>Loại</th>
                                        <th style={ss.th}>Từ Kho / To Kho</th>
                                        <th style={ss.th}>Sản Phẩm</th>
                                        <th style={ss.th}>Số Lượng</th>
                                        <th style={ss.th}>Giá Trị</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((trx, idx) => (
                                        <tr key={idx}>
                                            <td style={ss.td}>{trx.transactionNo}</td>
                                            <td style={ss.td}>{new Date(trx.transactionDate).toLocaleDateString('vi-VN')}</td>
                                            <td style={ss.td}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                                                    background: trx.type === 'IMPORT' ? '#dcfce7' : trx.type === 'TRANSFER' ? '#e0f2fe' : '#fee2e2',
                                                    color: trx.type === 'IMPORT' ? THEME.success : trx.type === 'TRANSFER' ? THEME.accent : THEME.danger
                                                }}>
                                                    {trx.type}
                                                </span>
                                            </td>
                                            <td style={ss.td}>
                                                {trx.type === 'TRANSFER'
                                                    ? `${trx.fromWarehouseId ? 'Source' : ''} -> ${trx.toWarehouseId ? 'Dest' : ''}` // Ideally resolve names. For now simplified as we might not have populated joined names in getAll
                                                    : trx.warehouse?.name
                                                }
                                            </td>
                                            <td style={ss.td}>{trx.product?.name}</td>
                                            <td style={ss.td}>
                                                {trx.type === 'IMPORT' || (trx.type === 'TRANSFER' && trx.toWarehouseId) ? '+' : '-'}{trx.quantity}
                                            </td>
                                            <td style={ss.td}>{formatMoney(trx.totalAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'warehouses' && (
                            <div>
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button style={ss.btn('primary')} onClick={() => { setEditingWarehouse(null); setModalMode('WAREHOUSE'); }}>
                                        <Plus size={16} /> Thêm Kho Mới
                                    </button>
                                </div>
                                <table style={ss.table}>
                                    <thead>
                                        <tr>
                                            <th style={ss.th}>Mã Kho</th>
                                            <th style={ss.th}>Tên Kho</th>
                                            <th style={ss.th}>Loại</th>
                                            <th style={ss.th}>Địa Chỉ</th>
                                            <th style={ss.th}>Quản Lý</th>
                                            <th style={ss.th}>Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warehouses.map(w => (
                                            <tr key={w.id}>
                                                <td style={ss.td}>{w.code}</td>
                                                <td style={ss.td} style={{ fontWeight: '600' }}>{w.name}</td>
                                                <td style={ss.td}>{w.type}</td>
                                                <td style={ss.td}>{w.address}</td>
                                                <td style={ss.td}>{w.managerName || '--'}</td>
                                                <td style={ss.td}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => { setEditingWarehouse(w); setModalMode('WAREHOUSE'); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: THEME.accent }}><FileText size={16} /></button>
                                                        <button onClick={() => handleDeleteWarehouse(w.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: THEME.danger }}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {['IMPORT', 'EXPORT', 'TRANSFER'].includes(modalMode) && (
                <TransactionModal
                    mode={modalMode}
                    products={products}
                    warehouses={warehouses}
                    onClose={() => setModalMode(null)}
                    onSubmit={handleTransactionSubmit}
                />
            )}

            {modalMode === 'WAREHOUSE' && (
                <WarehouseModal
                    initialData={editingWarehouse}
                    onClose={() => setModalMode(null)}
                    onSave={handleSaveWarehouse}
                />
            )}
        </div>
    );
};

// --- SUB COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${THEME.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <div style={{ fontSize: '12px', color: THEME.textLight, fontWeight: '600', textTransform: 'uppercase' }}>{title}</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: THEME.primary, marginTop: '4px' }}>{value}</div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={22} />
        </div>
    </div>
);

// Unified Transaction Modal (Import / Export / Transfer)
const TransactionModal = ({ mode, products, warehouses, onClose, onSubmit }) => {
    // Mode: "IMPORT", "EXPORT", "TRANSFER"
    const isTransfer = mode === 'TRANSFER';
    const isImport = mode === 'IMPORT';
    const title = isImport ? 'PHIẾU NHẬP KHO' : isTransfer ? 'PHIẾU CHUYỂN KHO' : 'PHIẾU XUẤT KHO';
    const color = isImport ? THEME.success : isTransfer ? THEME.accent : THEME.danger;

    const [header, setHeader] = useState({
        warehouseId: '',
        toWarehouseId: '',
        supplier: '', // Import only
        reason: '', // Export only
        referenceNo: '',
        notes: '',
        date: new Date().toISOString().slice(0, 10)
    });
    const [items, setItems] = useState([
        { productId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '', unit: '', vat: 0 }
    ]);

    const addItem = () => setItems([...items, { productId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '', unit: '', vat: 0 }]);
    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const updateItem = (idx, field, val) => {
        const newItems = [...items];
        newItems[idx][field] = val;
        if (field === 'productId') {
            const p = products.find(prod => prod.id === val);
            if (p) {
                newItems[idx].unitPrice = p.costPrice || 0;
                newItems[idx].unit = p.unit || '';
                newItems[idx].vat = p.vat || 0;
            }
        }
        setItems(newItems);
    };

    const calcTotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 + (item.vat || 0) / 100)), 0);

    const handleSubmit = () => {
        if (!header.warehouseId) return alert(isTransfer ? 'Nhập kho nguồn' : 'Nhập kho');
        if (isTransfer && !header.toWarehouseId) return alert('Nhập kho đích');
        if (isTransfer && header.warehouseId === header.toWarehouseId) return alert('Kho nguồn và đích phải khác nhau');

        const validItems = items.filter(i => i.productId && i.quantity > 0);
        if (validItems.length === 0) return alert('Chưa nhập sản phẩm nào');

        onSubmit({
            type: mode,
            ...header,
            items: validItems
        });
    };

    const ss = {
        overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 },
        modal: { background: 'white', width: '95vw', height: '90vh', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        header: { padding: '20px', background: '#f8fafc', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        body: { padding: '30px', overflowY: 'auto', flex: 1, background: 'white' },
        footer: { padding: '20px', background: '#f8fafc', borderTop: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' },

        input: { padding: '8px', borderRadius: '4px', border: `1px solid ${THEME.border}`, width: '100%', fontSize: '13px', outline: 'none' },
        gridHeader: { display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 80px 100px 120px 80px 100px 60px 100px 40px', gap: '8px', padding: '10px', background: '#e2e8f0', fontWeight: '700', fontSize: '12px', borderRadius: '4px' },
        gridRow: { display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 80px 100px 120px 80px 100px 60px 100px 40px', gap: '8px', padding: '10px 10px', borderBottom: `1px solid ${THEME.border}`, alignItems: 'center' },
    };

    return (
        <div style={ss.overlay}>
            <div style={ss.modal}>
                <div style={ss.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isTransfer ? <Truck size={24} color={color} /> : isImport ? <ArrowDownRight size={24} color={color} /> : <ArrowUpRight size={24} color={color} />}
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</div>
                            <div style={{ fontSize: '12px', color: THEME.textLight }}>{new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none' }}><X /></button>
                </div>

                <div style={ss.body}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: THEME.primary }}>THÔNG TIN GIAO DỊCH</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600' }}>{isTransfer ? 'Từ Kho (Source)' : 'Tại Kho'}</label>
                                    <select style={ss.input} value={header.warehouseId} onChange={e => setHeader({ ...header, warehouseId: e.target.value })}>
                                        <option value="">-- Chọn Kho --</option>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                                {isTransfer && (
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600' }}>Đến Kho (Destination)</label>
                                        <select style={ss.input} value={header.toWarehouseId} onChange={e => setHeader({ ...header, toWarehouseId: e.target.value })}>
                                            <option value="">-- Chọn Kho --</option>
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Ngày Giao Dịch</label>
                                    <input type="date" style={ss.input} value={header.date} onChange={e => setHeader({ ...header, date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: THEME.primary }}>THÔNG TIN CHUNG</div>
                            {isImport && <input style={{ ...ss.input, marginBottom: '8px' }} placeholder="Nhà cung cấp..." value={header.supplier} onChange={e => setHeader({ ...header, supplier: e.target.value })} />}
                            {!isImport && <input style={{ ...ss.input, marginBottom: '8px' }} placeholder={isTransfer ? "Lý do chuyển..." : "Lý do xuất (Hư hỏng, Nội bộ...)"} value={header.reason} onChange={e => setHeader({ ...header, reason: e.target.value })} />}
                            <textarea style={{ ...ss.input, height: '60px' }} placeholder="Ghi chú thêm..." value={header.notes} onChange={e => setHeader({ ...header, notes: e.target.value })} />
                        </div>
                    </div>

                    <div style={ss.gridHeader}>
                        <span>Sản phẩm</span>
                        <span>ĐVT</span>
                        <span>Batch No</span>
                        <span>Hạn Dùng</span>
                        <span style={{ textAlign: 'right' }}>Số lượng</span>
                        <span style={{ textAlign: 'right' }}>Đơn Giá</span>
                        <span style={{ textAlign: 'right' }}>VAT%</span>
                        <span style={{ textAlign: 'right' }}>Thành Tiền</span>
                        <span></span>
                    </div>
                    {items.map((item, idx) => (
                        <div key={idx} style={ss.gridRow}>
                            <select style={ss.input} value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                                <option value="">-- Sản phẩm --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <span style={{ fontSize: '12px' }}>{item.unit}</span>
                            <input style={ss.input} placeholder="Batch" value={item.batchNumber} onChange={e => updateItem(idx, 'batchNumber', e.target.value)} />
                            <input type="date" style={ss.input} value={item.expiryDate} onChange={e => updateItem(idx, 'expiryDate', e.target.value)} />
                            <input type="number" style={{ ...ss.input, textAlign: 'right' }} value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                            <input type="number" style={{ ...ss.input, textAlign: 'right' }} value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
                            <input type="number" style={{ ...ss.input, textAlign: 'right' }} value={item.vat} onChange={e => updateItem(idx, 'vat', e.target.value)} />
                            <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(item.quantity * item.unitPrice * (1 + (item.vat || 0) / 100))}</span>
                            <button onClick={() => removeItem(idx)} style={{ color: THEME.danger, border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    ))}
                    <button onClick={addItem} style={{ marginTop: '12px', width: '100%', padding: '10px', border: `1px dashed ${color}`, color: color, background: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Thêm dòng</button>

                    <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                        Tổng cộng: <span style={{ color: color }}>{formatMoney(calcTotal())}</span>
                    </div>
                </div>

                <div style={ss.footer}>
                    <button onClick={onClose} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                    <button onClick={handleSubmit} style={{ padding: '10px 20px', background: color, color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Complete Transaction</button>
                </div>
            </div>
        </div>
    );
};

const WarehouseModal = ({ initialData, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        code: '', name: '', address: '', type: 'BRANCH',
        ...initialData
    });

    const handleSubmit = () => {
        if (!formData.code || !formData.name) return alert('Nhập đủ thông tin!');
        onSave(formData);
    };

    const ss = {
        overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 },
        modal: { background: 'white', width: '500px', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
        inputGroup: { marginBottom: '16px' },
        label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: THEME.text },
        input: { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}`, outline: 'none' }
    };

    return (
        <div style={ss.overlay}>
            <div style={ss.modal}>
                <h2 style={{ marginTop: 0 }}>{initialData ? 'Cập nhật Kho' : 'Thêm Kho Mới'}</h2>

                <div style={ss.inputGroup}>
                    <label style={ss.label}>Mã Kho</label>
                    <input style={ss.input} value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} disabled={!!initialData} />
                </div>
                <div style={ss.inputGroup}>
                    <label style={ss.label}>Tên Kho</label>
                    <input style={ss.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div style={ss.inputGroup}>
                    <label style={ss.label}>Loại Kho</label>
                    <select style={ss.input} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                        <option value="BRANCH">Chi nhánh (Branch)</option>
                        <option value="CENTRAL">Tổng (Central)</option>
                        <option value="VAN">Xe (Mobile Van)</option>
                    </select>
                </div>
                <div style={ss.inputGroup}>
                    <label style={ss.label}>Địa chỉ</label>
                    <input style={ss.input} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', fontWeight: '600', cursor: 'pointer' }}>Hủy</button>
                    <button onClick={handleSubmit} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: THEME.primary, color: 'white', fontWeight: '600', cursor: 'pointer' }}>Lưu</button>
                </div>
            </div>
        </div>
    );
};

export default AdminInventory;
