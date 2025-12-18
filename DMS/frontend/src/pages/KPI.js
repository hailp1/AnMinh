import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { kpiAPI } from '../services/api';

const KPI = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [period, setPeriod] = useState('month'); // month, quarter, year
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        sales: { target: 0, actual: 0, unit: 'VND' },
        visits: { target: 0, actual: 0, unit: 'Lượt' },
        newCustomers: { target: 0, actual: 0, unit: 'KH' },
        orders: { target: 0, actual: 0, unit: 'Đơn' },
        skuCoverage: { target: 0, actual: 0, unit: 'SKU' }
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const res = await kpiAPI.getSummary({ userId: user.id, period });
                if (res) {
                    setData(res);
                }
            } catch (error) {
                console.error('Error fetching KPI:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, period]);

    const calculateProgress = (actual, target) => {
        if (!target) return 0;
        return Math.min((actual / target) * 100, 100);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

    const KPICard = ({ title, actual, target, unit, color, icon }) => {
        const progress = calculateProgress(actual, target);
        return (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            {icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#666' }}>{title}</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                                {unit === 'VND' ? formatCurrency(actual) : actual}
                                <span style={{ fontSize: '14px', color: '#999', fontWeight: 'normal' }}> / {unit === 'VND' ? formatCurrency(target) : target}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: progress >= 100 ? '#10b981' : progress >= 80 ? '#F29E2E' : '#ef4444' }}>
                            {Math.round(progress)}%
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: color, borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ background: '#1E4A8B', padding: '20px 20px 40px 20px', color: '#fff', borderRadius: '0 0 24px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>←</button>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Hiệu quả kinh doanh</h1>
                    <div style={{ width: '24px' }}></div>
                </div>

                {/* Period Selector */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '12px' }}>
                    {['month', 'quarter', 'year'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
                                background: period === p ? '#fff' : 'transparent',
                                color: period === p ? '#1E4A8B' : '#fff', fontWeight: '600',
                                textTransform: 'capitalize'
                            }}
                        >
                            {p === 'month' ? 'Tháng này' : p === 'quarter' ? 'Quý này' : 'Năm nay'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', marginTop: '-30px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
                ) : (
                    <>
                        <KPICard
                            title="Doanh số"
                            actual={data.sales.actual}
                            target={data.sales.target}
                            unit="VND"
                            color="#3b82f6"
                            icon="💰"
                        />
                        <KPICard
                            title="Viếng thăm"
                            actual={data.visits.actual}
                            target={data.visits.target}
                            unit="Lượt"
                            color="#10b981"
                            icon="📍"
                        />
                        <KPICard
                            title="Đơn hàng"
                            actual={data.orders.actual}
                            target={data.orders.target}
                            unit="Đơn"
                            color="#F29E2E"
                            icon="🛒"
                        />
                        <KPICard
                            title="Khách hàng mới"
                            actual={data.newCustomers.actual}
                            target={data.newCustomers.target}
                            unit="KH"
                            color="#8b5cf6"
                            icon="👥"
                        />
                        <KPICard
                            title="Độ phủ SKU"
                            actual={data.skuCoverage.actual}
                            target={data.skuCoverage.target}
                            unit="SKU"
                            color="#ec4899"
                            icon="📦"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default KPI;
