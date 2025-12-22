
import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Filter, Plus, Download, Upload, MoreHorizontal,
  MapPin, Phone, Mail, Star, TrendingUp, DollarSign, Activity,
  X, Check, ChevronRight, Building, Award, LayoutGrid, List,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// --- STYLES (Enterprise Theme) ---
const THEME = {
  primary: '#0f172a',    // Slate 900
  secondary: '#334155',  // Slate 700
  accent: '#2563eb',     // Blue 600
  success: '#10b981',    // Emerald 500
  warning: '#f59e0b',    // Amber 500
  danger: '#ef4444',     // Red 500
  bg: '#f1f5f9',         // Slate 100
  cardBg: '#ffffff',
  text: '#1e293b',       // Slate 800
  textLight: '#64748b',  // Slate 500
  border: '#e2e8f0'      // Slate 200
};

const STAT_CARDS = [
  { title: 'Tổng Khách Hàng', icon: Users, color: THEME.accent, key: 'total' },
  { title: 'Đang Hoạt Động', icon: Activity, color: THEME.success, key: 'active' },
  { title: 'Khách Hàng Mới (T)', icon: Star, color: THEME.warning, key: 'new' },
  { title: 'Có Đơn Tháng Này', icon: DollarSign, color: THEME.primary, key: 'ordering' }
];

