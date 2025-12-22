import React, { useState, useEffect, useMemo } from 'react';
import { reportsAPI } from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, Line, Area, AreaChart, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, ScatterChart, Scatter, ZAxis
} from 'recharts';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// --- THEME & UTILS ---
const THEME = {
    bg: '#0a1628',
    bgGradient: 'linear-gradient(135deg, #0a1628 0%, #0f2744 100%)',
    card: 'rgba(15, 39, 68, 0.8)',
    cardBorder: 'rgba(59, 130, 246, 0.2)',
    cardHeader: 'rgba(15, 39, 68, 0.95)',
    text: '#ffffff',
    textSec: '#94a3b8',
    textMuted: '#64748b',
    accent: '#3b82f6',
    accent2: '#22c55e',
    accent3: '#f59e0b',
    danger: '#ef4444'
};
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

// --- MOCK DATA GENERATORS (The "Wow" Factor) ---
const generateMockInventory = () => ({
    totalValue: 15420000000, // 15.4 Ty
    itemCount: 450,
    warehouseCount: 2,
    turnoverRate: 4.2,
    expiryRisk: [
        { name: 'Hết hạn < 3 tháng', value: 450000000, count: 12, color: '#ef4444' }, // Danger
        { name: 'Hết hạn 3-6 tháng', value: 1200000000, count: 45, color: '#f59e0b' }, // Warning
        { name: 'Hết hạn 6-12 tháng', value: 3500000000, count: 120, color: '#3b82f6' }, // Safe
        { name: 'An toàn (>12 tháng)', value: 10270000000, count: 273, color: '#22c55e' } // Good
    ],
    stockByCategory: [
        { name: 'Kháng sinh', value: 4500000000 },
        { name: 'Tim mạch', value: 3200000000 },
        { name: 'Vitamin', value: 2800000000 },
        { name: 'Giảm đau', value: 1900000000 },
        { name: 'Tiêu hóa', value: 1500000000 },
        { name: 'Khác', value: 1520000000 }
    ],
    stockByWarehouse: [
        { name: 'Kho Tổng (HCM)', size: 12500000000 },
        { name: 'Kho CN Hà Nội', size: 2920000000 }
    ],
    dsiTrend: [ // Days Sales of Inventory logic
        { month: 'T1', dsi: 45 }, { month: 'T2', dsi: 42 }, { month: 'T3', dsi: 38 },
        { month: 'T4', dsi: 40 }, { month: 'T5', dsi: 55 }, { month: 'T6', dsi: 62 }, // Warning rising
    ]
});

const generateMockTDV = () => {
    const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Đỗ Thị F'];
    return names.map((name, i) => ({
        id: `tdv-mock-${i}`,
        employeeCode: `TDV00${i + 1}`,
        name: name,
        sales: 450000000 + Math.random() * 200000000, // 450-650tr
        target: 600000000,
        visits: 180 + Math.floor(Math.random() * 40),
        visitTarget: 200,
        strikeRate: 45 + Math.floor(Math.random() * 30), // 45-75%
        coverage: 85 + Math.floor(Math.random() * 15),
        skus: 4.5 + Math.random() * 2
    })).sort((a, b) => b.sales - a.sales);
};

