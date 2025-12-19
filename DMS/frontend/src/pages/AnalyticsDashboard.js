import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const AnalyticsDashboard = () => {
    const [range, setRange] = useState('this_month');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, [range]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const res = await analyticsAPI.getDashboard({ range });
            setData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Đang tải dữ liệu...</div>;
    if (!data) return <div style={{ padding: 20 }}>Không có dữ liệu</div>;

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div style={{ padding: '24px', background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Header with Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1E293B' }}>📊 Dashboard Kinh Doanh</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13 }}>Tổng quan hiệu quả hoạt động</p>
                </div>
                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14 }}
                >
                    <option value="today">Hôm nay</option>
                    <option value="this_month">Tháng này</option>
                    <option value="all_time">Toàn thời gian</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
                <div style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', padding: 24, borderRadius: 16, color: '#fff', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>Doanh số tổng</div>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{formatCurrency(data.summary.totalRevenue)}</div>
                </div>
                <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>Số đơn hàng</div>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1E293B' }}>{data.summary.totalOrders}</div>
                </div>
                {/* Add more metrics later */}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
                {/* Sales Trend */}
                <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', height: 400 }}>
                    <h3 style={{ marginTop: 0, fontSize: 16, color: '#475569', marginBottom: 20 }}>Xu hướng doanh số</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={data.salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : val} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(val) => formatCurrency(val)} />
                            <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Sales by Category */}
                <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', height: 400 }}>
                    <h3 style={{ marginTop: 0, fontSize: 16, color: '#475569', marginBottom: 20 }}>Doanh số theo Nhóm hàng</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={data.salesByCategory} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(val) => formatCurrency(val)} />
                            <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
