import React, { useState, useEffect } from 'react';
import { Tag, Layers, Plus, Edit, Trash2, Search, Save, X } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const THEME = {
    primary: '#0f172a',
    secondary: '#334155',
    accent: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    text: '#1e293b',
    textLight: '#64748b',
    border: '#e2e8f0'
};

const AdminCategories = () => {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'groups'
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };

            const [catRes, groupRes] = await Promise.all([
                fetch(`${API_BASE}/products/categories`, { headers }),
                fetch(`${API_BASE}/products/groups`, { headers })
            ]);

            if (catRes.ok) setCategories(await catRes.json());
            if (groupRes.ok) setGroups(await groupRes.json());
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            };

            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem
                ? `${API_BASE}/products/admin/categories/${editingItem.id}`
                : `${API_BASE}/products/admin/categories`;

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Lưu danh mục thành công!');
                setShowModal(false);
                setEditingItem(null);
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

    const handleSaveGroup = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            };

            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem
                ? `${API_BASE}/products/admin/groups/${editingItem.id}`
                : `${API_BASE}/products/admin/groups`;

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Lưu nhóm sản phẩm thành công!');
                setShowModal(false);
                setEditingItem(null);
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

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/products/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                alert('Xóa danh mục thành công!');
                loadData();
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Có lỗi xảy ra khi xóa.');
        }
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nhóm sản phẩm này?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/products/admin/groups/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                alert('Xóa nhóm sản phẩm thành công!');
                loadData();
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Có lỗi xảy ra khi xóa.');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGroups = groups.filter(g =>
        g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ss = {
        container: { fontFamily: 'Inter, sans-serif', background: THEME.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
        header: { padding: '20px 30px', background: THEME.cardBg, borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        title: { fontSize: '24px', fontWeight: '700', color: THEME.primary, display: 'flex', alignItems: 'center', gap: '10px' },
        content: { flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' },
        statsRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
        statCard: { background: 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', gap: '16px' },
        tabBar: { display: 'flex', gap: '8px', background: 'white', padding: '8px', borderRadius: '12px', border: `1px solid ${THEME.border}` },
        tab: (active) => ({
            flex: 1,
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            background: active ? THEME.accent : 'transparent',
            color: active ? 'white' : THEME.text,
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
        }),
        actionBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 20px', borderRadius: '12px', border: `1px solid ${THEME.border}` },
        searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${THEME.border}`, width: '300px' },
        input: { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%' },
        table: { background: 'white', borderRadius: '12px', border: `1px solid ${THEME.border}`, overflow: 'hidden' },
        tableHeader: { background: '#f8fafc', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 120px', gap: '16px', fontWeight: '600', fontSize: '13px', color: THEME.textLight, textTransform: 'uppercase', letterSpacing: '0.5px' },
        tableRow: { padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 120px', gap: '16px', borderTop: `1px solid ${THEME.border}`, alignItems: 'center' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '16px', width: '500px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
        formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
        label: { fontSize: '13px', fontWeight: '600', color: THEME.text },
        formInput: { padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none' }
    };

    return (
        <div style={ss.container}>
            {/* HEADER */}
            <div style={ss.header}>
                <div style={ss.title}>
                    <Layers size={28} color={THEME.accent} />
                    Quản lý Danh Mục & Nhóm Sản Phẩm
                </div>
            </div>

            {/* CONTENT */}
            <div style={ss.content}>
                {/* STATS */}
                <div style={ss.statsRow}>
                    <div style={ss.statCard}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${THEME.warning}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.warning }}>
                            <Tag size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: THEME.text }}>{categories.length}</div>
                            <div style={{ fontSize: '13px', color: THEME.textLight }}>Danh Mục Sản Phẩm</div>
                        </div>
                    </div>
                    <div style={ss.statCard}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${THEME.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.accent }}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: THEME.text }}>{groups.length}</div>
                            <div style={{ fontSize: '13px', color: THEME.textLight }}>Nhóm Sản Phẩm</div>
                        </div>
                    </div>
                </div>

                {/* TAB BAR */}
                <div style={ss.tabBar}>
                    <button style={ss.tab(activeTab === 'categories')} onClick={() => setActiveTab('categories')}>
                        <Tag size={18} style={{ display: 'inline', marginRight: '8px' }} />
                        Danh Mục Sản Phẩm
                    </button>
                    <button style={ss.tab(activeTab === 'groups')} onClick={() => setActiveTab('groups')}>
                        <Layers size={18} style={{ display: 'inline', marginRight: '8px' }} />
                        Nhóm Sản Phẩm
                    </button>
                </div>

                {/* ACTION BAR */}
                <div style={ss.actionBar}>
                    <div style={ss.searchBox}>
                        <Search size={18} color={THEME.textLight} />
                        <input
                            style={ss.input}
                            placeholder={`Tìm ${activeTab === 'categories' ? 'danh mục' : 'nhóm'}...`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { setEditingItem(null); setShowModal(true); }}
                        style={{ background: THEME.accent, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} />
                        {activeTab === 'categories' ? 'Thêm Danh Mục' : 'Thêm Nhóm'}
                    </button>
                </div>

                {/* TABLE */}
                <div style={ss.table}>
                    <div style={ss.tableHeader}>
                        <div>Tên</div>
                        <div>Mã</div>
                        <div>Mô tả</div>
                        <div>Thao tác</div>
                    </div>
                    {activeTab === 'categories' ? (
                        filteredCategories.length > 0 ? (
                            filteredCategories.map(cat => (
                                <div key={cat.id} style={ss.tableRow}>
                                    <div style={{ fontWeight: '600', color: THEME.text }}>{cat.name}</div>
                                    <div style={{ fontSize: '13px', color: THEME.textLight, fontFamily: 'monospace' }}>{cat.code}</div>
                                    <div style={{ fontSize: '13px', color: THEME.textLight }}>{cat.description || '--'}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => { setEditingItem(cat); setShowModal(true); }}
                                            style={{ padding: '6px 12px', background: 'white', border: `1px solid ${THEME.border}`, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            style={{ padding: '6px 12px', background: 'white', border: `1px solid ${THEME.danger}`, borderRadius: '6px', cursor: 'pointer', color: THEME.danger }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: THEME.textLight }}>
                                Không tìm thấy danh mục nào
                            </div>
                        )
                    ) : (
                        filteredGroups.length > 0 ? (
                            filteredGroups.map(group => (
                                <div key={group.id} style={ss.tableRow}>
                                    <div style={{ fontWeight: '600', color: THEME.text }}>{group.name}</div>
                                    <div style={{ fontSize: '13px', color: THEME.textLight, fontFamily: 'monospace' }}>{group.code || '--'}</div>
                                    <div style={{ fontSize: '13px', color: THEME.textLight }}>{group.description || '--'}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => { setEditingItem(group); setShowModal(true); }}
                                            style={{ padding: '6px 12px', background: 'white', border: `1px solid ${THEME.border}`, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGroup(group.id)}
                                            style={{ padding: '6px 12px', background: 'white', border: `1px solid ${THEME.danger}`, borderRadius: '6px', cursor: 'pointer', color: THEME.danger }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: THEME.textLight }}>
                                Không tìm thấy nhóm sản phẩm nào
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                activeTab === 'categories' ? (
                    <CategoryModal
                        category={editingItem}
                        onClose={() => { setShowModal(false); setEditingItem(null); }}
                        onSave={handleSaveCategory}
                    />
                ) : (
                    <GroupModal
                        group={editingItem}
                        onClose={() => { setShowModal(false); setEditingItem(null); }}
                        onSave={handleSaveGroup}
                    />
                )
            )}
        </div>
    );
};

const CategoryModal = ({ category, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        ...category
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const ss = {
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '16px', width: '500px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
        header: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
        label: { fontSize: '13px', fontWeight: '600', color: THEME.text },
        input: { padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none' }
    };

    return (
        <div style={ss.modalOverlay}>
            <div style={ss.modalContent}>
                <div style={ss.header}>
                    <span>{category ? 'Cập nhật Danh Mục' : 'Thêm Danh Mục Mới'}</span>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={ss.formGroup}>
                        <label style={ss.label}>Tên Danh Mục *</label>
                        <input
                            style={ss.input}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="VD: Thuốc kháng sinh"
                        />
                    </div>

                    <div style={ss.formGroup}>
                        <label style={ss.label}>Mã Danh Mục</label>
                        <input
                            style={ss.input}
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="VD: ANTIBIOTIC (tự động tạo nếu để trống)"
                        />
                    </div>

                    <div style={ss.formGroup}>
                        <label style={ss.label}>Mô tả</label>
                        <textarea
                            style={{ ...ss.input, height: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Mô tả chi tiết về danh mục này..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${THEME.border}` }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: THEME.text, fontWeight: '600', cursor: 'pointer' }}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: THEME.accent, color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
                        >
                            <Save size={18} />
                            Lưu Danh Mục
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const GroupModal = ({ group, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        order: 0,
        ...group
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const ss = {
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '16px', width: '500px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
        header: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
        label: { fontSize: '13px', fontWeight: '600', color: THEME.text },
        input: { padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none' }
    };

    return (
        <div style={ss.modalOverlay}>
            <div style={ss.modalContent}>
                <div style={ss.header}>
                    <span>{group ? 'Cập nhật Nhóm Sản Phẩm' : 'Thêm Nhóm Sản Phẩm Mới'}</span>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={ss.formGroup}>
                        <label style={ss.label}>Tên Nhóm *</label>
                        <input
                            style={ss.input}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="VD: Thuốc tiêu hóa"
                        />
                    </div>

                    <div style={ss.formGroup}>
                        <label style={ss.label}>Mã Nhóm</label>
                        <input
                            style={ss.input}
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="VD: DIGESTIVE"
                        />
                    </div>

                    <div style={ss.formGroup}>
                        <label style={ss.label}>Thứ tự hiển thị</label>
                        <input
                            style={ss.input}
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div style={ss.formGroup}>
                        <label style={ss.label}>Mô tả</label>
                        <textarea
                            style={{ ...ss.input, height: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Mô tả chi tiết về nhóm sản phẩm này..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${THEME.border}` }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: THEME.text, fontWeight: '600', cursor: 'pointer' }}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: THEME.accent, color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
                        >
                            <Save size={18} />
                            Lưu Nhóm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCategories;
