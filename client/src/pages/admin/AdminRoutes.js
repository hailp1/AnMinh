import React, { useState, useEffect } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils/mockData';
import customersData from '../../data/customers.json';

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    repId: '',
    customerIds: [],
    startDate: '',
    endDate: '',
    status: 'active'
  });
  const [customers, setCustomers] = useState([]);
  const [reps, setReps] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedRoutes = getFromLocalStorage('adminRoutes', []);
    setRoutes(storedRoutes);

    const allCustomers = customersData.customers || [];
    setCustomers(allCustomers);

    const allUsers = getFromLocalStorage('users', []);
    const pharmacyReps = allUsers.filter(u => u.role === 'PHARMACY_REP');
    setReps(pharmacyReps);
  };

  const handleAdd = () => {
    setEditingRoute(null);
    setFormData({
      name: '',
      repId: '',
      customerIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      repId: route.repId,
      customerIds: route.customerIds || [],
      startDate: route.startDate || new Date().toISOString().split('T')[0],
      endDate: route.endDate || '',
      status: route.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa lộ trình này?')) {
      const updated = routes.filter(r => r.id !== id);
      setRoutes(updated);
      saveToLocalStorage('adminRoutes', updated);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.repId || formData.customerIds.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    let updated;
    if (editingRoute) {
      updated = routes.map(r => 
        r.id === editingRoute.id 
          ? { ...r, ...formData }
          : r
      );
    } else {
      const newRoute = {
        id: `route_${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString()
      };
      updated = [...routes, newRoute];
    }

    setRoutes(updated);
    saveToLocalStorage('adminRoutes', updated);
    setShowModal(false);
    setEditingRoute(null);
  };

  const toggleCustomer = (customerId) => {
    const isSelected = formData.customerIds.includes(customerId);
    if (isSelected) {
      setFormData({
        ...formData,
        customerIds: formData.customerIds.filter(id => id !== customerId)
      });
    } else {
      setFormData({
        ...formData,
        customerIds: [...formData.customerIds, customerId]
      });
    }
  };

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
            Quản lý lộ trình
          </h1>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#666'
          }}>
            Tổng số: {routes.length} lộ trình
          </p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>➕</span>
          <span>Tạo lộ trình</span>
        </button>
      </div>

      {/* Routes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {routes.map(route => {
          const rep = reps.find(r => r.id === route.repId);
          const routeCustomers = customers.filter(c => route.customerIds?.includes(c.id));
          
          return (
            <div
              key={route.id}
              style={{
                background: '#fff',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '16px' : '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${route.status === 'active' ? '#10b981' : '#e5e7eb'}`
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: isMobile ? '12px' : '16px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '8px'
                  }}>
                    {route.name}
                  </h3>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    👨‍⚕️ {rep?.name || 'Chưa chọn'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    📅 {route.startDate} {route.endDate ? `- ${route.endDate}` : ''}
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  background: route.status === 'active' ? '#10b98115' : '#e5e7eb',
                  color: route.status === 'active' ? '#10b981' : '#666',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {route.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>

              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  Khách hàng ({routeCustomers.length})
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#1a1a2e',
                  maxHeight: '100px',
                  overflowY: 'auto'
                }}>
                  {routeCustomers.slice(0, 3).map(c => (
                    <div key={c.id} style={{ marginBottom: '4px' }}>
                      • {c.name}
                    </div>
                  ))}
                  {routeCustomers.length > 3 && (
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      +{routeCustomers.length - 3} khách hàng khác
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleEdit(route)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#3eb4a815',
                    border: '1px solid #3eb4a8',
                    borderRadius: '8px',
                    color: '#3eb4a8',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(route.id)}
                  style={{
                    padding: '10px 16px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {routes.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Chưa có lộ trình nào
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '24px'
          }}>
            Tạo lộ trình mới để bắt đầu quản lý
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ➕ Tạo lộ trình đầu tiên
          </button>
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
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              {editingRoute ? 'Chỉnh sửa lộ trình' : 'Tạo lộ trình mới'}
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Tên lộ trình *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Lộ trình Quận 5 - Tháng 1/2024"
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
                Trình dược viên *
              </label>
              <select
                value={formData.repId}
                onChange={(e) => setFormData({ ...formData, repId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Chọn trình dược viên</option>
                {reps.map(rep => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name} - {rep.hub}
                  </option>
                ))}
              </select>
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
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Chọn khách hàng * ({formData.customerIds.length} đã chọn)
              </label>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {customers.map(customer => (
                  <label
                    key={customer.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      background: formData.customerIds.includes(customer.id) 
                        ? '#3eb4a815' 
                        : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.customerIds.includes(customer.id)}
                      onChange={() => toggleCustomer(customer.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1a1a2e'
                      }}>
                        {customer.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        {customer.code} - {customer.hub}
                      </div>
                    </div>
                  </label>
                ))}
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

export default AdminRoutes;

