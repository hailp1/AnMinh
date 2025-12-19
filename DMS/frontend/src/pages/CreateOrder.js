import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, pharmaciesAPI, ordersAPI, promotionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateOrder = () => {
    const { id, orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // View Mode
    const [viewMode, setViewMode] = useState('list');

    const [pharmacy, setPharmacy] = useState(null);
    const [products, setProducts] = useState([]);
    const [promotions, setPromotions] = useState([]);

    // Filter State
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filterType, setFilterType] = useState('ALL'); // ALL, SINGLE, COMBO

    // Order State
    const [cart, setCart] = useState({});
    const [showReview, setShowReview] = useState(false);
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!orderId;

    useEffect(() => {
        loadData();
    }, [id, orderId]);

    const loadData = async () => {
        try {
            const productsData = await productsAPI.getAll();
            setProducts(productsData || []);

            let currentPharmacyId = id;
            let loadedOrder = null;

            if (isEditMode) {
                loadedOrder = await ordersAPI.getById(orderId);
                currentPharmacyId = loadedOrder.pharmacyId;
                setDeliveryNotes(loadedOrder.notes || '');
            }

            if (currentPharmacyId) {
                const [pharmacyData, promoData] = await Promise.all([
                    pharmaciesAPI.getById(currentPharmacyId),
                    promotionsAPI.getAvailable(currentPharmacyId).catch(() => [])
                ]);
                setPharmacy(pharmacyData);
                setPromotions(promoData || []);
                // Debug log
                console.log('Promotions loaded:', promoData);
            }

            if (isEditMode && loadedOrder && productsData) {
                const initialCart = {};
                loadedOrder.items.forEach(item => {
                    const product = productsData.find(p => p.id === item.productId);
                    if (product) {
                        const rate = product.conversionRate || 1;
                        const cs = Math.floor(item.quantity / rate);
                        const ea = item.quantity % rate;
                        initialCart[item.productId] = { cs, ea };
                    }
                });
                setCart(initialCart);
            }
        } catch (error) {
            console.error('Data Load Error:', error);
        }
    };

    // Filter Logic
    const filteredProducts = useMemo(() => {
        let result = products;

        // 1. Text Search
        if (searchText) {
            const lowerIndex = searchText.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerIndex) ||
                p.code?.toLowerCase().includes(lowerIndex)
            );
        }

        // 2. Category Filter
        if (selectedCategory) {
            result = result.filter(p => p.category?.name === selectedCategory);
        }

        // 3. Type Filter (Combo vs Single)
        if (filterType === 'COMBO') {
            result = result.filter(p => p.isCombo);
        } else if (filterType === 'SINGLE') {
            result = result.filter(p => !p.isCombo);
        }

        return result;
    }, [products, searchText, selectedCategory, filterType]);

    const categories = useMemo(() =>
        [...new Set(products.map(p => p.category?.name).filter(Boolean))],
        [products]);

    const updateCart = (productId, field, value) => {
        setCart(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value === '' ? 0 : parseInt(value) || 0
            }
        }));
    };

    const handleFocus = (e) => e.target.select();

    // --- NEW ROBUST CALCULATION LOGIC ---
    const calculateOrder = () => {
        let subtotal = 0;
        let totalDiscount = 0;
        let giftItems = [];
        let appliedPromotions = [];

        // 1. Calculate Base Items
        const cartItemsList = [];
        Object.entries(cart).forEach(([productId, qty]) => {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const csQty = qty.cs || 0;
            const eaQty = qty.ea || 0;
            const rate = product.conversionRate && product.conversionRate > 0 ? product.conversionRate : 1;
            const totalQty = (csQty * rate) + eaQty;

            if (totalQty > 0) {
                const itemTotal = totalQty * product.price;
                subtotal += itemTotal;
                cartItemsList.push({
                    ...product,
                    totalQty,
                    itemTotal,
                    qtyDisplay: { cs: csQty, ea: eaQty }
                });
            }
        });

        // 2. Apply Promotions (Iterating correctly through Promo Items)
        if (promotions && promotions.length > 0) {
            promotions.forEach(promo => {
                // If promo has specific items defined
                if (promo.items && promo.items.length > 0) {
                    promo.items.forEach(pItem => {
                        // Match cart item with promo item
                        const eligibleItem = cartItemsList.find(item => item.id == pItem.productId);

                        if (eligibleItem) {
                            // Check Quantity Condition (pItem.quantity is the required amount)
                            if (eligibleItem.totalQty >= (pItem.quantity || 0)) {

                                // === DISCOUNT LOGIC ===
                                if (promo.type === 'DISCOUNT' || promo.type === 'PRODUCT_DISCOUNT') {
                                    // Use item-specific discount OR global promo discount
                                    const val = pItem.discountValue || promo.discountValue || 0;
                                    let discountAmount = 0;

                                    if (promo.discountType === 'PERCENTAGE') {
                                        discountAmount = eligibleItem.itemTotal * (val / 100);
                                        if (discountAmount > 0) {
                                            appliedPromotions.push({
                                                name: `CK ${val}% (${eligibleItem.name}) - ${promo.name}`,
                                                value: discountAmount,
                                                type: 'DISCOUNT'
                                            });
                                        }
                                    } else {
                                        // FIXED AMOUNT (Assume per order unless logic dictates per unit? Defaulting to Per Unit for item-level or fixed)
                                        // Simplification: Fixed discount usually applied once per criteria or per unit? 
                                        // Let's assume Fixed Amount is per Unit for flexibility if defined on Item
                                        // OR Fixed Amount is Total if defined on Promo.

                                        // Safety: If value seems large (> 1000), assume currency.
                                        discountAmount = val;
                                        if (discountAmount > 0) {
                                            appliedPromotions.push({
                                                name: `Giảm ${formatCurrency(val)} (${eligibleItem.name})`,
                                                value: discountAmount,
                                                type: 'DISCOUNT'
                                            });
                                        }
                                    }

                                    totalDiscount += discountAmount;
                                }

                                // === GIFT LOGIC (Buy X Get Y) ===
                                if (promo.type === 'BUY_X_GET_Y' || promo.type === 'GIFT') {
                                    // Rule: "Buy [pItem.quantity] Get [promo.discountValue] Free"
                                    // Assuming Gift is the SAME product unless we have 'giftProductId' (not in schema)
                                    const sets = Math.floor(eligibleItem.totalQty / (pItem.quantity || 1));
                                    if (sets > 0) {
                                        // Use global discountValue as quantity of gifts, default 1
                                        const giftQtyPerSet = promo.discountValue || 1;
                                        const totalGiftQty = sets * giftQtyPerSet;

                                        giftItems.push({ name: eligibleItem.name, quantity: totalGiftQty });
                                        appliedPromotions.push({
                                            name: `Tặng: ${totalGiftQty} ${eligibleItem.name} (Mua ${pItem.quantity} tặng ${giftQtyPerSet})`,
                                            value: 0,
                                            type: 'GIFT'
                                        });
                                    }
                                }
                            }
                        }
                    });
                } else {
                    // Global Cart Promotion (No specific items)
                    // e.g. "5% off total order if > 1M"
                    if (promo.minOrderAmount && subtotal >= promo.minOrderAmount) {
                        if (promo.discountType === 'PERCENTAGE') {
                            const discountVal = subtotal * ((promo.discountValue || 0) / 100);
                            if (discountVal > 0) {
                                totalDiscount += discountVal;
                                appliedPromotions.push({ name: `CK Tổng đơn: ${promo.name}`, value: discountVal, type: 'DISCOUNT' });
                            }
                        } else {
                            const discountVal = promo.discountValue || 0;
                            if (discountVal > 0) {
                                totalDiscount += discountVal;
                                appliedPromotions.push({ name: `Giảm Tổng đơn: ${promo.name}`, value: discountVal, type: 'DISCOUNT' });
                            }
                        }
                    }
                }
            });
        }

        return {
            subtotal,
            discount: totalDiscount,
            total: subtotal - totalDiscount,
            items: cartItemsList,
            gifts: giftItems,
            appliedPromos: appliedPromotions
        };
    };

    const orderMetrics = calculateOrder();

    // Helper: Find active promo explanation for badge
    const getProductPromoInfo = (product) => {
        if (!promotions.length) return null;
        for (const promo of promotions) {
            if (promo.items && promo.items.length > 0) {
                const match = promo.items.find(pi => pi.productId == product.id);
                if (match) {
                    if (promo.type === 'BUY_X_GET_Y') return `Mua ${match.quantity} tặng ${promo.discountValue || 1}`;
                    if (promo.discountType === 'PERCENTAGE') return `Giảm ${match.discountValue || promo.discountValue}%`;
                    if (promo.discountType === 'FIXED_AMOUNT') return `Giảm ${formatCurrency(match.discountValue || promo.discountValue)}`;
                    return promo.name;
                }
            }
        }
        return null;
    };

    const handleSubmit = async () => {
        if (orderMetrics.items.length === 0) return alert('Vui lòng chọn sản phẩm');
        setIsSubmitting(true);
        try {
            const apiItems = orderMetrics.items.map(item => ({
                productId: item.id,
                quantity: item.totalQty,
                price: item.price
            }));
            const payload = {
                pharmacyId: pharmacy.id,
                items: apiItems,
                totalAmount: orderMetrics.total,
                discountAmount: orderMetrics.discount,
                deliveryNotes,
                status: 'PENDING'
            };

            if (isEditMode) await ordersAPI.update(orderId, payload);
            else await ordersAPI.create(payload);

            navigate('/order-summary');
        } catch (error) {
            alert('Lỗi: ' + error.message);
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F1F5F9' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1E4A8B 0%, #2563EB 100%)', padding: '16px 20px', color: '#fff', boxShadow: '0 4px 12px rgba(30,74,139,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 20, cursor: 'pointer', width: 36, height: 36, borderRadius: 8, marginRight: 12 }}>←</button>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 18 }}>{isEditMode ? 'Chỉnh sửa' : 'Tạo đơn'}</h2>
                            <div style={{ fontSize: 12, opacity: 0.9 }}>{pharmacy?.name}</div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {['ALL', 'SINGLE', 'COMBO'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            style={{
                                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '600',
                                background: filterType === type ? '#fff' : 'rgba(255,255,255,0.2)',
                                color: filterType === type ? '#1E4A8B' : '#fff',
                                boxShadow: filterType === type ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {type === 'ALL' ? 'Tất cả' : type === 'SINGLE' ? 'Sản phẩm lẻ' : '🎁 Combo / Gói'}
                        </button>
                    ))}
                </div>

                <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 6, display: 'inline-block', marginBottom: 8 }}>
                    📦 {products.length} SP | 🎁 {promotions.length} CTKM
                </div>

                <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="🔍 Tìm kiếm..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', fontSize: 14 }} />
                </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 180px 16px' }}>
                {filteredProducts.map(product => {
                    const cartItem = cart[product.id] || { cs: 0, ea: 0 };
                    const hasQty = (cartItem.cs > 0 || cartItem.ea > 0);
                    const promoInfo = getProductPromoInfo(product);
                    const isCombo = product.isCombo;

                    return (
                        <div key={product.id} style={{
                            padding: '12px', marginBottom: 8, borderRadius: 12, gap: 12,
                            background: hasQty ? (isCombo ? '#FFFBEB' : '#F0FDF4') : (isCombo ? '#FFF7ED' : '#fff'),
                            border: hasQty ? (isCombo ? '1px solid #D97706' : '1px solid #10B981') : (isCombo ? '1px solid #FED7AA' : '1px solid #E5E7EB'),
                            display: 'flex', alignItems: 'center'
                        }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {isCombo && <span style={{ fontSize: 10, background: '#F97316', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>COMBO</span>}
                                    <div style={{ fontWeight: '600', fontSize: 14, color: '#1E293B' }}>{product.name}</div>
                                </div>

                                {isCombo && product.bundleItems && (
                                    <div style={{ fontSize: 11, color: '#475569', background: 'rgba(255,255,255,0.5)', padding: 6, borderRadius: 6, marginTop: 4 }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: 2 }}>Thành phần:</div>
                                        {product.bundleItems.map((bi, idx) => (
                                            <div key={idx}>• {bi.quantity}x {bi.child?.name}</div>
                                        ))}
                                    </div>
                                )}

                                {promoInfo && (
                                    <div style={{ fontSize: 11, color: '#D97706', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                        ⚡ {promoInfo}
                                    </div>
                                )}
                                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{product.code} • {formatCurrency(product.price)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {/* Hide CS (Carton) input for Combos usually, or just treat as Units? 
                                    Let's keep both but usually combos are sold in Units (ea). 
                                    If converting, rate=1. */}
                                <input type="number" onFocus={handleFocus} value={cartItem.cs || ''} onChange={(e) => updateCart(product.id, 'cs', e.target.value)} placeholder="0"
                                    style={{ width: 50, padding: 8, textAlign: 'center', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 'bold', background: cartItem.cs > 0 ? '#E0F2FE' : '#fff' }} />
                                <input type="number" onFocus={handleFocus} value={cartItem.ea || ''} onChange={(e) => updateCart(product.id, 'ea', e.target.value)} placeholder="0"
                                    style={{ width: 40, padding: 8, textAlign: 'center', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 'bold', background: cartItem.ea > 0 ? '#E0F2FE' : '#fff' }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sticky Footer */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E5E7EB', padding: '16px 20px', paddingBottom: '24px', borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
                {(orderMetrics.discount > 0 || orderMetrics.gifts.length > 0) && (
                    <div style={{
                        position: 'absolute', top: -30, left: 0, right: 0,
                        background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 'bold',
                        textAlign: 'center', padding: '6px 0', borderTop: '1px solid #86EFAC'
                    }}>
                        🎁 KM áp dụng: -{formatCurrency(orderMetrics.discount)} {orderMetrics.gifts.length > 0 ? `+ ${orderMetrics.gifts.length} quà` : ''}
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 13, color: '#64748B' }}>Thành tiền ({orderMetrics.items.length} SP)</div>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1E4A8B' }}>{formatCurrency(orderMetrics.total)}</div>
                    </div>
                    <button onClick={() => setShowReview(true)} disabled={orderMetrics.items.length === 0}
                        style={{ background: orderMetrics.items.length > 0 ? 'linear-gradient(135deg, #1E4A8B 0%, #2563EB 100%)' : '#E2E8F0', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 'bold' }}>
                        Xem chi tiết
                    </button>
                </div>
            </div>

            {/* REVIEW MODAL */}
            {showReview && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: 600, height: '95vh', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column' }}>

                        {/* Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderRadius: '24px 24px 0 0' }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#1E293B', fontSize: 18 }}>🧾 Hóa Đơn Chi Tiết</h3>
                                <div style={{ fontSize: 13, color: '#64748B' }}>{pharmacy?.name}</div>
                            </div>
                            <button onClick={() => setShowReview(false)} style={{ border: 'none', background: '#E2E8F0', width: 32, height: 32, borderRadius: 16, cursor: 'pointer', fontSize: 16 }}>✕</button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                            {/* Products Header */}
                            <div style={{ display: 'flex', fontSize: 11, fontWeight: 'bold', color: '#64748B', borderBottom: '2px solid #E2E8F0', paddingBottom: 8, marginBottom: 12 }}>
                                <div style={{ flex: 2 }}>SẢN PHẨM</div>
                                <div style={{ flex: 1, textAlign: 'center' }}>SL</div>
                                <div style={{ flex: 1, textAlign: 'right' }}>THÀNH TIỀN</div>
                            </div>

                            {/* Products Rows */}
                            {orderMetrics.items.map(item => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
                                    <div style={{ flex: 2, paddingRight: 8 }}>
                                        <div style={{ fontWeight: '600', color: '#334155', fontSize: 14 }}>{item.name}</div>
                                        <div style={{ fontSize: 11, color: '#94A3B8' }}>Mã: {item.code}</div>
                                        <div style={{ fontSize: 11, color: '#64748B' }}>Đơn giá: {formatCurrency(item.price)}</div>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '500', color: '#1E293B' }}>
                                        {item.qtyDisplay.cs > 0 && <div>{item.qtyDisplay.cs} Thùng</div>}
                                        {item.qtyDisplay.ea > 0 && <div>{item.qtyDisplay.ea} Lẻ</div>}
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', color: '#1E293B', fontSize: 14 }}>
                                        {formatCurrency(item.itemTotal)}
                                    </div>
                                </div>
                            ))}

                            {/* Promotions Section */}
                            {(orderMetrics.appliedPromos.length > 0) ? (
                                <div style={{ marginTop: 24 }}>
                                    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#059669', background: '#F0FDF4', padding: '8px 12px', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #86EFAC', borderBottom: 'none' }}>
                                        <span>🎁 KHUYẾN MÃI & CHIẾT KHẤU</span>
                                    </div>
                                    <div style={{ border: '1px solid #86EFAC', borderRadius: '0 0 8px 8px', padding: '12px', background: '#fff' }}>
                                        {orderMetrics.appliedPromos.map((p, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#15803D' }}>
                                                <span style={{ flex: 1 }}>• {p.name}</span>
                                                {p.type === 'DISCOUNT'
                                                    ? <span style={{ fontWeight: 'bold', color: '#DC2626' }}>-{formatCurrency(p.value)}</span>
                                                    : <span style={{ fontWeight: 'bold', color: '#166534', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>MIỄN PHÍ</span>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#94A3B8', fontStyle: 'italic', background: '#F8FAFC', padding: 10, borderRadius: 8 }}>
                                    (Không có chương trình khuyến mãi nào được áp dụng)
                                </div>
                            )}

                            {/* Grand Totals */}
                            <div style={{ marginTop: 24, background: '#F8FAFC', padding: '16px', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span style={{ color: '#64748B' }}>Cộng tiền hàng</span>
                                    <span style={{ fontWeight: '600' }}>{formatCurrency(orderMetrics.subtotal)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: '#DC2626' }}>
                                    <span>Trừ khuyến mãi</span>
                                    <span style={{ fontWeight: '600' }}>-{formatCurrency(orderMetrics.discount)}</span>
                                </div>
                                <div style={{ borderTop: '2px dashed #CBD5E1', margin: '12px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>KHÁCH CẦN TRẢ</span>
                                    <span style={{ fontSize: 22, fontWeight: '800', color: '#1E4A8B' }}>{formatCurrency(orderMetrics.total)}</span>
                                </div>
                            </div>

                            <textarea
                                value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)}
                                placeholder="Ghi chú đơn hàng..."
                                style={{ width: '100%', marginTop: 20, padding: 12, borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, minHeight: 80, fontFamily: 'inherit' }}
                            />
                        </div>

                        {/* Footer Action */}
                        <div style={{ padding: '20px', borderTop: '1px solid #E2E8F0', background: '#fff', display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => setShowReview(false)}
                                style={{
                                    flex: 1, padding: '16px', border: '1px solid #CBD5E1', borderRadius: 12,
                                    background: '#F1F5F9', color: '#475569', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                ✏️ Chỉnh sửa
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{
                                    flex: 2, padding: '16px', background: isSubmitting ? '#94A3B8' : '#1E4A8B',
                                    color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(30,74,139,0.2)'
                                }}
                            >
                                {isSubmitting ? 'ĐANG GỬI...' : 'HOÀN TẤT ĐƠN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateOrder;
