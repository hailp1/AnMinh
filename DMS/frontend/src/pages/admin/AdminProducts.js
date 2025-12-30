
import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Search, Filter, Plus, Edit, Trash2, Tag,
  Layers, MoreVertical, LayoutGrid, List, Image as ImageIcon,
  DollarSign, Activity, AlertCircle, ShoppingBag, Archive, ChevronRight,
  Download, Upload, X, Save
} from 'lucide-react';
import ImportModal from '../../components/ImportModal';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// --- STYLES (Enterprise Theme - Consistent with CRM) ---
const THEME = {
  primary: '#0f172a',    // Slate 900
  secondary: '#334155',  // Slate 700
  accent: '#6366f1',     // Indigo 500 (Different from CRM Blue)
  success: '#10b981',    // Emerald 500
  warning: '#f59e0b',    // Amber 500
  danger: '#ef4444',     // Red 500
  bg: '#f8fafc',         // Slate 50
  cardBg: '#ffffff',
  text: '#1e293b',       // Slate 800
  textLight: '#64748b',  // Slate 500
  border: '#e2e8f0'      // Slate 200
};

const STAT_CARDS = [
  { title: 'Tổng Sản Phẩm', icon: Package, color: THEME.accent, key: 'total' },
  { title: 'Sắp Hết Hàng', icon: AlertCircle, color: THEME.danger, key: 'lowStock' },
  { title: 'Hàng Mới', icon: Tag, color: THEME.success, key: 'new' },
  { title: 'Danh Mục', icon: Layers, color: THEME.warning, key: 'groups' }
];

