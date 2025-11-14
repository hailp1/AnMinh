import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customersData from '../data/customers.json';
import productsData from '../data/products.json';

const CreateOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProductGroup, setSelectedProductGroup] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);

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

    // Reset form
    setSelectedProduct('');
    setQuantity(1);
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
    <div className="create-order-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
          Nhập Đơn Hàng
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Chọn khách hàng và thêm sản phẩm vào đơn hàng
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Chọn khách hàng */}
        <div className="customer-section" style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', fontWeight: '600' }}>
            Chọn Nhà Thuốc
          </h2>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Tìm kiếm nhà thuốc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '14px'
            }}
          />

          {/* Danh sách khách hàng */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  border: selectedCustomer?.id === customer.id ? '2px solid #1a5ca2' : '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedCustomer?.id === customer.id ? '#e8f2f9' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '5px', fontSize: '16px' }}>
                  {customer.name}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                  📍 {customer.address}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                  📞 {customer.phone}
                </div>
                {customer.distance && (
                  <div style={{ fontSize: '12px', color: '#1a5ca2', marginTop: '5px' }}>
                    📏 {customer.distance < 1000 
                      ? `${Math.round(customer.distance)}m` 
                      : `${(customer.distance / 1000).toFixed(1)}km`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chọn sản phẩm */}
        <div className="product-section" style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', fontWeight: '600' }}>
            Chọn Sản Phẩm
          </h2>

          {/* Chọn nhóm sản phẩm */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
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
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
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
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Sản phẩm:
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
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
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Số lượng:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    padding: '8px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '16px'
                  }}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    padding: '8px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Nút thêm sản phẩm */}
          {selectedProduct && selectedCustomer && (
            <button
              onClick={handleAddProduct}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a5ca2',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              ➕ Thêm vào đơn hàng
            </button>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm đã chọn */}
      {orderItems.length > 0 && (
        <div className="order-items-section" style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', fontWeight: '600' }}>
            Đơn Hàng ({orderItems.length} sản phẩm)
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            {orderItems.map(item => {
              const product = productsInGroup.find(p => p.id === item.productId) || 
                            productGroups.flatMap(g => g.products).find(p => p.id === item.productId);
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #eee'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Nhà thuốc: {item.customerName} ({item.customerCode}) | 
                      Nhóm: {item.productGroup} | 
                      Đơn giá: {item.price.toLocaleString('vi-VN')}đ/{item.unit}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        style={{
                          padding: '5px 10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          backgroundColor: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: '600' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        style={{
                          padding: '5px 10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          backgroundColor: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ minWidth: '120px', textAlign: 'right', fontWeight: '600', color: '#1a5ca2' }}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#FF3B30',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '15px',
            borderTop: '2px solid #eee'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              Tổng cộng:
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a5ca2' }}>
              {totalAmount.toLocaleString('vi-VN')}đ
            </div>
          </div>

          <button
            onClick={handleCheckout}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#3eb4a8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '20px'
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

