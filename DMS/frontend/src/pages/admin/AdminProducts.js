import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AdminProducts = () => {
  const [productGroups, setProductGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [modalType, setModalType] = useState('product'); // 'product' or 'group'
  const [loading, setLoading] = useState(false);
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
    description: '',
    unit: 'hộp',
    price: '',
    groupId: '',
    order: 0
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedGroup, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Load groups
      const groupsResponse = await fetch(`${API_BASE}/products/groups`, {
        headers: { 'x-auth-token': token }
      });
      if (groupsResponse.ok) {
        const groups = await groupsResponse.json();
        setProductGroups(Array.isArray(groups) ? groups : []);
      }

      // Load products
      const productsResponse = await fetch(`${API_BASE}/products`, {
        headers: { 'x-auth-token': token }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      alert(`Lỗi khi tải danh sách sản phẩm: ${error.message}`);
      setProductGroups([]);
      setProducts([]);
    } finally {
      setLoading(false);
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
      filtered = filtered.filter(p => p.groupId === selectedGroup || p.group?.id === selectedGroup);
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setEditingGroup(null);
    setModalType('product');
    setFormData({
      code: '',
      name: '',
      description: '',
      unit: 'hộp',
      price: '',
      groupId: productGroups.length > 0 ? productGroups[0].id : '',
      order: 0
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditingGroup(null);
    setModalType('product');
    setFormData({
      code: product.code || '',
      name: product.name || '',
      description: product.description || '',
      unit: product.unit || 'hộp',
      price: product.price?.toString() || '',
      groupId: product.groupId || product.group?.id || '',
      order: product.order || 0
    });
    setShowModal(true);
  };

  const handleAddGroup = () => {
    setEditingProduct(null);
    setEditingGroup(null);
    setModalType('group');
    setFormData({
      name: '',
      description: '',
      order: 0,
      code: '',
      unit: 'hộp',
      price: '',
      groupId: ''
    });
    setShowModal(true);
  };

  const handleEditGroup = (group) => {
    setEditingProduct(null);
    setEditingGroup(group);
    setModalType('group');
    setFormData({
      name: group.name || '',
      description: group.description || '',
      order: group.order || 0,
      code: '',
      unit: 'hộp',
      price: '',
      groupId: group.id || ''
    });
    setShowModal(true);
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('Xóa danh mục sẽ xóa tất cả sản phẩm trong danh mục. Bạn có chắc chắn?')) return;

    try {
      setLoading(true);
      // First, delete all products in this group
      const token = localStorage.getItem('token');
      const productsInGroup = products.filter(p => p.groupId === id);
      for (const product of productsInGroup) {
        await fetch(`${API_BASE}/products/admin/products/${product.id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
      }

      // Then delete the group
      const response = await fetch(`${API_BASE}/products/admin/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        alert('Xóa danh mục thành công!');
        loadProducts();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi xóa danh mục');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Lỗi khi xóa danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/products/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (response.ok) {
        alert('Xóa sản phẩm thành công!');
        loadProducts();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Lỗi khi xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (modalType === 'group') {
      // Save group
      if (!formData.name) {
        alert('Vui lòng nhập tên danh mục');
        return;
      }

      try {
        setLoading(true);
        const payload = {
          name: formData.name,
          description: formData.description || null,
          order: formData.order || 0,
        };

        const url = editingGroup
          ? `${API_BASE}/products/admin/groups/${editingGroup.id}`
          : `${API_BASE}/products/admin/groups`;
        const method = editingGroup ? 'PUT' : 'POST';

        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert(editingGroup ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!');
          setShowModal(false);
          setEditingGroup(null);
          setModalType('product');
          loadProducts();
        } else {
          const error = await response.json();
          alert(error.error || 'Lỗi khi lưu danh mục');
        }
      } catch (error) {
        console.error('Error saving group:', error);
        alert('Lỗi khi lưu danh mục');
      } finally {
        setLoading(false);
      }
    } else {
      // Save product
      if (!formData.name || !formData.price || !formData.groupId) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }

      try {
        setLoading(true);
        const payload = {
          name: formData.name,
          code: formData.code || null,
          description: formData.description || null,
          groupId: formData.groupId,
          unit: formData.unit || 'hộp',
          price: parseFloat(formData.price),
        };

        const url = editingProduct?.id
          ? `${API_BASE}/products/admin/products/${editingProduct.id}`
          : `${API_BASE}/products/admin/products`;
        const method = editingProduct?.id ? 'PUT' : 'POST';

        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert(editingProduct?.id ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');
          setShowModal(false);
          setEditingProduct(null);
          setModalType('product');
          loadProducts();
        } else {
          const error = await response.json();
          alert(error.error || 'Lỗi khi lưu sản phẩm');
        }
      } catch (error) {
        console.error('Error saving product:', error);
        alert('Lỗi khi lưu sản phẩm');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      {
        'Mã SP': 'SP001',
        'Tên sản phẩm': 'Thuốc A',
        'Danh mục': 'Thuốc kê đơn',
        'Đơn vị': 'Hộp',
        'Giá bán': 100000,
        'Mô tả': 'Công dụng...'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_San_pham.xlsx');
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('File không có dữ liệu');
          return;
        }

        if (!window.confirm(`Tìm thấy ${data.length} dòng dữ liệu. Bạn có muốn import không?`)) return;

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
          try {
            // Lookup Group
            const groupName = row['Danh mục'];
            const group = productGroups.find(g => g.name === groupName);

            if (!group) {
              console.warn('Group not found:', groupName);
              errorCount++;
              continue;
            }

            const payload = {
              code: row['Mã SP']?.toString(),
              name: row['Tên sản phẩm'],
              description: row['Mô tả'],
              unit: row['Đơn vị'] || 'hộp',
              price: parseFloat(row['Giá bán']),
              groupId: group.id
            };

            if (!payload.name || !payload.price || !payload.groupId) {
              console.warn('Skipping invalid row:', row);
              errorCount++;
              continue;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/products/admin/products`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
              },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (err) {
            console.error('Error importing row:', err);
            errorCount++;
          }
        }

        alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${errorCount}`);
        loadProducts();
      } catch (error) {
        console.error('Error parsing excel:', error);
        alert('Lỗi khi đọc file Excel');
      } finally {
        setLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
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
            onClick={handleDownloadTemplate}
            style={{
              padding: '12px 24px',
              background: '#10b981',
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
            <span>📥</span>
            <span>Template</span>
          </button>
          <label
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
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
            <span>📤</span>
            <span>Import</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={handleAddGroup}
            style={{
              padding: '12px 24px',
              background: '#F29E2E',
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
              background: '#F29E2E',
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
          const groupProducts = products.filter(p => p.groupId === group.id || p.group?.id === group.id);
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
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E4A8B' }}>
                {product.code}
              </div>
              <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                {product.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {product.group?.name || product.groupName || 'Chưa phân loại'}
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
              {modalType === 'group'
                ? (editingGroup ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới')
                : (editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới')
              }
            </h2>

            {modalType === 'group' ? (
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
                        setFormData({
                          ...formData,
                          groupId: e.target.value
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
                  background: '#F29E2E',
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

