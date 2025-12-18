import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminReports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const viewParam = queryParams.get('view') || 'dashboard'; // dashboard, report
  const typeParam = queryParams.get('type');

  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [period, setPeriod] = useState('this_month');
  const [dashboardData, setDashboardData] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [expandedMenu, setExpandedMenu] = useState({});

  // Toggle sub-menus
  const toggleMenu = (key) => setExpandedMenu(prev => {
    const updated = { ...prev };
    updated[key] = !updated[key];
    return updated;
  });

  useEffect(() => {
    if (viewParam === 'dashboard') {
      loadDashboard();
    } else if (typeParam) {
      // Find report config and load
      loadReportData(typeParam);
    }
  }, [viewParam, typeParam, period]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await reportsAPI.getDashboard({ period });
      setDashboardData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async (type) => {
    setLoading(true);
    try {
      let res;
      // Map type to API
      if (['by_rep', 'by_customer', 'by_product'].includes(type)) {
        res = await reportsAPI.getSales({ type, period });
      } else if (type === 'compliance') {
        res = await reportsAPI.getVisits({ type: 'compliance', period });
      }
      setReportData(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // ... (Keep existing exportToExcel and renderSalesByRep if useful, or refactor)
  // For brevity, I will re-implement render logic based on new structure.

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      action: () => navigate('/Anminh/admin/reports?view=dashboard')
    },
    {
      key: 'sales',
      label: 'Báo cáo Doanh số',
      icon: '💰',
      children: [
        { key: 'by_rep', label: 'Theo Nhân viên', type: 'by_rep' },
        { key: 'by_customer', label: 'Theo Khách hàng', type: 'by_customer' },
        { key: 'by_product', label: 'Theo Sản phẩm', type: 'by_product' }
      ]
    },
    {
      key: 'visits',
      label: 'Viếng thăm',
      icon: '🛵',
      children: [
        { key: 'compliance', label: 'Tuân thủ tuyến', type: 'compliance' }
      ]
    },
    {
      key: 'inventory',
      label: 'Kho và Tồn kho',
      icon: '📦',
      children: [
        { key: 'inventory_status', label: 'Báo cáo Tồn kho', type: 'inventory_status' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#1E4A8B', fontWeight: 'bold' }}>Analytics and Reports</h2>
        </div>
        <div style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
          {menuItems.map(item => (
            <div key={item.key} style={{ marginBottom: '8px' }}>
              <div
                onClick={item.children ? () => toggleMenu(item.key) : item.action}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '8px',
                  background: (viewParam === 'dashboard' && item.key === 'dashboard') ? '#eff6ff' : 'transparent',
                  color: (viewParam === 'dashboard' && item.key === 'dashboard') ? '#1E4A8B' : '#475569',
                  fontWeight: (viewParam === 'dashboard' && item.key === 'dashboard') ? '600' : '500'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{item.icon}</span> {item.label}
                </span>
                {item.children && <span>{expandedMenu[item.key] ? '▼' : '▶'}</span>}
              </div>
              {item.children && expandedMenu[item.key] && (
                <div style={{ paddingLeft: '34px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {item.children.map(child => (
                    <div
                      key={child.key}
                      onClick={() => navigate(`/Anminh/admin/reports?view=report&type=${child.type}`)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: typeParam === child.type ? '#f1f5f9' : 'transparent',
                        color: typeParam === child.type ? '#1E4A8B' : '#64748b',
                        fontWeight: typeParam === child.type ? '600' : '400'
                      }}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Header & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
            {viewParam === 'dashboard' ? 'Tổng quan hoạt động' :
              menuItems.flatMap(i => i.children || []).find(c => c.type === typeParam)?.label || 'Báo cáo chi tiết'}
          </h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '500' }}
          >
            <option value="this_month">Tháng này</option>
            <option value="last_month">Tháng trước</option>
          </select>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</div>}

        {!loading && viewParam === 'dashboard' && dashboardData && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              <KpiCard title="Tổng doanh số" value={formatCurrency(dashboardData.kpi.revenue)} icon="💰" color="#10b981" />
              <KpiCard title="Đơn hàng" value={dashboardData.kpi.orders} icon="🛒" color="#3b82f6" />
              <KpiCard title="Khách hàng Active" value={dashboardData.kpi.customers} icon="👥" color="#8b5cf6" />
              <KpiCard title="Viếng thăm" value={`${dashboardData.kpi.visits.completed}/${dashboardData.kpi.visits.total}`} sub={`Đạt ${dashboardData.kpi.visits.total ? Math.round(dashboardData.kpi.visits.completed / dashboardData.kpi.visits.total * 100) : 0}%`} icon="📍" color="#f59e0b" />
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#475569', fontSize: '16px' }}>Xu hướng Doanh số</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.charts.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : val} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#475569', fontSize: '16px' }}>Trạng thái Đơn hàng</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.charts.orderStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {dashboardData.charts.orderStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#475569', fontSize: '16px' }}>Top 5 Sản phẩm bán chạy</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dashboardData.charts.topProducts.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: idx < 4 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', background: '#eff6ff', borderRadius: '50%', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1e293b' }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{p.code}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: '#1E4A8B' }}>{formatCurrency(p.revenue)}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{p.quantity} sp</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#94a3b8' }}>Biểu đồ khác (Region/Team performance) - Sắp ra mắt</p>
              </div>
            </div>
          </div>
        )}

        {!loading && viewParam === 'report' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {/* Re-use existing table logic for Report view */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>STT</th>
                  {typeParam === 'by_rep' && <>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Nhân viên</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Doanh số</th>
                  </>}
                  {typeParam === 'by_customer' && <>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Khách hàng</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Doanh số</th>
                  </>}
                  {typeParam === 'by_product' && <>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Sản phẩm</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>SL</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Doanh số</th>
                  </>}
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{idx + 1}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{item.name}</td>
                    {typeParam === 'by_product' && <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>}
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#1E4A8B' }}>
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
                {reportData.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Không có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, sub, icon, color }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
    <div>
      <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: color, marginTop: '4px' }}>{sub}</div>}
    </div>
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
      {icon}
    </div>
  </div>
);
export default AdminReports;
