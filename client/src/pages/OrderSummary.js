import React, { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OrderSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { orders = [], totalAmount = 0 } = location.state || {};

  // Tính tổng số đơn hàng
  const totalOrders = orders.length;
  
  // Tính tổng số sản phẩm
  const totalItems = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.items.length, 0);
  }, [orders]);

  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // In đơn hàng
  const handlePrint = () => {
    window.print();
  };

  // Quay lại
  const handleBack = () => {
    // Lấy customer từ đơn hàng đầu tiên để truyền lại
    const firstOrder = orders[0];
    const customer = firstOrder?.customer;
    
    navigate('/create-order', {
      state: {
        customer: customer,
        keepCustomer: true // Flag để giữ customer khi quay lại
      }
    });
  };
  
  // Tạo đơn hàng mới cho cùng khách hàng
  const handleNewOrder = () => {
    const firstOrder = orders[0];
    const customer = firstOrder?.customer;
    
    navigate('/create-order', {
      state: {
        customer: customer,
        keepCustomer: true,
        newOrder: true // Flag để tạo đơn mới
      }
    });
  };

  if (orders.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1a1a2e' }}>
            Không có đơn hàng nào
          </h2>
          <button 
            onClick={handleBack} 
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
      paddingBottom: '100px'
    }}>
      {/* Mobile Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '15px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/home" style={{ fontSize: '24px', textDecoration: 'none', color: '#1a5ca2' }}>
          ←
        </Link>
        <h1 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          margin: 0,
          color: '#1a5ca2',
          flex: 1,
          textAlign: 'center'
        }}>
          📋 Tổng Kết Đơn Hàng
        </h1>
        <div style={{ width: '24px' }}></div>
      </div>

      <div className="order-summary-container" style={{ 
        padding: '15px',
        maxWidth: '800px', 
        margin: '0 auto'
      }}>
        {/* Header với Logo - Mobile Optimized */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          background: '#fff',
          borderRadius: '16px',
          padding: '20px 15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <img 
            src="/image/logo.png" 
            alt="Logo" 
            style={{
              maxWidth: '120px',
              height: 'auto',
              marginBottom: '12px'
            }}
          />
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: '8px 0',
            color: '#1a5ca2'
          }}>
            Sapharco Sales
          </h1>
          <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
            HÓA ĐƠN BÁN HÀNG
          </p>
          <div style={{ 
            fontSize: '11px', 
            color: '#666',
            lineHeight: '1.6'
          }}>
            <div>📅 {new Date().toLocaleDateString('vi-VN')}</div>
            <div>🕐 {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
            {user && (
              <div style={{ marginTop: '5px' }}>
                👨‍⚕️ {user.name}
              </div>
            )}
          </div>
        </div>

        {/* Danh sách đơn hàng theo khách hàng */}
        {orders.map((order, orderIndex) => {
          const customer = order.customer;
          const items = order.items;
          const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          return (
            <div 
              key={orderIndex}
              style={{
                marginBottom: '20px',
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {/* Thông tin khách hàng - Mobile Card */}
              <div style={{
                background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                color: '#fff',
                padding: '16px'
              }}>
                <h2 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  🏥 {customer.name}
                  {customer.code && (
                    <span style={{ 
                      fontSize: '12px', 
                      marginLeft: '8px', 
                      opacity: 0.9,
                      display: 'block',
                      marginTop: '4px'
                    }}>
                      ({customer.code})
                    </span>
                  )}
                </h2>
                <div style={{ fontSize: '13px', opacity: 0.95, lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '6px' }}>
                    📍 {customer.address}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    📞 {customer.phone}
                  </div>
                  {customer.owner && (
                    <div>
                      👤 {customer.owner}
                    </div>
                  )}
                </div>
              </div>

              {/* Sản phẩm - Card Layout cho Mobile */}
              <div style={{ padding: '15px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1a5ca2',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  📦 Danh sách sản phẩm ({items.length} sản phẩm)
                </div>

                {/* Mobile Card Layout - Thay thế table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#f9fafb',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '13px',
                            color: '#666',
                            marginBottom: '4px'
                          }}>
                            #{itemIndex + 1} • {item.productGroup}
                          </div>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1a1a2e',
                            marginBottom: '4px'
                          }}>
                            {item.productName}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#1a5ca2',
                            fontWeight: '600',
                            marginBottom: '6px'
                          }}>
                            🆔 {item.productCode || 'N/A'} | 📦 {item.unit}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '8px',
                        borderTop: '1px solid #e5e7eb',
                        marginTop: '8px'
                      }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <div>Đơn giá: {item.price.toLocaleString('vi-VN')}đ</div>
                          <div style={{ marginTop: '4px' }}>
                            Số lượng: <strong style={{ color: '#1a5ca2' }}>{item.quantity}</strong>
                          </div>
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1a5ca2',
                          textAlign: 'right'
                        }}>
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng tiền đơn hàng - Mobile */}
                <div style={{
                  marginTop: '16px',
                  padding: '15px',
                  background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
                  borderRadius: '12px',
                  border: '2px solid #1a5ca2'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }}>
                      Tổng tiền đơn hàng:
                    </div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      color: '#1a5ca2'
                    }}>
                      {formatCurrency(orderTotal)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Tổng kết chung - Mobile */}
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
          borderRadius: '16px',
          border: '2px solid #1a5ca2',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Tổng số đơn hàng:</span>
              <strong style={{ color: '#1a5ca2' }}>{totalOrders}</strong>
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Tổng số sản phẩm:</span>
              <strong style={{ color: '#1a5ca2' }}>{totalItems}</strong>
            </div>
          </div>
          <div style={{
            paddingTop: '15px',
            borderTop: '2px solid #1a5ca2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
              Tổng giá trị:
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1a5ca2'
            }}>
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        {/* Câu cảm ơn khách hàng - Mobile */}
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(62, 180, 168, 0.1), rgba(229, 170, 66, 0.1))',
          borderRadius: '16px',
          border: '2px solid #3eb4a8',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>
            🙏
          </div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#1a5ca2',
            marginBottom: '10px'
          }}>
            Cảm ơn Quý Khách Hàng!
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '8px'
          }}>
            Chúng tôi chân thành cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ của Sapharco Sales.
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            lineHeight: '1.6'
          }}>
            Chúc Quý khách sức khỏe và thành công trong công việc!
          </p>
        </div>

        {/* Footer - Mobile */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          paddingTop: '15px',
          borderTop: '1px solid rgba(255,255,255,0.3)',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '11px',
          lineHeight: '1.6'
        }}>
          <p>Cảm ơn quý khách đã sử dụng dịch vụ của Sapharco Sales</p>
          <p>© 2024 Sapharco Sales - Hệ thống quản lý bán hàng</p>
        </div>
      </div>

      {/* Sticky Action Buttons - Mobile */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        padding: '12px 15px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        zIndex: 100,
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={handlePrint}
          style={{
            flex: 1,
            padding: '14px',
            background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            touchAction: 'manipulation',
            boxShadow: '0 2px 8px rgba(26, 92, 162, 0.3)'
          }}
        >
          🖨️ In
        </button>
        <button
          onClick={handleNewOrder}
          style={{
            flex: 1,
            padding: '14px',
            background: 'linear-gradient(135deg, #3eb4a8, #e5aa42)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            touchAction: 'manipulation',
            boxShadow: '0 2px 8px rgba(62, 180, 168, 0.3)'
          }}
        >
          ➕ Đơn Mới
        </button>
        <button
          onClick={handleBack}
          style={{
            flex: 1,
            padding: '14px',
            background: '#f3f4f6',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          ← Về
        </button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .order-summary-container, .order-summary-container * {
            visibility: visible;
          }
          .order-summary-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #fff;
            padding: 20px;
          }
          button {
            display: none !important;
          }
        }
        
        /* Desktop: Hiển thị table */
        @media (min-width: 768px) {
          .order-summary-container {
            padding: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSummary;
