import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Metadata
  const [regions, setRegions] = useState([]);
  const [managers, setManagers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    routeCode: '',
    phone: '',
    email: '',
    role: 'TDV',
    password: '',
    managerId: '',
    regionId: '',
    channel: ''
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadUsers();
    loadMetadata();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const loadMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const regRes = await fetch(`${API_BASE}/regions`, { headers });
      if (regRes.ok) setRegions(await regRes.json());

      // Managers are users with role QL or ADMIN
      // We can reuse users list if loaded, but better fetch specifically if needed
      // For simplicity, we filter from the main users list after it's loaded, 
      // or fetch a separate list if the main list is paginated (currently it's all users)
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/users/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-auth-token': token } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
        // Update managers list from users
        setManagers(data.filter(u => ['QL', 'ADMIN'].includes(u.role)));
      } else {
        console.warn('Failed to load users:', response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert(`Lỗi khi tải danh sách người dùng: ${error.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.employeeCode && u.employeeCode.toUpperCase().includes(searchTerm.toUpperCase())) ||
        (u.phone && u.phone.includes(searchTerm)) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      employeeCode: '',
      routeCode: '',
      phone: '',
      email: '',
      role: 'TDV',
      password: '',
      managerId: '',
      regionId: '',
      channel: ''
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      employeeCode: user.employeeCode || '',
      routeCode: user.routeCode || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'TDV',
      password: '',
      managerId: user.manager?.id || '',
      regionId: user.region?.id || '',
      channel: user.channel || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/users/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'x-auth-token': token } : {}),
        },
      });

      if (response.ok) {
        alert('Xóa người dùng thành công!');
        loadUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi xóa người dùng');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.employeeCode || !formData.role) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc: Tên, Mã NV, Vai trò');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('Vui lòng nhập mật khẩu cho người dùng mới');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        employeeCode: formData.employeeCode.toUpperCase(),
        routeCode: formData.routeCode || null,
        phone: formData.phone || null,
        email: formData.email || null,
        role: formData.role,
        managerId: formData.managerId || null,
        regionId: formData.regionId || null,
        channel: formData.channel || null
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const url = editingUser
        ? `${API_BASE}/users/admin/users/${editingUser.id}`
        : `${API_BASE}/users/admin/users`;
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-auth-token': token } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingUser ? 'Cập nhật người dùng thành công!' : 'Tạo người dùng thành công!');
        setShowModal(false);
        setEditingUser(null);
        loadUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu người dùng');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Lỗi khi lưu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'ADMIN': '👑 Quản trị viên',
      'TDV': '👨‍⚕️ Trình dược viên',
      'QL': '👔 Quản lý',
      'KT': '📊 Kế toán'
    };
    return labels[role] || role;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa đăng nhập';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredUsers.map(user => ({
      'Mã NV': user.employeeCode || '',
      'Tên': user.name || '',
      'Mã tuyến': user.routeCode || '',
      'Số điện thoại': user.phone || '',
      'Email': user.email || '',
      'Vai trò': user.role || '',
      'Quản lý trực tiếp': user.manager?.name || '',
      'Vùng': user.region?.name || '',
      'Kênh': user.channel || '',
      'Trạng thái': user.isActive ? 'Hoạt động' : 'Không hoạt động',
      'Ngày tạo': user.createdAt ? formatDate(user.createdAt) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nhân viên');
    XLSX.writeFile(wb, `Danh_sach_nhan_vien_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      {
        'Tên': 'Nguyễn Văn A',
        'Mã NV': 'NV001',
        'Mật khẩu': '123456',
        'Vai trò': 'TDV',
        'SĐT': '0909000000',
        'Email': 'a@example.com',
        'Mã tuyến': 'T01',
        'Kênh': 'OTC'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Nguoi_dung.xlsx');
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('File không có dữ liệu');
          return;
        }

        if (!window.confirm(`Tìm thấy ${data.length} dòng dữ liệu. Bạn có muốn import không?`)) return;

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
          try {
            const payload = {
              name: row['Tên'],
              employeeCode: row['Mã NV']?.toString().toUpperCase(),
              password: row['Mật khẩu']?.toString(),
              role: row['Vai trò'] || 'TDV',
              phone: row['SĐT']?.toString(),
              email: row['Email'],
              routeCode: row['Mã tuyến']?.toString(),
              channel: row['Kênh']
            };

            if (!payload.name || !payload.employeeCode || !payload.password) {
              console.warn('Skipping invalid row:', row);
              errorCount++;
              continue;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/users/admin/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
              },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (err) {
            console.error('Error importing row:', err);
            errorCount++;
          }
        }

        alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${errorCount}`);
        loadUsers();
      } catch (error) {
        console.error('Error parsing excel:', error);
        alert('Lỗi khi đọc file Excel');
      } finally {
        setLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  const channels = [
    { value: 'OTC', label: 'OTC' },
    { value: 'ETC', label: 'ETC' },
    { value: 'MT', label: 'MT (Modern Trade)' }
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Quản lý người dùng
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666'
          }}>
            Tổng số: {filteredUsers.length} người dùng
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleExportExcel}
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: '#8b5cf6',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>📊</span>
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleDownloadTemplate}
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: '#10b981',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>📥</span>
            <span>Template</span>
          </button>
          <label
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>📤</span>
            <span>Import</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={handleAdd}
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: '#F29E2E',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>➕</span>
            <span>Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: isMobile ? '1 1 100%' : '1',
            minWidth: isMobile ? '100%' : '200px',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px'
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: isMobile ? '100%' : '150px'
          }}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="ADMIN">👑 Quản trị viên</option>
          <option value="TDV">👨‍⚕️ Trình dược viên</option>
          <option value="QL">👔 Quản lý</option>
          <option value="KT">📊 Kế toán</option>
        </select>
      </div>

      {/* Desktop Table View */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50px 150px 100px 100px 100px 120px 120px 100px 100px 100px',
          gap: '16px',
          padding: '16px 20px',
          background: '#f9fafb',
          borderBottom: '2px solid #e5e7eb',
          fontWeight: '600',
          fontSize: '14px',
          color: '#1a1a2e',
          minWidth: '1200px'
        }}>
          <div>STT</div>
          <div>Tên</div>
          <div>Mã NV</div>
          <div>Vai trò</div>
          <div>Quản lý</div>
          <div>Vùng</div>
          <div>Kênh</div>
          <div>SĐT</div>
          <div>Trạng thái</div>
          <div>Thao tác</div>
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto', minWidth: '1200px' }}>
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 150px 100px 100px 100px 120px 120px 100px 100px 100px',
                gap: '16px',
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
              }}
            >
              <div style={{ fontSize: '14px', color: '#666' }}>{index + 1}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '13px', color: '#1E4A8B', fontWeight: '600' }}>
                {user.employeeCode || '-'}
              </div>
              <div>
                <span style={{
                  padding: '4px 10px',
                  background: '#1E4A8B15',
                  color: '#1E4A8B',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>{user.manager?.name || '-'}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{user.region?.name || '-'}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{user.channel || '-'}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{user.phone || '-'}</div>
              <div>
                <span style={{
                  padding: '4px 10px',
                  background: user.isOnline ? '#10b98115' : '#e5e7eb',
                  color: user.isOnline ? '#10b981' : '#666',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {user.isOnline ? '🟢 Online' : '⚫ Offline'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleEdit(user)}
                  style={{
                    padding: '6px 12px',
                    background: '#FBC93D15',
                    border: '1px solid #FBC93D',
                    borderRadius: '6px',
                    color: '#FBC93D',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#dc2626',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '20px' : '32px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Họ tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mã nhân viên *</label>
                <input
                  type="text"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Vai trò *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  <option value="TDV">Trình dược viên</option>
                  <option value="QL">Quản lý</option>
                  <option value="KT">Kế toán</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Quản lý trực tiếp</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">-- Chọn quản lý --</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Vùng phụ trách</label>
                <select
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">-- Chọn vùng --</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Kênh</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">-- Chọn kênh --</option>
                  {channels.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mã tuyến</label>
                <input
                  type="text"
                  value={formData.routeCode}
                  onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 24px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#4b5563',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