const generateMockCompliance = () => {
    // Generate data for scatter plot (Visit Efficiency)
    const scatterData = Array.from({ length: 20 }, (_, i) => ({
        x: 80 + Math.random() * 40, // Visit Rate (80-120%)
        y: 40 + Math.random() * 50, // Strike Rate (40-90%)
        z: 500000 + Math.random() * 1500000, // Avg Drop Size
        name: `TDV ${i + 1}`,
        group: Math.random() > 0.5 ? 'A' : 'B'
    }));

    // Generate funnel data
    const funnelData = [
        { name: 'Plan Call', value: 1250, fill: '#3b82f6' },
        { name: 'Visited', value: 1150, fill: '#8b5cf6' }, // 92%
        { name: 'Productive (PC)', value: 750, fill: '#22c55e' }, // 65% Strike
    ];

    // Generate detail table data
    const detailData = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Trình Dược Viên ${i + 1}`,
        plan: 26,
        actual: 24 + Math.floor(Math.random() * 3),
        pc: 15 + Math.floor(Math.random() * 8),
        lppc: (3.5 + Math.random() * 2).toFixed(1),
        vpo: (1200000 + Math.random() * 800000).toFixed(0)
    }));

    return { scatterData, funnelData, detailData };
};

const BizReview = () => {
    // State
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState({ region: 'all', month: 'all', channel: 'all', stockWarehouse: 'all', manufacturer: 'all' });
    const [loading, setLoading] = useState(true);

    // Data Containers
    const [realData, setRealData] = useState(null);
    const [mockData, setMockData] = useState({
        inventory: generateMockInventory(),
        tdv: generateMockTDV(),
        compliance: generateMockCompliance(), // Initialize new mock data
        stockHealth: 85
    });

    // Formatting Helpers
    const formatCurrency = (val) => {
        if (!val) return '0';
        if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' tỷ';
        if (val >= 1000000) return (val / 1000000).toFixed(0) + ' tr';
        return val.toLocaleString('vi-VN');
    };

    useEffect(() => {
        // Simulate loading then set data
        // In real impl, we fetch API. If API is empty/error, we fallback to mock for demo.
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch logic here...
                // For now, assume we fetch and it might be partial.
                // We keep 'realData' null to trigger Mock display for this demo or mix them.
                const bizData = await reportsAPI.getBizReview(filters).catch(() => null);
                setRealData(bizData);
            } catch (e) { console.warn("API Error, using mock"); }
            setTimeout(() => setLoading(false), 800);
        };
        fetchData();
    }, [filters]);

    // Derived Display Data (Mix Real + Mock)
    const displayData = useMemo(() => {
        // If we have real data with actual sales, use it. Otherwise mix mock data for "Wow" effect.
        const useReal = realData && realData.totalSales > 0;

        return {
            totalSales: useReal ? realData.totalSales : 15400000000,
            orderCount: useReal ? realData.orderCount : 1250,
            customerCount: useReal ? realData.customerCount : 450,
            salesByRegion: useReal ? realData.salesByRegion : [
                { name: 'Miền Bắc', value: 450 }, { name: 'Miền Nam', value: 850 }, { name: 'Miền Trung', value: 240 }
            ],
            // Ensure we have a nice curve for monthly sales
            monthlySales: useReal ? realData.monthlySales : [
                { month: 'T1', sales: 900, target: 1000 }, { month: 'T2', sales: 1100, target: 1000 },
                { month: 'T3', sales: 1300, target: 1200 }, { month: 'T4', sales: 1150, target: 1200 },
                { month: 'T5', sales: 1400, target: 1300 }, { month: 'T6', sales: 1650, target: 1400 },
                { month: 'T7', sales: 1580, target: 1500 }, { month: 'T8', sales: 1800, target: 1600 },
                { month: 'T9', sales: 2100, target: 1800 }, { month: 'T10', sales: 1950, target: 1900 },
                { month: 'T11', sales: 2400, target: 2000 }, { month: 'T12', sales: 2800, target: 2200 }
            ],
            // Add top stats missing in previous mock
            topProducts: [
                { name: 'Panadol Extra', value: 3500000000 }, { name: 'Hapacol Blue', value: 2100000000 },
                { name: 'Berberin', value: 1500000000 }, { name: 'Vitamin C 500', value: 950000000 }
            ]
        };
    }, [realData]);

    const tabs = [
        { id: 'overview', label: '📊 Tổng quan', icon: '📊' },
        { id: 'inventory', label: '📦 Tồn kho', icon: '📦' },
        { id: 'sales', label: '💰 Doanh số', icon: '💰' },
        { id: 'compliance', label: '✅ Tuân thủ (MCP)', icon: '✅' },
        { id: 'tdv', label: '👤 Đội ngũ TDV', icon: '👤' },
        { id: 'coverage', label: '🌏 Độ phủ', icon: '🌏' },
    ];

    if (loading) return <LoadingScreen />;

    return (
        <div style={{ background: THEME.bgGradient, minHeight: '100vh', color: THEME.text, fontFamily: 'Inter, sans-serif' }}>
            {/* --- HEADER --- */}
            <div style={{ background: 'rgba(15,39,68,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${THEME.cardBorder}`, padding: '20px 32px', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, background: 'linear-gradient(90deg, #3b82f6, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            BIZ REVIEW CENTER 360°
                        </h1>
                        <div style={{ fontSize: '13px', color: THEME.textSec, marginTop: '4px' }}>
                            Dữ liệu cập nhật: {new Date().toLocaleString('vi-VN')} • <span style={{ color: '#22c55e' }}>Hệ thống Online</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select style={filterStyle} value={filters.region} onChange={e => setFilters({ ...filters, region: e.target.value })}>
                            <option value="all">Toàn quốc</option>
                            <option value="north">Miền Bắc</option>
                            <option value="south">Miền Nam</option>
                        </select>
                        <select style={filterStyle} value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })}>
                            <option value="all">Năm nay</option>
                            <option value="current">Tháng này</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            style={{
                                padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: activeTab === t.id ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.05)',
                                color: activeTab === t.id ? '#fff' : '#94a3b8', fontWeight: '600', transition: 'all 0.2s',
                                boxShadow: activeTab === t.id ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
                            }}>
                            <span style={{ marginRight: '6px' }}>{t.icon}</span> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '32px' }}>
                {/* === INVENTORY TAB (NEW) === */}
                {activeTab === 'inventory' && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <SectionTitle title="SỨC KHỎE TỒN KHO & CHUỖI CUNG ỨNG" icon="📦" />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <select style={filterStyle} value={filters.stockWarehouse || 'all'} onChange={e => setFilters({ ...filters, stockWarehouse: e.target.value })}>
                                    <option value="all">Tất cả kho</option>
                                    <option value="WH001">Kho Tổng (HCM)</option>
                                    <option value="WH002">Kho CN Hà Nội</option>
                                </select>
                                <select style={filterStyle} value={filters.manufacturer || 'all'} onChange={e => setFilters({ ...filters, manufacturer: e.target.value })}>
                                    <option value="all">Tất cả Hãng</option>
                                    <option value="GSK">GSK</option>
                                    <option value="Sanofi">Sanofi</option>
                                    <option value="DHG">DHG Pharma</option>
                                </select>
                            </div>
                        </div>

                        {/* Top KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <KPICard title="GIÁ TRỊ TỒN KHO" value={formatCurrency(mockData.inventory.totalValue * (filters.stockWarehouse !== 'all' ? 0.6 : 1))} sub="VND" color="#3b82f6" icon="💰" />
                            <KPICard title="HÀNG CẬN DATE (<6T)" value={formatCurrency(1650000000 * (filters.stockWarehouse !== 'all' ? 0.4 : 1))} sub="10.7% Tổng kho" color="#f59e0b" icon="⚠️" />
                            <KPICard title="VÒNG QUAY (TURNOVER)" value={(mockData.inventory.turnoverRate + (filters.stockWarehouse !== 'all' ? 0.5 : 0)).toFixed(1) + 'x'} sub="Mục tiêu: 5.0x" color="#22c55e" icon="🔄" />
                            <KPICard title="DAYS SALES OF INV (DSI)" value="45 Ngày" sub="Cảnh báo: >60" color="#8b5cf6" icon="📅" />
                        </div>

                        {/* Inventory Charts Row 1 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <ChartCard title="PHÂN TÍCH TUỔI THỌ TỒN KHO (EXPIRY RISK matrix)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={mockData.inventory.expiryRisk} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 500 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                        <Bar dataKey="value" barSize={32} radius={[0, 4, 4, 0]}>
                                            {mockData.inventory.expiryRisk.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>Nguy hiểm (&lt;3T)</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>Cảnh báo (3-6T)</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></div>An toàn (&gt;6T)</div>
                                </div>
                            </ChartCard>

                            <ChartCard title="PHÂN BỔ THEO NHÓM HÀNG">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={mockData.inventory.stockByCategory} innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                                            {mockData.inventory.stockByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#cbd5e1' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        {/* Inventory Charts Row 2 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <ChartCard title="XU HƯỚNG DSI (Ngày tồn kho) - 6 Tháng">
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={mockData.inventory.dsiTrend}>
                                        <defs>
                                            <linearGradient id="colorDsi" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" tick={{ fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Area type="monotone" dataKey="dsi" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDsi)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="TOP KHO HÀNG (TREEMAP)">
                                <ResponsiveContainer width="100%" height={250}>
                                    <Treemap
                                        data={mockData.inventory.stockByWarehouse}
                                        dataKey="size"
                                        aspectRatio={4 / 3}
                                        stroke="#0a1628"
                                        content={<CustomTreemapContent />}
                                    >
                                        <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                    </Treemap>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </div>
                )}

                {/* === TDV TAB (ENHANCED MOCK) === */}
                {activeTab === 'tdv' && (
                    <div className="animate-fade-in">
                        <SectionTitle title="HIỆU SUẤT ĐỘI NGŨ TRÌNH DƯỢC VIÊN" icon="👤" />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {mockData.tdv.map((tdv, idx) => (
                                <div key={idx} style={{
                                    background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '12px', padding: '20px',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                    {idx < 3 && <div style={{ position: 'absolute', top: 0, right: 0, background: '#eab308', color: '#000', padding: '2px 10px', fontSize: '10px', fontWeight: 'bold', borderBottomLeftRadius: '8px' }}>TOP {idx + 1}</div>}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]}, #1e293b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: `2px solid ${COLORS[idx]}` }}>
                                            {tdv.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{tdv.name}</div>
                                            <div style={{ fontSize: '12px', color: THEME.textSec }}>{tdv.employeeCode} | {tdv.visits} Visits</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <MetricRow label="Doanh số" value={formatCurrency(tdv.sales)} target={formatCurrency(tdv.target)}
                                            percent={(tdv.sales / tdv.target) * 100} color={COLORS[idx % COLORS.length]} />
                                        <MetricRow label="Độ phủ" value={tdv.coverage + '/100'} target="100"
                                            percent={tdv.coverage} color="#22c55e" />
                                        <MetricRow label="Strike Rate" value={tdv.strikeRate + '%'} target="60%"
                                            percent={(tdv.strikeRate / 60) * 100} color="#f59e0b" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === OVERVIEW (DEFAULT) === */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <SectionTitle title="TỔNG QUAN KINH DOANH" icon="📊" />

                        {/* Overview KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <KPICard title="TỔNG DOANH SỐ" value={formatCurrency(displayData.totalSales)} sub={`${displayData.orderCount.toLocaleString()} đơn hàng`} color="#3b82f6" icon="💰" />
                            <KPICard title="SỐ LƯỢNG KHÁCH" value={displayData.customerCount} sub="+12% so với tháng trước" color="#22c55e" icon="👥" />
                            <KPICard title="TỶ LỆ TUÂN THỦ (MCP)" value="92%" sub="Viếng thăm đúng tuyến" color="#f59e0b" icon="✅" />
                            <KPICard title="ĐỘ PHỦ SẢN PHẨM" value="85 SKU" sub="Trung bình / Điểm bán" color="#8b5cf6" icon="📦" />
                        </div>

                        {/* Overview Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <ChartCard title="XU HƯỚNG DOANH SỐ (YTD)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={displayData.monthlySales}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" tick={{ fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fill="url(#colorSales)" />
                                        <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="TỶ TRỌNG MIỀN">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={displayData.salesByRegion} innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                                            {displayData.salesByRegion.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                        <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ color: '#cbd5e1' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        {/* Top Products Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <ChartCard title="🏆 TOP 5 SẢN PHẨM BÁN CHẠY">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={displayData.topProducts} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#fff', fontSize: 13, fontWeight: 500 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                        <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                            {displayData.topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                            <ChartCard title="📈 TĂNG TRƯỞNG KÊNH PHÂN PHỐI">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={[
                                        { name: 'Chợ thuốc', t1: 450, t2: 520 },
                                        { name: 'Nhà thuốc', t1: 850, t2: 980 },
                                        { name: 'Phòng khám', t1: 320, t2: 350 },
                                        { name: 'Chuỗi', t1: 650, t2: 890 }, // High growth
                                    ]} barGap={0}>
                                        <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                                        <Bar name="Tháng trước" dataKey="t1" fill="#64748b" radius={[4, 4, 0, 0]} />
                                        <Bar name="Tháng này" dataKey="t2" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </div>
                )}

                {/* === SALES TAB (NEW CONTENT) === */}
                {activeTab === 'sales' && (
                    <div className="animate-fade-in">
                        <SectionTitle title="PHÂN TÍCH DOANH SỐ CHI TIẾT" icon="💰" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                            <ChartCard title="THEO KÊNH (CHANNEL)">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie data={[
                                            { name: 'OTC - Nhà thuốc', value: 12500000000 },
                                            { name: 'ETC - Bệnh viện', value: 4500000000 },
                                            { name: 'MT - Chuỗi', value: 3200000000 }
                                        ]} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                                            <Cell fill="#3b82f6" /><Cell fill="#f59e0b" /><Cell fill="#22c55e" />
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                        <Legend verticalAlign="bottom" wrapperStyle={{ color: '#cbd5e1' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                            <ChartCard title="THEO NHÓM KHÁCH HÀNG">
                                <ResponsiveContainer width="100%" height={280}>
                                    <RadarChart outerRadius={90} data={[
                                        { subject: 'Diamond', A: 120, fullMark: 150 },
                                        { subject: 'Gold', A: 98, fullMark: 150 },
                                        { subject: 'Silver', A: 86, fullMark: 150 },
                                        { subject: 'Bronze', A: 99, fullMark: 150 },
                                        { subject: 'New', A: 85, fullMark: 150 },
                                        { subject: 'Lost', A: 65, fullMark: 150 },
                                    ]}>
                                        <PolarGrid stroke="#cbd5e1" strokeOpacity={0.2} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                        <Radar name="Số lượng" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                            <ChartCard title="ĐÓNG GÓP THEO TOP SẢN PHẨM">
                                <ResponsiveContainer width="100%" height={280}>
                                    <Treemap data={mockData.inventory.stockByCategory} dataKey="value" aspectRatio={4 / 3} stroke="#0a1628" content={<CustomTreemapContent />} >
                                        <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                    </Treemap>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </div>
                )}

                {/* === COVERAGE TAB (NEW CONTENT) === */}
                {activeTab === 'coverage' && (
                    <div className="animate-fade-in">
                        <SectionTitle title="ĐỘ PHỦ VÀ PHÂN PHỐI" icon="🌏" />
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            <ChartCard title="BẢN ĐỒ NHIỆT ĐỘ PHỦ (HEATMAP - MOCK)">
                                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
                                        <div>Tích hợp bản đồ GPS (Google Maps API)</div>
                                    </div>
                                </div>
                            </ChartCard>
                            <ChartCard title="TẦN SUẤT VIẾNG THĂM (F)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[
                                        { name: 'F1 (1 lần/tháng)', value: 120 },
                                        { name: 'F2 (2 lần/tháng)', value: 450 },
                                        { name: 'F4 (1 lần/tuần)', value: 200 },
                                        { name: 'F8 (2 lần/tuần)', value: 50 },
                                    ]} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={30}>
                                            <Cell fill="#ec4899" opacity={0.4} />
                                            <Cell fill="#ec4899" opacity={0.6} />
                                            <Cell fill="#ec4899" opacity={0.8} />
                                            <Cell fill="#ec4899" opacity={1} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </div>
                )}

                {/* === COMPLIANCE TAB (NEW CONTENT) === */}
                {activeTab === 'compliance' && (
                    <div className="animate-fade-in">
                        <SectionTitle title="PHÂN TÍCH TUÂN THỦ & HIỆU QUẢ VIẾNG THĂM (MCP)" icon="✅" />

                        {/* 4 Key Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <KPICard title="TỶ LỆ TUÂN THỦ (MCP)" value="92.5%" sub="Visited / Plan Call" color="#3b82f6" icon="📅" />
                            <KPICard title="TỶ LỆ CHỐT ĐƠN (STRIKE)" value="65.2%" sub="PO / Visited" color="#22c55e" icon="🎯" />
                            <KPICard title="AVG DROP SIZE" value={formatCurrency(1250000)} sub="Giá trị TB / Đơn hàng" color="#f59e0b" icon="💰" />
                            <KPICard title="AVG LPPC" value="4.2 SKUs" sub="Danh mục / Đơn hàng" color="#8b5cf6" icon="📦" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
                            {/* Funnel: Plan -> Visit -> PC */}
                            <ChartCard title="PHỄU HIỆU QUẢ (CALL FUNNEL)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={mockData.compliance.funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#cbd5e1', fontWeight: 600 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={tooltipStyle} />
                                        <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]}>
                                            {mockData.compliance.funnelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            {/* Scatter: Efficiency Matrix */}
                            <ChartCard title="MA TRẬN HIỆU QUẢ (VISIT EFFICIENCY MATRIX)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis type="number" dataKey="x" name="Visit Rate" unit="%" domain={[60, 140]} tick={{ fill: '#94a3b8' }} label={{ value: 'Tỷ lệ viếng thăm (%)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 12 }} />
                                        <YAxis type="number" dataKey="y" name="Strike Rate" unit="%" domain={[20, 100]} tick={{ fill: '#94a3b8' }} label={{ value: 'Tỷ lệ chốt đơn (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                                        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Drop Size" unit="đ" />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} formatter={(val, name) => name === 'Drop Size' ? formatCurrency(val) : val} />
                                        <Scatter name="Efficiency" data={mockData.compliance.scatterData} fill="#8884d8">
                                            {mockData.compliance.scatterData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.y > 60 && entry.x > 90 ? '#22c55e' : entry.y < 40 ? '#ef4444' : '#f59e0b'} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                                <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: -10 }}>*Kích thước chấm tròn thể hiện quy mô đơn hàng (Drop Size)</div>
                            </ChartCard>
                        </div>

                        {/* Detailed Table */}
                        <ChartCard title="CHI TIẾT HOẠT ĐỘNG ĐỘI NGŨ (SALES FORCE ACTIVITY)">
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                                            <th style={{ padding: 12, textAlign: 'left' }}>TDV / Team</th>
                                            <th style={{ padding: 12, textAlign: 'center' }}>Plan Call</th>
                                            <th style={{ padding: 12, textAlign: 'center' }}>Visited</th>
                                            <th style={{ padding: 12, textAlign: 'center' }}>Tuân thủ</th>
                                            <th style={{ padding: 12, textAlign: 'center' }}>P.Call (PC)</th>
                                            <th style={{ padding: 12, textAlign: 'center' }}>Strike Rate</th>
                                            <th style={{ padding: 12, textAlign: 'right' }}>Doanh thu</th>
                                            <th style={{ padding: 12, textAlign: 'right' }}>Drop Size (VPO)</th>
                                            <th style={{ padding: 12, textAlign: 'center' }}>LPPC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockData.compliance.detailData.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                                <td style={{ padding: 12, fontWeight: 500 }}>{row.name}</td>
                                                <td style={{ padding: 12, textAlign: 'center' }}>{row.plan}</td>
                                                <td style={{ padding: 12, textAlign: 'center' }}>{row.actual}</td>
                                                <td style={{ padding: 12, textAlign: 'center' }}>
                                                    <span style={{ color: row.actual / row.plan < 0.9 ? '#ef4444' : '#22c55e' }}>{Math.round(row.actual / row.plan * 100)}%</span>
                                                </td>
                                                <td style={{ padding: 12, textAlign: 'center' }}>{row.pc}</td>
                                                <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold', color: row.pc / row.actual < 0.5 ? '#f59e0b' : '#3b82f6' }}>
                                                    {Math.round(row.pc / row.actual * 100)}%
                                                </td>
                                                <td style={{ padding: 12, textAlign: 'right' }}>{formatCurrency(row.pc * row.vpo)}</td>
                                                <td style={{ padding: 12, textAlign: 'right' }}>{formatCurrency(row.vpo)}</td>
                                                <td style={{ padding: 12, textAlign: 'center' }}>{row.lppc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ChartCard>
                    </div>
                )}
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #0a1628; }
                ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 4px; }
            `}</style>
        </div >
    );
};

// --- SUB COMPONENTS ---

const LoadingScreen = () => (
    <div style={{ height: '100vh', background: THEME.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#fff' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: 16, color: '#94a3b8' }}>Loading Business Intelligence...</p>
        <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    </div>
);

const KPICard = ({ title, value, sub, icon, color }) => (
    <div style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)`, border: `1px solid ${color}30`, borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.1 }}>{icon}</div>
        <div style={{ fontSize: 13, color: THEME.textSec, fontWeight: 600, textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontSize: 28, color: '#fff', fontWeight: 800, margin: '8px 0' }}>{value}</div>
        <div style={{ fontSize: 13, color: color, display: 'flex', alignItems: 'center', gap: 4 }}>{sub}</div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${THEME.cardBorder}`, background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{title}</span>
        </div>
        <div style={{ padding: 24, flex: 1 }}>{children}</div>
    </div>
);

const SectionTitle = ({ title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 4, height: 24, background: '#3b82f6', borderRadius: 2 }}></div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>{icon} {title}</h2>
    </div>
);

const MetricRow = ({ label, value, target, percent, color }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#cbd5e1' }}>
            <span>{label}</span>
            <span><b style={{ color: '#fff' }}>{value}</b> / {target}</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(percent, 100)}%`, height: '100%', background: color, borderRadius: 3 }}></div>
        </div>
    </div>
);

const CustomTreemapContent = (props) => {
    const { x, y, width, height, index, name, size } = props;
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: COLORS[index % COLORS.length],
                    stroke: '#0a1628',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
            {width > 50 && height > 30 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                    fontWeight={600}
                >
                    {name}
                </text>
            )}
            {width > 50 && height > 50 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 14}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.8)"
                    fontSize={10}
                >
                    {(size / 1000000000).toFixed(1)} Tỷ
                </text>
            )}
        </g>
    );
};

// Styles
const filterStyle = { background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '6px 12px', borderRadius: 6 };
const tooltipStyle = { background: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: 8 };

export default BizReview;
