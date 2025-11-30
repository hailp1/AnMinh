import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { pharmaciesAPI } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPharmacies = async () => {
        try {
            const data = await pharmaciesAPI.getAll();
            if (Array.isArray(data)) {
                // Filter by hub if user is TDV
                let filtered = data;
                if (user?.role === 'PHARMACY_REP' && user?.hub) {
                    filtered = data.filter(p => p.hub === user.hub);
                }
                setPharmacies(filtered);
            }
        } catch (error) {
            console.error('Error fetching pharmacies:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPharmacies();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPharmacies();
    };

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.pharmacyName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                    <Text style={[styles.statusText, { color: '#166534' }]}>Hoạt động</Text>
                </View>
            </View>

            <Text style={styles.address}>📍 {item.address}</Text>

            <View style={styles.cardFooter}>
                <Text style={styles.phone}>📞 {item.phone}</Text>
                <Text style={styles.distance}>2.5 km</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào,</Text>
                    <Text style={styles.name}>{user?.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Map')}
                    >
                        <Text style={styles.iconButtonText}>🗺️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm nhà thuốc..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Danh sách nhà thuốc ({filteredPharmacies.length})</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#1E4A8B" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredPharmacies}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Không tìm thấy nhà thuốc nào</Text>
                        }
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
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
        backgroundColor: '#1E4A8B',
        padding: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        color: '#e0e0e0',
        fontSize: 14,
    },
    name: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonText: {
        fontSize: 20,
    },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        justifyContent: 'center',
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    searchContainer: {
        backgroundColor: '#1E4A8B',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    pharmacyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a2e',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    phone: {
        fontSize: 13,
        color: '#1E4A8B',
        fontWeight: '500',
    },
    distance: {
        fontSize: 13,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 30,
        fontStyle: 'italic',
    },
});

export default HomeScreen;
