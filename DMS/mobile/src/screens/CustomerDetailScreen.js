import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pharmaciesAPI, visitPlansAPI } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

const CustomerDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const { customerId } = route.params;
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentVisit, setCurrentVisit] = useState(null);
    const [processingVisit, setProcessingVisit] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const data = await pharmaciesAPI.getById(customerId);
                setCustomer(data);
            } catch (error) {
                console.error('Error fetching customer:', error);
                Alert.alert('Lỗi', 'Không thể tải thông tin khách hàng');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        const fetchCurrentVisit = async () => {
            try {
                const visit = await visitPlansAPI.getCurrentVisit(user.id);
                if (visit && visit.pharmacyId === customerId) {
                    setCurrentVisit(visit);
                }
            } catch (error) {
                console.error('Error fetching current visit:', error);
            }
        };

        fetchCustomer();
        fetchCurrentVisit();
    }, [customerId]);

    const handleCheckIn = async () => {
        setProcessingVisit(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Cần quyền truy cập vị trí để Check-in');
                setProcessingVisit(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            const visit = await visitPlansAPI.checkIn({
                userId: user.id,
                pharmacyId: customerId,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            setCurrentVisit(visit);
            Alert.alert('Thành công', 'Đã Check-in thành công!');
        } catch (error) {
            console.error('Check-in error:', error);
            Alert.alert('Lỗi', 'Không thể Check-in. Vui lòng thử lại.');
        } finally {
            setProcessingVisit(false);
        }
    };

    const handleCheckOut = async () => {
        setProcessingVisit(true);
        try {
            let location = await Location.getCurrentPositionAsync({});

            await visitPlansAPI.checkOut({
                visitId: currentVisit.id,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                notes: 'Hoàn thành viếng thăm'
            });

            setCurrentVisit(null);
            Alert.alert('Thành công', 'Đã Check-out thành công!');
        } catch (error) {
            console.error('Check-out error:', error);
            Alert.alert('Lỗi', 'Không thể Check-out. Vui lòng thử lại.');
        } finally {
            setProcessingVisit(false);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Cần quyền truy cập camera để chụp ảnh');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.5,
            });

            if (!result.canceled) {
                // In a real app, upload result.assets[0].uri to server
                console.log('Photo taken:', result.assets[0].uri);
                Alert.alert('Thành công', 'Đã chụp và lưu ảnh trưng bày!');
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Lỗi', 'Không thể chụp ảnh');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E4A8B" />
            </View>
        );
    }

    if (!customer) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết khách hàng</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.infoCard}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <Text style={styles.customerCode}>{customer.code}</Text>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Địa chỉ:</Text>
                        <Text style={styles.value}>{customer.address}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>SĐT:</Text>
                        <Text style={styles.value}>{customer.phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Người liên hệ:</Text>
                        <Text style={styles.value}>{customer.owner}</Text>
                    </View>
                </View>

                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleTakePhoto}
                    >
                        <Text style={styles.actionIcon}>📸</Text>
                        <Text style={styles.actionText}>Chụp trưng bày</Text>
                    </TouchableOpacity>

                    {currentVisit ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.checkOutButton]}
                            onPress={handleCheckOut}
                            disabled={processingVisit}
                        >
                            {processingVisit ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.actionIcon}>🛑</Text>
                                    <Text style={[styles.actionText, { color: '#fff' }]}>Check-out</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.checkInButton]}
                            onPress={handleCheckIn}
                            disabled={processingVisit}
                        >
                            {processingVisit ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.actionIcon}>📍</Text>
                                    <Text style={[styles.actionText, { color: '#fff' }]}>Check-in</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryAction]}
                        onPress={() => navigation.navigate('CreateOrder', { customerId: customer.id, customerName: customer.name })}
                    >
                        <Text style={styles.actionIcon}>🛒</Text>
                        <Text style={[styles.actionText, { color: '#fff' }]}>Lên đơn hàng</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        color: '#1E4A8B',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    customerName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 5,
    },
    customerCode: {
        fontSize: 14,
        color: '#666',
        backgroundColor: '#f0f0f0',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 15,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    label: {
        width: 100,
        color: '#666',
        fontSize: 15,
    },
    value: {
        flex: 1,
        color: '#333',
        fontSize: 15,
        fontWeight: '500',
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    actionButton: {
        backgroundColor: '#fff',
        width: '48%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    checkInButton: {
        backgroundColor: '#16a34a',
    },
    checkOutButton: {
        backgroundColor: '#dc2626',
    },
    primaryAction: {
        backgroundColor: '#F29E2E',
        width: '100%',
        marginTop: 5,
    },
    actionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});

export default CustomerDetailScreen;
