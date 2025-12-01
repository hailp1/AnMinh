import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { productsAPI, ordersAPI } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const CreateOrderScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const { customerId, customerName } = route.params;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productsAPI.getAll();
                if (data && data.length > 0) {
                    setProducts(data);
                } else {
                    // Mock data if API empty
                    const mockProducts = Array.from({ length: 20 }, (_, i) => ({
                        id: i + 1,
                        code: `SKU${String(i + 1).padStart(3, '0')}`,
                        name: `Thuốc mẫu ${i + 1}`,
                        price: 50000 + (i * 5000),
                        unit: 'Hộp',
                        image: 'https://via.placeholder.com/50'
                    }));
                    setProducts(mockProducts);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

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

    const calculateTotal = () => {
        return Object.entries(cart).reduce((sum, [productId, qty]) => {
            const product = products.find(p => String(p.id) === String(productId));
            return sum + (product ? product.price * qty : 0);
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleSubmitOrder = async () => {
        if (Object.keys(cart).length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

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
                status: 'PENDING',
                notes: 'Đơn hàng từ Mobile App'
            };

            await ordersAPI.create(orderData);

            Alert.alert(
                'Thành công',
                'Đơn hàng đã được tạo thành công!',
                [
                    { text: 'OK', onPress: () => navigation.navigate('Home') }
                ]
            );
        } catch (error) {
            console.error('Error creating order:', error);
            Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.productCard}>
            <View style={styles.productIcon}>
                <Text style={{ fontSize: 20 }}>💊</Text>
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCode}>{item.code} • {item.unit}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
            </View>
            <View style={styles.quantityControl}>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, -1)}
                >
                    <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{cart[item.id] || 0}</Text>
                <TouchableOpacity
                    style={[styles.qtyBtn, styles.qtyBtnAdd]}
                    onPress={() => updateQuantity(item.id, 1)}
                >
                    <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Hủy</Text>
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Tạo đơn hàng</Text>
                    <Text style={styles.customerName}>{customerName}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1E4A8B" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                />
            )}

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng tiền:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.submitButton, Object.keys(cart).length === 0 && styles.disabledButton]}
                    onPress={handleSubmitOrder}
                    disabled={Object.keys(cart).length === 0 || submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Gửi đơn hàng</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        backgroundColor: '#fff',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        color: '#666',
        fontSize: 16,
    },
    headerInfo: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    customerName: {
        fontSize: 12,
        color: '#666',
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    productIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 2,
    },
    productCode: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F29E2E',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    qtyBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    qtyBtnAdd: {
        backgroundColor: '#1E4A8B',
        borderColor: '#1E4A8B',
        borderWidth: 0,
    },
    qtyBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: -2,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '600',
        minWidth: 20,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F29E2E',
    },
    submitButton: {
        backgroundColor: '#1E4A8B',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateOrderScreen;
