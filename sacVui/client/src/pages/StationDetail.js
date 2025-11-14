import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customersData from '../data/customers.json';
import productsData from '../data/products.json';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/mockData';

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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Tìm nhà thuốc theo ID
    const pharmacyData = customersData?.customers?.find(c => c.id === id);
    
    if (pharmacyData) {
      setPharmacy(pharmacyData);
      
      // Load lịch sử đơn hàng (mock data từ localStorage)
      const orders = getFromLocalStorage('orders', []);
      const pharmacyOrders = orders.filter(order => 
        order.customer && order.customer.id === id
      );
      
      // Lọc đơn hàng trong tháng hiện tại
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthOrders = pharmacyOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      });
      
      setOrderHistory(thisMonthOrders);
      
      // Tính doanh thu 3 tháng gần nhất
      const revenueData = [];
      for (let i = 2; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const monthOrders = pharmacyOrders.filter(order => {
          const orderDate = new Date(order.createdAt || order.date);
          return orderDate.getMonth() === month && 
                 orderDate.getFullYear() === year;
        });
        
        const revenue = monthOrders.reduce((sum, order) => {
          const orderTotal = order.items?.reduce((itemSum, item) => 
            itemSum + (item.price * item.quantity), 0) || 0;
          return sum + orderTotal;
        }, 0);
        
        revenueData.push({
          month: date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
          revenue: revenue,
          orderCount: monthOrders.length
        });
      }
      
      setMonthlyRevenue(revenueData);
      
      // Gợi ý thuốc nên chào (lấy từ products.json)
      // Ưu tiên các nhóm sản phẩm phổ biến
      const allProducts = productsData?.productGroups?.flatMap(group => 
        group.products.map(product => ({
          ...product,
          groupName: group.name
        }))
      ) || [];
      
      // Sắp xếp theo giá và chọn top 6 sản phẩm
      const recommended = allProducts
        .sort((a, b) => b.price - a.price)
        .slice(0, 6);
      
      setRecommendedProducts(recommended);
    }
    
    setLoading(false);
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
      <div className="station-header-card" style={{ background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 100%)' }}>
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
                orderHistory.reduce((sum, order) => {
                  const orderTotal = order.items?.reduce((itemSum, item) => 
                    itemSum + (item.price * item.quantity), 0) || 0;
                  return sum + orderTotal;
                }, 0)
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
                <div style={{ fontWeight: '600', color: '#1a5ca2', marginBottom: '0.25rem' }}>
                  {month.month}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {month.orderCount} đơn hàng
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a5ca2' }}>
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
                    <div style={{ fontWeight: '600', color: '#1a5ca2' }}>
                      Đơn hàng #{order.id?.slice(-6) || index + 1}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                      {formatDate(order.createdAt || order.date)}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a5ca2' }}>
                    {formatCurrency(
                      order.items?.reduce((sum, item) => 
                        sum + (item.price * item.quantity), 0) || 0
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {order.items?.length || 0} sản phẩm
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                  {order.items?.slice(0, 3).map(item => item.productName).join(', ')}
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
                  <div style={{ fontWeight: '600', color: '#1a5ca2', marginBottom: '0.25rem' }}>
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
                  color: '#1a5ca2',
                  fontWeight: '600'
                }}>
                  {product.code}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Đơn vị: {product.unit}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1a5ca2' }}>
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
              background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
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
            color: '#1a5ca2',
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
            background: 'linear-gradient(135deg, #e5aa42, #f5c869)',
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
            background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
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
