import React, { useState, useEffect } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils/mockData';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterHub, setFilterHub] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'PHARMACY_REP',
    hub: 'Trung tâm',
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, filterHub, users]);

  const loadUsers = () => {
    let storedUsers = getFromLocalStorage('users', []);
    
    // Generate mock users if none exist
    if (storedUsers.length === 0) {
      storedUsers = generateMockUsers();
      saveToLocalStorage('users', storedUsers);
    }
    
    setUsers(storedUsers);
  };

  const generateMockUsers = () => {
    const mockUsers = [];
    const roles = ['PHARMACY_REP', 'PHARMACY', 'DELIVERY', 'ADMIN'];
    const hubs = ['Trung tâm', 'Củ Chi', 'Đồng Nai'];
    const names = [
      'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D',
      'Hoàng Văn E', 'Vũ Thị F', 'Đặng Văn G', 'Bùi Thị H',
      'Đỗ Văn I', 'Ngô Thị K', 'Lý Văn L', 'Võ Thị M'
    ];

    // Admin users
    mockUsers.push({
      id: 'admin_001',
      name: 'Administrator',
      phone: '0900000000',
      email: 'admin@sapharco.com',
      role: 'ADMIN',
      hub: 'Trung tâm',
      password: 'admin',
      isOnline: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Pharmacy Reps
    for (let i = 0; i < 15; i++) {
      const hub = hubs[Math.floor(Math.random() * hubs.length)];
      mockUsers.push({
        id: `rep_${String(i + 1).padStart(3, '0')}`,
        name: names[i % names.length] + ` ${i + 1}`,
        phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `rep${i + 1}@sapharco.com`,
        role: 'PHARMACY_REP',
        hub: hub,
        password: '123456',
        isOnline: Math.random() > 0.5,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Pharmacy owners
    for (let i = 0; i < 20; i++) {
      const hub = hubs[Math.floor(Math.random() * hubs.length)];
      mockUsers.push({
        id: `pharmacy_${String(i + 1).padStart(3, '0')}`,
        name: `Nhà thuốc ${names[i % names.length]}`,
        phone: `08${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `pharmacy${i + 1}@sapharco.com`,
        role: 'PHARMACY',
        hub: hub,
        password: '123456',
        isOnline: Math.random() > 0.7,
        lastLogin: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Delivery users
    for (let i = 0; i < 10; i++) {
      mockUsers.push({
        id: `delivery_${String(i + 1).padStart(3, '0')}`,
        name: `Giao hàng ${names[i % names.length]}`,
        phone: `07${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `delivery${i + 1}@sapharco.com`,
        role: 'DELIVERY',
        hub: hubs[Math.floor(Math.random() * hubs.length)],
        password: '123456',
        isOnline: Math.random() > 0.6,
        lastLogin: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return mockUsers;
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (filterHub !== 'all') {
      filtered = filtered.filter(u => u.hub === filterHub);
    }

    setFilteredUsers(filtered);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      role: 'PHARMACY_REP',
      hub: 'Trung tâm',
      password: ''
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'PHARMACY_REP',
      hub: user.hub || 'Trung tâm',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      saveToLocalStorage('users', updated);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.role) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    let updated;
    if (editingUser) {
      updated = users.map(u => 
        u.id === editingUser.id 
          ? { 
              ...u, 
              ...formData,
              password: formData.password || u.password,
              updatedAt: new Date().toISOString()
            }
          : u
      );
    } else {
      const newUser = {
        id: `${formData.role.toLowerCase()}_${Date.now()}`,
        ...formData,
        password: formData.password || '123456',
        isOnline: false,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      updated = [...users, newUser];
    }

    setUsers(updated);
    saveToLocalStorage('users', updated);
    setShowModal(false);
    setEditingUser(null);
  };

  const getRoleLabel = (role) => {
    const labels = {
      'ADMIN': '🛡️ Admin',
      'PHARMACY_REP': '👨‍⚕️ Trình dược viên',
      'PHARMACY': '🏥 Nhà thuốc',
      'DELIVERY': '🚚 Giao hàng'
    };
    return labels[role] || role;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa đăng nhập';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isMobile = window.innerWidth < 768;

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
        <button
          onClick={handleAdd}
          style={{
            padding: isMobile ? '10px 16px' : '12px 24px',
            background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
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
          <option value="ADMIN">Admin</option>
          <option value="PHARMACY_REP">Trình dược viên</option>
          <option value="PHARMACY">Nhà thuốc</option>
          <option value="DELIVERY">Giao hàng</option>
        </select>
        <select
          value={filterHub}
          onChange={(e) => setFilterHub(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: isMobile ? '100%' : '150px'
          }}
        >
          <option value="all">Tất cả Hub</option>
          <option value="Trung tâm">Trung tâm</option>
          <option value="Củ Chi">Củ Chi</option>
          <option value="Đồng Nai">Đồng Nai</option>
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
                  background: '#1a5ca215',
                  color: '#1a5ca2',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {getRoleLabel(user.role)}
                </span>
                <span style={{
                  padding: '4px 10px',
                  background: '#e5aa4215',
                  color: '#e5aa42',
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
                    background: '#3eb4a815',
                    border: '1px solid #3eb4a8',
                    borderRadius: '8px',
                    color: '#3eb4a8',
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
            <div>Hub</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 150px 180px 120px 120px 150px 120px',
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
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{user.phone}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{user.email}</div>
                <div>
                  <span style={{
                    padding: '4px 10px',
                    background: '#1a5ca215',
                    color: '#1a5ca2',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>{user.hub}</div>
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
                      background: '#3eb4a815',
                      border: '1px solid #3eb4a8',
                      borderRadius: '6px',
                      color: '#3eb4a8',
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
                  boxSizing: 'border-box'
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
                  marginBottom: '8px'
                }}>
                  Số điện thoại *
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
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px'
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
                    boxSizing: 'border-box'
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
                  marginBottom: '8px'
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
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="PHARMACY_REP">Trình dược viên</option>
                  <option value="PHARMACY">Nhà thuốc</option>
                  <option value="DELIVERY">Giao hàng</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Hub
                </label>
                <select
                  value={formData.hub}
                  onChange={(e) => setFormData({ ...formData, hub: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Trung tâm">Trung tâm</option>
                  <option value="Củ Chi">Củ Chi</option>
                  <option value="Đồng Nai">Đồng Nai</option>
                </select>
              </div>
            </div>

            {!editingUser && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px'
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
                    boxSizing: 'border-box'
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
                  background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
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

