import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Alert,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { visitPlansAPI } from '../services/api';

const VisitScheduleScreen = ({ navigation }) => {
    const [visitPlans, setVisitPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadUserAndVisits();
    }, []);

    const loadUserAndVisits = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserId(user.id);
                await fetchVisitPlans(user.id);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
        }
    };

    const fetchVisitPlans = async (uid) => {
        setLoading(true);
        try {
            const response = await visitPlansAPI.getAll({
                userId: uid || userId,
                visitDate: selectedDate
            });

            // Sort by visit time
            const sorted = (response || []).sort((a, b) => {
                if (!a.visitTime) return 1;
                if (!b.visitTime) return -1;
                return a.visitTime.localeCompare(b.visitTime);
            });

            setVisitPlans(sorted);
        } catch (error) {
            console.error('Error fetching visit plans:', error);
            Alert.alert('Lỗi', 'Không thể tải lịch viếng thăm');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchVisitPlans();
    };

    const handleCheckIn = async (visit) => {
        try {
            // Would get real GPS coordinates in production
            const checkInData = {
                userId: userId,
                pharmacyId: visit.pharmacyId,
                latitude: 10.762622, // Mock coordinates
                longitude: 106.660172
            };

            await visitPlansAPI.checkIn(checkInData);
            Alert.alert('Thành công', 'Đã check-in thành công');
            fetchVisitPlans();
        } catch (error) {
            console.error('Check-in error:', error);
            Alert.alert('Lỗi', 'Không thể check-in: ' + error.message);
        }
    };

    const handleVisitDetail = (visit) => {
        navigation.navigate('CustomerDetail', {
            customerId: visit.pharmacyId,
            visitId: visit.id
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return '#10b981';
            case 'IN_PROGRESS': return '#f59e0b';
            case 'PLANNED': return '#3b82f6';
            case 'MISSED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'COMPLETED': return 'Đã hoàn thành';
            case 'IN_PROGRESS': return 'Đang thực hiện';
            case 'PLANNED': return 'Chưa thực hiện';
            case 'MISSED': return 'Đã bỏ lỡ';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const renderVisitItem = ({ item }) => (
        <TouchableOpacity
            style={styles.visitCard}
            onPress={() => handleVisitDetail(item)}
        >
            <View style={styles.visitHeader}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>⏰ {item.visitTime || '08:00'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.visitBody}>
                <Text style={styles.pharmacyName}>{item.pharmacy?.name || 'N/A'}</Text>
                <Text style={styles.pharmacyAddress}>
                    📍 {item.pharmacy?.address || 'Chưa có địa chỉ'}
                </Text>
                {item.purpose && (
                    <Text style={styles.purpose}>🎯 {item.purpose}</Text>
                )}
            </View>

            <View style={styles.visitActions}>
                {item.status === 'PLANNED' && (
                    <TouchableOpacity
                        style={styles.checkInButton}
                        onPress={() => handleCheckIn(item)}
                    >
                        <Text style={styles.checkInButtonText}>✓ Check-in</Text>
                    </TouchableOpacity>
                )}
                {item.status === 'IN_PROGRESS' && (
                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => handleVisitDetail(item)}
                    >
                        <Text style={styles.detailButtonText}>Chi tiết →</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Không có lịch viếng thăm</Text>
            <Text style={styles.emptySubtitle}>
                Bạn chưa có lịch viếng thăm nào cho hôm nay
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch viếng thăm</Text>
                <Text style={styles.headerDate}>
                    {new Date().toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Text>
            </View>

            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{visitPlans.length}</Text>
                    <Text style={styles.summaryLabel}>Tổng số</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: '#10b981' }]}>
                        {visitPlans.filter(v => v.status === 'COMPLETED').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Đã hoàn thành</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNumber, { color: '#3b82f6' }]}>
                        {visitPlans.filter(v => v.status === 'PLANNED').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Còn lại</Text>
                </View>
            </View>

            {/* Visit List */}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E4A8B" />
                    <Text style={styles.loadingText}>Đang tải lịch viếng thăm...</Text>
                </View>
            ) : (
                <FlatList
                    data={visitPlans}
                    renderItem={renderVisitItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    header: {
        backgroundColor: '#1E4A8B',
        padding: 20,
        paddingTop: 50
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4
    },
    headerDate: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9
    },
    summary: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: -30,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center'
    },
    summaryNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E4A8B'
    },
    summaryLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4
    },
    listContent: {
        padding: 16,
        paddingTop: 24
    },
    visitCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
    },
    visitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b'
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600'
    },
    visitBody: {
        marginBottom: 12
    },
    pharmacyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 6
    },
    pharmacyAddress: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4
    },
    purpose: {
        fontSize: 14,
        color: '#475569',
        marginTop: 4
    },
    visitActions: {
        flexDirection: 'row',
        gap: 8
    },
    checkInButton: {
        flex: 1,
        backgroundColor: '#10b981',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    checkInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    detailButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    detailButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b'
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        marginTop: 60
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center'
    }
});

export default VisitScheduleScreen;
