import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pharmaciesAPI, visitPlansAPI, kpiAPI, ordersAPI } from '../services/api';

// --- Icons ---
const Icons = {
  Map: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
  TrendingUp: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
};

const Home = () => {
  const { user } = useAuth();
  const [visitPlans, setVisitPlans] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    targetRevenue: 0,
    orders: 0,
    customers: 0,
    aso: 0,
    percent: 0,
    avgSku: 0,
    avgValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  const loadData = async () => {
    try {
      const today = new Date().toISOString();
      const [plans, kpiData, pharmStats, ordersData] = await Promise.all([
        visitPlansAPI.getAll({ userId: user.id, visitDate: today }),
        kpiAPI.getSummary({ userId: user.id, period: 'month' }),
        pharmaciesAPI.getSummary(),
        ordersAPI.getAll({ userId: user.id }).catch(() => [])
      ]);

      setVisitPlans(plans || []);

      const revenue = kpiData.sales?.actual || 0;
      const target = kpiData.sales?.target || 0;
      const percent = target > 0 ? Math.round((revenue / target) * 100) : 0;
      const cappedPercent = percent > 100 ? 100 : percent;

      // Calculate metrics
      const orders = Array.isArray(ordersData) ? ordersData : [];
      const activeCustomers = pharmStats.count || 0;

      // Count unique SKUs and ASO (Active Selling Outlets)
      const allSkus = new Set();
      const activeSellingOutlets = new Set();

      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => allSkus.add(item.productId));
        }
        if (order.pharmacyId) {
          activeSellingOutlets.add(order.pharmacyId);
        }
      });

      const avgSkuPerOutlet = activeCustomers > 0 ? (allSkus.size / activeCustomers).toFixed(1) : 0;
      const avgValuePerOutlet = activeCustomers > 0 ? (revenue / activeCustomers) : 0;
      const aso = activeSellingOutlets.size;

      setStats({
        revenue,
        targetRevenue: target,
        percent: cappedPercent,
        orders: kpiData.orders?.actual || 0,
        customers: activeCustomers,
        aso: aso,
        avgSku: avgSkuPerOutlet,
        avgValue: avgValuePerOutlet
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val).replace('₫', '');

  return (
    <div style={{ minHeight: '100%', paddingBottom: 100, fontFamily: 'Inter, sans-serif', background: '#F0F2F5' }}>

      {/* 1. Header with Target Progress */}
      <div style={{ background: 'linear-gradient(135deg, #1E4A8B 0%, #00d2ff 100%)', padding: '20px 20px 50px 20px', color: '#fff', borderRadius: '0 0 30px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Xin chào, {user.name}! 👋</h2>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>Chúc bạn một ngày làm việc hiệu quả</div>
          </div>
          <Link to="/profile">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)', fontWeight: 'bold', color: '#fff' }}>
              {user.name.charAt(0)}
            </div>
          </Link>
        </div>

        {/* Monthly Target Card */}
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: 15, borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
            <span style={{ fontWeight: '600' }}>Chi tiêu tháng này</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, fontSize: 10 }}>Thực tế</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ position: 'relative', width: 50, height: 50 }}>
              <svg width="50" height="50" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray={`${stats.percent}, 100`} />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>
                {stats.percent}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>{formatCurrency(stats.revenue)}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Mục tiêu: {formatCurrency(stats.targetRevenue)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Enhanced Stats Grid (6 metrics: 2 rows x 3 cols) */}
      <div style={{ padding: '0 20px', marginTop: -30 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '16px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}>
          {/* Row 1: Main 3 metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
            <Link to="/kpi" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ color: '#1E4A8B', fontWeight: 'bold', fontSize: 16 }}>{formatCurrency(stats.revenue / 1000000)}M</div>
              <div style={{ fontSize: 11, color: '#666' }}>Doanh số</div>
            </Link>
            <Link to="/customers" style={{ textDecoration: 'none', textAlign: 'center', borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
              <div style={{ color: '#1E4A8B', fontWeight: 'bold', fontSize: 16 }}>{stats.customers}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Khách hàng</div>
            </Link>
            <Link to="/kpi" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ color: '#1E4A8B', fontWeight: 'bold', fontSize: 16 }}>{stats.orders}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Đơn hàng</div>
            </Link>
          </div>

          {/* Row 2: Performance metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ textAlign: 'center', padding: '8px', background: '#FEF3C7', borderRadius: 12 }}>
              <div style={{ color: '#D97706', fontWeight: 'bold', fontSize: 15 }}>{stats.aso}</div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>ASO</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#F0F9FF', borderRadius: 12 }}>
              <div style={{ color: '#0284C7', fontWeight: 'bold', fontSize: 15 }}>{stats.avgSku || 0}</div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>SKU/Outlet</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#ECFDF5', borderRadius: 12 }}>
              <div style={{ color: '#059669', fontWeight: 'bold', fontSize: 15 }}>{formatCurrency((stats.avgValue || 0) / 1000)}K</div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Value/Outlet</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions - Optimized */}
      <div style={{ padding: '20px 20px 0 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Bản đồ', icon: <Icons.Map />, to: '/map', color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Thêm KH', icon: <div style={{ fontSize: 18 }}>➕</div>, to: '/create-pharmacy', color: '#10B981', bg: '#ECFDF5' },
          { label: 'Đơn hàng', icon: <div style={{ fontSize: 18 }}>📋</div>, to: '/order-summary', color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'KPI', icon: <Icons.TrendingUp />, to: '/kpi', color: '#8B5CF6', bg: '#F3E8FF' },
          // New Report Items
          { label: 'Dashboard', icon: <div style={{ fontSize: 18 }}>📊</div>, to: '/dashboard', color: '#EC4899', bg: '#FDF2F8' },
          { label: 'Báo cáo', icon: <div style={{ fontSize: 18 }}>📑</div>, to: '/reports', color: '#6366F1', bg: '#EEF2FF' },
        ].map((item, i) => (
          <Link key={i} to={item.to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 45, height: 45, borderRadius: 14, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 11, fontWeight: '600', color: '#444' }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* 4. Today's Plan */}
      <div style={{ padding: '20px 20px 0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, margin: 0, color: '#333' }}>📅 Lịch trình hôm nay</h3>
          <Link to="/map" style={{ fontSize: 12, color: '#1E4A8B', fontWeight: 'bold', textDecoration: 'none' }}>Xem bản đồ</Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#999', fontSize: 13, marginTop: 20 }}>Đang tải...</div>
        ) : visitPlans.length > 0 ? (
          visitPlans.map(plan => {
            const pharmacy = plan.pharmacy;
            if (!pharmacy) return null;

            return (
              <div key={plan.id} style={{ background: '#fff', padding: 15, borderRadius: 16, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, background: '#EFF6FF', color: '#1E4A8B', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏥</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 14, color: '#1E293B', marginBottom: 4 }}>{pharmacy.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>📍 {pharmacy.address}</div>
                    {pharmacy.phone && (
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>📞 {pharmacy.phone}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {pharmacy.latitude && pharmacy.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#F0F9FF',
                        color: '#0284C7',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        textAlign: 'center',
                        border: '1px solid #BAE6FD'
                      }}
                    >
                      🧭 Chỉ đường
                    </a>
                  )}
                  <Link
                    to={`/visit/${pharmacy.id}`}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#1E4A8B',
                      color: '#fff',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    ✓ Check-in
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: 30, background: '#fff', borderRadius: 16 }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>☕</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>Không có lịch hôm nay</div>
            <div style={{ fontSize: 12, color: '#666' }}>Bạn có thể tự do viếng thăm khách hàng</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
