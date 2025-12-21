import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { reportsAPI } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import ComplianceReportView from '../../components/ComplianceReportView';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminReports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const viewParam = queryParams.get('view') || 'dashboard';
  const typeParam = queryParams.get('type');

  // State
  const [period, setPeriod] = useState('this_month');
  const [dashboardData, setDashboardData] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Power BI Style Tabs
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (viewParam === 'dashboard') {
      loadDashboard();
    } else if (viewParam === 'report_detail') {
      loadReportData(typeParam);
    }
  }, [viewParam, typeParam, period]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await reportsAPI.getDashboard({ period });
      setDashboardData(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const loadReportData = async (type) => {
    setLoading(true);
    try {
      let res;
      if (['by_rep', 'by_customer', 'by_product'].includes(type)) {
        res = await reportsAPI.getSales({ type, period });
      } else if (type === 'compliance') {
        res = await reportsAPI.getVisits({ type: 'compliance', period });
      } else if (type === 'inventory_status') {
        res = await reportsAPI.getInventory({});
      }
      setReportData(res || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleExport = async (report) => {
    if (!window.confirm(`Xuất báo cáo "${report.title}"?`)) return;
    try {
      setLoading(true);
      let data = [];

      if (['execution_sales', 'orders', 'inventory'].includes(report.type)) {
        data = await reportsAPI.exportData({ type: report.type, period });
      } else if (['by_rep', 'by_customer', 'by_product'].includes(report.type)) {
        const res = await reportsAPI.getSales({ type: report.type, period });
        data = res;
      }

      if (!data || data.length === 0) {
        alert('Không có dữ liệu.');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${report.id}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error(error);
      alert('Lỗi xuất báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const availableReports = [
    { id: 'rpt_sales_rep', type: 'by_rep', title: 'Doanh số theo Nhân viên', desc: 'Phân tích hiệu quả kinh doanh của từng TDV.', category: 'Phân tích' },
    { id: 'rpt_sales_cust', type: 'by_customer', title: 'Doanh số theo Khách hàng', desc: 'Top khách hàng và đóng góp doanh thu.', category: 'Phân tích' },
    { id: 'rpt_sales_prod', type: 'by_product', title: 'Hiệu quả Sản phẩm', desc: 'Sản phẩm bán chạy và tồn kho chậm.', category: 'Phân tích' },
    { id: 'rpt_compliance', type: 'compliance', title: 'Tuân thủ Viếng thăm', desc: 'Tỷ lệ thực hiện viếng thăm so với kế hoạch.', category: 'Vận hành' },
    { id: 'rpt_inventory', type: 'inventory', title: 'Báo cáo Tồn kho', desc: 'Trạng thái tồn kho chi tiết tại các kho.', category: 'Kho vận' },
    { id: 'rpt_orders', type: 'orders', title: 'Chi tiết Đơn hàng', desc: 'Danh sách chi tiết line-items của đơn hàng.', category: 'Dữ liệu' },
    { id: 'rpt_exec', type: 'execution_sales', title: 'Hoạt động & Doanh số', desc: 'Tổng hợp kết quả làm việc hàng ngày của nhân viên.', category: 'Tổng hợp' },
  ];

  return (
    <div style={{ padding: '24px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-1px' }}>
            {viewParam === 'dashboard' && 'Dashboard Tổng quan'}
            {viewParam === 'report_list' && 'Danh mục Báo cáo'}
            {viewParam === 'report_detail' && 'Chi tiết Báo cáo'}
          </h1>
          <p style={{ color: '#64748B', marginTop: '8px', margin: 0 }}>
            {viewParam === 'dashboard' ? 'Theo dõi chỉ số hiệu suất chính (KPIs)' : 'Truy xuất và phân tích dữ liệu hệ thống'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {viewParam === 'report_detail' && (
            <button onClick={() => navigate('/Anminh/admin/reports?view=report_list')} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#fff', fontWeight: '600', cursor: 'pointer' }}>
              ← Quay lại
            </button>
          )}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: '1px solid #E2E8F0',
              outline: 'none', fontWeight: '600', color: '#334155', background: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <option value="this_month">Tháng này</option>
            <option value="last_month">Tháng trước</option>
            <option value="this_year">Năm nay</option>
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* DASHBOARD VIEW with TABS */}
      {!loading && viewParam === 'dashboard' && dashboardData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Power BI Style Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '0px' }}>
            {['overview', 'sales', 'ops'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #3B82F6' : '3px solid transparent',
                  color: activeTab === tab ? '#3B82F6' : '#64748B',
                  fontWeight: activeTab === tab ? '700' : '500',
                  cursor: 'pointer',
                  fontSize: '15px',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'overview' && '📋 Tổng quan'}
                {tab === 'sales' && '💰 Phân tích Kinh doanh'}
                {tab === 'ops' && '📦 Kho & Vận hành'}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.3s' }}>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <KpiCard title="Tổng doanh thu" value={formatCurrency(dashboardData.kpi.revenue)} icon="💰" color="#10B981" bg="#D1FAE5" />
                <KpiCard title="Đơn hàng" value={dashboardData.kpi.orders} icon="🛒" color="#3B82F6" bg="#DBEAFE" />
                <KpiCard title="Viếng thăm" value={`${dashboardData.kpi.visits.completed}/${dashboardData.kpi.visits.total}`} icon="📍" color="#F59E0B" bg="#FEF3C7" sub="Thực hiện/Kế hoạch" />
                <KpiCard title="Active Users" value={dashboardData.kpi.customers} icon="👥" color="#8B5CF6" bg="#EDE9FE" />
              </div>

              {/* Sales Trend (Area Chart) */}
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>Xu hướng Doanh số</h3>
                  <button onClick={() => setActiveTab('sales')} style={{ color: '#3B82F6', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Chi tiết ↗</button>
                </div>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.charts.salesTrend}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : val} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} formatter={(value) => [formatCurrency(value), 'Doanh số']} />
                      <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SALES */}
          {activeTab === 'sales' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', animation: 'fadeIn 0.3s' }}>

              {/* Region Analysis */}
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px 0' }}>Phân bổ theo Khu vực</h3>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.charts.salesByRegion} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={(val) => val / 1000000 + 'M'} />
                      <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B', fontWeight: '500' }} />
                      <Tooltip cursor={{ fill: '#F1F5F9' }} formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={24} name="Doanh số">
                        {dashboardData.charts.salesByRegion?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales by Product Group (NEW) */}
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px 0' }}>Cơ cấu Nhóm hàng</h3>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.charts.salesByGroup || []}
                        cx="50%" cy="50%"
                        innerRadius={80} outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name.substring(0, 10)}.. ${(percent * 100).toFixed(0)}%`}
                      >
                        {(dashboardData.charts.salesByGroup || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip formatter={(val) => formatCurrency(val)} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status */}
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px 0' }}>Trạng thái Đơn hàng</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.charts.orderStatus}
                        cx="50%" cy="50%"
                        innerRadius={80} outerRadius={110}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardData.charts.orderStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Products Table */}
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px 0' }}>Top 5 Sản phẩm Chủ lực</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {dashboardData.charts.topProducts.map((p, idx) => (
                    <div key={idx} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#3B82F6' }}>#{idx + 1}</span>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{p.code}</span>
                      </div>
                      <div style={{ fontWeight: '600', color: '#334155', marginBottom: '12px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {p.name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>Doanh thu</div>
                          <div style={{ fontWeight: '700', color: '#0F172A' }}>{formatCurrency(p.revenue)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>Số lượng</div>
                          <div style={{ fontWeight: '600' }}>{p.quantity}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: OPERATIONS (Inventory & Visit) */}
          {activeTab === 'ops' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.3s' }}>

              {/* Inventory Warning Block */}
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>Cảnh báo Kho hàng</h3>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#FEE2E2', color: '#EF4444', fontSize: '12px', fontWeight: '700' }}>Live</span>
                  </div>
                  <button onClick={() => navigate('/Anminh/admin/reports?view=report_detail&type=inventory_status')} style={{ color: '#3B82F6', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Xem chi tiết →</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '32px' }}>
                  {/* Summary Stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '20px', borderRadius: '16px', background: '#FEF2F2', border: '1px solid #FEE2E2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <div style={{ color: '#EF4444', fontWeight: '600', marginBottom: '8px' }}>Sản phẩm Sắp hết</div>
                      <div style={{ fontSize: '48px', fontWeight: '800', color: '#B91C1C', lineHeight: 1 }}>{dashboardData.inventory?.lowStockCount || 0}</div>
                      <div style={{ fontSize: '13px', color: '#EF4444', marginTop: '8px' }}>Cần nhập hàng ngay</div>
                    </div>
                    <div style={{ padding: '20px', borderRadius: '16px', background: '#F0FDF4', border: '1px solid #DCFCE7' }}>
                      <div style={{ color: '#166534', fontWeight: '600', marginBottom: '4px' }}>Tổng Giá trị Tồn kho</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#14532D' }}>{formatCurrency(dashboardData.inventory?.totalValue || 0)}</div>
                    </div>
                  </div>

                  {/* Low Stock List */}
                  <div style={{ border: '1px solid #F1F5F9', borderRadius: '16px', padding: '0 20px', maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                        <tr style={{ textAlign: 'left', color: '#64748B', fontSize: '13px', borderBottom: '2px solid #F1F5F9' }}>
                          <th style={{ padding: '16px 0' }}>Sản phẩm</th>
                          <th style={{ padding: '16px 0' }}>Kho</th>
                          <th style={{ padding: '16px 0', textAlign: 'right' }}>Hiệu số</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardData.inventory?.lowStockItems || []).map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                            <td style={{ padding: '12px 0' }}>
                              <div style={{ fontWeight: '600', color: '#334155' }}>{item.name}</div>
                              <div style={{ fontSize: '12px', color: '#94A3B8' }}>Min: {item.min}</div>
                            </td>
                            <td style={{ padding: '12px 0', color: '#64748B' }}>{item.warehouse}</td>
                            <td style={{ padding: '12px 0', textAlign: 'right' }}>
                              <span style={{ fontWeight: 'bold', color: '#EF4444' }}>{item.qty}</span>
                            </td>
                          </tr>
                        ))}
                        {(!dashboardData.inventory?.lowStockItems || dashboardData.inventory.lowStockItems.length === 0) && (
                          <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Kho ổn định ✅</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Visit Performance Chart */}
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px 0' }}>Hiệu suất Viếng thăm (Thực tế vs Kế hoạch)</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dashboardData.charts.visitPerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey="plan" name="Kế hoạch" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={20} />
                      <Line type="monotone" dataKey="actual" name="Thực tế" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORTS LIST VIEW */}
      {!loading && viewParam === 'report_list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {availableReports.map(rpt => (
            <div key={rpt.id} style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '6px 12px', borderRadius: '20px', background: '#F1F5F9', color: '#475569', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {rpt.category}
                </div>
                <div style={{ fontSize: '24px' }}>
                  {rpt.category === 'Dữ liệu' ? '🧾' : '📊'}
                </div>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 8px 0' }}>{rpt.title}</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5', margin: '0 0 24px 0', flex: 1 }}>{rpt.desc}</p>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                {['Phân tích', 'Vận hành'].includes(rpt.category) && (
                  <button
                    onClick={() => navigate(`/Anminh/admin/reports?view=report_detail&type=${rpt.type}`)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#fff', border: '1px solid #E2E8F0', color: '#334155', fontWeight: '600', cursor: 'pointer' }}>
                    Xem biểu đồ
                  </button>
                )}
                <button
                  onClick={() => handleExport(rpt)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#EFF6FF', border: 'none', color: '#3B82F6', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>📥</span> Xuất Excel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPORT DETAIL VIEW */}
      {!loading && viewParam === 'report_detail' && (
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

          {typeParam === 'compliance' ? (
            <ComplianceReportView reportData={reportData} period={period} formatCurrency={formatCurrency} />
          ) : (
            <>
              <div style={{ height: 400, marginBottom: 40 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.slice(0, 15)} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 13, fontWeight: '500' }} />
                    <Tooltip formatter={(val) => formatCurrency(val)} cursor={{ fill: '#F8FAFC' }} />
                    <Bar dataKey="total" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#64748B' }}>Đối tượng</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: '#64748B' }}>Số liệu</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: '#64748B' }}>Doanh số / Giá trị</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>
                        {item.name} <span style={{ color: '#94A3B8', fontSize: '13px', marginLeft: '8px' }}>{item.code}</span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

    </div>
  );
};

const KpiCard = ({ title, value, sub, icon, color, bg }) => (
  <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
      {icon}
    </div>
    <div>
      <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: '600', marginTop: '4px' }}>{sub}</div>}
    </div>
  </div>
);

export default AdminReports;
