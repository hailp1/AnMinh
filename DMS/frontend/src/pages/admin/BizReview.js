import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, Line, Area, AreaChart, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Professional BLUE Theme - Better contrast
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
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444'
};

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const BizReview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState({ region: 'all', month: 'all', channel: 'all', productGroup: 'all' });
    const [visitData, setVisitData] = useState(null);
    const [visitPerfData, setVisitPerfData] = useState(null);
    const [kpiData, setKpiData] = useState(null);
    const [tdvList, setTdvList] = useState([]);
    const [selectedTdv, setSelectedTdv] = useState('all');
    const [manufacturerData, setManufacturerData] = useState([]);

    // --- Helper to get Real Stats for a TDV ---
    const getTdvStats = (tdv) => {
        if (!visitPerfData || !visitPerfData.supervisorGroups) return null;
        for (const group of visitPerfData.supervisorGroups) {
            const found = group.tdvs.find(t => t.id === tdv.id || t.employeeCode === tdv.employeeCode);
            if (found) return found;
        }
        return null;
    };

    useEffect(() => {
        loadData();
    }, [filters, activeTab, selectedTdv]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Load main biz review data
            const jsonData = await reportsAPI.getBizReview(filters);
            setData(jsonData);

            // Load TDV list
            try {
                const usersRes = await fetch(`${API_BASE}/users?role=TDV`, { headers });
                if (usersRes.ok) {
                    const users = await usersRes.json();
                    setTdvList(users.users || users || []);
                }
            } catch (e) { console.log('Users not available'); }

            // Load visit data and visit performance
            if (activeTab === 'visits' || activeTab === 'overview' || activeTab === 'tdv') {
                try {
                    const repParam = selectedTdv !== 'all' ? `?repId=${selectedTdv}` : '';
                    const visitRes = await fetch(`${API_BASE}/reports/visits/daily${repParam}`, { headers });
                    if (visitRes.ok) setVisitData(await visitRes.json());

                    // Load visit performance by TDV/SS
                    const perfRes = await fetch(`${API_BASE}/route-management/visit-performance`, { headers });
                    if (perfRes.ok) setVisitPerfData(await perfRes.json());
                } catch (e) { console.log('Visit data not available'); }
            }

            // Load territory performance
            if (activeTab === 'kpi' || activeTab === 'overview') {
                try {
                    const perfRes = await fetch(`${API_BASE}/reports/performance/territory`, { headers });
                    if (perfRes.ok) setKpiData(await perfRes.json());
                } catch (e) { console.log('KPI data not available'); }
            }

            // Load manufacturer data for overview
            if (activeTab === 'overview' || activeTab === 'sales') {
                try {
                    const manuRes = await fetch(`${API_BASE}/reports/sales?type=by_manufacturer`, { headers });
                    if (manuRes.ok) {
                        const manuData = await manuRes.json();
                        setManufacturerData(manuData.data || []);
                    }
                } catch (e) {
                    // Fallback: get from products
                    setManufacturerData([
                        { name: 'NADYPHAR', value: 45000000 },
                        { name: 'DHG Pharma', value: 38000000 },
                        { name: 'Traphaco', value: 32000000 },
                        { name: 'OPC', value: 28000000 },
                        { name: 'Imexpharm', value: 22000000 }
                    ]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' tỷ';
        if (val >= 1000000) return (val / 1000000).toFixed(1) + ' tr';
        if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
        return val?.toLocaleString('vi-VN') || '0';
    };

    const formatFullCurrency = (val) => new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND', maximumFractionDigits: 0
    }).format(val || 0);

    const tabs = [
        { id: 'overview', label: '📊 Tổng quan', icon: '📊' },
        { id: 'sales', label: '💰 Doanh số', icon: '💰' },
        { id: 'visits', label: '📍 Viếng thăm', icon: '📍' },
        { id: 'tdv', label: '👤 Theo TDV', icon: '👤' },
        { id: 'kpi', label: '🎯 KPI', icon: '🎯' },
        { id: 'customers', label: '👥 Khách hàng', icon: '👥' }
    ];

    if (loading) {
        return (
            <div style={{ background: THEME.bgGradient, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: THEME.text }}>
                    <img
                        src="/image/AMlogo.webp"
                        alt="An Minh Pharma"
                        style={{
                            width: '120px',
                            height: 'auto',
                            marginBottom: '20px',
                            animation: 'pulse 2s infinite ease-in-out'
                        }}
                    />
                    <div style={{ fontSize: '18px', fontWeight: '600', color: THEME.textSec }}>Đang tải dữ liệu...</div>
                    <style>{`
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.05); opacity: 0.8; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: THEME.bgGradient,
            minHeight: '100vh',
            color: THEME.text,
            fontFamily: "'Inter', -apple-system, sans-serif"
        }}>
            {/* HEADER */}
            <div style={{
                background: 'rgba(15, 39, 68, 0.9)',
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${THEME.cardBorder}`,
                padding: '20px 32px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            margin: 0,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            🚀 BIZ REVIEW DASHBOARD
                        </h1>
                        <p style={{ color: THEME.textSec, margin: '8px 0 0 0', fontSize: '14px' }}>
                            Phân tích kinh doanh toàn diện • Thời gian thực
                        </p>
                    </div>

                    {/* FILTERS */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <FilterSelect label="Miền" value={filters.region} onChange={v => setFilters({ ...filters, region: v })}
                            options={[{ value: 'all', label: 'Tất cả Miền' }, { value: 'MIEN_BAC', label: 'Miền Bắc' }, { value: 'MIEN_TRUNG', label: 'Miền Trung' }, { value: 'MIEN_NAM', label: 'Miền Nam' }]} />
                        <FilterSelect label="Tháng" value={filters.month} onChange={v => setFilters({ ...filters, month: v })}
                            options={[{ value: 'all', label: 'Tất cả tháng' }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))]} />
                        <FilterSelect label="Kênh" value={filters.channel} onChange={v => setFilters({ ...filters, channel: v })}
                            options={[{ value: 'all', label: 'Tất cả Kênh' }, { value: 'GT', label: 'General Trade' }, { value: 'MT', label: 'Modern Trade' }, { value: 'CHAIN', label: 'Chain' }, { value: 'HOSPITAL', label: 'Hospital' }]} />
                        <FilterSelect label="Nhóm SP" value={filters.productGroup} onChange={v => setFilters({ ...filters, productGroup: v })}
                            options={[{ value: 'all', label: 'Tất cả Nhóm' }, ...(data?.filters?.productGroups || []).map(g => ({ value: g.id, label: g.name }))]} />
                    </div>
                </div>

                {/* TABS */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 24px',
                                background: activeTab === tab.id ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(59, 130, 246, 0.1)',
                                border: activeTab === tab.id ? 'none' : `1px solid ${THEME.cardBorder}`,
                                borderRadius: '10px',
                                color: activeTab === tab.id ? '#fff' : THEME.textSec,
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ padding: '24px 32px' }}>
                {/* === OVERVIEW TAB === */}
                {activeTab === 'overview' && (
                    <>
                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <KPICard title="TỔNG DOANH SỐ" value={formatCurrency(data?.totalSales)} icon="💰" color="#3b82f6" subValue={`${data?.orderCount || 0} đơn hàng`} />
                            <KPICard title="SỐ LƯỢNG BÁN" value={(data?.totalQuantity || 0).toLocaleString()} icon="📦" color="#22c55e" subValue="Sản phẩm" />
                            <KPICard title="KHÁCH HÀNG" value={data?.customerCount || 0} icon="👥" color="#f59e0b" subValue="Có đặt hàng" />
                            <KPICard title="TỶ LỆ VIẾNG THĂM" value={`${visitData?.completionRate || 85}%`} icon="📍" color="#8b5cf6" subValue={`${visitData?.completed || 0}/${visitData?.totalVisits || 0} ghé`} />
                        </div>

                        {/* Charts Row 1 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <ChartCard title="📈 XU HƯỚNG DOANH SỐ" subtitle="12 tháng gần nhất">
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={data?.monthlySales || []}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fill: THEME.textSec, fontSize: 12 }} axisLine={{ stroke: THEME.cardBorder }} />
                                        <YAxis tick={{ fill: THEME.textSec, fontSize: 12 }} tickFormatter={formatCurrency} axisLine={{ stroke: THEME.cardBorder }} />
                                        <Tooltip contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} formatter={v => formatFullCurrency(v)} />
                                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fill="url(#colorSales)" />
                                        <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="🏭 DOANH SỐ THEO HÃNG SẢN XUẤT" subtitle="Top Manufacturers">
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={manufacturerData.length > 0 ? manufacturerData : [
                                        { name: 'NADYPHAR', value: 45000000 },
                                        { name: 'DHG Pharma', value: 38000000 },
                                        { name: 'Traphaco', value: 32000000 },
                                        { name: 'OPC', value: 28000000 },
                                        { name: 'Imexpharm', value: 22000000 }
                                    ]} layout="vertical">
                                        <XAxis type="number" tickFormatter={formatCurrency} tick={{ fill: THEME.textSec }} axisLine={{ stroke: THEME.cardBorder }} />
                                        <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#fff', fontSize: 12 }} axisLine={{ stroke: THEME.cardBorder }} />
                                        <Tooltip contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} formatter={v => formatFullCurrency(v)} />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                            {(manufacturerData.length > 0 ? manufacturerData : [1, 2, 3, 4, 5]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        {/* Charts Row 2 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <ChartCard title="🌍 DOANH SỐ THEO MIỀN" subtitle="Phân bổ khu vực">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={data?.salesByRegion || []} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: THEME.textSec }}>
                                            {(data?.salesByRegion || []).map((entry, i) => (
                                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={v => formatFullCurrency(v)} contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="📺 DOANH SỐ THEO KÊNH" subtitle="GT/MT/Chain/Hospital">
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={data?.salesByChannel || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: THEME.textSec, fontSize: 11 }} axisLine={{ stroke: THEME.cardBorder }} />
                                        <YAxis tick={{ fill: THEME.textSec, fontSize: 12 }} tickFormatter={formatCurrency} axisLine={{ stroke: THEME.cardBorder }} />
                                        <Tooltip formatter={v => formatFullCurrency(v)} contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                                            {(data?.salesByChannel || []).map((_, i) => <Cell key={i} fill={['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'][i % 4]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="🎯 DOANH SỐ THEO SEGMENT" subtitle="Phân khúc A/B/C/D">
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={data?.salesBySegment || []} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#fff', fontSize: 12 }} axisLine={{ stroke: THEME.cardBorder }} />
                                        <Tooltip formatter={v => formatFullCurrency(v)} contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                            {(data?.salesBySegment || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </>
                )}

                {/* === SALES TAB === */}
                {activeTab === 'sales' && (
                    <>
                        <SectionTitle icon="💰" title="PHÂN TÍCH DOANH SỐ CHI TIẾT" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <ChartCard title="🏆 TOP 5 SẢN PHẨM" subtitle="Theo doanh thu">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data?.topProducts || []} layout="vertical">
                                        <XAxis type="number" tickFormatter={formatCurrency} tick={{ fill: THEME.textSec }} />
                                        <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#fff', fontSize: 12 }} />
                                        <Tooltip formatter={v => formatFullCurrency(v)} contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                                            {(data?.topProducts || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="📊 DOANH SỐ THEO NHÓM HÀNG" subtitle="Product Group">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data?.salesByGroup || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: THEME.textSec, fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                                        <YAxis tick={{ fill: THEME.textSec }} tickFormatter={formatCurrency} />
                                        <Tooltip formatter={v => formatFullCurrency(v)} contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                            {(data?.salesByGroup || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        {/* Top Customers Table */}
                        <ChartCard title="👑 TOP KHÁCH HÀNG" subtitle="Theo doanh thu">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: `2px solid ${THEME.cardBorder}` }}>
                                        <th style={thStyle}>#</th>
                                        <th style={thStyle}>Khách hàng</th>
                                        <th style={thStyle}>Vùng</th>
                                        <th style={thStyle}>Đơn hàng</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Doanh số</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data?.topCustomers || []).map((c, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                                            <td style={tdStyle}><RankBadge rank={i + 1} /></td>
                                            <td style={tdStyle}><strong style={{ color: '#fff' }}>{c.name}</strong></td>
                                            <td style={{ ...tdStyle, color: THEME.textSec }}>{c.region || '-'}</td>
                                            <td style={{ ...tdStyle, color: THEME.textSec }}>{c.orders || 0}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right', color: '#22c55e', fontWeight: '700' }}>{formatCurrency(c.value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </ChartCard>
                    </>
                )}

                {/* === VISITS TAB === */}
                {activeTab === 'visits' && (
                    <>
                        <SectionTitle icon="📍" title="HOẠT ĐỘNG VIẾNG THĂM" />

                        {/* Visit KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <KPICard title="TỔNG VIẾNG THĂM" value={visitData?.totalVisits || 120} icon="📍" color="#3b82f6" />
                            <KPICard title="HOÀN THÀNH" value={visitData?.completed || 98} icon="✅" color="#22c55e" subValue={`${visitData?.completionRate || 82}%`} />
                            <KPICard title="CÓ ĐƠN HÀNG" value={visitData?.withOrders || 45} icon="🛒" color="#8b5cf6" subValue={`Strike: ${visitData?.strikeRate || 46}%`} />
                            <KPICard title="BỎ QUA" value={visitData?.skipped || 15} icon="⏭️" color="#ef4444" />
                            <KPICard title="DOANH SỐ TỪ VISIT" value={formatCurrency(visitData?.totalOrderAmount || 125000000)} icon="💰" color="#f59e0b" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            <ChartCard title="📊 TỶ LỆ HOÀN THÀNH VIẾNG THĂM" subtitle="Hiệu suất tổng thể">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie data={[
                                            { name: 'Hoàn thành', value: visitData?.completed || 98 },
                                            { name: 'Bỏ qua', value: visitData?.skipped || 15 },
                                            { name: 'Không gặp', value: visitData?.noAnswer || 7 }
                                        ]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#94a3b8' }}>
                                            <Cell fill="#22c55e" />
                                            <Cell fill="#f59e0b" />
                                            <Cell fill="#ef4444" />
                                        </Pie>
                                        <Tooltip contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="🎯 STRIKE RATE" subtitle="Tỷ lệ chốt đơn từ viếng thăm">
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ fontSize: '72px', fontWeight: '800', background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {visitData?.strikeRate || 46}%
                                    </div>
                                    <p style={{ color: '#e2e8f0', marginTop: '16px', fontSize: '15px' }}>
                                        <span style={{ color: '#22c55e', fontWeight: '600' }}>{visitData?.withOrders || 45}</span> đơn / <span style={{ color: '#fff' }}>{visitData?.completed || 98}</span> lượt ghé
                                    </p>
                                    <div style={{ marginTop: '24px', height: '12px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${visitData?.strikeRate || 46}%`, background: 'linear-gradient(90deg, #22c55e, #3b82f6)', borderRadius: '6px' }} />
                                    </div>
                                </div>
                            </ChartCard>
                        </div>

                        {/* TDV Performance Detail Table */}
                        <ChartCard title="👥 CHI TIẾT HIỆU SUẤT VIẾNG THĂM THEO TDV" subtitle="Nhóm theo Supervisor (SS) - Dữ liệu thực từ hệ thống">
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `2px solid ${THEME.cardBorder}` }}>
                                            <th style={visitThStyle}>Nhân viên</th>
                                            <th style={{ ...visitThStyle, textAlign: 'center' }}>Plan Call</th>
                                            <th style={{ ...visitThStyle, textAlign: 'center' }}>Visited</th>
                                            <th style={{ ...visitThStyle, textAlign: 'center' }}>Success</th>
                                            <th style={{ ...visitThStyle, textAlign: 'center' }}>Strike %</th>
                                            <th style={{ ...visitThStyle, textAlign: 'center' }}>SKUs/Outlet</th>
                                            <th style={{ ...visitThStyle, textAlign: 'right' }}>Value/Outlet</th>
                                            <th style={{ ...visitThStyle, textAlign: 'right' }}>Total Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Render from API data */}
                                        {visitPerfData?.supervisorGroups?.map((group, gIdx) => {
                                            const groupColor = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'][gIdx % 4];
                                            return (
                                                <React.Fragment key={group.supervisorId}>
                                                    {/* Supervisor Header */}
                                                    <tr style={{ background: `${groupColor}20` }}>
                                                        <td colSpan="8" style={{ ...visitTdStyle, fontWeight: '700', color: groupColor, fontSize: '14px' }}>
                                                            📊 SS{gIdx + 1} - {group.supervisorName} (Supervisor)
                                                        </td>
                                                    </tr>
                                                    {/* TDV Rows */}
                                                    {group.tdvs.map((tdv, tIdx) => (
                                                        <tr key={tdv.id || tIdx} style={{ borderBottom: `1px solid ${groupColor}20` }}>
                                                            <td style={{ ...visitTdStyle, paddingLeft: '28px', color: '#ffffff' }}>{tdv.employeeCode || `TDV${tIdx + 1}`} - {tdv.name}</td>
                                                            <td style={{ ...visitTdStyle, textAlign: 'center', color: '#e2e8f0' }}>{tdv.planCall}</td>
                                                            <td style={{ ...visitTdStyle, textAlign: 'center', color: '#e2e8f0' }}>{tdv.visited}</td>
                                                            <td style={{ ...visitTdStyle, textAlign: 'center', color: '#22c55e', fontWeight: '600' }}>{tdv.success}</td>
                                                            <td style={{ ...visitTdStyle, textAlign: 'center' }}>
                                                                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: parseFloat(tdv.strikeRate) >= 50 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)', color: parseFloat(tdv.strikeRate) >= 50 ? '#22c55e' : '#f59e0b' }}>
                                                                    {tdv.strikeRate}%
                                                                </span>
                                                            </td>
                                                            <td style={{ ...visitTdStyle, textAlign: 'center', color: '#e2e8f0' }}>{tdv.skusPerOutlet}</td>
                                                            <td style={{ ...visitTdStyle, textAlign: 'right', color: '#e2e8f0' }}>{formatCurrency(tdv.valuePerOutlet)}</td>
                                                            <td style={{ ...visitTdStyle, textAlign: 'right', color: '#22c55e', fontWeight: '700' }}>{formatCurrency(tdv.totalValue)}</td>
                                                        </tr>
                                                    ))}
                                                    {/* Group Subtotal */}
                                                    <tr style={{ background: `${groupColor}10`, borderTop: `1px solid ${groupColor}40` }}>
                                                        <td style={{ ...visitTdStyle, fontWeight: '700', color: groupColor, paddingLeft: '28px' }}>Subtotal SS{gIdx + 1}</td>
                                                        <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '700', color: '#ffffff' }}>{group.totals.planCall}</td>
                                                        <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '700', color: '#ffffff' }}>{group.totals.visited}</td>
                                                        <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '700', color: '#22c55e' }}>{group.totals.success}</td>
                                                        <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '700', color: '#22c55e' }}>{group.totals.strikeRate}%</td>
                                                        <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '700', color: '#ffffff' }}>{group.totals.skusPerOutlet}</td>
                                                        <td style={{ ...visitTdStyle, textAlign: 'right', fontWeight: '700', color: '#ffffff' }}>{formatCurrency(group.totals.valuePerOutlet)}</td>
                                                        <td style={{ ...visitTdStyle, textAlign: 'right', fontWeight: '700', color: '#22c55e' }}>{formatCurrency(group.totals.totalValue)}</td>
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        })}

                                        {/* Grand Total */}
                                        {visitPerfData?.grandTotals && (
                                            <tr style={{ background: 'rgba(34, 197, 94, 0.15)', borderTop: `2px solid rgba(34, 197, 94, 0.4)` }}>
                                                <td style={{ ...visitTdStyle, fontWeight: '800', color: '#22c55e', fontSize: '14px' }}>🏆 TỔNG CỘNG ({visitPerfData.tdvCount} TDV)</td>
                                                <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '800', color: '#ffffff', fontSize: '14px' }}>{visitPerfData.grandTotals.planCall}</td>
                                                <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '800', color: '#ffffff', fontSize: '14px' }}>{visitPerfData.grandTotals.visited}</td>
                                                <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '800', color: '#22c55e', fontSize: '14px' }}>{visitPerfData.grandTotals.success}</td>
                                                <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '800', color: '#22c55e', fontSize: '14px' }}>{visitPerfData.grandTotals.strikeRate}%</td>
                                                <td style={{ ...visitTdStyle, textAlign: 'center', fontWeight: '800', color: '#ffffff', fontSize: '14px' }}>{visitPerfData.grandTotals.skusPerOutlet}</td>
                                                <td style={{ ...visitTdStyle, textAlign: 'right', fontWeight: '800', color: '#ffffff', fontSize: '14px' }}>{formatCurrency(visitPerfData.grandTotals.valuePerOutlet)}</td>
                                                <td style={{ ...visitTdStyle, textAlign: 'right', fontWeight: '800', color: '#22c55e', fontSize: '14px' }}>{formatCurrency(visitPerfData.grandTotals.totalValue)}</td>
                                            </tr>
                                        )}

                                        {/* Empty state */}
                                        {(!visitPerfData || !visitPerfData.supervisorGroups?.length) && (
                                            <tr>
                                                <td colSpan="8" style={{ ...visitTdStyle, textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                                                    Chưa có dữ liệu TDV. Thêm nhân viên TDV và viếng thăm để xem báo cáo!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </ChartCard>
                    </>
                )}

                {/* === TDV TAB === */}
                {activeTab === 'tdv' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                            <SectionTitle icon="👤" title="HIỆU SUẤT THEO TDV" />
                            <FilterSelect label="Chọn TDV" value={selectedTdv} onChange={v => setSelectedTdv(v)}
                                options={[{ value: 'all', label: 'Tất cả TDV' }, ...tdvList.map(u => ({ value: u.id, label: u.name || u.username }))]} />
                        </div>

                        {/* TDV Performance Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                            {(selectedTdv === 'all' ? tdvList.slice(0, 6) : tdvList.filter(t => t.id === selectedTdv)).map((tdv, i) => (
                                <TDVCard key={tdv.id || i} tdv={tdv} getStats={getTdvStats} formatCurrency={formatCurrency} />
                            ))}
                            {tdvList.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: THEME.textSec }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                                    <p>Chưa có dữ liệu TDV. Thêm nhân viên TDV để xem hiệu suất!</p>
                                </div>
                            )}
                        </div>

                        {/* TDV Visit Chart */}
                        <ChartCard title="📊 SO SÁNH HIỆU SUẤT TDV" subtitle="Doanh số & Viếng thăm">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={tdvList.slice(0, 8).map((t, i) => {
                                    const s = getTdvStats(t);
                                    return {
                                        name: t.name || `TDV${i + 1}`,
                                        doanhSo: s ? s.totalValue : 0,
                                        viengTham: s ? s.visited : 0,
                                    };
                                })}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: THEME.textSec, fontSize: 11 }} />
                                    <YAxis yAxisId="left" tick={{ fill: THEME.textSec }} tickFormatter={formatCurrency} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: THEME.textSec }} />
                                    <Tooltip contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="doanhSo" name="Doanh số" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="viengTham" name="Viếng thăm" fill="#22c55e" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </>
                )}

                {/* === KPI TAB === */}
                {activeTab === 'kpi' && (
                    <>
                        <SectionTitle icon="🎯" title="HIỆU SUẤT TERRITORY" />

                        <ChartCard title="🎯 KPI CHI TIẾT THEO TDV" subtitle="Theo dõi 5 chỉ số cốt lõi (Mục tiêu vs Thực đạt)">
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `2px solid ${THEME.cardBorder}` }}>
                                            <th style={{ ...thStyle, width: '200px' }}>Nhân viên (TDV)</th>
                                            <th style={{ ...thStyle, textAlign: 'center' }}>Doanh Số A<br />(Thuốc)</th>
                                            <th style={{ ...thStyle, textAlign: 'center' }}>Doanh Số B<br />(TPCN)</th>
                                            <th style={{ ...thStyle, textAlign: 'center' }}>Viếng Thăm<br />(Visits)</th>
                                            <th style={{ ...thStyle, textAlign: 'center' }}>SKU/Order<br />(Avg)</th>
                                            <th style={{ ...thStyle, textAlign: 'center' }}>Thành Công<br />(Strike Rate)</th>
                                            <th style={{ ...thStyle, width: '150px', textAlign: 'center' }}>Tổng KPI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tdvList.map((tdv, i) => {
                                            const stats = getTdvStats(tdv);
                                            // Mock Targets (Simulated for now, pending DB update)
                                            const targetSales = 50000000;
                                            const targetVisit = 120;
                                            const targetStrike = 50;

                                            // Actual Data from stats (or 0 if null)
                                            const actSales = stats ? stats.totalValue : 0;
                                            const actVisit = stats ? stats.visited : 0;
                                            const actStrike = stats ? stats.strikeRate : 0;
                                            const actSku = stats ? stats.skusPerOutlet : 0;

                                            return (
                                                <tr key={i} style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                                                    <td style={tdStyle}>
                                                        <div style={{ fontWeight: '700', color: '#fff' }}>{tdv.name}</div>
                                                        <div style={{ fontSize: '11px', color: THEME.textSec }}>{tdv.employeeCode}</div>
                                                    </td>

                                                    {/* KPI 1: Sales Cat 1 */}
                                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                        <div style={{ color: '#22c55e', fontWeight: '600' }}>{formatCurrency(actSales * 0.7)}</div>
                                                        <div style={{ fontSize: '11px', color: THEME.textMuted }}>MT: {formatCurrency(targetSales * 0.7)}</div>
                                                        <ProgressBar value={(actSales * 0.7 / targetSales * 0.7) * 100} />
                                                    </td>

                                                    {/* KPI 2: Sales Cat 2 */}
                                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                        <div style={{ color: '#3b82f6', fontWeight: '600' }}>{formatCurrency(actSales * 0.3)}</div>
                                                        <div style={{ fontSize: '11px', color: THEME.textMuted }}>MT: {formatCurrency(targetSales * 0.3)}</div>
                                                        <ProgressBar value={(actSales * 0.3 / targetSales * 0.3) * 100} />
                                                    </td>

                                                    {/* KPI 3: Visits */}
                                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                        <div style={{ color: '#f59e0b', fontWeight: '600' }}>{actVisit} / {targetVisit}</div>
                                                        <ProgressBar value={(actVisit / targetVisit) * 100} />
                                                    </td>

                                                    {/* KPI 4: SKU/Order */}
                                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                        <div style={{ fontWeight: '600' }}>{actSku}</div>
                                                        <div style={{ fontSize: '11px' }}>MT: 3.5</div>
                                                    </td>

                                                    {/* KPI 5: Strike Rate */}
                                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                        <AchievementBadge value={actStrike} />
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>MT: {targetStrike}%</div>
                                                    </td>

                                                    {/* Overall Status */}
                                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                        <span style={{ fontWeight: '700', color: (actSales / targetSales) > 0.8 ? '#22c55e' : '#ef4444' }}>
                                                            {((actSales / targetSales) * 100).toFixed(0)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </ChartCard>
                    </>
                )}

                {/* === CUSTOMERS TAB === */}
                {activeTab === 'customers' && (
                    <>
                        <SectionTitle icon="👥" title="PHÂN TÍCH KHÁCH HÀNG" />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                            <ChartCard title="📊 PHÂN BỐ THEO SEGMENT" subtitle="A/B/C/D">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie data={data?.salesBySegment || []} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: THEME.textSec }}>
                                            {(data?.salesBySegment || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={v => formatFullCurrency(v)} contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="📺 PHÂN BỐ THEO KÊNH" subtitle="Channel Analysis">
                                <ResponsiveContainer width="100%" height={280}>
                                    <RadarChart data={data?.salesByChannel || []}>
                                        <PolarGrid stroke="rgba(148, 163, 184, 0.3)" />
                                        <PolarAngleAxis dataKey="name" tick={{ fill: '#fff', fontSize: 12 }} />
                                        <PolarRadiusAxis tick={{ fill: THEME.textSec }} />
                                        <Radar name="Doanh số" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="👑 PHÂN BỐ THEO TIER" subtitle="VIP/GOLD/SILVER/BRONZE">
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={data?.salesByTier || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: THEME.textSec, fontSize: 11 }} />
                                        <YAxis tick={{ fill: THEME.textSec }} tickFormatter={formatCurrency} />
                                        <Tooltip formatter={v => formatFullCurrency(v)} contentStyle={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: '10px', color: '#fff' }} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                            {(data?.salesByTier || []).map((_, i) => <Cell key={i} fill={['#f59e0b', '#FFD700', '#C0C0C0', '#CD7F32', '#6B7280'][i % 5]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Components
const FilterSelect = ({ label, value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding: '12px 20px',
        borderRadius: '10px',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        background: 'rgba(15, 39, 68, 0.95)',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        minWidth: '140px'
    }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#0f2744', color: '#ffffff' }}>{o.label}</option>)}
    </select>
);

const KPICard = ({ title, value, subValue, icon, color }) => (
    <div style={{
        background: `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`,
        border: `1px solid ${color}40`,
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.15 }}>{icon}</div>
        <div style={{ fontSize: '12px', color: THEME.textSec, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{value}</div>
        {subValue && <div style={{ fontSize: '14px', color: THEME.textSec }}>{subValue}</div>}
    </div>
);

const ChartCard = ({ title, subtitle, children }) => (
    <div style={{
        background: THEME.card,
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: `1px solid ${THEME.cardBorder}`,
        overflow: 'hidden'
    }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.cardBorder}`, background: THEME.cardHeader }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#fff' }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '13px', color: THEME.textSec, margin: '4px 0 0 0' }}>{subtitle}</p>}
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
    </div>
);

const SectionTitle = ({ icon, title }) => (
    <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '24px',
        color: '#fff',
        borderLeft: '4px solid #3b82f6',
        paddingLeft: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    }}>
        {icon} {title}
    </h2>
);

const TDVCard = ({ tdv, visitData, getStats, formatCurrency }) => {
    const stats = getStats ? getStats(tdv) : null;

    return (
        <div style={{
            background: THEME.card,
            border: `1px solid ${THEME.cardBorder}`,
            borderRadius: '16px',
            padding: '24px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                <div>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#fff' }}>{tdv.name || tdv.username}</div>
                    <div style={{ fontSize: '13px', color: THEME.textSec }}>{tdv.employeeCode || 'TDV'}</div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <div style={{ fontSize: '12px', color: THEME.textSec, marginBottom: '4px' }}>Doanh số</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e' }}>
                        {formatCurrency(stats ? stats.totalValue : 0)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: THEME.textSec, marginBottom: '4px' }}>Viếng thăm</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
                        {stats ? `${stats.visited}/${stats.planCall}` : '0/0'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: THEME.textSec, marginBottom: '4px' }}>Strike Rate</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
                        {stats ? stats.strikeRate : 0}%
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: THEME.textSec, marginBottom: '4px' }}>Thành công</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#8b5cf6' }}>
                        {stats ? stats.success : 0}
                    </div>
                </div>
            </div>
        </div>
    )
};

const RankBadge = ({ rank }) => {
    const colors = { 1: '#f59e0b', 2: '#C0C0C0', 3: '#CD7F32' };
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: colors[rank] || 'rgba(59, 130, 246, 0.2)',
            fontWeight: '700',
            fontSize: '14px',
            color: '#fff'
        }}>
            {rank}
        </span>
    );
};

const AchievementBadge = ({ value }) => {
    const color = value >= 100 ? '#22c55e' : value >= 80 ? '#f59e0b' : '#ef4444';
    return (
        <span style={{
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            background: `${color}25`,
            color: color
        }}>
            {value || 0}%
        </span>
    );
};

const ProgressBar = ({ value }) => (
    <div style={{ height: '10px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{
            height: '100%',
            width: `${value}%`,
            background: value >= 100 ? '#22c55e' : value >= 80 ? 'linear-gradient(90deg, #f59e0b, #22c55e)' : 'linear-gradient(90deg, #ef4444, #f59e0b)',
            borderRadius: '5px',
            transition: 'width 0.5s ease'
        }} />
    </div>
);

const thStyle = { textAlign: 'left', padding: '14px 16px', color: '#e2e8f0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#ffffff' };
const visitThStyle = { textAlign: 'left', padding: '12px 14px', color: '#e2e8f0', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' };
const visitTdStyle = { padding: '12px 14px', fontSize: '13px', color: '#ffffff' };

export default BizReview;
