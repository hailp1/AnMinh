import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, pharmaciesAPI } from '../services/api';

const CreateOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pharmacy, setPharmacy] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pharmacyData, productsData] = await Promise.all([
                    pharmaciesAPI.getById(id),
                    productsAPI.getAll()
                ]);
                setPharmacy(pharmacyData);

                if (productsData && productsData.length > 0) {
                    setProducts(productsData);
                } else {
                    // Mock data if API returns empty
                    const mockProducts = Array.from({ length: 60 }, (_, i) => ({
                        id: i + 1,
                        code: `SKU${String(i + 1).padStart(3, '0')}`,
                        name: `Thuốc mẫu ${i + 1} - Điều trị bệnh lý`,
                        price: 50000 + (i * 5000),
                        unit: 'Hộp',
                        image: 'https://via.placeholder.com/50'
                    }));
                    setProducts(mockProducts);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Mock data fallback
                const mockProducts = Array.from({ length: 60 }, (_, i) => ({
                    id: i + 1,
                    code: `SKU${String(i + 1).padStart(3, '0')}`,
                    name: `Thuốc mẫu ${i + 1} - Điều trị bệnh lý`,
                    price: 50000 + (i * 5000),
                    unit: 'Hộp',
                    image: 'https://via.placeholder.com/50'
                }));
                setProducts(mockProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const updateQuantity = (productId, delta) => {
        setCart(prev => {
            const currentQty = prev[productId] || 0;
            const newQty = Math.max(0, currentQty + delta);
            if (newQty === 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: newQty };
        });
    };

    const handleQuantityChange = (productId, value) => {
        const qty = parseInt(value) || 0;
        setCart(prev => {
            if (qty <= 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: qty };
        });
    };

    const calculateTotal = () => {
        return Object.entries(cart).reduce((sum, [productId, qty]) => {
            const product = products.find(p => String(p.id) === String(productId));
            return sum + (product ? product.price * qty : 0);
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '15px', border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                ← Quay lại
            </button>

            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', color: '#1E4A8B', margin: 0 }}>Đơn hàng cho: {pharmacy?.name}</h2>
                <p style={{ color: '#666', fontSize: '13px', margin: '5px 0 0 0' }}>{pharmacy?.address}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {products.map(product => (
                    <div key={product.id} style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            💊
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{product.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{product.code} • {product.unit}</div>
                            <div style={{ color: '#F29E2E', fontWeight: 'bold' }}>{formatCurrency(product.price)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => updateQuantity(product.id, -1)}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                            >-</button>
                            <input
                                type="number"
                                value={cart[product.id] || 0}
                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                style={{ width: '40px', textAlign: 'center', border: 'none', fontSize: '16px', fontWeight: '600' }}
                            />
                            <button
                                onClick={() => updateQuantity(product.id, 1)}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#1E4A8B', color: '#fff', cursor: 'pointer' }}
                            >+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                position: 'sticky',
                bottom: 0,
                background: '#fff',
                padding: '15px 20px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                borderTop: '1px solid #eee',
                zIndex: 100,
                marginTop: '20px',
                borderRadius: '12px 12px 0 0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>Tổng tiền:</span>
                    <span style={{ color: '#F29E2E' }}>{formatCurrency(calculateTotal())}</span>
                </div>
                <button
                    onClick={() => {
                        if (Object.keys(cart).length === 0) {
                            alert('Vui lòng chọn ít nhất một sản phẩm');
                            return;
                        }
                        navigate('/order-summary', {
                            state: {
                                cart,
                                products,
                                pharmacy,
                                total: calculateTotal()
                            }
                        });
                    }}
                    style={{ width: '100%', padding: '15px', background: '#1E4A8B', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Tính KM
                </button>
            </div>
        </div>
    );
};

export default CreateOrder;
