# Enhanced CreateOrderScreen Implementation Guide
## TDV Mobile - Order Creation with Promotions & Review

**Date:** 2025-12-18  
**Status:** Ready to Implement

---

## 🎯 NEW FEATURES

### 1. "Tính KM" Button
- After selecting products
- Shows review modal with product names
- Displays potential promotions

### 2. Confirmation Screen
- Product list with prices
- CTKM (Chương trình khuyến mãi) applied
- Chiết khấu (Discounts)
- Delivery notes field

---

## 📝 IMPLEMENTATION STEPS

### Step 1: Add States
```javascript
const [showReviewModal, setShowReviewModal] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [promotions, setPromotions] = useState([]);
const [discount, setDiscount] = useState(0);
const [deliveryNotes, setDeliveryNotes] = useState('');
```

### Step 2: Add "Tính KM" Function
```javascript
const calculatePromotions = () => {
    // Mock promotion logic - replace with real API
    const selectedProducts = Object.entries(cart).map(([id, qty]) => ({
        ...products.find(p => String(p.id) === String(id)),
        quantity: qty
    }));
    
    // Example: Buy 10+ get 5% off
    const totalQty = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    let promos = [];
    let discountPct = 0;
    
    if (totalQty >= 10) {
        promos.push({ type: 'VOLUME', desc: 'Mua 10+ giảm 5%', value: 5 });
        discountPct = 5;
    }
    
    setPromotions(promos);
    setDiscount(calculateTotal() * (discountPct / 100));
    setShowReviewModal(true);
};
```

### Step 3: Review Modal Component
```javascript
<Modal
    visible={showReviewModal}
    transparent
    animationType="slide"
>
    <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📋 Xem lại đơn hàng</Text>
            
            {/* Selected Products */}
            <ScrollView style={styles.reviewList}>
                {Object.entries(cart).map(([productId, qty]) => {
                    const product = products.find(p => String(p.id) === String(productId));
                    return (
                        <View key={productId} style={styles.reviewItem}>
                            <Text style={styles.reviewProductName}>{product.name}</Text>
                            <Text style={styles.reviewQty}>x{qty}</Text>
                            <Text style={styles.reviewPrice}>
                                {formatCurrency(product.price * qty)}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
            
            {/* Promotions */}
            {promotions.length > 0 && (
                <View style={styles.promoSection}>
                    <Text style={styles.promoTitle}>🎁 Khuyến mãi áp dụng</Text>
                    {promotions.map((promo, idx) => (
                        <Text key={idx} style={styles.promoText}>• {promo.desc}</Text>
                    ))}
                </View>
            )}
            
            {/ Total */}
            <View style={styles.reviewTotal}>
                <Text>Tạm tính: {formatCurrency(calculateTotal())}</Text>
                {discount > 0 && (
                    <Text style={{color: '#10b981'}}>
                        Giảm giá: -{formatCurrency(discount)}
                    </Text>
                )}
                <Text style={styles.finalTotal}>
                    Thành tiền: {formatCurrency(calculateTotal() - discount)}
                </Text>
            </View>
            
            <View style={styles.modalButtons}>
                <TouchableOpacity 
                    style={styles.modalBtnSecondary}
                    onPress={() => setShowReviewModal(false)}
                >
                    <Text>Sửa đổi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.modalBtnPrimary}
                    onPress={() => {
                        setShowReviewModal(false);
                        setShowConfirmModal(true);
                    }}
                >
                    <Text style={{color: '#fff'}}>Xác nhận</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
</Modal>
```

### Step 4: Confirmation Modal with Notes
```javascript
<Modal
    visible={showConfirmModal}
    transparent
    animationType="slide"
>
    <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✅ Xác nhận đơn hàng</Text>
            
            {/* Order Summary */}
            <View style={styles.orderSummary}>
                <Text style={styles.summaryLabel}>Khách hàng:</Text>
                <Text style={styles.summaryValue}>{customerName}</Text>
                
                <Text style={styles.summaryLabel}>Tổng sản phẩm:</Text>
                <Text style={styles.summaryValue}>
                    {Object.keys(cart).length} loại
                </Text>
                
                <Text style={styles.summaryLabel}>Tổng số lượng:</Text>
                <Text style={styles.summaryValue}>
                    {Object.values(cart).reduce((sum, qty) => sum + qty, 0)} SP
                </Text>
            </View>
            
            {/* Promotions & Discounts */}
            {promotions.length > 0 && (
                <View style={styles.promoBox}>
                    <Text style={styles.promoBoxTitle}>🎁 CTKM & Chiết khấu</Text>
                    {promotions.map((promo, idx) => (
                        <View key={idx} style={styles.promoRow}>
                            <Text>• {promo.desc}</Text>
                            <Text style={{color: '#10b981', fontWeight: 'bold'}}>
                                -{promo.value}%
                            </Text>
                        </View>
                    ))}
                </View>
            )}
            
            {/* Delivery Notes */}
            <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>📝 Ghi chú giao hàng</Text>
                <TextInput
                    style={styles.notesInput}
                    placeholder="Nhập ghi chú (địa chỉ, thời gian...)"
                    value={deliveryNotes}
                    onChangeText={setDeliveryNotes}
                    multiline
                    numberOfLines={3}
                />
            </View>
            
            {/* Final Total */}
            <View style={styles.finalTotalBox}>
                <Text style={styles.finalTotalLabel}>Tổng thanh toán:</Text>
                <Text style={styles.finalTotalValue}>
                    {formatCurrency(calculateTotal() - discount)}
                </Text>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.confirmButtons}>
                <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setShowConfirmModal(false)}
                >
                    <Text>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.btnConfirm}
                    onPress={handleFinalSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>
                            Gửi đơn hàng
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    </View>
</Modal>
```

