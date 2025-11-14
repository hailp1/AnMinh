import React, { useState, useEffect } from 'react';
import productsData from '../../data/products.json';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils/mockData';

const AdminProducts = () => {
  const [productGroups, setProductGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: 'Vĩ',
    price: '',
    groupId: '',
    groupName: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedGroup, products]);

  const loadProducts = () => {
    const stored = getFromLocalStorage('adminProducts', null);
    if (stored) {
      setProductGroups(stored.productGroups || []);
      setProducts(stored.products || []);
    } else {
      // Initialize from products.json
      const groups = productsData.productGroups || [];
      const allProducts = groups.flatMap(g => g.products.map(p => ({
        ...p,
        groupId: g.id,
        groupName: g.name
      })));
      
      setProductGroups(groups);
      setProducts(allProducts);
      saveToLocalStorage('adminProducts', {
        productGroups: groups,
        products: allProducts
      });
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGroup !== 'all') {
      filtered = filtered.filter(p => p.groupId === selectedGroup);
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setEditingGroup(null);
    setFormData({
      code: '',
      name: '',
      unit: 'Vĩ',
      price: '',
      groupId: productGroups.length > 0 ? productGroups[0].id : '',
      groupName: productGroups.length > 0 ? productGroups[0].name : ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditingGroup(null);
    setFormData({
      code: product.code,
      name: product.name,
      unit: product.unit || 'Vĩ',
      price: product.price?.toString() || '',
      groupId: product.groupId,
      groupName: product.groupName
    });
    setShowModal(true);
  };

  const handleAddGroup = () => {
    setEditingProduct(null);
    setEditingGroup(null);
    setFormData({
      code: '',
      name: '',
      unit: 'Vĩ',
      price: '',
      groupId: '',
      groupName: ''
    });
    setShowModal(true);
  };

  const handleEditGroup = (group) => {
    setEditingProduct(null);
    setEditingGroup(group);
    setFormData({
      code: '',
      name: group.name,
      unit: 'Vĩ',
      price: '',
      groupId: group.id,
      groupName: group.name
    });
    setShowModal(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      saveProducts(updated);
    }
  };

  const handleDeleteGroup = (id) => {
    if (window.confirm('Xóa danh mục sẽ xóa tất cả sản phẩm trong danh mục. Bạn có chắc chắn?')) {
      const updatedGroups = productGroups.filter(g => g.id !== id);
      const updatedProducts = products.filter(p => p.groupId !== id);
      setProductGroups(updatedGroups);
      setProducts(updatedProducts);
      saveProducts(updatedProducts, updatedGroups);
    }
  };

  const saveProducts = (updatedProducts, updatedGroups) => {
    const data = {
      productGroups: updatedGroups || productGroups,
      products: updatedProducts || products
    };
    saveToLocalStorage('adminProducts', data);
    if (updatedGroups) setProductGroups(updatedGroups);
    if (updatedProducts) setProducts(updatedProducts);
  };

  const handleSave = () => {
    if (editingGroup) {
      // Save group
      if (!formData.name) {
        alert('Vui lòng nhập tên danh mục');
        return;
      }
      const updated = productGroups.map(g => 
        g.id === editingGroup.id 
          ? { ...g, name: formData.name }
          : g
      );
      setProductGroups(updated);
      saveProducts(products, updated);
    } else {
      // Save product
      if (!formData.name || !formData.code || !formData.price || !formData.groupId) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }
      let updated;
      if (editingProduct) {
        updated = products.map(p => 
          p.id === editingProduct.id 
            ? { 
                ...p, 
                code: formData.code,
                name: formData.name,
                unit: formData.unit,
                price: parseFloat(formData.price),
                groupId: formData.groupId,
                groupName: productGroups.find(g => g.id === formData.groupId)?.name || ''
              }
            : p
        );
      } else {
        const newProduct = {
          id: `p${String(products.length + 1).padStart(3, '0')}`,
          code: formData.code,
          name: formData.name,
          unit: formData.unit,
          price: parseFloat(formData.price),
          groupId: formData.groupId,
          groupName: productGroups.find(g => g.id === formData.groupId)?.name || ''
        };
        updated = [...products, newProduct];
      }
      setProducts(updated);
      saveProducts(updated);
    }
    setShowModal(false);
    setEditingProduct(null);
    setEditingGroup(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div style={{ padding: isMobile ? '0' : '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Quản lý sản phẩm
          </h1>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#666'
          }}>
            {productGroups.length} danh mục • {filteredProducts.length} sản phẩm
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={handleAddGroup}
            style={{
              padding: '12px 24px',
              background: '#3eb4a8',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📂</span>
            <span>Thêm danh mục</span>
          </button>
          <button
            onClick={handleAddProduct}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>➕</span>
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '300px',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px'
          }}
        />
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="all">Tất cả danh mục</option>
          {productGroups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      {/* Product Groups */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {productGroups.map(group => {
          const groupProducts = products.filter(p => p.groupId === group.id);
          const totalRevenue = groupProducts.reduce((sum, p) => sum + (p.price || 0), 0);
          
          return (
            <div
              key={group.id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '2px solid #e5e7eb'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '8px'
                  }}>
                    📂 {group.name}
                  </h3>
                  <div style={{
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    {groupProducts.length} sản phẩm
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleEditGroup(group)}
                    style={{
                      padding: '6px 12px',
                      background: '#3eb4a815',
                      border: '1px solid #3eb4a8',
                      borderRadius: '6px',
                      color: '#3eb4a8',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      color: '#dc2626',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#666'
              }}>
                Giá trung bình: {formatCurrency(totalRevenue / (groupProducts.length || 1))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Products Table */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 120px 1fr 150px 120px 150px 120px',
          gap: '16px',
          padding: '16px 20px',
          background: '#f9fafb',
          borderBottom: '2px solid #e5e7eb',
          fontWeight: '600',
          fontSize: '14px',
          color: '#1a1a2e'
        }}>
          <div>STT</div>
          <div>Mã SP</div>
          <div>Tên sản phẩm</div>
          <div>Danh mục</div>
          <div>Đơn vị</div>
          <div>Giá bán</div>
          <div>Thao tác</div>
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 120px 1fr 150px 120px 150px 120px',
                gap: '16px',
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
              }}
            >
              <div style={{ fontSize: '14px', color: '#666' }}>{index + 1}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a5ca2' }}>
                {product.code}
              </div>
              <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                {product.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {product.groupName}
              </div>
              <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                {product.unit}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                {formatCurrency(product.price)}
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleEditProduct(product)}
                  style={{
                    padding: '6px 12px',
                    background: '#3eb4a815',
                    border: '1px solid #3eb4a8',
                    borderRadius: '6px',
                    color: '#3eb4a8',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#dc2626',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              {editingGroup 
                ? (editingGroup ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới')
                : (editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới')
              }
            </h2>

            {editingGroup !== null ? (
              // Group Form
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Thuốc kê đơn"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            ) : (
              // Product Form
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Mã sản phẩm *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="VD: PAR500"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Đơn vị *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="Vĩ">Vĩ</option>
                      <option value="Hộp">Hộp</option>
                      <option value="Lọ">Lọ</option>
                      <option value="Chai">Chai</option>
                      <option value="Tuýp">Tuýp</option>
                      <option value="Viên">Viên</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Paracetamol 500mg"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Danh mục *
                    </label>
                    <select
                      value={formData.groupId}
                      onChange={(e) => {
                        const group = productGroups.find(g => g.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          groupId: e.target.value,
                          groupName: group?.name || ''
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Chọn danh mục</option>
                      {productGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Giá bán (VNĐ) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="VD: 50000"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

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
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

