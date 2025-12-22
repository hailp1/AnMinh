
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { usersAPI } from '../../services/api';
import {
  Users, UserPlus, Search, Filter, Download, Upload,
  MoreVertical, Edit2, Trash2, CheckCircle, XCircle,
  Shield, Briefcase, MapPin, Phone, Mail
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// --- STYLES & THEME ---
const THEME = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  secondary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#E2E8F0',
  text: '#1E293B',
  textLight: '#64748B',
  bg: '#F8FAFC',
  white: '#FFFFFF'
};

const Card = ({ children, style }) => (
  <div style={{
    background: THEME.white,
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${THEME.border}`,
    ...style
  }}>{children}</div>
);

const Badge = ({ children, color, bg }) => (
  <span style={{
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: color,
    background: bg,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  }}>{children}</span>
);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, TDV, ADMIN, MANAGER
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Metadata
  const [regions, setRegions] = useState([]);
  const [managers, setManagers] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    name: '', employeeCode: '', routeCode: '', phone: '', email: '',
    role: 'TDV', password: '', managerId: '', regionId: '', channel: 'OTC', isActive: true
  });

  useEffect(() => {
    loadUsers();
    loadMetadata();
  }, []);

  useEffect(() => {
    let res = [...users];

    // 1. Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      res = res.filter(u =>
        u.name?.toLowerCase().includes(lower) ||
        u.employeeCode?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
      );
    }

    // 2. Tab Filter
    if (activeTab !== 'ALL') {
      if (activeTab === 'MANAGER') res = res.filter(u => ['QL', 'RSM', 'ASM'].includes(u.role));
      else if (activeTab === 'ADMIN') res = res.filter(u => ['ADMIN', 'BU_HEAD'].includes(u.role));
      else res = res.filter(u => u.role === activeTab);
    }

    setFilteredUsers(res);
  }, [users, searchTerm, activeTab]);

  const loadMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/regions`, { headers: { 'x-auth-token': token } });
      if (res.ok) setRegions(await res.json());
    } catch (err) { console.error(err); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersAPI.getAllAdmin();
      const list = Array.isArray(data) ? data : [];
      setUsers(list);
      // Filter managers for dropdown
      setManagers(list.filter(u => ['QL', 'ADMIN', 'RSM', 'ASM', 'BU_HEAD'].includes(u.role)));
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      employeeCode: user.employeeCode || '',
      routeCode: user.routeCode || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'TDV',
      password: '', // Don't show password
      managerId: user.manager?.id || '',
      regionId: user.region?.id || '',
      channel: user.channel || 'OTC',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.employeeCode || !formData.role) {
      alert('Vui lòng nhập Tên, Mã NV và Vai trò');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty pass

      // Upper case codes
      payload.employeeCode = payload.employeeCode.toUpperCase();
      if (payload.routeCode) payload.routeCode = payload.routeCode.toUpperCase();

      if (editingUser) {
        await usersAPI.update(editingUser.id, payload);
      } else {
        if (!payload.password) throw new Error('Cần mật khẩu cho user mới');
        await usersAPI.create(payload);
      }

      alert('Lưu thành công!');
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Chắc chắn xóa user này? Hành động không thể hoàn tác.')) return;
    try {
      await usersAPI.delete(id);
      loadUsers();
    } catch (err) { alert(err.message); }
  };

  const exportExcel = () => {
    const data = filteredUsers.map(u => ({
      'Mã NV': u.employeeCode,
      'Tên': u.name,
      'Vai trò': u.role,
      'Email': u.email,
      'SĐT': u.phone,
      'Quản lý': u.manager?.name,
      'Vùng': u.region?.name,
      'Trạng thái': u.isActive ? 'Active' : 'Inactive'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "Danh_sach_nhan_su.xlsx");
  };

  // --- RENDER HELPERS ---
  const renderRoleBadge = (role) => {
    const map = {
      'ADMIN': { color: '#7C3AED', bg: '#F3E8FF', label: 'Admin' },
      'TDV': { color: '#2563EB', bg: '#EFF6FF', label: 'TDV' },
      'QL': { color: '#059669', bg: '#ECFDF5', label: 'Manager' },
      'KT': { color: '#D97706', bg: '#FFFBEB', label: 'Kế toán' }
    };
    const style = map[role] || { color: '#64748B', bg: '#F1F5F9', label: role };
    return <Badge color={style.color} bg={style.bg}>{style.label}</Badge>;
  };

  return (
    <div style={{ padding: '24px', background: '#F1F5F9', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: THEME.text }}>Quản Lý Người Dùng</h1>
          <p style={{ color: THEME.textLight }}>Quản lý tài khoản, phân quyền và thông tin nhân sự</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportExcel} style={btnSecondaryStyle}>
            <Download size={18} /> Export
          </button>
          <button onClick={() => {
            setEditingUser(null); setFormData({
              name: '', employeeCode: '', routeCode: '', phone: '', email: '', role: 'TDV', password: '',
              managerId: '', regionId: '', channel: 'OTC', isActive: true
            }); setShowModal(true);
          }} style={btnPrimaryStyle}>
            <UserPlus size={18} /> Thêm Mới
          </button>
        </div>
      </div>

      {/* METRICS & TABS using a Card */}
      <Card style={{ padding: '4px', marginBottom: '24px', display: 'flex', gap: '4px', width: 'fit-content' }}>
        {['ALL', 'TDV', 'MANAGER', 'ADMIN'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              background: activeTab === tab ? THEME.white : 'transparent',
              color: activeTab === tab ? THEME.primary : THEME.textLight,
              boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'ALL' ? 'Tất cả' : tab === 'MANAGER' ? 'Quản lý' : tab}
          </button>
        ))}
      </Card>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: THEME.textLight }} />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã nhân viên, email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 14px 14px 48px',
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            fontSize: '15px',
            outline: 'none'
          }}
        />
      </div>

      {/* DATA TABLE */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${THEME.border}`, textAlign: 'left' }}>
                <th style={thStyle}>Nhân viên</th>
                <th style={thStyle}>Vai trò</th>
                <th style={thStyle}>Liên hệ</th>
                <th style={thStyle}>Quản lý & Vùng</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Ngày tạo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: THEME.primaryLight, color: THEME.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '16px'
                      }}>
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: THEME.text }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: THEME.textLight }}>{user.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {renderRoleBadge(user.role)}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color={THEME.textLight} /> {user.email || 'N/A'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color={THEME.textLight} /> {user.phone || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px' }}>
                      <div>Report to: <b>{user.manager?.name || '-'}</b></div>
                      <div style={{ color: THEME.textLight }}>{user.region?.name || 'Chưa phân vùng'}</div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {user.isActive ? (
                      <Badge color={THEME.success} bg="#D1FAE5"><CheckCircle size={12} /> Active</Badge>
                    ) : (
                      <Badge color={THEME.textLight} bg="#F1F5F9"><XCircle size={12} /> Inactive</Badge>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button onClick={() => handleEdit(user)} style={{ ...iconBtn, color: THEME.primary }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(user.id)} style={{ ...iconBtn, color: THEME.danger }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: THEME.textLight }}>
                    Chưa có dữ liệu nhân sự.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      {showModal && (
        <div style={itemsCenterFixed}>
          <Card style={{ width: '600px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>{editingUser ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} color={THEME.textLight} /></button>
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Họ và tên *</label>
                <input style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label style={labelStyle}>Mã nhân viên *</label>
                <input style={inputStyle} value={formData.employeeCode} onChange={e => setFormData({ ...formData, employeeCode: e.target.value })} placeholder="TDV001" />
              </div>
              <div>
                <label style={labelStyle}>Vai trò *</label>
                <select style={inputStyle} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="TDV">Trình dược viên</option>
                  <option value="QL">Quản lý (Manager)</option>
                  <option value="KT">Kế toán</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Email (Tên đăng nhập)</label>
                <input style={inputStyle} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Số điện thoại</label>
                <input style={inputStyle} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              {/* Password Field */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Mật khẩu {editingUser && '(Để trống nếu không đổi)'}</label>
                <input type="password" style={inputStyle} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="******" />
              </div>

              <div style={{ borderTop: `1px solid ${THEME.border}`, gridColumn: 'span 2', margin: '8px 0' }}></div>

              {/* Org Info */}
              <div>
                <label style={labelStyle}>Quản lý trực tiếp</label>
                <select style={inputStyle} value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })}>
                  <option value="">-- Chọn Quản lý --</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Khu vực / Vùng</label>
                <select style={inputStyle} value={formData.regionId} onChange={e => setFormData({ ...formData, regionId: e.target.value })}>
                  <option value="">-- Chọn Vùng --</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Kênh bán hàng</label>
                <select style={inputStyle} value={formData.channel} onChange={e => setFormData({ ...formData, channel: e.target.value })}>
                  <option value="OTC">OTC (Nhà thuốc)</option>
                  <option value="ETC">ETC (Bệnh viện)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Trạng thái</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" checked={formData.isActive} onChange={() => setFormData({ ...formData, isActive: true })} /> Active
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" checked={!formData.isActive} onChange={() => setFormData({ ...formData, isActive: false })} /> Inactive
                  </label>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 24px', background: '#F8FAFC', borderTop: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={btnSecondaryStyle}>Hủy bỏ</button>
              <button onClick={handleSave} disabled={loading} style={btnPrimaryStyle}>{loading ? 'Đang lưu...' : 'Lưu thông tin'}</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// --- CSS STYLES ---
const btnBase = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', border: 'none', fontSize: '14px' };
const btnPrimaryStyle = { ...btnBase, background: THEME.primary, color: THEME.white };
const btnSecondaryStyle = { ...btnBase, background: THEME.white, color: THEME.text, border: `1px solid ${THEME.border}` };
const thStyle = { padding: '12px 24px', fontSize: '13px', textTransform: 'uppercase', color: THEME.textLight, fontWeight: '600' };
const tdStyle = { padding: '16px 24px', fontSize: '14px', color: THEME.text };
const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px' };
const itemsCenterFixed = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: THEME.text, marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none' };

export default AdminUsers;