### Step 5: Update handleFinalSubmit
```javascript
const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
        const orderItems = Object.entries(cart).map(([productId, quantity]) => {
            const product = products.find(p => String(p.id) === String(productId));
            return {
                productId: product.id,
                productName: product.name,
                quantity,
                price: product.price,
                unit: product.unit
            };
        });

        const orderData = {
            pharmacyId: customerId,
            items: orderItems,
            totalAmount: calculateTotal(),
            discount: discount,
            finalAmount: calculateTotal() - discount,
            promotions: promotions,
            deliveryNotes: deliveryNotes,
            status: 'PENDING',
            notes: `Đơn hàng từ Mobile App\n${deliveryNotes}`
        };

        await ordersAPI.create(orderData);

        setShowConfirmModal(false);
        Alert.alert(
            'Thành công',
            'Đơn hàng đã được tạo thành công!',
            [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
    } catch (error) {
        console.error('Error:', error);
        Alert.alert('Lỗi', 'Không thể tạo đơn hàng');
    } finally {
        setSubmitting(false);
    }
};
```

### Step 6: Update Footer Buttons
Replace current footer with:
```javascript
<View style={styles.footer}>
    <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng tiền:</Text>
        <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
    </View>
    
    {/* New: Tính KM Button */}
    <View style={{flexDirection: 'row', gap: 10}}>
        <TouchableOpacity
            style={[styles.calcButton, Object.keys(cart).length === 0 && styles.disabledButton]}
            onPress={calculatePromotions}
            disabled={Object.keys(cart).length === 0}
        >
            <Text style={styles.calcButtonText}>🎁 Tính KM</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
            style={[styles.submitButton, Object.keys(cart).length === 0 && styles.disabledButton]}
            onPress={calculatePromotions}
            disabled={Object.keys(cart).length === 0}
        >
            <Text style={styles.submitButtonText}>Tiếp tục →</Text>
        </TouchableOpacity>
    </View>
</View>
```

---

## 🎨 NEW STYLES

```javascript
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
},
modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%'
},
modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
},
reviewList: {
    maxHeight: 200,
    marginBottom: 16
},
reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
},
reviewProductName: {
    flex: 1,
    fontWeight: '600'
},
reviewQty: {
    marginHorizontal: 12,
    color: '#666'
},
reviewPrice: {
    fontWeight: 'bold',
    color: '#F29E2E'
},
promoSection: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
},
promoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#10b981'
},
promoText: {
    fontSize: 13,
    color: '#059669',
    marginBottom: 4
},
reviewTotal: {
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginBottom: 16
},
finalTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E4A8B',
    marginTop: 8
},
modalButtons: {
    flexDirection: 'row',
    gap: 12
},
modalBtnSecondary: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
},
modalBtnPrimary: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#1E4A8B',
    alignItems: 'center'
},
orderSummary: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
},
summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4
},
summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8
},
promoBox: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    marginBottom: 16
},
promoBoxTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#059669'
},
promoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
},
notesSection: {
    marginBottom: 16
},
notesLabel: {
    fontWeight: '600',
    marginBottom: 8
},
notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top'
},
finalTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E4A8B10',
    borderRadius: 8,
    marginBottom: 16
},
finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold'
},
finalTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E4A8B'
},
confirmButtons: {
    flexDirection: 'row',
    gap: 12
},
btnCancel: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
},
btnConfirm: {
    flex: 2,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center'
},
calcButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
},
calcButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold'
}
```

---

## 🚀 QUICK UPDATE

1. Add all new states & functions
2. Import Modal from 'react-native'
3. Add 2 modals before `</SafeAreaView>`
4. Update footer buttons
5. Add new styles
6. Test flow!

---

** Code sẵn sàng implement! ** 🎉
