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
  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    routeCode: '',
    phone: '',
    email: '',
    role: 'TDV',
    password: ''
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
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

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
      password: ''
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
      password: ''
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
      'Trạng thái': user.isActive ? 'Hoạt động' : 'Không hoạt động',
      'Ngày tạo': user.createdAt ? formatDate(user.createdAt) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nhân viên');
    
    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Mã NV
      { wch: 25 }, // Tên
      { wch: 12 }, // Mã tuyến
      { wch: 15 }, // Số điện thoại
      { wch: 25 }, // Email
      { wch: 15 }, // Vai trò
      { wch: 12 }, // Trạng thái
      { wch: 20 }  // Lần đăng nhập cuối
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Danh_sach_nhan_vien_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Import from Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and map data
        const importedUsers = jsonData.map((row, index) => {
          const employeeCode = (row['Mã NV'] || row['Mã nhân viên'] || '').toString().trim().toUpperCase();
          const name = (row['Tên'] || row['Họ tên'] || '').toString().trim();
          const role = (row['Vai trò'] || row['Role'] || 'TDV').toString().toUpperCase();
          
          if (!employeeCode || !name) {
            throw new Error(`Dòng ${index + 2}: Thiếu Mã NV hoặc Tên`);
          }

          return {
            employeeCode,
            name,
            routeCode: (row['Mã tuyến'] || row['Mã tuyến phụ trách'] || '').toString().trim() || null,
            phone: (row['Số điện thoại'] || row['Phone'] || '').toString().trim() || null,
            email: (row['Email'] || '').toString().trim() || null,
            role: ['TDV', 'QL', 'KT', 'ADMIN'].includes(role) ? role : 'TDV',
            password: '123456' // Default password
          };
        });

        // Import users via API
        let successCount = 0;
        let errorCount = 0;
        
        const token = localStorage.getItem('token');
        for (const importedUser of importedUsers) {
          try {
            const response = await fetch(`${API_BASE}/users/admin/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'x-auth-token': token } : {}),
              },
              body: JSON.stringify(importedUser),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              const error = await response.json();
              console.error(`Error importing user ${importedUser.employeeCode}:`, error.error);
            }
          } catch (error) {
            errorCount++;
            console.error(`Error importing user ${importedUser.employeeCode}:`, error);
          }
        }

        alert(`Đã import ${successCount} người dùng thành công${errorCount > 0 ? `, ${errorCount} lỗi` : ''}!`);
        loadUsers(); // Reload users from API
        e.target.value = ''; // Reset input
      } catch (error) {
        alert(`Lỗi import: ${error.message}`);
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Mã NV': 'TDV001',
        'Tên': 'Nguyễn Văn A',
        'Mã tuyến': 'T001',
        'Số điện thoại': '0901234567',
        'Email': 'tdv001@anminh.com',
        'Vai trò': 'TDV'
      },
      {
        'Mã NV': 'QL001',
        'Tên': 'Trần Thị B',
        'Mã tuyến': '',
        'Số điện thoại': '0912345678',
        'Email': 'ql001@anminh.com',
        'Vai trò': 'QL'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    const colWidths = [
      { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'Template_Import_Nhan_Vien.xlsx');
  };

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
            onClick={handleDownloadTemplate}
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
            <span>📥</span>
            <span>Template</span>
          </button>
          <label style={{
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
          }}>
            <span>📤</span>
            <span>Import Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
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

      {/* Users List - Mobile Card View */}
      {isMobile ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {filteredUsers.map(user => (
            <div
              key={user.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${user.isOnline ? '#10b981' : '#e5e7eb'}`
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '4px'
                  }}>
                    {user.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    📞 {user.phone}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    📧 {user.email}
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  background: user.isOnline ? '#10b98115' : '#e5e7eb',
                  color: user.isOnline ? '#10b981' : '#666',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
                  {user.isOnline ? '🟢 Online' : '⚫ Offline'}
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
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
                <span style={{
                  padding: '4px 10px',
                  background: '#F29E2E15',
                  color: '#F29E2E',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  🏢 {user.hub}
                </span>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#999',
                marginBottom: '12px'
              }}>
                Đăng nhập cuối: {formatDate(user.lastLogin)}
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleEdit(user)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#FBC93D15',
                    border: '1px solid #FBC93D',
                    borderRadius: '8px',
                    color: '#FBC93D',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 150px 180px 120px 120px 150px 120px',
            gap: '16px',
            padding: '16px 20px',
            background: '#f9fafb',
            borderBottom: '2px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '14px',
            color: '#1a1a2e'
          }}>
            <div>STT</div>
            <div>Tên</div>
            <div>Số điện thoại</div>
            <div>Email</div>
            <div>Vai trò</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 120px 150px 120px 120px 120px 120px',
                  gap: '12px',
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
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {user.routeCode || '-'}
                </div>
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{user.phone || '-'}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{user.email || '-'}</div>
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
      )}

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
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: isMobile ? '24px' : '32px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Tên người dùng *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  color: '#1a1a2e',
                  background: '#fff'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mã nhân viên *
                </label>
                <input
                  type="text"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value.toUpperCase() })}
                  placeholder="TDV001"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    textTransform: 'uppercase',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mã tuyến phụ trách
                </label>
                <input
                  type="text"
                  value={formData.routeCode}
                  onChange={(e) => setFormData({ ...formData, routeCode: e.target.value.toUpperCase() })}
                  placeholder="T001"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    textTransform: 'uppercase',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Vai trò *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                >
                  <option value="TDV">👨‍⚕️ Trình dược viên</option>
                  <option value="QL">👔 Quản lý</option>
                  <option value="KT">📊 Kế toán</option>
                  <option value="ADMIN">👑 Quản trị viên</option>
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mật khẩu {editingUser ? '(để trống nếu không đổi)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            {!editingUser && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mật khẩu {editingUser ? '(để trống nếu không đổi)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Nhập mật khẩu mới' : 'Nhập mật khẩu'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '12px 24px',
                  background: '#F29E2E',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

