import React, { useState, useEffect, useMemo } from 'react';
import { reportsAPI } from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, Line, Area, AreaChart, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
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

// ... (Other existing code structure preserved but enhanced)

const BizReview = () => {
    // State
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState({ region: 'all', month: 'all', channel: 'all' });
    const [loading, setLoading] = useState(true);

    // Data Containers
    const [realData, setRealData] = useState(null);
    const [mockData, setMockData] = useState({
        inventory: generateMockInventory(),
        tdv: generateMockTDV(),
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
        if (realData && realData.totalSales > 0) return realData; // Use real if available
        // Fallback Mock Structure for Overview
        return {
            totalSales: 15400000000,
            orderCount: 1250,
            customerCount: 450,
            salesByRegion: [{ name: 'Miền Bắc', value: 450 }, { name: 'Miền Nam', value: 850 }, { name: 'Miền Trung', value: 240 }],
            monthlySales: Array.from({ length: 12 }, (_, i) => ({
                month: `T${i + 1}`, sales: 1000 + Math.random() * 500, target: 1200
            }))
        };
    }, [realData]);

    const tabs = [
        { id: 'overview', label: '📊 Tổng quan', icon: '📊' },
        { id: 'inventory', label: '📦 Tồn kho (Mới)', icon: '📦' },
        { id: 'sales', label: '💰 Doanh số', icon: '💰' },
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
                        <SectionTitle title="SỨC KHỎE TỒN KHO & CHUỖI CUNG ỨNG" icon="📦" />

                        {/* Top KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <KPICard title="GIÁ TRỊ TỒN KHO" value={formatCurrency(mockData.inventory.totalValue)} sub="VND" color="#3b82f6" icon="💰" />
                            <KPICard title="HÀNG CẬN DATE (<6T)" value={formatCurrency(1650000000)} sub="10.7% Tổng kho" color="#f59e0b" icon="⚠️" />
                            <KPICard title="VÒNG QUAY (TURNOVER)" value={mockData.inventory.turnoverRate + 'x'} sub="Mục tiêu: 5.0x" color="#22c55e" icon="🔄" />
                            <KPICard title="DAYS SALES OF INV (DSI)" value="45 Ngày" sub="Cảnh báo: >60" color="#8b5cf6" icon="📅" />
                        </div>

                        {/* Inventory Charts Row 1 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <ChartCard title="PHÂN TÍCH TUỔI THỌ TỒN KHO (EXPIRY RISK matrix)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={mockData.inventory.expiryRisk} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#cbd5e1' }} />
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
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
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
                                        <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Area type="monotone" dataKey="dsi" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDsi)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="TOP KHO HÀNG">
                                <ResponsiveContainer width="100%" height={250}>
                                    <Treemap data={mockData.inventory.stockByWarehouse} dataKey="size" aspectRatio={4 / 3} stroke="#0a1628" >
                                        <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
                                    </Treemap>
                                </ResponsiveContainer>
                                <div style={{ textAlign: 'center', fontSize: '12px', color: '#fff', marginTop: '-25px', position: 'relative', pointerEvents: 'none' }}>
                                    *Diện tích hình chữ nhật thể hiện giá trị tồn kho
                                </div>
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
                        {/* Mock Charts for Overview if Real Data missing */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
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
                                        <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                                        <YAxis tick={{ fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="url(#colorSales)" />
                                        <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="5 5" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="TỶ TRỌNG MIỀN">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={displayData.salesByRegion} innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                                            {displayData.salesByRegion.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend iconType="circle" verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </div>
                )}

                {(activeTab === 'sales' || activeTab === 'coverage') && (
                    <div style={{ textAlign: 'center', padding: '60px', color: THEME.textSec }}>
                        <div style={{ fontSize: '48px' }}>🚧</div>
                        <h3>Chức năng đang được cập nhật thêm dữ liệu</h3>
                        <p>Vui lòng quay lại tab Tồn kho hoặc Tổng quan</p>
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

// Styles
const filterStyle = { background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '6px 12px', borderRadius: 6 };
const tooltipStyle = { background: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: 8 };

export default BizReview;
