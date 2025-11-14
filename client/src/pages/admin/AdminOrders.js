import React, { useState, useEffect } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils/mockData';
import customersData from '../../data/customers.json';
import productsData from '../../data/products.json';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHub, setFilterHub] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, filterStatus, filterHub, orders]);

  const loadOrders = () => {
    // Generate mock orders if none exist
    let storedOrders = getFromLocalStorage('adminOrders', []);
    
    if (storedOrders.length === 0) {
      storedOrders = generateMockOrders();
      saveToLocalStorage('adminOrders', storedOrders);
    }
    
    setOrders(storedOrders);
  };

  const generateMockOrders = () => {
    const customers = customersData.customers || [];
    const allProducts = productsData.productGroups?.flatMap(g => g.products) || [];
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const mockOrders = [];

    for (let i = 0; i < 50; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const itemCount = Math.floor(Math.random() * 5) + 1;
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = allProducts[Math.floor(Math.random() * allProducts.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const price = product.price || Math.floor(Math.random() * 50000) + 10000;
        const itemTotal = price * quantity;
        subtotal += itemTotal;

        items.push({
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          quantity: quantity,
          unit: product.unit || 'Vĩ',
          price: price,
          total: itemTotal
        });
      }

      const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0;
      const totalAmount = subtotal - discount;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      mockOrders.push({
        id: `ORD${String(i + 1).padStart(5, '0')}`,
        customerId: customer.id,
        customerCode: customer.code,
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        customerHub: customer.hub,
        items: items,
        subtotal: subtotal,
        discount: discount,
        totalAmount: totalAmount,
        status: status,
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
        repId: `rep${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
        repName: `Trình dược viên ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}`,
        notes: Math.random() > 0.8 ? 'Giao hàng trong giờ hành chính' : ''
      });
    }

    return mockOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerPhone.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    if (filterHub !== 'all') {
      filtered = filtered.filter(o => o.customerHub === filterHub);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map(o => 
      o.id === orderId 
        ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
        : o
    );
    setOrders(updated);
    saveToLocalStorage('adminOrders', updated);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#d97706', label: 'Chờ xác nhận' },
      confirmed: { bg: '#dbeafe', text: '#2563eb', label: 'Đã xác nhận' },
      processing: { bg: '#e0e7ff', text: '#6366f1', label: 'Đang xử lý' },
      shipped: { bg: '#d1fae5', text: '#059669', label: 'Đã giao hàng' },
      delivered: { bg: '#d1fae5', text: '#10b981', label: 'Hoàn thành' },
      cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Đã hủy' }
    };
    return colors[status] || colors.pending;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
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
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Quản lý đơn hàng
          </h1>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#666'
          }}>
            Tổng số: {filteredOrders.length} đơn hàng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? '10px' : '12px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: isMobile ? '16px' : '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo mã đơn, tên KH, SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '300px',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px'
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đã giao hàng</option>
          <option value="delivered">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select
          value={filterHub}
          onChange={(e) => setFilterHub(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="all">Tất cả Hub</option>
          <option value="Trung tâm">Trung tâm</option>
          <option value="Củ Chi">Củ Chi</option>
          <option value="Đồng Nai">Đồng Nai</option>
        </select>
      </div>

      {/* Orders List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {filteredOrders.map(order => {
          const statusColor = getStatusColor(order.status);
          return (
            <div
              key={order.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${statusColor.bg}`,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onClick={() => handleViewDetails(order)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a5ca2'
                    }}>
                      {order.id}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      background: statusColor.bg,
                      color: statusColor.text,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {statusColor.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '4px'
                  }}>
                    {order.customerName}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    📍 {order.customerAddress}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <span>📞 {order.customerPhone}</span>
                    <span>🏢 {order.customerHub}</span>
                    <span>👨‍⚕️ {order.repName}</span>
                  </div>
                </div>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#10b981',
                    marginBottom: '4px'
                  }}>
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    {formatDate(order.createdAt)}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginTop: '8px'
                  }}>
                    {order.items.length} sản phẩm
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{
                display: 'flex',
                gap: '8px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, 'confirmed');
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#3eb4a815',
                        border: '1px solid #3eb4a8',
                        borderRadius: '6px',
                        color: '#3eb4a8',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Xác nhận
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, 'cancelled');
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Hủy đơn
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'processing');
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#e0e7ff',
                      border: '1px solid #6366f1',
                      borderRadius: '6px',
                      color: '#6366f1',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ⚙️ Xử lý
                  </button>
                )}
                {order.status === 'processing' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'shipped');
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#d1fae5',
                      border: '1px solid #059669',
                      borderRadius: '6px',
                      color: '#059669',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🚚 Giao hàng
                  </button>
                )}
                {order.status === 'shipped' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'delivered');
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#d1fae5',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      color: '#10b981',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Hoàn thành
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(order);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    color: '#1a1a2e',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  👁️ Chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
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
              padding: '32px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1a1a2e'
              }}>
                Chi tiết đơn hàng {selectedOrder.id}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#1a1a2e'
              }}>
                Thông tin khách hàng
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tên</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{selectedOrder.customerName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Mã KH</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a5ca2' }}>{selectedOrder.customerCode}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Số điện thoại</div>
                  <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{selectedOrder.customerPhone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Hub</div>
                  <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{selectedOrder.customerHub}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Địa chỉ</div>
                  <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{selectedOrder.customerAddress}</div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={{
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#1a1a2e'
              }}>
                Sản phẩm ({selectedOrder.items.length})
              </h3>
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Mã SP</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Tên sản phẩm</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>SL</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Đơn giá</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1a5ca2', fontWeight: '600' }}>{item.productCode}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1a1a2e' }}>{item.productName}</td>
                        <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#1a1a2e' }}>{item.quantity} {item.unit}</td>
                        <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#666' }}>{formatCurrency(item.price)}</td>
                        <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontWeight: '600', color: '#1a1a2e' }}>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Tạm tính:</span>
                <span style={{ fontSize: '14px', color: '#1a1a2e' }}>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Giảm giá:</span>
                  <span style={{ fontSize: '14px', color: '#dc2626' }}>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '2px solid #e5e7eb',
                marginTop: '12px'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>Tổng cộng:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {selectedOrder.notes && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#92400e'
              }}>
                <strong>Ghi chú:</strong> {selectedOrder.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

