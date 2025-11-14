import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customersData from '../data/customers.json';
import productsData from '../data/products.json';

const CreateOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy customer từ state nếu có (khi quay lại từ OrderSummary)
  const customerFromState = location.state?.customer;
  const isNewOrder = location.state?.newOrder;
  
  const [selectedCustomer, setSelectedCustomer] = useState(customerFromState || null);
  const [selectedProductGroup, setSelectedProductGroup] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState(isNewOrder ? [] : []); // Reset nếu là đơn mới
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [activeStep, setActiveStep] = useState(customerFromState ? 2 : 1); // Tự động chuyển sang bước 2 nếu đã có customer

  const customers = useMemo(() => customersData?.customers || [], []);
  const productGroups = useMemo(() => productsData?.productGroups || [], []);

  useEffect(() => {
    // Lấy vị trí hiện tại
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Tính khoảng cách từ vị trí hiện tại đến khách hàng
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Lọc và sắp xếp khách hàng theo khoảng cách
  const filteredCustomers = useMemo(() => {
    let filtered = customers;
    
    // Lọc theo Hub phụ trách (chỉ hiển thị nhà thuốc trong Hub của user)
    if (user && user.hub) {
      filtered = filtered.filter(customer => customer.hub === user.hub);
    }
    
    // Lọc theo search term
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp theo khoảng cách nếu có vị trí
    if (userLocation) {
      filtered = filtered.map(customer => ({
        ...customer,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          customer.latitude,
          customer.longitude
        )
      })).sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  }, [customers, searchTerm, userLocation, user]);

  // Lấy danh sách sản phẩm theo nhóm
  const productsInGroup = useMemo(() => {
    if (!selectedProductGroup) return [];
    const group = productGroups.find(g => g.id === selectedProductGroup);
    return group ? group.products : [];
  }, [selectedProductGroup, productGroups]);

  // Thêm sản phẩm vào đơn hàng
  const handleAddProduct = () => {
    if (!selectedProduct || !selectedCustomer) {
      alert('Vui lòng chọn khách hàng và sản phẩm');
      return;
    }

    const product = productsInGroup.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingItem = orderItems.find(
      item => item.productId === selectedProduct && item.customerId === selectedCustomer.id
    );

    if (existingItem) {
      // Cập nhật số lượng nếu sản phẩm đã có
      setOrderItems(orderItems.map(item =>
        item.productId === selectedProduct && item.customerId === selectedCustomer.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      // Thêm sản phẩm mới
      const newItem = {
        id: Date.now().toString(),
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerCode: selectedCustomer.code,
        customerAddress: selectedCustomer.address,
        customerPhone: selectedCustomer.phone,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        productGroup: productGroups.find(g => g.id === selectedProductGroup)?.name || '',
        unit: product.unit,
        price: product.price,
        quantity: quantity
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Reset chỉ sản phẩm và số lượng, giữ lại customer và productGroup để thêm tiếp
    setSelectedProduct('');
    setQuantity(1);
    
    // Chuyển sang bước review để xem đơn hàng
    setActiveStep(3);
    
    // Hiển thị thông báo thành công
    const message = existingItem 
      ? `Đã cập nhật số lượng ${product.name}`
      : `Đã thêm ${product.name} vào đơn hàng`;
    
    // Có thể thêm toast notification ở đây
    console.log(message);
  };

  // Xóa sản phẩm khỏi đơn hàng
  const handleRemoveItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  // Cập nhật số lượng sản phẩm
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setOrderItems(orderItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Tính tổng tiền
  const totalAmount = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [orderItems]);

  // Tổng kết đơn hàng
  const handleCheckout = () => {
    if (orderItems.length === 0) {
      alert('Vui lòng thêm sản phẩm vào đơn hàng');
      return;
    }

    // Nhóm đơn hàng theo khách hàng
    const ordersByCustomer = {};
    orderItems.forEach(item => {
      if (!ordersByCustomer[item.customerId]) {
        const customer = customers.find(c => c.id === item.customerId);
        ordersByCustomer[item.customerId] = {
          customer: customer,
          items: []
        };
      }
      ordersByCustomer[item.customerId].items.push(item);
    });

    // Chuyển đến trang tổng kết
    navigate('/order-summary', {
      state: {
        orders: Object.values(ordersByCustomer),
        totalAmount: totalAmount
      }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
      paddingBottom: orderItems.length > 0 ? '120px' : '20px'
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
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: 0,
          color: '#1a5ca2',
          flex: 1,
          textAlign: 'center'
        }}>
          📋 Nhập Đơn Hàng
        </h1>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* Progress Steps - Mobile */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        {[
          { step: 1, label: 'Chọn nhà thuốc', icon: '🏥' },
          { step: 2, label: 'Chọn sản phẩm', icon: '💊' },
          { step: 3, label: 'Xem lại', icon: '📋' }
        ].map(({ step, label, icon }) => (
          <div
            key={step}
            onClick={() => {
              if (step === 1 || (step === 2 && selectedCustomer) || (step === 3 && orderItems.length > 0)) {
                setActiveStep(step);
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              opacity: activeStep === step ? 1 : 0.5,
              flex: 1
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: activeStep === step 
                ? 'linear-gradient(135deg, #1a5ca2, #3eb4a8)' 
                : '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: activeStep === step ? '#fff' : '#666',
              fontWeight: 'bold'
            }}>
              {activeStep > step ? '✓' : icon}
            </div>
            <span style={{ 
              fontSize: '11px', 
              textAlign: 'center',
              color: activeStep === step ? '#1a5ca2' : '#666',
              fontWeight: activeStep === step ? '600' : '400'
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 15px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Step 1: Chọn khách hàng */}
        {activeStep === 1 && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '15px'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              marginBottom: '15px', 
              fontWeight: '600',
              color: '#1a5ca2'
            }}>
              🏥 Chọn Nhà Thuốc
            </h2>
            
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm nhà thuốc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 45px 14px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#f9fafb'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selected Customer Info */}
            {selectedCustomer && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
                border: '2px solid #1a5ca2',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: '#1a5ca2' }}>
                    ✅ {selectedCustomer.name}
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#999'
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                  📍 {selectedCustomer.address}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  📞 {selectedCustomer.phone} | 🆔 {selectedCustomer.code}
                </div>
              </div>
            )}

            {/* Danh sách khách hàng */}
            <div style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
              {filteredCustomers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
                  <p>Không tìm thấy nhà thuốc nào</p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setActiveStep(2);
                    }}
                    style={{
                      padding: '15px',
                      marginBottom: '12px',
                      border: selectedCustomer?.id === customer.id ? '2px solid #1a5ca2' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: selectedCustomer?.id === customer.id 
                        ? 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))' 
                        : '#fff',
                      transition: 'all 0.2s',
                      boxShadow: selectedCustomer?.id === customer.id 
                        ? '0 4px 12px rgba(26, 92, 162, 0.2)' 
                        : '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#1a1a2e', flex: 1 }}>
                        🏥 {customer.name}
                      </div>
                      {customer.distance && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#1a5ca2', 
                          background: 'rgba(26, 92, 162, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          marginLeft: '10px'
                        }}>
                          {customer.distance < 1000 
                            ? `${Math.round(customer.distance)}m` 
                            : `${(customer.distance / 1000).toFixed(1)}km`}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                      📍 {customer.address}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                      📞 {customer.phone}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#1a5ca2',
                      fontWeight: '600',
                      marginTop: '8px'
                    }}>
                      🆔 {customer.code} | 📍 Hub: {customer.hub}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Chọn sản phẩm */}
        {activeStep === 2 && selectedCustomer && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '15px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#1a5ca2'
              }}>
                💊 Chọn Sản Phẩm
              </h2>
              <button
                onClick={() => setActiveStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  color: '#1a5ca2',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Đổi nhà thuốc
              </button>
            </div>

            {/* Customer Info */}
            <div style={{
              background: 'rgba(26, 92, 162, 0.05)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
              border: '1px solid rgba(26, 92, 162, 0.1)'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a5ca2', marginBottom: '5px' }}>
                🏥 {selectedCustomer.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {selectedCustomer.address}
              </div>
            </div>

            {/* Chọn nhóm sản phẩm */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#1a1a2e'
              }}>
                Nhóm sản phẩm:
              </label>
              <select
                value={selectedProductGroup}
                onChange={(e) => {
                  setSelectedProductGroup(e.target.value);
                  setSelectedProduct('');
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%231a5ca2\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: '40px'
                }}
              >
                <option value="">-- Chọn nhóm sản phẩm --</option>
                {productGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn sản phẩm */}
            {selectedProductGroup && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#1a1a2e'
                }}>
                  Sản phẩm:
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: '#fff',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%231a5ca2\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    paddingRight: '40px'
                  }}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {productsInGroup.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.price.toLocaleString('vi-VN')}đ/{product.unit}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nhập số lượng */}
            {selectedProduct && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#1a1a2e'
                  }}>
                    Số lượng:
                  </label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '5px'
                  }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        width: '48px',
                        height: '48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1a5ca2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        touchAction: 'manipulation'
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      style={{
                        flex: 1,
                        padding: '14px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: '600',
                        background: '#fff'
                      }}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{
                        width: '48px',
                        height: '48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1a5ca2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        touchAction: 'manipulation'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                {selectedProduct && (() => {
                  const product = productsInGroup.find(p => p.id === selectedProduct);
                  return product ? (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.05), rgba(62, 180, 168, 0.05))',
                      borderRadius: '12px',
                      padding: '15px',
                      marginBottom: '20px',
                      border: '1px solid rgba(26, 92, 162, 0.1)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '15px', color: '#1a1a2e' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            🆔 {product.code} | 📦 {product.unit}
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          color: '#1a5ca2'
                        }}>
                          {product.price.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                      <div style={{
                        padding: '10px',
                        background: '#fff',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1a5ca2'
                      }}>
                        Thành tiền: {(product.price * quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Nút thêm sản phẩm */}
                <button
                  onClick={handleAddProduct}
                  disabled={!selectedProduct || !selectedCustomer}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: selectedProduct && selectedCustomer
                      ? 'linear-gradient(135deg, #1a5ca2, #3eb4a8)'
                      : '#e5e7eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: selectedProduct && selectedCustomer ? 'pointer' : 'not-allowed',
                    boxShadow: selectedProduct && selectedCustomer
                      ? '0 4px 12px rgba(26, 92, 162, 0.3)'
                      : 'none',
                    touchAction: 'manipulation'
                  }}
                >
                  ➕ Thêm vào đơn hàng
                </button>
                
                {/* Nút thêm sản phẩm khác - hiển thị sau khi đã có sản phẩm */}
                {orderItems.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveStep(2);
                      setSelectedProduct('');
                      setQuantity(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #e5aa42, #f5c869)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                      marginTop: '10px'
                    }}
                  >
                    ➕ Thêm sản phẩm khác
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Xem lại đơn hàng */}
        {activeStep === 3 && orderItems.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '15px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#1a5ca2'
              }}>
                📋 Đơn Hàng ({orderItems.length} sản phẩm)
              </h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setActiveStep(2);
                    setSelectedProduct('');
                    setQuantity(1);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #e5aa42, #f5c869)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Thêm SP
                </button>
                {selectedCustomer && (
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(26, 92, 162, 0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#1a5ca2',
                    fontWeight: '600'
                  }}>
                    🏥 {selectedCustomer.name}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              {orderItems.map(item => {
                const product = productGroups
                  .flatMap(g => g.products)
                  .find(p => p.id === item.productId);
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '15px',
                      marginBottom: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '10px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '5px', color: '#1a1a2e' }}>
                          {item.productName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                          🆔 {item.productCode} | 📦 {item.unit}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          🏥 {item.customerName} ({item.customerCode})
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          💰 {item.price.toLocaleString('vi-VN')}đ/{item.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#FF3B30',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          touchAction: 'manipulation'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '5px'
                      }}>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: '40px',
                            height: '40px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#1a5ca2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            touchAction: 'manipulation'
                          }}
                        >
                          −
                        </button>
                        <span style={{ 
                          minWidth: '50px', 
                          textAlign: 'center', 
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: '40px',
                            height: '40px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#1a5ca2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            touchAction: 'manipulation'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: '#1a5ca2',
                        minWidth: '100px',
                        textAlign: 'right'
                      }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
              borderRadius: '12px',
              border: '2px solid #1a5ca2',
              marginBottom: '15px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
                  Tổng cộng:
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a5ca2' }}>
                  {totalAmount.toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeStep === 3 && orderItems.length === 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', color: '#1a1a2e' }}>
              Chưa có sản phẩm nào
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Hãy chọn nhà thuốc và thêm sản phẩm vào đơn hàng
            </p>
            <button
              onClick={() => setActiveStep(1)}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Chọn nhà thuốc
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar - Mobile */}
      {orderItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          padding: '15px 20px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          zIndex: 100,
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {orderItems.length} sản phẩm
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a5ca2' }}>
              {totalAmount.toLocaleString('vi-VN')}đ
            </div>
          </div>
          <button
            onClick={handleCheckout}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(26, 92, 162, 0.3)',
              touchAction: 'manipulation'
            }}
          >
            ✅ Hoàn Tất Đơn Hàng
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
