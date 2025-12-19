import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

const ProductCatalog = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productsAPI.getAll();
            setProducts(data || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

    const filteredProducts = products.filter(p => {
        const matchSearch = !searchText ||
            p.name.toLowerCase().includes(searchText.toLowerCase()) ||
            p.code.toLowerCase().includes(searchText.toLowerCase());
        const matchCategory = !categoryFilter || p.category?.name === categoryFilter;
        return matchSearch && matchCategory;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStockStatus = (stock) => {
        if (!stock || stock === 0) return { label: 'Hết hàng', color: '#DC2626', bg: '#FEE2E2' };
        if (stock < 10) return { label: 'Sắp hết', color: '#F59E0B', bg: '#FEF3C7' };
        return { label: 'Còn hàng', color: '#059669', bg: '#ECFDF5' };
    };

    return (
        <div style={{ padding: 20, paddingBottom: 100 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', marginRight: 15 }}>←</button>
                <h2 style={{ fontSize: 20, margin: 0, color: '#1E4A8B' }}>📦 Bảng giá & Tồn kho</h2>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 15 }}>
                <input
                    type="text"
                    placeholder="🔍 Tìm sản phẩm theo tên hoặc mã..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 12,
                        border: '1px solid #E5E7EB',
                        fontSize: 15,
                        background: '#F9FAFB'
                    }}
                />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
                    <button onClick={() => setCategoryFilter(null)} style={{
                        padding: '6px 14px',
                        borderRadius: 16,
                        border: 'none',
                        background: !categoryFilter ? '#1E4A8B' : '#fff',
                        color: !categoryFilter ? '#fff' : '#666',
                        fontSize: 13,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        Tất cả
                    </button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                            padding: '6px 14px',
                            borderRadius: 16,
                            border: 'none',
                            background: categoryFilter === cat ? '#1E4A8B' : '#fff',
                            color: categoryFilter === cat ? '#fff' : '#666',
                            fontSize: 13,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Products List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Đang tải...</div>
            ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📦</div>
                    <div style={{ color: '#999' }}>Không tìm thấy sản phẩm</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredProducts.map(product => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                            <div key={product.id} style={{
                                background: '#fff',
                                borderRadius: 12,
                                padding: 14,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                border: '1px solid #F3F4F6'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: 15, color: '#1E293B' }}>{product.name}</h4>
                                        <div style={{ fontSize: 12, color: '#94A3B8' }}>
                                            Mã: {product.code} • {product.unit}
                                        </div>
                                        {product.genericName && (
                                            <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>
                                                HC: {product.genericName}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        background: stockStatus.bg,
                                        color: stockStatus.color,
                                        padding: '4px 10px',
                                        borderRadius: 12,
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        marginLeft: 10
                                    }}>
                                        {stockStatus.label}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1E4A8B' }}>
                                            {formatCurrency(product.price)}
                                        </div>
                                        {product.stock > 0 && (
                                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                                Tồn: {product.stock} {product.unit}
                                            </div>
                                        )}
                                    </div>
                                    {product.manufacturer && (
                                        <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'right' }}>
                                            🏭 {product.manufacturer}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProductCatalog;
