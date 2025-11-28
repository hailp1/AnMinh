import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'DISCOUNT',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    applicableTo: 'ALL',
    customerSegmentIds: [],
    territoryIds: [],
    items: [],
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadPromotions();
    loadProducts();
  }, []);

  useEffect(() => {
    filterPromotions();
  }, [searchTerm, filterType, promotions]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/promotions`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading promotions:', error);
      alert(`Lỗi khi tải danh sách khuyến mãi: ${error.message}`);
      setPromotions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        console.warn('Failed to load products:', response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const filterPromotions = () => {
    let filtered = [...promotions];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    setFilteredPromotions(filtered);
  };

  const handleAdd = () => {
    setEditingPromotion(null);
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'DISCOUNT',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      startDate: now.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      applicableTo: 'ALL',
      customerSegmentIds: [],
      territoryIds: [],
      items: [],
    });
    setShowModal(true);
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description || '',
      type: promotion.type,
      discountType: promotion.discountType || 'PERCENTAGE',
      discountValue: promotion.discountValue?.toString() || '',
      minOrderAmount: promotion.minOrderAmount?.toString() || '',
      maxDiscountAmount: promotion.maxDiscountAmount?.toString() || '',
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0],
      applicableTo: promotion.applicableTo || 'ALL',
      customerSegmentIds: promotion.customerSegmentIds || [],
      territoryIds: promotion.territoryIds || [],
      items: promotion.items?.map(item => ({
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        discountValue: item.discountValue,
      })) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) return;

    try {
      const response = await fetch(`${API_BASE}/promotions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Xóa khuyến mãi thành công!');
        loadPromotions();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi xóa khuyến mãi');
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Lỗi khi xóa khuyến mãi');
    }
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      const url = editingPromotion
        ? `${API_BASE}/promotions/${editingPromotion.id}`
        : `${API_BASE}/promotions`;
      
      const method = editingPromotion ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity ? parseInt(item.quantity) : null,
          discountValue: item.discountValue ? parseFloat(item.discountValue) : null,
        })),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingPromotion ? 'Cập nhật khuyến mãi thành công!' : 'Tạo khuyến mãi thành công!');
        setShowModal(false);
        loadPromotions();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu khuyến mãi');
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('Lỗi khi lưu khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const addProductItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: products.length > 0 ? products[0].id : '',
          quantity: '',
          discountValue: '',
        },
      ],
    });
  };

  const removeProductItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateProductItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const getTypeLabel = (type) => {
    const labels = {
      DISCOUNT: 'Giảm giá',
      BUY_X_GET_Y: 'Mua X tặng Y',
      COMBO: 'Combo',
      FREE_SHIPPING: 'Miễn phí vận chuyển',
      POINT_BONUS: 'Tặng điểm',
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const isActive = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return promotion.isActive && now >= start && now <= end;
  };

  return (
    <div style={{ padding: isMobile ? '0' : '0' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        color: '#1a1a2e'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1a1a2e'
            }}>
              🎁 Quản lý Khuyến mãi
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Tổng số: {promotions.length} chương trình
            </p>
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: '12px 24px',
              background: '#F29E2E',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>➕</span> Thêm khuyến mãi
          </button>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a1a2e',
              background: '#fff'
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a1a2e',
              background: '#fff'
            }}
          >
            <option value="all">Tất cả loại</option>
            <option value="DISCOUNT">Giảm giá</option>
            <option value="BUY_X_GET_Y">Mua X tặng Y</option>
            <option value="COMBO">Combo</option>
            <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
            <option value="POINT_BONUS">Tặng điểm</option>
          </select>
        </div>
      </div>

      {/* Promotions List */}
      {loading && promotions.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#1a1a2e'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #F29E2E',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '14px', color: '#666' }}>Đang tải danh sách khuyến mãi...</p>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#1a1a2e'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1a1a2e' }}>
            {promotions.length === 0 ? 'Chưa có khuyến mãi nào' : 'Không tìm thấy khuyến mãi phù hợp'}
          </p>
          {promotions.length === 0 && (
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              Nhấn nút "Thêm khuyến mãi" để tạo chương trình khuyến mãi đầu tiên
            </p>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {filteredPromotions.map((promotion) => (
            <div
              key={promotion.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${isActive(promotion) ? '#10b981' : '#e5e7eb'}`,
                color: '#1a1a2e'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a1a2e',
                      margin: 0
                    }}>
                      {promotion.name}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      background: isActive(promotion) ? '#10b98115' : '#e5e7eb',
                      color: isActive(promotion) ? '#10b981' : '#666',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {isActive(promotion) ? 'Đang áp dụng' : 'Không hoạt động'}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: '4px 0'
                  }}>
                    Mã: {promotion.code}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: '4px 0'
                  }}>
                    Loại: {getTypeLabel(promotion.type)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(promotion)}
                    style={{
                      padding: '6px 12px',
                      background: '#FBC93D15',
                      border: '1px solid #FBC93D',
                      borderRadius: '6px',
                      color: '#FBC93D',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(promotion.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#ef444415',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {promotion.description && (
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '12px'
                }}>
                  {promotion.description}
                </p>
              )}

              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '12px'
              }}>
                <div>Thời gian: {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</div>
                {promotion.discountValue && (
                  <div>
                    Giảm giá: {promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}%` : `${promotion.discountValue.toLocaleString()}đ`}
                  </div>
                )}
                {promotion.minOrderAmount && (
                  <div>Đơn hàng tối thiểu: {promotion.minOrderAmount.toLocaleString()}đ</div>
                )}
              </div>

              {promotion.items && promotion.items.length > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <strong>Sản phẩm:</strong>
                  <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                    {promotion.items.map((item, idx) => (
                      <li key={idx}>
                        {item.product?.name || 'N/A'} {item.quantity && `(SL: ${item.quantity})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: isMobile ? '24px' : '32px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#1a1a2e'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a2e'
            }}>
              {editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mã khuyến mãi *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="KM001"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Tên chương trình *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Giảm giá 10% cho đơn hàng trên 1 triệu"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Loại khuyến mãi *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  >
                    <option value="DISCOUNT">Giảm giá</option>
                    <option value="BUY_X_GET_Y">Mua X tặng Y</option>
                    <option value="COMBO">Combo</option>
                    <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
                    <option value="POINT_BONUS">Tặng điểm</option>
                  </select>
                </div>

                {formData.type === 'DISCOUNT' && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a2e'
                    }}>
                      Loại giảm giá
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#1a1a2e',
                        background: '#fff'
                      }}
                    >
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                      <option value="FIXED">Cố định (đ)</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.type === 'DISCOUNT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a2e'
                    }}>
                      Giá trị giảm giá
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '10000'}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#1a1a2e',
                        background: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a2e'
                    }}>
                      Giảm tối đa (đ)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      placeholder="50000"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#1a1a2e',
                        background: '#fff'
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Đơn hàng tối thiểu (đ)
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="1000000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              {(formData.type === 'BUY_X_GET_Y' || formData.type === 'COMBO') && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1a1a2e'
                    }}>
                      Sản phẩm áp dụng
                    </label>
                    <button
                      type="button"
                      onClick={addProductItem}
                      style={{
                        padding: '8px 16px',
                        background: '#1E4A8B',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ➕ Thêm sản phẩm
                    </button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '12px',
                      alignItems: 'center'
                    }}>
                      <select
                        value={item.productId}
                        onChange={(e) => updateProductItem(index, 'productId', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#1a1a2e',
                          background: '#fff'
                        }}
                      >
                        <option value="">Chọn sản phẩm</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="SL"
                        value={item.quantity}
                        onChange={(e) => updateProductItem(index, 'quantity', e.target.value)}
                        style={{
                          width: '80px',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#1a1a2e',
                          background: '#fff'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeProductItem(index)}
                        style={{
                          padding: '12px',
                          background: '#ef444415',
                          border: '1px solid #ef4444',
                          borderRadius: '8px',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#1a1a2e'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: '#F29E2E',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;

