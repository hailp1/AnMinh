import React, { useState, useEffect } from 'react';
import customersData from '../../data/customers.json';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils/mockData';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHub, setFilterHub] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    owner: '',
    hub: 'Trung tâm',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, filterHub, customers]);

  const loadCustomers = () => {
    const stored = getFromLocalStorage('adminCustomers', null);
    if (stored) {
      setCustomers(stored);
    } else {
      setCustomers(customersData.customers || []);
      saveToLocalStorage('adminCustomers', customersData.customers || []);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterHub !== 'all') {
      filtered = filtered.filter(c => c.hub === filterHub);
    }

    setFilteredCustomers(filtered);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      code: `NT${String(customers.length + 1).padStart(3, '0')}`,
      name: '',
      address: '',
      phone: '',
      owner: '',
      hub: 'Trung tâm',
      latitude: '',
      longitude: ''
    });
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code,
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      owner: customer.owner,
      hub: customer.hub || 'Trung tâm',
      latitude: customer.latitude?.toString() || '',
      longitude: customer.longitude?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      saveToLocalStorage('adminCustomers', updated);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    let updated;
    if (editingCustomer) {
      updated = customers.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, ...formData, latitude: parseFloat(formData.latitude) || c.latitude, longitude: parseFloat(formData.longitude) || c.longitude }
          : c
      );
    } else {
      const newCustomer = {
        id: `c${String(customers.length + 1).padStart(3, '0')}`,
        ...formData,
        type: 'Nhà thuốc',
        latitude: parseFloat(formData.latitude) || 10.7769,
        longitude: parseFloat(formData.longitude) || 106.7009
      };
      updated = [...customers, newCustomer];
    }

    setCustomers(updated);
    saveToLocalStorage('adminCustomers', updated);
    setShowModal(false);
    setEditingCustomer(null);
  };

  const hubs = ['Trung tâm', 'Củ Chi', 'Đồng Nai'];

  return (
    <div style={{ padding: isMobile ? '0' : '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Quản lý khách hàng
          </h1>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#666'
          }}>
            Tổng số: {filteredCustomers.length} khách hàng
          </p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: isMobile ? '10px 16px' : '12px 24px',
            background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
            border: 'none',
            borderRadius: isMobile ? '10px' : '12px',
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
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? '10px' : '12px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: isMobile ? '16px' : '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: isMobile ? '12px' : '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: isMobile ? '1 1 100%' : '1',
            minWidth: isMobile ? '100%' : '300px',
            padding: isMobile ? '10px 14px' : '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: isMobile ? '8px' : '10px',
            fontSize: isMobile ? '13px' : '14px',
            boxSizing: 'border-box'
          }}
        />
        <select
          value={filterHub}
          onChange={(e) => setFilterHub(e.target.value)}
          style={{
            padding: isMobile ? '10px 14px' : '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: isMobile ? '8px' : '10px',
            fontSize: isMobile ? '13px' : '14px',
            cursor: 'pointer',
            flex: isMobile ? '1 1 100%' : 'none',
            minWidth: isMobile ? '100%' : '150px',
            boxSizing: 'border-box'
          }}
        >
          <option value="all">Tất cả Hub</option>
          {hubs.map(hub => (
            <option key={hub} value={hub}>{hub}</option>
          ))}
        </select>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
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
                    color: '#1a5ca2',
                    marginBottom: '4px'
                  }}>
                    {customer.code}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '8px'
                  }}>
                    {customer.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    📍 {customer.address}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    👤 {customer.owner}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  background: customer.hub === 'Củ Chi' || customer.hub === 'Đồng Nai' ? '#e5aa4215' : '#1a5ca215',
                  color: customer.hub === 'Củ Chi' || customer.hub === 'Đồng Nai' ? '#e5aa42' : '#1a5ca2',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
                  {customer.hub}
                </span>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleEdit(customer)}
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
                  onClick={() => handleDelete(customer.id)}
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
            gridTemplateColumns: '80px 120px 1fr 200px 150px 120px 120px',
            gap: '16px',
            padding: '16px 20px',
            background: '#f9fafb',
            borderBottom: '2px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '14px',
            color: '#1a1a2e'
          }}>
            <div>STT</div>
            <div>Mã</div>
            <div>Tên nhà thuốc</div>
            <div>Địa chỉ</div>
            <div>Chủ sở hữu</div>
            <div>Hub</div>
            <div>Thao tác</div>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredCustomers.map((customer, index) => (
              <div
                key={customer.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 120px 1fr 200px 150px 120px 120px',
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
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a5ca2' }}>
                  {customer.code}
                </div>
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                  {customer.name}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {customer.address.length > 30 ? customer.address.substring(0, 30) + '...' : customer.address}
                </div>
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                  {customer.owner}
                </div>
                <div>
                  <span style={{
                    padding: '4px 12px',
                    background: customer.hub === 'Củ Chi' ? '#e5aa4215' : 
                               customer.hub === 'Đồng Nai' ? '#e5aa4215' : '#1a5ca215',
                    color: customer.hub === 'Củ Chi' ? '#e5aa42' : 
                           customer.hub === 'Đồng Nai' ? '#e5aa42' : '#1a5ca2',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {customer.hub}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleEdit(customer)}
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
                    onClick={() => handleDelete(customer.id)}
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
              maxWidth: '600px',
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
              {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
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
                  Mã khách hàng
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
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
                    fontSize: '14px'
                  }}
                >
                  {hubs.map(hub => (
                    <option key={hub} value={hub}>{hub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Tên nhà thuốc *
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
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Địa chỉ *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
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
                    fontSize: '14px'
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
                  Chủ sở hữu
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Vĩ độ
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
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
                  Kinh độ
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
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
                  cursor: 'pointer'
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
                  cursor: 'pointer'
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

export default AdminCustomers;

