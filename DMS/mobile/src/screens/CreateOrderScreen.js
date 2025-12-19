import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { productsAPI, ordersAPI } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const FILTER_TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'CATEGORY', label: 'Danh mục' },
    { id: 'INGREDIENT', label: 'Hoạt chất' },
    { id: 'MANUFACTURER', label: 'Hãng SX' },
];

const CreateOrderScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const { customerId, customerName, orderId, existingOrder } = route.params || {};

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Search and Filter State
    const [searchText, setSearchText] = useState('');
    const [activeFilterTab, setActiveFilterTab] = useState('ALL');
    const [selectedFilterValue, setSelectedFilterValue] = useState(null);

    // Modals & Summary
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [promotions, setPromotions] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [deliveryNotes, setDeliveryNotes] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    // Load existing order
    useEffect(() => {
        if (existingOrder && products.length > 0) {
            const initialCart = {};
            existingOrder.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const rate = product.conversionRate || 1;
                    const cs = Math.floor(item.quantity / rate);
                    const ea = item.quantity % rate;
                    initialCart[item.productId] = { cs, ea };
                }
            });
            setCart(initialCart);
            setDeliveryNotes(existingOrder.notes || '');
        }
    }, [existingOrder, products]);

    const fetchProducts = async () => {
        try {
            const data = await productsAPI.getAll();
            if (data && Array.isArray(data)) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            Alert.alert('Lỗi', 'Không thể tải sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // --- FILTER LOGIC ---
    const getUniqueValues = (items, key, subKey) => {
        const values = items.map(i => subKey ? i[key]?.[subKey] : i[key]).filter(v => v);
        return [...new Set(values)].sort();
    };

    const filterOptions = useMemo(() => {
        if (activeFilterTab === 'CATEGORY') return getUniqueValues(products, 'category', 'name');
        if (activeFilterTab === 'INGREDIENT') return getUniqueValues(products, 'genericName');
        if (activeFilterTab === 'MANUFACTURER') return getUniqueValues(products, 'manufacturer');
        return [];
    }, [activeFilterTab, products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // Text Search
            const searchLower = searchText.toLowerCase();
            const matchText = !searchText ||
                p.name.toLowerCase().includes(searchLower) ||
                p.code.toLowerCase().includes(searchLower) ||
                p.genericName?.toLowerCase().includes(searchLower);

            if (!matchText) return false;

            // Type Filter
            if (activeFilterTab === 'ALL') return true;
            if (!selectedFilterValue) return true;

            if (activeFilterTab === 'CATEGORY') return p.category?.name === selectedFilterValue;
            if (activeFilterTab === 'INGREDIENT') return p.genericName === selectedFilterValue;
            if (activeFilterTab === 'MANUFACTURER') return p.manufacturer === selectedFilterValue;

            return true;
        });
    }, [products, searchText, activeFilterTab, selectedFilterValue]);

    // --- CART LOGIC ---
    const updateQuantity = (productId, type, value) => {
        if (value === '') {
            setCart(prev => {
                const current = prev[productId] || { cs: 0, ea: 0 };
                const updated = { ...current, [type]: 0 };
                if (updated.cs === 0 && updated.ea === 0) {
                    const { [productId]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [productId]: updated };
            });
            return;
        }
        const numValue = parseInt(value);
        if (isNaN(numValue)) return;

        setCart(prev => {
            const current = prev[productId] || { cs: 0, ea: 0 };
            const updated = { ...current, [type]: numValue };

            if (updated.cs === 0 && updated.ea === 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: updated };
        });
    };

    const calculateItemTotal = (product, qtyObj) => {
        if (!qtyObj) return 0;
        const rate = product.conversionRate || 1;
        const totalUnits = (qtyObj.cs * rate) + qtyObj.ea;
        return totalUnits * product.price;
    };

    const calculateTotal = () => {
        return Object.entries(cart).reduce((sum, [productId, qtyObj]) => {
            const product = products.find(p => p.id === productId);
            return sum + (product ? calculateItemTotal(product, qtyObj) : 0);
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const calculatePromotions = () => {
        const totalAmt = calculateTotal();
        let promos = [];
        let discountAmt = 0;
        if (totalAmt > 5000000) {
            promos.push({ desc: 'Đơn hàng > 5tr: Giảm 2%', value: 2 });
            discountAmt += totalAmt * 0.02;
        }
        setPromotions(promos);
        setDiscount(discountAmt);
        setShowReviewModal(true);
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        try {
            const orderItems = Object.entries(cart).map(([productId, qtyObj]) => {
                const product = products.find(p => p.id === productId);
                const rate = product.conversionRate || 1;
                const totalQty = (qtyObj.cs * rate) + qtyObj.ea;
                return {
                    productId: product.id,
                    productName: product.name,
                    quantity: totalQty,
                    price: product.price,
                    unit: product.unit
                };
            });

            const orderData = {
                pharmacyId: customerId || existingOrder.pharmacyId,
                items: orderItems,
                totalAmount: calculateTotal(),
                discount: discount,
                finalAmount: calculateTotal() - discount,
                promotions: promotions,
                notes: `Delivery: ${deliveryNotes}`,
                status: 'PENDING'
            };

            if (existingOrder) {
                await ordersAPI.update(existingOrder.id, orderData);
                Alert.alert('Thành công', 'Đã cập nhật đơn hàng!', [{ text: 'OK', onPress: () => navigation.navigate('Home') }]);
            } else {
                await ordersAPI.create(orderData);
                Alert.alert('Thành công', 'Đơn hàng đã được tạo!', [{ text: 'OK', onPress: () => navigation.navigate('Home') }]);
            }
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Lỗi', 'Không thể lưu đơn hàng');
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }) => {
        const qty = cart[item.id] || { cs: 0, ea: 0 };
        const hasQty = qty.cs > 0 || qty.ea > 0;
        return (
            <View style={[styles.productCard, hasQty && styles.productCardActive]}>
                <View style={styles.productHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productInfo}>
                            {item.genericName ? `HC: ${item.genericName}\n` : ''}
                            {item.manufacturer ? `Hãng: ${item.manufacturer}` : ''}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={styles.productCode}>Mã: {item.code}</Text>
                            <Text style={styles.productRate}>Quy đổi: 1T = {item.conversionRate || 1}{item.unit}</Text>
                        </View>
                        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                    </View>
                </View>

                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Thùng</Text>
                        <TextInput
                            style={[styles.input, qty.cs > 0 && styles.inputActive]}
                            keyboardType="numeric"
                            value={String(qty.cs || '')}
                            onChangeText={(val) => updateQuantity(item.id, 'cs', val)}
                            placeholder="0"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Lẻ ({item.unit})</Text>
                        <TextInput
                            style={[styles.input, qty.ea > 0 && styles.inputActive]}
                            keyboardType="numeric"
                            value={String(qty.ea || '')}
                            onChangeText={(val) => updateQuantity(item.id, 'ea', val)}
                            placeholder="0"
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="🔍 Tìm tên, hoạt chất, mã..."
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')} style={{ padding: 4 }}>
                                <Text style={{ color: '#999' }}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterTabs}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        {FILTER_TABS.map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.filterTab, activeFilterTab === tab.id && styles.filterTabActive]}
                                onPress={() => {
                                    setActiveFilterTab(tab.id);
                                    setSelectedFilterValue(null);
                                }}
                            >
                                <Text style={[styles.filterTabText, activeFilterTab === tab.id && styles.filterTabTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Filter Values (Chips) */}
                {activeFilterTab !== 'ALL' && filterOptions.length > 0 && (
                    <View style={styles.filterChipsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                            {filterOptions.map((opt, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.chip, selectedFilterValue === opt && styles.chipActive]}
                                    onPress={() => setSelectedFilterValue(selectedFilterValue === opt ? null : opt)}
                                >
                                    <Text style={[styles.chipText, selectedFilterValue === opt && styles.chipTextActive]}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* Product List */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#1E4A8B" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
                        showsVerticalScrollIndicator={true}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <Text style={{ color: '#999' }}>Không tìm thấy sản phẩm nào</Text>
                            </View>
                        }
                    />
                )}
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                        Đã chọn {Object.keys(cart).length} SP
                    </Text>
                    <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
                </View>
                <View style={styles.footerButtons}>
                    <TouchableOpacity
                        style={[styles.btnSecondary, Object.keys(cart).length === 0 && styles.btnDisabled]}
                        onPress={calculatePromotions}
                        disabled={Object.keys(cart).length === 0}
                    >
                        <Text style={styles.btnTextSecondary}>🎁 Tính KM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnPrimary, Object.keys(cart).length === 0 && styles.btnDisabled]}
                        disabled={Object.keys(cart).length === 0}
                        onPress={calculatePromotions}
                    >
                        <Text style={styles.btnTextPrimary}>Tiếp tục →</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modals same as before... (omitted to save space, assuming previous modal logic is good but needs to be included) */}
            {/* Re-adding Modals code here to ensure file completeness */}
            <Modal visible={showReviewModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📋 Xem lại đơn hàng</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <Text style={{ fontSize: 20, color: '#999' }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300, marginBottom: 20 }}>
                            {Object.entries(cart).map(([pid, q]) => {
                                const p = products.find(i => i.id === pid);
                                if (!p) return null;
                                const itemTotal = calculateItemTotal(p, q);
                                return (
                                    <View key={pid} style={styles.reviewItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: '600' }}>{p.name}</Text>
                                            <Text style={{ fontSize: 12, color: '#666' }}>
                                                {q.cs > 0 ? `${q.cs} Thùng ` : ''}
                                                {q.cs > 0 && q.ea > 0 ? '+ ' : ''}
                                                {q.ea > 0 ? `${q.ea} ${p.unit}` : ''}
                                            </Text>
                                        </View>
                                        <Text style={{ fontWeight: 'bold', color: '#1E4A8B' }}>{formatCurrency(itemTotal)}</Text>
                                    </View>
                                )
                            })}
                        </ScrollView>
                        {promotions.length > 0 && (
                            <View style={styles.promoBox}>
                                <Text style={styles.promoTitle}>🎁 Khuyến mãi:</Text>
                                {promotions.map((pr, i) => <Text key={i} style={{ color: '#059669' }}>• {pr.desc}</Text>)}
                            </View>
                        )}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.btnOutline} onPress={() => setShowReviewModal(false)}><Text>Sửa đổi</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.btnPrimary} onPress={() => { setShowReviewModal(false); setShowConfirmModal(true); }}><Text style={styles.btnTextPrimary}>Xác nhận</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showConfirmModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>✅ Xác nhận & Gửi</Text>
                        <View style={styles.summaryBox}>
                            <Text>Tồng tiền hàng: {formatCurrency(calculateTotal())}</Text>
                            {discount > 0 && <Text style={{ color: '#10b981' }}>Chiết khấu: -{formatCurrency(discount)}</Text>}
                            <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 8 }} />
                            <Text style={styles.finalTotal}>Thanh toán: {formatCurrency(calculateTotal() - discount)}</Text>
                        </View>
                        <Text style={styles.label}>Ghi chú giao hàng:</Text>
                        <TextInput style={styles.noteInput} multiline placeholder="Nhập ghi chú giao hàng..." value={deliveryNotes} onChangeText={setDeliveryNotes} />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.btnOutline} onPress={() => setShowConfirmModal(false)}><Text>Quay lại</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.btnSuccess} onPress={handleFinalSubmit} disabled={submitting}>
                                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextPrimary}>Gửi đơn hàng</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },

    // Header Styles
    header: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 8 },
    headerTop: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
    backText: { fontSize: 24, color: '#1E4A8B', fontWeight: 'bold' },
    searchContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, alignItems: 'center', height: 40 },
    searchInput: { flex: 1, fontSize: 15, color: '#333', marginLeft: 4 },

    filterTabs: { flexDirection: 'row', marginTop: 4 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 4, borderBottomWidth: 2, borderColor: 'transparent' },
    filterTabActive: { borderColor: '#1E4A8B' },
    filterTabText: { color: '#6b7280', fontWeight: '500' },
    filterTabTextActive: { color: '#1E4A8B', fontWeight: 'bold' },

    filterChipsContainer: { marginTop: 8 },
    chip: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    chipActive: { backgroundColor: '#eff6ff', borderColor: '#1E4A8B' },
    chipText: { fontSize: 13, color: '#4b5563' },
    chipTextActive: { color: '#1E4A8B', fontWeight: '500' },

    // Product List Styles
    productCard: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
    productCardActive: { borderColor: '#1E4A8B', backgroundColor: '#eff6ff' },
    productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2, color: '#1f2937' },
    productInfo: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
    productCode: { fontSize: 12, color: '#9ca3af' },
    productRate: { fontSize: 12, color: '#059669', fontStyle: 'italic' },
    productPrice: { color: '#1E4A8B', fontWeight: 'bold', fontSize: 16, marginTop: 4 },

    inputRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
    inputGroup: { flex: 1 },
    inputLabel: { fontSize: 12, color: '#4b5563', marginBottom: 4, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, textAlign: 'center', fontSize: 16, color: '#000', backgroundColor: '#fff' },
    inputActive: { borderColor: '#1E4A8B', color: '#1E4A8B', fontWeight: 'bold' },

    // Footer & Modal (Same as before)
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#e5e7eb', elevation: 10, zIndex: 999 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    totalLabel: { fontSize: 16, color: '#374151', fontWeight: '500' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#1E4A8B' },
    footerButtons: { flexDirection: 'row', gap: 12 },
    btnPrimary: { flex: 1, backgroundColor: '#1E4A8B', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnSecondary: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#1E4A8B', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnSuccess: { flex: 1, backgroundColor: '#10b981', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnOutline: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnDisabled: { opacity: 0.5, backgroundColor: '#9ca3af', borderColor: '#9ca3af' },
    btnTextPrimary: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    btnTextSecondary: { color: '#1E4A8B', fontWeight: 'bold', fontSize: 16 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
    reviewItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' },
    promoBox: { backgroundColor: '#ecfdf5', padding: 16, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#d1fae5' },
    promoTitle: { fontWeight: 'bold', color: '#059669', marginBottom: 8 },
    summaryBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
    finalTotal: { fontSize: 18, fontWeight: 'bold', color: '#1E4A8B', marginTop: 8 },
    label: { marginBottom: 8, fontWeight: '600', color: '#374151' },
    noteInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 16 }
});

export default CreateOrderScreen;
