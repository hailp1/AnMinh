import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Không có đơn hàng nào</h2>
        <button onClick={handleBack} style={{
          padding: '10px 20px',
          backgroundColor: '#007AFF',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="order-summary-container" style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#fff'
    }}>
      {/* Header với Logo */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        borderBottom: '2px solid #eee',
        paddingBottom: '20px'
      }}>
        <img 
          src="/image/logo.png" 
          alt="Logo" 
          style={{
            maxWidth: '150px',
            height: 'auto',
            marginBottom: '15px'
          }}
        />
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>
          Sapharco Sales
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          HÓA ĐƠN BÁN HÀNG
        </p>
        <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
          Ngày: {new Date().toLocaleDateString('vi-VN')} | 
          Giờ: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        {user && (
          <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
            Trình dược viên: {user.name}
          </p>
        )}
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
              marginBottom: '40px',
              pageBreakInside: 'avoid',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fafafa'
            }}
          >
            {/* Thông tin khách hàng */}
            <div style={{
              backgroundColor: '#1a5ca2',
              color: '#fff',
              padding: '15px',
              borderRadius: '8px 8px 0 0',
              margin: '-20px -20px 20px -20px'
            }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>
                🏥 {customer.name}
                {customer.code && <span style={{ fontSize: '14px', marginLeft: '10px', opacity: 0.9 }}>({customer.code})</span>}
              </h2>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                <div style={{ marginBottom: '5px' }}>
                  📍 {customer.address}
                </div>
                <div>
                  📞 {customer.phone}
                </div>
                {customer.owner && (
                  <div style={{ marginTop: '5px' }}>
                    👤 Chủ nhà thuốc: {customer.owner}
                  </div>
                )}
              </div>
            </div>

            {/* Bảng sản phẩm */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '20px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #ddd',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    STT
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #ddd',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Nhóm SP
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #ddd',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Mã SP
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #ddd',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Tên sản phẩm
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '2px solid #ddd',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Đơn vị
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'right', 
                    borderBottom: '2px solid #ddd',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Đơn giá
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '2px solid #ddd',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Số lượng
                  </th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'right', 
                    borderBottom: '2px solid #ddd',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, itemIndex) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {itemIndex + 1}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {item.productGroup}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                      {item.productCode || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                      {item.productName}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                      {item.unit}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                      {item.price.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tổng tiền đơn hàng */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '2px solid #1a5ca2'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', marginBottom: '5px', color: '#666' }}>
                  Tổng tiền đơn hàng:
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a5ca2' }}>
                  {formatCurrency(orderTotal)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tổng kết chung */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        border: '2px solid #1a5ca2'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '5px' }}>
              Tổng số đơn hàng: <strong>{totalOrders}</strong>
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>
              Tổng số sản phẩm: <strong>{totalItems}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '5px' }}>
              Tổng giá trị:
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a5ca2' }}>
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Câu cảm ơn khách hàng */}
      <div style={{
        marginTop: '30px',
        padding: '25px',
        backgroundColor: '#f0f8ff',
        borderRadius: '12px',
        border: '2px solid #3eb4a8',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '15px' }}>
          🙏
        </div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#1a5ca2',
          marginBottom: '10px'
        }}>
          Cảm ơn Quý Khách Hàng!
        </h3>
        <p style={{ 
          fontSize: '16px', 
          color: '#666',
          lineHeight: '1.6',
          marginBottom: '10px'
        }}>
          Chúng tôi chân thành cảm ơn Quý khách đã tin tưởng và sử dụng dịch vụ của Sapharco Sales.
        </p>
        <p style={{ 
          fontSize: '16px', 
          color: '#666',
          lineHeight: '1.6'
        }}>
          Chúc Quý khách sức khỏe và thành công trong công việc!
        </p>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
        color: '#666',
        fontSize: '12px'
      }}>
        <p>Cảm ơn quý khách đã sử dụng dịch vụ của Sapharco Sales</p>
        <p>© 2024 Sapharco Sales - Hệ thống quản lý bán hàng</p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginTop: '30px',
        justifyContent: 'center'
      }}>
        <button
          onClick={handlePrint}
          style={{
            padding: '12px 30px',
            backgroundColor: '#1a5ca2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🖨️ In Đơn Hàng
        </button>
        <button
          onClick={handleNewOrder}
          style={{
            padding: '12px 30px',
            backgroundColor: '#3eb4a8',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ➕ Tạo Đơn Mới
        </button>
        <button
          onClick={handleBack}
          style={{
            padding: '12px 30px',
            backgroundColor: '#e5e7eb',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Quay lại
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
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSummary;

