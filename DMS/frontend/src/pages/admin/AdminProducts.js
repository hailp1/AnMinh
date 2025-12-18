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
  const [viewMode, setViewMode] = useState('products'); // 'products' or 'groups'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    unit: 'hộp',
    price: '',
    groupId: '',
    order: 0,
    isPrescription: false,
    concentration: '',
    usage: '',
    genericName: '',
    manufacturer: '',
    countryOfOrigin: '',
    registrationNo: '',
    packingSpec: '',
    storageCondition: '',
    indications: '',
    contraindications: '',
    dosage: '',
    sideEffects: '',
    shelfLife: '',
    vat: '',
    image: ''
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
    setActiveTab('basic');
    setFormData({
      code: '',
      name: '',
      description: '',
      unit: 'hộp',
      price: '',
      groupId: productGroups.length > 0 ? productGroups[0].id : '',
      order: 0,
      isPrescription: false,
      concentration: '',
      usage: '',
      genericName: '',
      manufacturer: '',
      countryOfOrigin: '',
      registrationNo: '',
      packingSpec: '',
      storageCondition: '',
      indications: '',
      contraindications: '',
      dosage: '',
      sideEffects: '',
      shelfLife: '',
      vat: '',
      image: ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditingGroup(null);
    setModalType('product');
    setActiveTab('basic');
    setFormData({
      code: product.code || '',
      name: product.name || '',
      description: product.description || '',
      unit: product.unit || 'hộp',
      price: product.price?.toString() || '',
      groupId: product.groupId || product.group?.id || '',
      order: product.order || 0,
      isPrescription: product.isPrescription || false,
      concentration: product.concentration || '',
      usage: product.usage || '',
      genericName: product.genericName || '',
      manufacturer: product.manufacturer || '',
      countryOfOrigin: product.countryOfOrigin || '',
      registrationNo: product.registrationNo || '',
      packingSpec: product.packingSpec || '',
      storageCondition: product.storageCondition || '',
      indications: product.indications || '',
      contraindications: product.contraindications || '',
      dosage: product.dosage || '',
      sideEffects: product.sideEffects || '',
      shelfLife: product.shelfLife || '',
      vat: product.vat?.toString() || '',
      image: (product.images && product.images.length > 0) ? product.images[0] : ''
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
          isPrescription: formData.isPrescription,
          concentration: formData.concentration,
          usage: formData.usage,
          genericName: formData.genericName,
          manufacturer: formData.manufacturer,
          countryOfOrigin: formData.countryOfOrigin,
          registrationNo: formData.registrationNo,
          packingSpec: formData.packingSpec,
          storageCondition: formData.storageCondition,
          indications: formData.indications,
          contraindications: formData.contraindications,
          dosage: formData.dosage,
          sideEffects: formData.sideEffects,
          shelfLife: formData.shelfLife,
          vat: formData.vat ? parseFloat(formData.vat) : null,
          images: formData.image ? [formData.image] : []
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
        'Mã Nhóm SP': 'GROUP001',
        'Đơn vị': 'Hộp',
        'Giá bán': 100000,
        'Giá vốn': 80000,
        'Tồn kho min': 10,
        'Tồn kho max': 1000,
        'Mô tả': 'Công dụng điều trị...',
        'Hoạt chất': 'Paracetamol',
        'Hàm lượng': '500mg',
        'Hãng SX': 'NADYPHAR',
        'Nước SX': 'Việt Nam',
        'Số ĐK': 'VD-12345-23',
        'Quy cách': 'Hộp 10 vỉ x 10 viên',
        'ETC': 'C',
        'VAT': 5,
        'Barcode': '8936079123456',
        'Trạng thái': 'true'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_San_pham_DMS.xlsx');
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
              groupId: group.id,
              genericName: row['Hoạt chất'],
              concentration: row['Hàm lượng'],
              manufacturer: row['Hãng SX'],
              countryOfOrigin: row['Nước SX'],
              registrationNo: row['Số ĐK'],
              packingSpec: row['Quy cách'],
              isPrescription: row['ETC'] === 'C' || row['ETC'] === 'True',
              vat: row['VAT'] ? parseFloat(row['VAT']) : null
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
      {/* Header & Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>
          Quản lý sản phẩm
        </h1>
        <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid #e5e7eb', marginTop: '16px' }}>
          <div
            onClick={() => setViewMode('products')}
            style={{
              padding: '12px 24px', cursor: 'pointer', fontWeight: '600',
              color: viewMode === 'products' ? '#F29E2E' : '#666',
              borderBottom: viewMode === 'products' ? '2px solid #F29E2E' : 'transparent', marginBottom: '-2px'
            }}
          >
            Danh sách sản phẩm
          </div>
          <div
            onClick={() => setViewMode('groups')}
            style={{
              padding: '12px 24px', cursor: 'pointer', fontWeight: '600',
              color: viewMode === 'groups' ? '#F29E2E' : '#666',
              borderBottom: viewMode === 'groups' ? '2px solid #F29E2E' : 'transparent', marginBottom: '-2px'
            }}
          >
            Quản lý Danh mục
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, display: viewMode === 'products' ? 'flex' : 'none', gap: '16px' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1, minWidth: '200px', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px'
            }}
          />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="all">Tất cả danh mục</option>
            {productGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          {viewMode === 'products' && (
            <>
              <button onClick={handleDownloadTemplate} style={{ padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📥</span> Template
              </button>
              <label style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📤</span> Import
                <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} style={{ display: 'none' }} />
              </label>
              <button onClick={handleAddProduct} style={{ padding: '10px 20px', background: '#F29E2E', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>➕</span> Thêm sản phẩm
              </button>
            </>
          )}
          {viewMode === 'groups' && (
            <button onClick={handleAddGroup} style={{ padding: '10px 20px', background: '#F29E2E', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📂</span> Thêm danh mục
            </button>
          )}
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'groups' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {productGroups.map(group => {
            const groupProducts = products.filter(p => p.groupId === group.id || p.group?.id === group.id);
            const totalRevenue = groupProducts.reduce((sum, p) => sum + (p.price || 0), 0);
            return (
              <div key={group.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>📂 {group.name}</h3>
                    <div style={{ fontSize: '13px', color: '#666' }}>{groupProducts.length} sản phẩm</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditGroup(group)} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                    <button onClick={() => handleDeleteGroup(group.id)} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                  </div>
                </div>
                <div style={{ padding: '8px', background: '#f9fafb', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
                  Giá TB: {formatCurrency(totalRevenue / (groupProducts.length || 1))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'products' && (
        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50px 100px 1fr 150px 100px 120px 100px', gap: '16px', padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '13px', color: '#4b5563' }}>
            <div>STT</div>
            <div>Mã SP</div>
            <div>Tên sản phẩm</div>
            <div>Danh mục</div>
            <div>Đơn vị</div>
            <div>Giá bán</div>
            <div>Thao tác</div>
          </div>
          <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {filteredProducts.map((product, index) => (
              <div key={product.id} style={{ display: 'grid', gridTemplateColumns: '50px 100px 1fr 150px 100px 120px 100px', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #f3f4f6', alignItems: 'center', fontSize: '13px' }}>
                <div style={{ color: '#6b7280' }}>{index + 1}</div>
                <div style={{ fontWeight: '600', color: '#1E4A8B' }}>{product.code}</div>
                <div style={{ color: '#111827' }}>{product.name}</div>
                <div style={{ color: '#6b7280' }}>{product.group?.name || product.groupName || '-'}</div>
                <div style={{ color: '#374151' }}>{product.unit}</div>
                <div style={{ fontWeight: '600', color: '#059669' }}>{formatCurrency(product.price)}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditProduct(product)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDeleteProduct(product.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {
        showModal && (
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
                  <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
                    {['basic', 'pharma', 'detail', 'other'].map(tab => (
                      <div key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 0', cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #F29E2E' : '2px solid transparent', color: activeTab === tab ? '#F29E2E' : '#666', fontWeight: activeTab === tab ? '600' : '500', fontSize: '14px' }}>
                        {tab === 'basic' ? 'Cơ bản' : tab === 'pharma' ? 'Dược lý' : tab === 'detail' ? 'Chi tiết' : 'Khác'}
                      </div>
                    ))}
                  </div>

                  {activeTab === 'basic' && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Hình ảnh (URL)</label>
                        <input type="text" value={formData.image || ''} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://example.com/image.jpg" style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                        {formData.image && <img src={formData.image} alt="Preview" style={{ marginTop: '8px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />}
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
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>VAT (%)</label>
                        <input type="number" value={formData.vat} onChange={(e) => setFormData({ ...formData, vat: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Mô tả ngắn</label>
                        <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                    </>
                  )}

                  {activeTab === 'pharma' && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                          <input type="checkbox" checked={formData.isPrescription} onChange={(e) => setFormData({ ...formData, isPrescription: e.target.checked })} />
                          Thuốc kê đơn (ETC)
                        </label>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Hoạt chất (Generic Name)</label>
                        <input type="text" value={formData.genericName} onChange={(e) => setFormData({ ...formData, genericName: e.target.value })} placeholder="VD: Paracetamol" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Hàm lượng</label>
                          <input type="text" value={formData.concentration} onChange={(e) => setFormData({ ...formData, concentration: e.target.value })} placeholder="VD: 500mg" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Đường dùng</label>
                          <input type="text" value={formData.usage} onChange={(e) => setFormData({ ...formData, usage: e.target.value })} placeholder="VD: Uống" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Quy cách đóng gói</label>
                        <input type="text" value={formData.packingSpec} onChange={(e) => setFormData({ ...formData, packingSpec: e.target.value })} placeholder="VD: Hộp 10 vỉ x 10 viên" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                    </>
                  )}

                  {activeTab === 'detail' && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Chỉ định</label>
                        <textarea rows="3" value={formData.indications} onChange={(e) => setFormData({ ...formData, indications: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Chống chỉ định</label>
                        <textarea rows="3" value={formData.contraindications} onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Liều dùng & Cách dùng</label>
                        <textarea rows="3" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Tác dụng phụ</label>
                        <textarea rows="3" value={formData.sideEffects} onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                    </>
                  )}

                  {activeTab === 'other' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Hãng sản xuất</label>
                          <input type="text" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Nước sản xuất</label>
                          <input type="text" value={formData.countryOfOrigin} onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Số đăng ký</label>
                          <input type="text" value={formData.registrationNo} onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Hạn dùng</label>
                          <input type="text" value={formData.shelfLife} onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })} placeholder="VD: 36 tháng" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Điều kiện bảo quản</label>
                        <input type="text" value={formData.storageCondition} onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                      </div>
                    </>
                  )}
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
        )
      }
    </div >
  );
};

export default AdminProducts;

