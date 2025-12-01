import React, { useState, useEffect } from 'react';
const API_BASE = process.env.REACT_APP_API_URL || '/api';

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

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders`, {
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map API data to UI format
        const mappedOrders = data.map(order => ({
          id: order.orderNumber || order.id, // Use orderNumber if available
          realId: order.id, // Keep real ID for API calls
          customerId: order.pharmacy?.id,
          customerCode: 'NT' + (order.pharmacy?.id?.substring(0, 4) || '000'), // Mock code if missing
          customerName: order.pharmacy?.name || 'Khách lẻ',
          customerAddress: order.pharmacy?.address || '',
          customerPhone: order.pharmacy?.phone || '',
          customerHub: order.pharmacy?.hub || 'CENTRAL',
          items: order.items.map(item => ({
            productId: item.product?.id,
            productCode: item.product?.code || 'SP000',
            productName: item.product?.name || 'Sản phẩm',
            quantity: item.quantity,
            unit: item.product?.unit || 'Đơn vị',
            price: item.price || 0,
            total: (item.price || 0) * item.quantity
          })),
          subtotal: order.totalAmount, // API doesn't separate subtotal/discount yet
          discount: 0,
          totalAmount: order.totalAmount,
          status: order.status.toLowerCase(), // API uses uppercase
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          repId: order.user?.id,
          repName: order.user?.name || 'Trình dược viên',
          notes: order.notes || ''
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/${order.realId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });

      if (response.ok) {
        // Reload orders to get updated status
        loadOrders();
      } else {
        alert('Lỗi khi cập nhật trạng thái đơn hàng');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Lỗi khi cập nhật trạng thái đơn hàng');
    }
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
                      color: '#1E4A8B'
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
                        background: '#FBC93D15',
                        border: '1px solid #FBC93D',
                        borderRadius: '6px',
                        color: '#FBC93D',
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
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E4A8B' }}>{selectedOrder.customerCode}</div>
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
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1E4A8B', fontWeight: '600' }}>{item.productCode}</td>
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

