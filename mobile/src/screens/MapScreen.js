import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { pharmaciesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const MapScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [location, setLocation] = useState(null);
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {
            // 1. Get User Location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);

            // 2. Fetch Pharmacies
            try {
                const data = await pharmaciesAPI.getAll();
                if (Array.isArray(data)) {
                    // Filter by hub if user is TDV
                    let filtered = data;
                    if (user?.role === 'PHARMACY_REP' && user?.hub) {
                        filtered = data.filter(p => p.hub === user.hub);
                    }

                    // Filter valid coordinates
                    filtered = filtered.filter(p =>
                        p.latitude && p.longitude &&
                        !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude))
                    );

                    setPharmacies(filtered);
                }
            } catch (error) {
                console.error('Error fetching pharmacies:', error);
                Alert.alert('Lỗi', 'Không thể tải dữ liệu bản đồ');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleMarkerPress = (pharmacy) => {
        // Optional: Center map on marker or show bottom sheet
    };

    const handleCalloutPress = (pharmacy) => {
        navigation.navigate('CustomerDetail', { customerId: pharmacy.id });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E4A8B" />
                <Text style={{ marginTop: 10 }}>Đang tải bản đồ...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bản đồ khách hàng</Text>
                <View style={{ width: 60 }} />
            </View>

            {errorMsg ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            ) : (
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: location ? location.latitude : 10.7769,
                        longitude: location ? location.longitude : 106.7009,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {pharmacies.map((pharmacy) => (
                        <Marker
                            key={pharmacy.id}
                            coordinate={{
                                latitude: parseFloat(pharmacy.latitude),
                                longitude: parseFloat(pharmacy.longitude),
                            }}
                            title={pharmacy.name}
                            description={pharmacy.address}
                            onCalloutPress={() => handleCalloutPress(pharmacy)}
                        >
                            <Callout tooltip>
                                <View style={styles.calloutContainer}>
                                    <Text style={styles.calloutTitle}>{pharmacy.name}</Text>
                                    <Text style={styles.calloutAddress} numberOfLines={2}>{pharmacy.address}</Text>
                                    <View style={styles.calloutButton}>
                                        <Text style={styles.calloutButtonText}>Xem chi tiết</Text>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 40, // Adjust for safe area
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        color: '#1E4A8B',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    calloutContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        width: 200,
        borderColor: '#ddd',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
        color: '#1a1a2e',
    },
    calloutAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    calloutButton: {
        backgroundColor: '#1E4A8B',
        paddingVertical: 6,
        borderRadius: 4,
        alignItems: 'center',
    },
    calloutButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default MapScreen;
