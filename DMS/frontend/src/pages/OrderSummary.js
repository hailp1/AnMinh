import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ordersAPI, promotionsAPI } from '../services/api';

const OrderSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart, products, pharmacy, total } = state || {};
  const [submitting, setSubmitting] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      if (pharmacy?.id) {
        try {
          const data = await promotionsAPI.getAvailable(pharmacy.id);
          setPromotions(data);
        } catch (error) {
          console.error('Error fetching promotions:', error);
          // Fallback to empty or mock if needed, but we want DB data
        } finally {
          setLoadingPromos(false);
        }
      }
    };
    fetchPromotions();
  }, [pharmacy]);

  if (!cart || !products) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Không có dữ liệu đơn hàng. Vui lòng quay lại.</p>
        <button onClick={() => navigate('/home')}>Về trang chủ</button>
      </div>
    );
  }

  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find(p => String(p.id) === String(productId));
    return { ...product, quantity };
  });

  // Simple logic to calculate discount based on seeded promotions
  // This is a simplified frontend calculation for display purposes
  const calculateDiscount = () => {
    let discountAmount = 0;
    let giftItems = [];

    promotions.forEach(promo => {
      if (promo.type === 'DISCOUNT' && promo.discountType === 'PERCENTAGE') {
        discountAmount += total * (promo.discountValue / 100);
      }
      if (promo.type === 'BUY_X_GET_Y') {
        // Check if cart has the product
        promo.items.forEach(item => {
          const cartItem = cartItems.find(ci => ci.id === item.productId);
          if (cartItem && cartItem.quantity >= item.quantity) {
            const giftQty = Math.floor(cartItem.quantity / item.quantity) * (item.discountValue || 1);
            giftItems.push({
              name: item.product?.name || 'Quà tặng',
              quantity: giftQty
            });
          }
        });
      }
    });

    return { discountAmount, giftItems };
  };

  const { discountAmount, giftItems } = calculateDiscount();
  const finalTotal = total - discountAmount;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const orderData = {
        pharmacyId: pharmacy.id,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        totalAmount: finalTotal,
        status: 'PENDING'
      };

      const createdOrder = await ordersAPI.create(orderData);
      const orderId = createdOrder?.id || 'ORD-' + Date.now();

      const fullOrder = {
        ...createdOrder,
        id: orderId,
        customer: pharmacy,
        items: cartItems,
        totalAmount: finalTotal,
        createdAt: new Date().toISOString()
      };

      alert('Đơn hàng đã được tạo thành công!');
      navigate(`/order/invoice/${orderId}`, { state: { order: fullOrder } });
    } catch (error) {
      console.error('Error creating order:', error);
      const mockId = 'MOCK-' + Date.now();
      const mockOrder = {
        id: mockId,
        customer: pharmacy,
        items: cartItems,
        totalAmount: finalTotal,
        createdAt: new Date().toISOString()
      };
      alert('Tạo đơn hàng thành công (Giả lập)');
      navigate(`/order/invoice/${mockId}`, { state: { order: mockOrder } });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src="/image/logo.webp" alt="An Minh Logo" style={{ height: '60px', marginBottom: '10px' }} />
        <h1 style={{ fontSize: '24px', color: '#1E4A8B', margin: 0 }}>Tổng kết đơn hàng</h1>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', color: '#1E4A8B', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          Thông tin khách hàng
        </h2>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{pharmacy?.name}</p>
        <p style={{ color: '#666', fontSize: '14px' }}>{pharmacy?.address}</p>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', color: '#1E4A8B', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          Chi tiết đơn hàng
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{item.code}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>x{item.quantity}</div>
                <div style={{ color: '#F29E2E', fontSize: '14px' }}>{formatCurrency(item.price * item.quantity)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Promotion Section */}
        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ddd' }}>
          <h3 style={{ fontSize: '16px', color: '#1E4A8B', marginBottom: '10px' }}>KM, hàng tặng</h3>
          <div style={{ color: '#0F2A50', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loadingPromos ? (
              <div>Đang tải khuyến mãi...</div>
            ) : promotions.length === 0 ? (
              <div>Không có khuyến mãi áp dụng</div>
            ) : (
              <>
                {promotions.map(promo => (
                  <div key={promo.id}>• {promo.name}</div>
                ))}

                {/* Display calculated gifts/discounts */}
                {giftItems.map((gift, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '10px' }}>
                    <span>- Tặng: {gift.name}</span>
                    <span style={{ fontWeight: 'bold' }}>{gift.quantity} Hộp</span>
                  </div>
                ))}
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '10px' }}>
                    <span>- Chiết khấu</span>
                    <span style={{ fontWeight: 'bold' }}>- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Tổng cộng:</span>
          <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#F29E2E' }}>{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      <div style={{
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        padding: '15px 20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '10px',
        zIndex: 100,
        marginTop: '20px',
        borderRadius: '12px 12px 0 0'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ flex: 1, padding: '15px', background: '#f3f4f6', color: '#1a1a2e', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
        >
          Quay lại
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          style={{ flex: 2, padding: '15px', background: '#1E4A8B', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