const AdminProducts = () => {
  // State
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'list' | 'grid'
  const [selectedProduct, setSelectedProduct] = useState(null); // For Right Panel Detail
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGroup, setActiveGroup] = useState('ALL');

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const [prodRes, groupRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/products`, { headers }),
        fetch(`${API_BASE}/products/groups`, { headers }),
        fetch(`${API_BASE}/products/categories`, { headers }).catch(() => ({ ok: false }))
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (groupRes.ok) setGroups(await groupRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      else setCategories([]);
    } catch (error) {
      console.error('Error loading Product Catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create/Edit Handler
  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      };

      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct
        ? `${API_BASE}/products/admin/products/${editingProduct.id}`
        : `${API_BASE}/products/admin/products`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Lưu sản phẩm thành công!');
        setShowModal(false);
        setEditingProduct(null);
        loadData();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Có lỗi xảy ra khi lưu.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        if (selectedProduct?.id === id) setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleExport = () => {
    window.open(`${API_BASE}/excel/export/products`, '_blank');
  };

  const handleDownloadTemplate = () => {
    window.open(`${API_BASE}/excel/template/products`, '_blank');
  };

  // KPIs
  const kpiData = useMemo(() => {
    return {
      total: products.length,
      lowStock: products.filter(p => (p.currentStock || 0) < (p.minStock || 10)).length,
      new: products.filter(p => new Date(p.createdAt) > new Date(new Date().setDate(new Date().getDate() - 30))).length,
      groups: groups.length
    };
  }, [products, groups]);

  // Filtering
  const filteredData = useMemo(() => {
    let data = products;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(p =>
        p.name?.toLowerCase().includes(lower) ||
        p.code?.toLowerCase().includes(lower) ||
        p.genericName?.toLowerCase().includes(lower)
      );
    }
    if (activeGroup !== 'ALL') {
      data = data.filter(p => p.groupId === activeGroup);
    }
    return data;
  }, [products, searchTerm, activeGroup]);

  // Styles
  const ss = {
    container: { fontFamily: 'Inter, sans-serif', background: THEME.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { padding: '20px 30px', background: THEME.cardBg, borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '24px', fontWeight: '700', color: THEME.primary, display: 'flex', alignItems: 'center', gap: '10px' },

    mainLayout: { display: 'flex', flex: 1, padding: '24px 30px', gap: '24px', overflow: 'hidden' },
    sidebar: { width: '260px', background: 'white', borderRadius: '12px', border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' },

    // Grid
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', overflowY: 'auto', paddingBottom: '20px' },
    card: { background: 'white', border: `1px solid ${THEME.border}`, borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column' },
    cardImg: { height: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    cardBody: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' },
    cardTitle: { fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: THEME.text, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
    cardSub: { fontSize: '13px', color: THEME.textLight, marginBottom: '8px' },
    cardPrice: { fontSize: '16px', fontWeight: '700', color: THEME.accent, marginTop: 'auto' },
    badge: { position: 'absolute', top: 10, right: 10, padding: '4px 8px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: THEME.textLight, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },

    // Sidebar Items
    menuItem: (active) => ({ padding: '12px 20px', fontSize: '14px', fontWeight: active ? '600' : '500', color: active ? THEME.accent : THEME.text, background: active ? '#eef2ff' : 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRight: active ? `3px solid ${THEME.accent}` : 'none' }),

    // Action Bar
    actionBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 20px', borderRadius: '12px', border: `1px solid ${THEME.border}` },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${THEME.border}`, width: '300px' },
    input: { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%' },

    // Detail Panel
    detailPanel: { width: '400px', background: 'white', borderRadius: '12px', border: `1px solid ${THEME.border}`, padding: '0', display: 'flex', flexDirection: 'column', overflowY: 'auto', borderLeft: `1px solid ${THEME.border}` },

    // Modal
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'white', borderRadius: '16px', width: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: THEME.text },
    input: { padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none' },
    header: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }
  };

  return (
    <div style={ss.container}>
      {/* HEADER */}
      <div style={ss.header}>
        <div style={ss.title}>
          <Package size={28} color={THEME.accent} />
          Product Catalog
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleDownloadTemplate} style={{ background: 'white', border: `1px solid ${THEME.border}`, padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Template
          </button>
          <button onClick={() => setShowImportModal(true)} style={{ background: 'white', border: `1px solid ${THEME.border}`, padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} /> Import
          </button>
          <button onClick={handleExport} style={{ background: 'white', border: `1px solid ${THEME.border}`, padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} /> Export
          </button>
          <button onClick={() => { setEditingProduct(null); setShowModal(true); }} style={{ background: THEME.accent, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Thêm Sản Phẩm
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={ss.mainLayout}>
        {/* SIDEBAR: CATEGORIES */}
        <div style={ss.sidebar}>
          <div style={{ padding: '20px', fontSize: '12px', fontWeight: '700', color: THEME.textLight, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Danh Mục</div>
          <div
            style={ss.menuItem(activeGroup === 'ALL')}
            onClick={() => setActiveGroup('ALL')}
          >
            <span>Tất Cả</span>
            <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px' }}>{kpiData.total}</span>
          </div>
          {groups.map(g => (
            <div
              key={g.id}
              style={ss.menuItem(activeGroup === g.id)}
              onClick={() => setActiveGroup(g.id)}
            >
              <span>{g.name}</span>
              <ChevronRight size={14} color={THEME.textLight} />
            </div>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div style={ss.content}>
          {/* Stats Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {STAT_CARDS.map(c => (
              <div key={c.key} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                  <c.icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: THEME.text }}>{kpiData[c.key]}</div>
                  <div style={{ fontSize: '12px', color: THEME.textLight }}>{c.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div style={ss.actionBar}>
            <div style={ss.searchBox}>
              <Search size={18} color={THEME.textLight} />
              <input
                style={ss.input}
                placeholder="Tìm tên, mã, hoạt chất..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '8px', borderRadius: '6px', border: 'none', background: viewMode === 'grid' ? '#e2e8f0' : 'transparent', cursor: 'pointer' }}><LayoutGrid size={20} /></button>
              <button onClick={() => setViewMode('list')} style={{ padding: '8px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? '#e2e8f0' : 'transparent', cursor: 'pointer' }}><List size={20} /></button>
            </div>
          </div>

          {/* DATA GRID */}
          <div style={ss.gridContainer}>
            {filteredData.map(p => (
              <div
                key={p.id}
                style={{
                  ...ss.card,
                  boxShadow: selectedProduct?.id === p.id ? `0 0 0 2px ${THEME.accent}` : 'none',
                  transform: selectedProduct?.id === p.id ? 'scale(1.02)' : 'none'
                }}
                onClick={() => setSelectedProduct(p)}
              >
                <div style={ss.cardImg}>
                  {p.image ? (
                    <img src={p.image.startsWith('http') ? p.image : `${API_BASE}/${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <ImageIcon size={40} color={THEME.textLight} />
                  )}
                  {p.isPrescription && <div style={{ position: 'absolute', top: 10, left: 10, background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>Rx</div>}
                  <div style={ss.badge}>{p.code}</div>
                </div>
                <div style={ss.cardBody}>
                  <div style={ss.cardTitle} title={p.name}>{p.name}</div>
                  <div style={ss.cardSub}>{p.genericName || p.manufacturer || 'Unknown'}</div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={ss.cardPrice}>{(p.price || 0).toLocaleString()} ₫</div>
                    <div style={{ fontSize: '12px', color: (p.currentStock || 100) < 20 ? THEME.danger : THEME.success, fontWeight: '600' }}>
                      Stock: {p.currentStock || 100}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: PRODUCT DETAIL */}
        {selectedProduct && (
          <div style={ss.detailPanel}>
            <div style={{ height: '200px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${THEME.border}` }}>
              {selectedProduct.image ? (
                <img src={selectedProduct.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <ImageIcon size={64} color={THEME.textLight} />
              )}
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: THEME.accent }}>{selectedProduct.code}</div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px', marginBottom: '8px' }}>{selectedProduct.name}</h2>
                  <div style={{ fontSize: '13px', color: THEME.textLight }}>{selectedProduct.genericName}</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: THEME.text }}>
                  {(selectedProduct.price || 0).toLocaleString()} <span style={{ fontSize: '12px', fontWeight: '400', color: THEME.textLight }}>/ {selectedProduct.unit}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InfoItem label="Nhóm" value={groups.find(g => g.id === selectedProduct.groupId)?.name || 'N/A'} />
                <InfoItem label="Danh Mục" value={categories.find(c => c.id === selectedProduct.categoryId)?.name || 'N/A'} />
                <InfoItem label="Nhà SX (Brand)" value={selectedProduct.manufacturer} />
                <InfoItem label="Quy cách" value={selectedProduct.packingSpec} />
                <InfoItem label="SDK" value={selectedProduct.registrationNo} />
                <InfoItem label="Công dụng" value={selectedProduct.usage} span={2} />
                <InfoItem label="Hàm lượng" value={selectedProduct.concentration} />
                <InfoItem label="Chỉ định" value={selectedProduct.indications} span={2} />
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setEditingProduct(selectedProduct); setShowModal(true); }}
                  style={{ flex: 1, padding: '10px', background: THEME.text, color: 'white', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Edit Details
                </button>
                <button
                  onClick={() => handleDelete(selectedProduct.id)}
                  style={{ padding: '10px', background: 'white', border: `1px solid ${THEME.danger}`, borderRadius: '8px', color: THEME.danger, cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div style={{ marginTop: 'auto', padding: '16px', borderTop: `1px solid ${THEME.border}`, background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedProduct(null)} style={{ background: 'transparent', border: 'none', color: THEME.textLight, cursor: 'pointer', fontWeight: '500' }}>Close Panel</button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          groups={groups}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        endpoint="products"
        title="Import Sản Phẩm"
        onSuccess={() => {
          loadData();
          setShowImportModal(false);
        }}
      />
    </div>
  );
};

const ProductModal = ({ product, groups, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', code: '', groupId: '', categoryId: '', unit: '', price: 0,
    genericName: '', manufacturer: '', usage: '', indications: '', concentration: '',
    packingSpec: '', isPrescription: false, minStock: 10,
    ...product // Override defaults if editing
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const ss = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'white', borderRadius: '16px', width: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: THEME.text },
    input: { padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none' },
    header: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }
  };

  return (
    <div style={ss.modalOverlay}>
      <div style={ss.modalContent}>
        <div style={ss.header}>
          <span>{product ? 'Cập nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={ss.formGrid}>
            <div style={{ gridColumn: 'span 3', fontSize: '16px', fontWeight: 'bold', color: THEME.accent, marginTop: '0px' }}>Thông tin cơ bản</div>

            <FormGroup label="Tên Sản Phẩm *" style={ss}>
              <input style={ss.input} name="name" value={formData.name} onChange={handleChange} required />
            </FormGroup>
            <FormGroup label="Mã SKU (Code)" style={ss}>
              <input style={ss.input} name="code" value={formData.code} onChange={handleChange} />
            </FormGroup>
            <FormGroup label="Đơn vị tính" style={ss}>
              <input style={ss.input} name="unit" value={formData.unit} onChange={handleChange} placeholder="Hộp/Lọ/Vỉ" />
            </FormGroup>

            <FormGroup label="Nhóm Hàng" style={ss}>
              <select style={ss.input} name="groupId" value={formData.groupId} onChange={handleChange} required>
                <option value="">-- Chọn Nhóm --</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Danh Mục" style={ss}>
              <select style={ss.input} name="categoryId" value={formData.categoryId} onChange={handleChange}>
                <option value="">-- Chọn Danh Mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Giá Bán" style={ss}>
              <input style={ss.input} type="number" name="price" value={formData.price} onChange={handleChange} required />
            </FormGroup>

            <div style={{ gridColumn: 'span 3', fontSize: '16px', fontWeight: 'bold', color: THEME.accent, marginTop: '10px' }}>Thông tin dược phẩm</div>

            <FormGroup label="Hoạt chất (Active Ingredient)" style={ss}>
              <input style={ss.input} name="genericName" value={formData.genericName} onChange={handleChange} />
            </FormGroup>
            <FormGroup label="Hãng SX (Brand)" style={ss}>
              <input style={ss.input} name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
            </FormGroup>
            <FormGroup label="Hàm lượng" style={ss}>
              <input style={ss.input} name="concentration" value={formData.concentration} onChange={handleChange} />
            </FormGroup>

            <FormGroup label="Công dụng (Usage)" style={ss}>
              <input style={ss.input} name="usage" value={formData.usage} onChange={handleChange} placeholder="VD: Giảm đau, hạ sốt" />
            </FormGroup>

            <FormGroup label="Quy cách đóng gói" style={ss}>
              <input style={ss.input} name="packingSpec" value={formData.packingSpec} onChange={handleChange} />
            </FormGroup>
            <FormGroup label="Số Đăng Ký" style={ss}>
              <input style={ss.input} name="registrationNo" value={formData.registrationNo} onChange={handleChange} />
            </FormGroup>

            <div style={{ gridColumn: 'span 3' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', cursor: 'pointer' }}>
                <input type="checkbox" name="isPrescription" checked={formData.isPrescription} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                Thuốc Kê Đơn (Rx)
              </label>
            </div>

            <FormGroup label="Chỉ định (Indications)" style={{ ...ss, gridColumn: 'span 3' }}>
              <textarea style={{ ...ss.input, height: '80px', fontFamily: 'inherit' }} name="indications" value={formData.indications} onChange={handleChange} />
            </FormGroup>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', borderTop: `1px solid ${THEME.border}`, paddingTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: THEME.text, fontWeight: '600', cursor: 'pointer' }}>Hủy bỏ</button>
            <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: THEME.accent, color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Save size={18} /> Lưu Sản Phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormGroup = ({ label, children, style }) => (
  <div style={style.formGroup}>
    <label style={style.label}>{label}</label>
    {children}
  </div>
);

const InfoItem = ({ label, value, span = 1 }) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <div style={{ fontSize: '11px', color: THEME.textLight, marginBottom: '2px' }}>{label}</div>
    <div style={{ fontSize: '14px', fontWeight: '500', color: THEME.text }}>{value || '--'}</div>
  </div>
);

export default AdminProducts;
