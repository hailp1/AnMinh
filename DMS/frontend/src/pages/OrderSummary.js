import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/LoadingStates';

const OrderSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, CONFIRMED, COMPLETED

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Assuming getAll supports filtering or we filter client-side
      const data = await ordersAPI.getAll({ userId: user.id });
      // Sort by date desc
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (filterStatus === 'ALL') return orders;
    return orders.filter(o => o.status === filterStatus);
  };

  const statusConfig = {
    'PENDING': { label: 'Chờ xác nhận', color: '#F59E0B', bg: '#FFFBEB', icon: '⏳' },
    'CONFIRMED': { label: 'Đã xác nhận', color: '#3B82F6', bg: '#EFF6FF', icon: '✅' },
    'COMPLETED': { label: 'Hoàn thành', color: '#10B981', bg: '#ECFDF5', icon: '🎉' },
    'CANCELLED': { label: 'Đã hủy', color: '#EF4444', bg: '#FEF2F2', icon: '❌' }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleOrderClick = (order) => {
    if (order.status === 'PENDING') {
      // CreateOrder component needs to handle edit mode
      // We'll use a new route /order/edit/:id
      navigate(`/order/edit/${order.id}`);
    } else {
      // View details only
      navigate(`/order/invoice/${order.id}`); // Assuming existing detail/invoice view
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải danh sách đơn hàng..." />;

  const filteredOrders = getFilteredOrders();

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        padding: '20px',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => navigate('/home')} style={{
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            width: 36,
            height: 36,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>←</button>
          <h2 style={{ margin: 0, fontSize: 18 }}>📋 Danh sách đơn hàng</h2>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Tổng đơn</div>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{orders.length}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Chờ xử lý</div>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '12px 20px',
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        overflowX: 'auto',
        display: 'flex',
        gap: 8,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: filterStatus === status ? '#F59E0B' : '#F1F5F9',
              color: filterStatus === status ? '#fff' : '#64748B',
              fontSize: 13,
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {status === 'ALL' ? 'Tất cả' : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '16px 20px' }}>
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="📭"
            title="Không có đơn hàng nào"
            subtitle="Bạn chưa có đơn hàng nào trong trạng thái này."
          />
        ) : (
          filteredOrders.map(order => {
            const status = statusConfig[order.status] || { label: order.status, color: '#666', bg: '#eee', icon: '?' };

            return (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #F1F5F9',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: status.bg,
                  color: status.color,
                  padding: '4px 12px',
                  borderRadius: '0 16px 0 12px',
                  fontSize: 11,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  {status.icon} {status.label}
                </div>

                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                  #{order.id.substring(0, 8)} • {formatDate(order.createdAt)}
                </div>

                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4, paddingRight: 80 }}>
                  {order.pharmacy?.name || 'Khách hàng ẩn'}
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
                  {order.items?.length || 0} sản phẩm
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E5E7EB', paddingTop: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B' }}>
                    {formatCurrency(order.totalAmount)}
                  </div>
                  {order.status === 'PENDING' && (
                    <div style={{
                      fontSize: 12,
                      color: '#F59E0B',
                      background: '#FFFBEB',
                      padding: '6px 12px',
                      borderRadius: 20,
                      border: '1px solid #FCD34D',
                      fontWeight: '600'
                    }}>
                      ✏️ Chỉnh sửa
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
