import React, { useState, useEffect } from 'react';
import ImportModal from '../../components/ImportModal';
const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AdminOrders = () => {
  // States
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
    calculateStats();
  }, [searchTerm, filterStatus, orders]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders`, {
        headers: { 'x-auth-token': token }
      });

      if (response.ok) {
        const data = await response.json();
        const mappedOrders = data.map(order => ({
          id: order.orderNumber || order.id,
          realId: order.id,
          customerId: order.pharmacy?.id,
          customerCode: order.pharmacy?.code || 'N/A',
          customerName: order.pharmacy?.name || 'Khách lẻ',
          customerAddress: order.pharmacy?.address || '',
          customerPhone: order.pharmacy?.phone || '',
          customerHub: order.pharmacy?.territory?.businessUnit?.name || 'N/A',
          items: order.items.map(item => ({
            productId: item.product?.id,
            productCode: item.product?.code || 'SP000',
            productName: item.product?.name || 'Sản phẩm',
            quantity: item.quantity,
            unit: item.product?.unit || 'Đơn vị',
            price: item.price || 0,
            total: (item.price || 0) * item.quantity
          })),
          subtotal: order.totalAmount,
          discount: 0,
          totalAmount: order.totalAmount,
          status: order.status.toLowerCase(),
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

    setFilteredOrders(filtered);
  };

  const calculateStats = () => {
    const newStats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    setStats(newStats);
  };

  const initiateStatusChange = (order, newStatus) => {
    setPendingAction({ order, newStatus });
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingAction) return;

    try {
      const { order, newStatus } = pendingAction;
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
        setShowConfirmModal(false);
        setPendingAction(null);
        loadOrders();
        alert('✅ Cập nhật trạng thái thành công!');
      } else {
        alert('❌ Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: '#fef3c7',
        text: '#d97706',
        label: 'Chờ xác nhận',
        icon: '⏱️',
        nextAction: 'Xác nhận đơn hàng',
        nextStatus: 'confirmed'
      },
      confirmed: {
        bg: '#dbeafe',
        text: '#2563eb',
        label: 'Đã xác nhận',
        icon: '✓',
        nextAction: 'Bắt đầu xử lý',
        nextStatus: 'processing'
      },
      processing: {
        bg: '#e0e7ff',
        text: '#6366f1',
        label: 'Đang xử lý',
        icon: '⚙️',
        nextAction: 'Giao hàng',
        nextStatus: 'shipped'
      },
      shipped: {
        bg: '#d1fae5',
        text: '#059669',
        label: 'Đã giao hàng',
        icon: '🚚',
        nextAction: 'Xác nhận hoàn thành',
        nextStatus: 'delivered'
      },
      delivered: {
        bg: '#d1fae5',
        text: '#10b981',
        label: 'Hoàn thành',
        icon: '🎉',
        nextAction: null,
        nextStatus: null
      },
      cancelled: {
        bg: '#fee2e2',
        text: '#dc2626',
        label: 'Đã hủy',
        icon: '✕',
        nextAction: null,
        nextStatus: null
      }
    };
    return configs[status] || configs.pending;
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

  const getStatusSteps = () => {
    return [
      { key: 'pending', label: 'Chờ XN', icon: '⏱️' },
      { key: 'confirmed', label: 'Đã XN', icon: '✓' },
      { key: 'processing', label: 'Xử lý', icon: '⚙️' },
      { key: 'shipped', label: 'Giao hàng', icon: '🚚' },
      { key: 'delivered', label: 'Hoàn thành', icon: '🎉' }
    ];
  };

  const getStatusStepIndex = (status) => {
    const steps = getStatusSteps();
    return steps.findIndex(s => s.key === status);
  };

  return (
    <div style={{ padding: '0', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E4A8B 0%, #2563eb 100%)',
        padding: isMobile ? '20px' : '32px',
        color: '#fff'
      }}>
        <h1 style={{
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: '700',
          marginBottom: '8px',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          📦 Quản lý Đơn hàng
        </h1>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              padding: '10px 16px',
              background: '#fff',
              color: '#1E4A8B',
              border: '2px solid #fff',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📥 Import
          </button>
        </div>
        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          opacity: 0.9
        }}>
          Theo dõi và xử lý đơn hàng một cách thông minh
        </p>
      </div>

      {/* Stats Dashboard */}
      <div style={{
        padding: isMobile ? '16px' : '24px',
        marginTop: '-40px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <StatCard
            title="Tổng đơn"
            value={stats.total}
            icon="📊"
            color="#3b82f6"
            onClick={() => setFilterStatus('all')}
          />
          <StatCard
            title="Chờ xác nhận"
            value={stats.pending}
            icon="⏱️"
            color="#f59e0b"
            onClick={() => setFilterStatus('pending')}
            highlight={stats.pending > 0}
          />
          <StatCard
            title="Đang xử lý"
            value={stats.confirmed + stats.processing}
            icon="⚙️"
            color="#6366f1"
            onClick={() => setFilterStatus('confirmed')}
          />
          <StatCard
            title="Hoàn thành"
            value={stats.delivered}
            icon="✅"
            color="#10b981"
            onClick={() => setFilterStatus('delivered')}
          />
        </div>

        {/* Filters */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: isMobile ? '16px' : '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '15px',
              cursor: 'pointer',
              background: '#fff',
              fontWeight: '500'
            }}
          >
            <option value="all">📋 Tất cả trạng thái</option>
            <option value="pending">⏱️ Chờ xác nhận ({stats.pending})</option>
            <option value="confirmed">✓ Đã xác nhận ({stats.confirmed})</option>
            <option value="processing">⚙️ Đang xử lý ({stats.processing})</option>
            <option value="shipped">🚚 Đã giao ({stats.shipped})</option>
            <option value="delivered">🎉 Hoàn thành ({stats.delivered})</option>
            <option value="cancelled">✕ Đã hủy ({stats.cancelled})</option>
          </select>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const currentStep = getStatusStepIndex(order.status);

            return (
              <div
                key={order.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: isMobile ? '16px' : '24px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${statusConfig.text}`,
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                }}
              >
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1E4A8B'
                      }}>
                        {order.id}
                      </span>
                      <span style={{
                        padding: '6px 14px',
                        background: statusConfig.bg,
                        color: statusConfig.text,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>{statusConfig.icon}</span>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>
                      {order.customerName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      📍 {order.customerAddress}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#10b981',
                      marginBottom: '4px'
                    }}>
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Status Stepper */}
                {order.status !== 'cancelled' && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {getStatusSteps().map((step, index) => (
                        <React.Fragment key={step.key}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1
                          }}>
                            <div style={{
                              width: isMobile ? '32px' : '40px',
                              height: isMobile ? '32px' : '40px',
                              borderRadius: '50%',
                              background: index <= currentStep ? '#10b981' : '#e5e7eb',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: isMobile ? '16px' : '18px',
                              fontWeight: '600',
                              marginBottom: '6px',
                              transition: 'all 0.3s'
                            }}>
                              {index <= currentStep ? step.icon : index + 1}
                            </div>
                            {!isMobile && (
                              <div style={{
                                fontSize: '11px',
                                color: index <= currentStep ? '#10b981' : '#999',
                                fontWeight: index === currentStep ? '600' : '400',
                                textAlign: 'center'
                              }}>
                                {step.label}
                              </div>
                            )}
                          </div>
                          {index < getStatusSteps().length - 1 && (
                            <div style={{
                              flex: 1,
                              height: '3px',
                              background: index < currentStep ? '#10b981' : '#e5e7eb',
                              marginBottom: isMobile ? '0' : '20px',
                              transition: 'all 0.3s'
                            }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Details Summary */}
                <div style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>👨‍⚕️ TDV: <strong>{order.repName}</strong></span>
                    <span>📦 {order.items.length} sản phẩm</span>
                  </div>
                  {statusConfig.nextAction && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#fff',
                      border: '2px dashed #3b82f6',
                      borderRadius: '6px',
                      color: '#3b82f6',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      💡 Bước tiếp theo: {statusConfig.nextAction}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {statusConfig.nextStatus && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        initiateStatusChange(order, statusConfig.nextStatus);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: statusConfig.text,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minWidth: '150px'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      ▶ {statusConfig.nextAction}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    style={{
                      padding: '12px 20px',
                      background: '#f3f4f6',
                      color: '#1a1a2e',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minWidth: '120px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e5e7eb';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f3f4f6';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    👁️ Chi tiết
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        initiateStatusChange(order, 'cancelled');
                      }}
                      style={{
                        padding: '12px 20px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '2px solid #fecaca',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minWidth: '100px'
                      }}
                    >
                      ✕ Hủy
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>
                Không tìm thấy đơn hàng
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có đơn hàng nào'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingAction && (
        <ConfirmationModal
          order={pendingAction.order}
          newStatus={pendingAction.newStatus}
          onConfirm={confirmStatusChange}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingAction(null);
          }}
          getStatusConfig={getStatusConfig}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Detail Modal (existing) */}
      {showModal && selectedOrder && (
        <DetailModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        endpoint="orders"
        title="Import Đơn Hàng"
        onSuccess={() => {
          loadOrders();
          setShowImportModal(false);
        }}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, onClick, highlight }) => (
  <div
    onClick={onClick}
    style={{
      background: highlight ? `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)` : '#fff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: highlight ? `0 4px 12px ${color}30` : '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: highlight ? `2px solid ${color}` : '2px solid transparent',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 16px ${color}40`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = highlight ? `0 4px 12px ${color}30` : '0 2px 4px rgba(0,0,0,0.1)';
    }}
  >
    <div style={{ fontSize: '32px', marginBottom: '8px', animation: highlight ? 'pulse 2s infinite' : 'none' }}>
      {icon}
    </div>
    <div style={{ fontSize: '28px', fontWeight: '700', color: color, marginBottom: '4px' }}>
      {value}
    </div>
    <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
      {title}
    </div>
    {highlight && value > 0 && (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: color,
        animation: 'blink 1s infinite'
      }} />
    )}
  </div>
);

// Confirmation Modal Component
const ConfirmationModal = ({ order, newStatus, onConfirm, onCancel, getStatusConfig, formatCurrency }) => {
  const currentConfig = getStatusConfig(order.status);
  const nextConfig = getStatusConfig(newStatus);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          fontSize: '48px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          {newStatus === 'cancelled' ? '⚠️' : '🔄'}
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '8px',
          color: '#1a1a2e'
        }}>
          {newStatus === 'cancelled' ? 'Xác nhận hủy đơn?' : 'Xác nhận cập nhật trạng thái?'}
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          Vui lòng xem lại thông tin đơn hàng trước khi tiếp tục
        </p>

        {/* Order Summary */}
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Mã đơn hàng</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1E4A8B' }}>{order.id}</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Khách hàng</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{order.customerName}</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tổng tiền</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
              {formatCurrency(order.totalAmount)}
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Số sản phẩm</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{order.items.length} sản phẩm</div>
          </div>
        </div>

        {/* Status Change Arrow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '8px 16px',
            background: currentConfig.bg,
            color: currentConfig.text,
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {currentConfig.label}
          </div>
          <div style={{ fontSize: '24px' }}>→</div>
          <div style={{
            padding: '8px 16px',
            background: nextConfig.bg,
            color: nextConfig.text,
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {nextConfig.label}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f3f4f6',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#1a1a2e',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
            onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px',
              background: newStatus === 'cancelled' ? '#dc2626' : '#10b981',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#fff',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {newStatus === 'cancelled' ? 'Xác nhận hủy' : 'Xác nhận cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Detail Modal Component (condensed from original)
const DetailModal = ({ order, onClose, formatCurrency, formatDate }) => (
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
    onClick={onClose}
  >
    <div
      style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '32px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e' }}>
          Chi tiết đơn hàng {order.id}
        </h2>
        <button
          onClick={onClose}
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
      <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a2e' }}>
          Thông tin khách hàng
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tên</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{order.customerName}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Mã KH</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E4A8B' }}>{order.customerCode}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Số điện thoại</div>
            <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{order.customerPhone}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Hub</div>
            <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{order.customerHub}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Địa chỉ</div>
            <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{order.customerAddress}</div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a2e' }}>
          Sản phẩm ({order.items.length})
        </h3>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
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
              {order.items.map((item, index) => (
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
      <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>Tổng cộng:</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {order.notes && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          <strong>Ghi chú:</strong> {order.notes}
        </div>
      )}
    </div>
  </div>
);

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

export default AdminOrders;
