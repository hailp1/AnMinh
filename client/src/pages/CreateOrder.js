import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  const [orderItems, setOrderItems] = useState(isNewOrder ? [] : []);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [activeStep, setActiveStep] = useState(customerFromState ? 2 : 1);

  // State for API data
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch pharmacies (customers)
        const pharmaciesRes = await fetch(`${API_BASE}/pharmacies`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-auth-token': token } : {}),
          },
        });

        if (pharmaciesRes.ok) {
          const pharmaciesData = await pharmaciesRes.json();
          setCustomers(pharmaciesData);
        } else {
          console.error('Failed to fetch pharmacies');
        }

        // Fetch products
        const productsRes = await fetch(`${API_BASE}/products`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-auth-token': token } : {}),
          },
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        } else {
          console.error('Failed to fetch products');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Lỗi khi tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Group products by category
  const productGroups = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Group products by category
    const groups = {};
    products.forEach(product => {
      const category = product.category || 'Khác';
      if (!groups[category]) {
        groups[category] = {
          id: category,
          name: category,
          products: []
        };
      }
      groups[category].products.push(product);
    });

    return Object.values(groups);
  }, [products]);

  // Tính khoảng cách từ vị trí hiện tại đến khách hàng
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Lọc và sắp xếp khách hàng theo khoảng cách
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Lọc theo search term
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp theo khoảng cách nếu có vị trí
    if (userLocation && filtered.length > 0) {
      filtered = filtered.map(customer => ({
        ...customer,
        distance: customer.latitude && customer.longitude
          ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            customer.latitude,
            customer.longitude
          )
          : null
      })).sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return filtered;
  }, [customers, searchTerm, userLocation]);

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

    // Reset chỉ sản phẩm và số lượng
    setSelectedProduct('');
    setQuantity(1);

    // Chuyển sang bước review
    setActiveStep(3);
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1E4A8B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px' }}>Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1E4A8B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#FBC93D',
              border: 'none',
              borderRadius: '12px',
              color: '#1E4A8B',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1E4A8B',
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
        <Link to="/home" style={{ fontSize: '24px', textDecoration: 'none', color: '#1E4A8B' }}>
          ←
        </Link>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          margin: 0,
          color: '#1E4A8B',
          flex: 1,
          textAlign: 'center'
        }}>
          📋 Nhập Đơn Hàng
        </h1>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* Progress Steps */}
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
                ? 'linear-gradient(135deg, #1E4A8B, #FBC93D)'
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
              color: activeStep === step ? '#1E4A8B' : '#666',
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
              color: '#1E4A8B'
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
                border: '2px solid #1E4A8B',
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
                  <div style={{ fontWeight: '600', fontSize: '16px', color: '#1E4A8B' }}>
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
                      border: selectedCustomer?.id === customer.id ? '2px solid #1E4A8B' : '1px solid #e5e7eb',
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
                          color: '#1E4A8B',
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
                      color: '#1E4A8B',
                      fontWeight: '600',
                      marginTop: '8px'
                    }}>
                      🆔 {customer.code}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Chọn sản phẩm - Will continue in next part */}
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
                color: '#1E4A8B'
              }}>
                💊 Chọn Sản Phẩm
              </h2>
              <button
                onClick={() => setActiveStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  color: '#1E4A8B',
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
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E4A8B', marginBottom: '5px' }}>
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
                  background: '#fff'
                }}
              >
                <option value="">-- Chọn nhóm sản phẩm --</option>
                {productGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.products.length} sản phẩm)
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
                    background: '#fff'
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
            {selectedProduct && (() => {
              const product = productsInGroup.find(p => p.id === selectedProduct);
              return product ? (
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
                          color: '#1E4A8B'
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
                          color: '#1E4A8B'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
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
                        color: '#1E4A8B'
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
                      color: '#1E4A8B'
                    }}>
                      Thành tiền: {(product.price * quantity).toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  {/* Nút thêm sản phẩm */}
                  <button
                    onClick={handleAddProduct}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #1E4A8B, #FBC93D)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(26, 92, 162, 0.3)'
                    }}
                  >
                    ➕ Thêm vào đơn hàng
                  </button>

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
                        background: 'linear-gradient(135deg, #F29E2E, #f5c869)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      ➕ Thêm sản phẩm khác
                    </button>
                  )}
                </>
              ) : null;
            })()}
          </div>
        )}

        {/* Step 3: Review - Will add in next message due to length */}
        {activeStep === 3 && orderItems.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '15px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1E4A8B',
              marginBottom: '20px'
            }}>
              📋 Xem Lại Đơn Hàng
            </h2>

            {/* Order Items */}
            <div style={{ marginBottom: '20px' }}>
              {orderItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '15px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#1a1a2e', marginBottom: '4px' }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.price.toLocaleString('vi-VN')}đ × {item.quantity} {item.unit}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E4A8B' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginTop: '4px'
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '10px'
                  }}>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#1E4A8B'
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#1E4A8B'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              background: 'linear-gradient(135deg, #1E4A8B, #FBC93D)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                  Tổng cộng:
                </span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                  {totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setActiveStep(2)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ← Thêm sản phẩm
              </button>
              <button
                onClick={handleCheckout}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                Hoàn tất đơn hàng →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {orderItems.length > 0 && activeStep !== 3 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: 'calc(100% - 40px)',
          maxWidth: '560px'
        }}>
          <button
            onClick={() => setActiveStep(3)}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>🛒 Xem đơn hàng ({orderItems.length})</span>
            <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
