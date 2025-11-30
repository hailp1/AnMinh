import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pharmaciesAPI, ordersAPI, productsAPI } from '../services/api';

const StationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPharmacyData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPharmacyData = async () => {
    try {
      setLoading(true);

      // 1. Load pharmacy details
      const pharmacyData = await pharmaciesAPI.getById(id);
      setPharmacy(pharmacyData);

      if (pharmacyData) {
        // 2. Load orders history
        const orders = await ordersAPI.getAll({ pharmacyId: id });

        // Filter orders for current month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt || order.date);
          return orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear;
        });

        setOrderHistory(thisMonthOrders);

        // Calculate revenue for last 3 months
        const revenueData = [];
        for (let i = 2; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth();
          const year = date.getFullYear();

          const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt || order.date);
            return orderDate.getMonth() === month &&
              orderDate.getFullYear() === year;
          });

          const revenue = monthOrders.reduce((sum, order) => {
            // Assuming order.totalAmount exists from API, otherwise calculate from items
            return sum + (order.totalAmount || 0);
          }, 0);

          revenueData.push({
            month: date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
            revenue: revenue,
            orderCount: monthOrders.length
          });
        }

        setMonthlyRevenue(revenueData);

        // 3. Load products for recommendations
        const products = await productsAPI.getAll();
        const groups = await productsAPI.getGroups();

        // Map group names to products
        const productsWithGroups = products.map(p => {
          const group = groups.find(g => g.id === p.groupId);
          return { ...p, groupName: group?.name || 'Khác' };
        });

        // Sort by price (descending) and take top 6 as recommendation
        // In a real app, this would be a smarter recommendation algorithm
        const recommended = productsWithGroups
          .sort((a, b) => b.price - a.price)
          .slice(0, 6);

        setRecommendedProducts(recommended);
      }
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin nhà thuốc...</div>;
  }

  if (!pharmacy) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>❌ Không tìm thấy nhà thuốc</h2>
        <Link to="/home" className="btn-primary">🏠 Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="station-detail-container">
      {/* Header */}
      <div className="station-header-card" style={{ background: '#1E4A8B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 className="station-title" style={{ color: '#fff' }}>
              🏥 {pharmacy.name}
            </h1>
            <p className="station-address" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              📍 {pharmacy.address}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>
              📋 Mã: {pharmacy.code} | 📞 {pharmacy.phone}
            </p>
          </div>
          <span className="verified-badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}>
            Hub: {pharmacy.hub}
          </span>
        </div>

        <div className="station-info-grid">
          <div className="info-section">
            <h3 style={{ color: 'rgba(255, 255, 255, 0.9)' }}>👤 Chủ nhà thuốc</h3>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
              {pharmacy.owner}
            </div>
          </div>

          <div className="info-section">
            <h3 style={{ color: 'rgba(255, 255, 255, 0.9)' }}>📦 Đơn hàng tháng này</h3>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {orderHistory.length}
            </div>
          </div>

          <div className="info-section">
            <h3 style={{ color: 'rgba(255, 255, 255, 0.9)' }}>💰 Doanh thu tháng này</h3>
            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {formatCurrency(
                orderHistory.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Doanh thu 3 tháng gần nhất */}
      <div className="pricing-card" style={{ marginTop: '2rem' }}>
        <h3>📊 Doanh thu 3 tháng gần nhất</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {monthlyRevenue.map((month, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(26, 92, 162, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(26, 92, 162, 0.1)'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1E4A8B', marginBottom: '0.25rem' }}>
                  {month.month}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {month.orderCount} đơn hàng
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E4A8B' }}>
                {formatCurrency(month.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lịch sử mua hàng trong tháng */}
      <div className="pricing-card" style={{ marginTop: '2rem' }}>
        <h3>📋 Lịch sử mua hàng trong tháng</h3>
        {orderHistory.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {orderHistory.map((order, index) => (
              <div key={index} style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1E4A8B' }}>
                      Đơn hàng #{order.orderNumber || order.id?.slice(-6) || index + 1}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                      {formatDate(order.createdAt || order.date)}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1E4A8B' }}>
                    {formatCurrency(order.totalAmount || 0)}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {order.items?.length || 0} sản phẩm
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                  {order.items?.slice(0, 3).map(item => item.product?.name || item.productName).join(', ')}
                  {order.items?.length > 3 && '...'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p>Chưa có đơn hàng nào trong tháng này</p>
          </div>
        )}
      </div>

      {/* Các loại thuốc nên chào */}
      <div className="pricing-card" style={{ marginTop: '2rem' }}>
        <h3>💊 Các loại thuốc nên chào</h3>
        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Gợi ý sản phẩm để chào bán cho nhà thuốc này
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {recommendedProducts.map((product) => (
            <div key={product.id} style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.05) 0%, rgba(62, 180, 168, 0.05) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(26, 92, 162, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
              onClick={() => window.location.href = `/create-order?pharmacy=${pharmacy.id}&product=${product.id}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 92, 162, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#1E4A8B', marginBottom: '0.25rem' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {product.groupName}
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(26, 92, 162, 0.1)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#1E4A8B',
                  fontWeight: '600'
                }}>
                  {product.code}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Đơn vị: {product.unit}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1E4A8B' }}>
                  {formatCurrency(product.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link
            to={`/create-order?pharmacy=${pharmacy.id}`}
            className="btn-primary"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#F29E2E',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            📋 Tạo đơn hàng mới
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <Link
          to="/home"
          className="btn-secondary"
          style={{
            flex: 1,
            minWidth: '120px',
            textAlign: 'center',
            padding: '12px',
            background: '#f3f4f6',
            color: '#1E4A8B',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          ← Quay lại
        </Link>
        <Link
          to={`/edit-pharmacy/${pharmacy.id}`}
          className="btn-secondary"
          style={{
            flex: 1,
            minWidth: '120px',
            textAlign: 'center',
            padding: '12px',
            background: 'linear-gradient(135deg, #F29E2E, #f5c869)',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          ✏️ Cập nhật
        </Link>
        <Link
          to={`/create-order?pharmacy=${pharmacy.id}`}
          className="btn-primary"
          style={{
            flex: 1,
            minWidth: '120px',
            textAlign: 'center',
            padding: '12px',
            background: 'linear-gradient(135deg, #1E4A8B, #FBC93D)',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          📋 Tạo đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default StationDetail;