const AdminCustomers = () => {
  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [selectedCustomer, setSelectedCustomer] = useState(null); // For Right Panel
  const [showModal, setShowModal] = useState(false); // For Creating

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, VIP, NEW, RISK

  // Metadata
  const [territories, setTerritories] = useState([]);
  const [segments, setSegments] = useState([]);

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const [custRes, terrRes, segRes] = await Promise.all([
        fetch(`${API_BASE}/pharmacies/admin/all`, { headers }),
        fetch(`${API_BASE}/territories`, { headers }),
        fetch(`${API_BASE}/customer-segments`, { headers })
      ]);

      if (custRes.ok) setCustomers(await custRes.json());
      if (terrRes.ok) setTerritories(await terrRes.json());
      if (segRes.ok) setSegments(await segRes.json());
    } catch (error) {
      console.error('Error loading CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const kpiData = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'ACTIVE' || c.isActive).length;
    // Mock date logic if createdAt missing
    const newCust = customers.filter(c => new Date(c.createdAt) > new Date(new Date().setDate(new Date().getDate() - 30))).length;
    const ordering = Math.floor(active * 0.65); // Mock metric as we don't fetch orders here yet

    return { total, active, new: newCust, ordering };
  }, [customers]);

  // Filtering
  const filteredData = useMemo(() => {
    let data = customers;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(c =>
        c.name?.toLowerCase().includes(lower) ||
        c.phone?.includes(lower) ||
        c.code?.toLowerCase().includes(lower) ||
        c.address?.toLowerCase().includes(lower)
      );
    }

    if (activeFilter === 'VIP') data = data.filter(c => c.tier === 'VIP' || c.segment === 'A');
    if (activeFilter === 'NEW') data = data.filter(c => new Date(c.createdAt) > new Date(new Date().setDate(new Date().getDate() - 30)));
    // Risk = No order 60 days (Mocked check)
    if (activeFilter === 'RISK') data = data.filter(c => !c.lastOrderDate || new Date(c.lastOrderDate) < new Date(new Date().setDate(new Date().getDate() - 60)));

    return data;
  }, [customers, searchTerm, activeFilter]);

  // Styles
  const ss = {
    container: { fontFamily: 'Inter, sans-serif', background: THEME.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { padding: '20px 30px', background: THEME.cardBg, borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '24px', fontWeight: '700', color: THEME.primary, display: 'flex', alignItems: 'center', gap: '10px' },
    btnPrimary: { background: THEME.accent, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s' },
    btnSecondary: { background: '#fff', color: THEME.text, border: `1px solid ${THEME.border}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' },

    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '24px 30px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    statValue: { fontSize: '28px', fontWeight: '800', color: THEME.primary, marginTop: '5px' },
    statLabel: { fontSize: '14px', color: THEME.textLight, fontWeight: '500' },
    statIconBox: (color) => ({ width: '48px', height: '48px', borderRadius: '12px', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),

    // Main Content
    mainArea: { flex: 1, display: 'flex', padding: '0 30px 30px', gap: '24px', overflow: 'hidden' }, // Prevent Scroll of whole page
    leftTable: { flex: selectedCustomer ? 2 : 1, background: 'white', borderRadius: '12px', border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', overflow: 'hidden' }, // Added overflow hidden
    rightPanel: { flex: 1, width: '400px', background: 'white', borderRadius: '12px', border: `1px solid ${THEME.border}`, overflowY: 'auto', display: selectedCustomer ? 'block' : 'none', animation: 'slideIn 0.3s' },

    // Toolbar
    toolbar: { padding: '16px 20px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', gap: '12px', alignItems: 'center' },
    searchBox: { flex: 1, position: 'relative' },
    searchInput: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: `1px solid ${THEME.border}`, outline: 'none', fontSize: '14px' },
    filterBtn: (active) => ({ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: active ? '#eff6ff' : 'transparent', color: active ? THEME.accent : THEME.textLight, fontWeight: active ? '600' : '500' }),

    // Table
    tableWrapper: { flex: 1, overflowY: 'auto' }, // Allow scrolling
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '16px', borderBottom: `1px solid ${THEME.border}`, color: THEME.textLight, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', position: 'sticky', top: 0, background: 'white', zIndex: 10 },
    td: { padding: '16px', borderBottom: `1px solid ${THEME.border}`, fontSize: '14px', color: THEME.text },
    row: { cursor: 'pointer', transition: 'background 0.1s' },

    // Tags
    badge: (color) => ({ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: `${color}20`, color: color, display: 'inline-block' }),
    avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: THEME.secondary, fontSize: '14px', marginRight: '12px' },
  };

  return (
    <div style={ss.container}>
      {/* HEADER */}
      <div style={ss.header}>
        <div style={ss.title}>
          <Building size={28} color={THEME.accent} />
          Customer Intelligence
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={ss.btnSecondary}><Download size={18} /> Export</button>
          <button style={ss.btnSecondary}><Upload size={18} /> Import</button>
          <button style={ss.btnPrimary} onClick={() => { setSelectedCustomer(null); setShowModal(true); }}>
            <Plus size={20} /> Thêm Mới
          </button>
        </div>
      </div>

      {/* STATS DECK */}
      <div style={ss.statsGrid}>
        {STAT_CARDS.map(card => (
          <div key={card.key} style={ss.statCard}>
            <div>
              <div style={ss.statLabel}>{card.title}</div>
              <div style={ss.statValue}>{kpiData[card.key].toLocaleString()}</div>
            </div>
            <div style={ss.statIconBox(card.color)}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* MAIN WORKSPACE */}
      <div style={ss.mainArea}>
        {/* LEFT: MASTER LIST */}
        <div style={ss.leftTable}>
          {/* Toolbar */}
          <div style={ss.toolbar}>
            <div style={ss.searchBox}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: THEME.textLight }} />
              <input
                style={ss.searchInput}
                placeholder="Tìm kiếm khách hàng, SĐT, mã số..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: `1px solid ${THEME.border}` }}>
              {['ALL', 'VIP', 'NEW', 'RISK'].map(f => (
                <button
                  key={f}
                  style={ss.filterBtn(activeFilter === f)}
                  onClick={() => setActiveFilter(f)}
                >
                  {f === 'ALL' ? 'Tất cả' : f}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setViewMode('list')} style={{ padding: 8, background: viewMode === 'list' ? '#e2e8f0' : 'transparent', borderRadius: 6, border: 'none', cursor: 'pointer' }}><List size={18} /></button>
              <button onClick={() => setViewMode('grid')} style={{ padding: 8, background: viewMode === 'grid' ? '#e2e8f0' : 'transparent', borderRadius: 6, border: 'none', cursor: 'pointer' }}><LayoutGrid size={18} /></button>
            </div>
          </div>

          {/* List View */}
          <div style={ss.tableWrapper}>
            <table style={ss.table}>
              <thead>
                <tr>
                  <th style={ss.th}>Khách Hàng</th>
                  <th style={ss.th}>Phân Loại</th>
                  <th style={ss.th}>Khu Vực</th>
                  <th style={ss.th}>Tương Tác Cuối</th>
                  <th style={ss.th}>Doanh Số (YTD)</th>
                  <th style={ss.th}>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((c, idx) => (
                  <tr
                    key={c.id || idx}
                    style={{ ...ss.row, background: selectedCustomer?.id === c.id ? '#f1f5f9' : 'white' }}
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <td style={ss.td}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={ss.avatar}>{c.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: THEME.textLight }}>{c.code || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={ss.td}>
                      <span style={{
                        ...ss.badge(
                          c.tier === 'VIP' ? THEME.warning :
                            c.segment === 'A' ? THEME.accent : THEME.textLight
                        ),
                        fontSize: '11px'
                      }}>
                        {c.tier || c.segment || 'Standard'}
                      </span>
                    </td>
                    <td style={ss.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <MapPin size={14} color={THEME.textLight} />
                        {c.district}, {c.province?.split(' ').pop()}
                      </div>
                    </td>
                    <td style={ss.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: THEME.textLight, fontSize: '13px' }}>
                        <Clock size={14} />
                        {c.lastVisitDate ? new Date(c.lastVisitDate).toLocaleDateString() : 'Chưa ghé thăm'}
                      </div>
                    </td>
                    <td style={ss.td}>
                      <div style={{ fontWeight: '600' }}>{(c.currentDebt || 0).toLocaleString()} ₫</div>
                    </td>
                    <td style={ss.td}>
                      <span style={ss.badge(c.status === 'ACTIVE' || c.isActive ? THEME.success : THEME.danger)}>
                        {c.status === 'ACTIVE' || c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: `1px solid ${THEME.border}`, background: '#f8fafc', fontSize: '13px', color: THEME.textLight, display: 'flex', justifyContent: 'space-between' }}>
            <span>Hiển thị {filteredData.length} khách hàng</span>
            <span>Page 1 of {Math.ceil(filteredData.length / 50)}</span>
          </div>
        </div>

        {/* RIGHT: 360 DETAIL PANEL */}
        {selectedCustomer && (
          <div style={ss.rightPanel}>
            {/* Cover Info */}
            <div style={{ padding: '30px 20px 20px', background: 'linear-gradient(to bottom, #1e293b 0%, #1e293b 60%, white 60%, white 100%)', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: THEME.primary, border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {selectedCustomer.name.charAt(0)}
              </div>
              <div style={{ marginTop: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{selectedCustomer.name}</h2>
                <div style={{ fontSize: '13px', color: THEME.textLight, marginTop: '2px' }}>{selectedCustomer.code} | {selectedCustomer.type}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                <button style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${THEME.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Phone size={16} color={THEME.textLight} /></button>
                <button style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${THEME.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Mail size={16} color={THEME.textLight} /></button>
                <button style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${THEME.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MapPin size={16} color={THEME.textLight} /></button>
              </div>
            </div>

            {/* Tabs / Sections */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: THEME.textLight, marginTop: 0, marginBottom: '16px' }}>Thông Tin Chính</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InfoItem label="Nhóm KH" value={selectedCustomer.segment || 'Chưa phân nhóm'} icon={Users} />
                <InfoItem label="Khu Vực" value={selectedCustomer.district || 'N/A'} icon={MapPin} />
                <InfoItem label="Công Nợ" value={(selectedCustomer.currentDebt || 0).toLocaleString()} icon={DollarSign} color={THEME.danger} />
                <InfoItem label="Hạng Thẻ" value={selectedCustomer.tier || 'Standard'} icon={Award} color={THEME.warning} />
              </div>

              <div style={{ margin: '24px 0', borderTop: `1px solid ${THEME.border}` }}></div>

              <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: THEME.textLight, marginBottom: '16px' }}>Người Phụ Trách</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: `1px solid ${THEME.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: THEME.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {selectedCustomer.ownerName ? selectedCustomer.ownerName.charAt(0) : 'T'}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{selectedCustomer.ownerName || 'Chưa phân công'}</div>
                  <div style={{ fontSize: '12px', color: THEME.textLight }}>Nhân viên kinh doanh</div>
                </div>
              </div>

              <div style={{ margin: '24px 0', borderTop: `1px solid ${THEME.border}` }}></div>

              <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: THEME.textLight, marginBottom: '16px' }}>Activity Timeline</h3>
              <div style={{ position: 'relative', paddingLeft: '20px' }}>
                {/* Timeline Line */}
                <div style={{ position: 'absolute', left: '0', top: '5px', bottom: '0', width: '2px', background: '#e2e8f0' }}></div>

                <TimelineItem
                  date="Hôm nay"
                  title="Check-in App"
                  desc="NV Nguyễn Văn Tú đã check-in"
                  type="visit"
                  color={THEME.accent}
                />
                <TimelineItem
                  date="3 ngày trước"
                  title="Đặt hàng #ORD-28392"
                  desc="Trị giá: 12.500.000đ"
                  type="order"
                  color={THEME.success}
                />
                <TimelineItem
                  date="20/12/2025"
                  title="Cập nhật thông tin"
                  desc="Đổi số điện thoại người nhận hàng"
                  type="system"
                  color={THEME.textLight}
                />
              </div>

              <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <button style={{ ...ss.btnPrimary, flex: 1, justifyContent: 'center' }}>Chỉnh Sửa</button>
                <button style={{ ...ss.btnSecondary, color: THEME.danger, borderColor: THEME.danger }} onClick={() => setSelectedCustomer(null)}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const InfoItem = ({ label, value, icon: Icon, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
      {Icon && <Icon size={12} />} {label}
    </span>
    <span style={{ fontWeight: '600', fontSize: '14px', color: color || '#1e293b' }}>{value}</span>
  </div>
);

const TimelineItem = ({ date, title, desc, color }) => (
  <div style={{ marginBottom: '20px', position: 'relative' }}>
    <div style={{ position: 'absolute', left: '-25px', width: '12px', height: '12px', borderRadius: '50%', background: color || '#ccc', border: '2px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}></div>
    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>{date}</div>
    <div style={{ fontWeight: '600', fontSize: '13px' }}>{title}</div>
    <div style={{ fontSize: '12px', color: '#64748b' }}>{desc}</div>
  </div>
);

export default AdminCustomers;
