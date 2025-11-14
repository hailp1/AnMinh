import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNearbyUsers, initializeNearbyUsers, initializePharmacyReps } from '../utils/mockData';
import customersData from '../data/customers.json';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix cho marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = () => {
  const { user } = useAuth();
  const [pharmacies, setPharmacies] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  const [userLocation, setUserLocation] = useState([10.7769, 106.7009]); // Default: TP.HCM
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pharmacies'); // 'pharmacies' or 'colleagues'
  const [showUserProfile, setShowUserProfile] = useState(null);

  useEffect(() => {
    // Initialize nearby users data
    initializeNearbyUsers();
    // Initialize pharmacy reps
    initializePharmacyReps();
    
    // Lấy vị trí hiện tại của user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          fetchPharmacies(latitude, longitude);
          fetchColleagues(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          fetchPharmacies(10.7769, 106.7009); // Fallback location: TP.HCM
          fetchColleagues(10.7769, 106.7009);
        }
      );
    } else {
      fetchPharmacies(10.7769, 106.7009);
      fetchColleagues(10.7769, 106.7009);
    }
  }, [user]);

  const fetchPharmacies = async (lat, lng) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const allPharmacies = customersData?.customers || [];
      
      // Lọc theo Hub phụ trách nếu user là Trình dược viên
      let filteredPharmacies = allPharmacies;
      if (user && user.hub) {
        filteredPharmacies = allPharmacies.filter(pharmacy => pharmacy.hub === user.hub);
      }
      
      // Tính khoảng cách và sắp xếp
      const pharmaciesWithDistance = filteredPharmacies.map(pharmacy => {
        const R = 6371000;
        const dLat = (pharmacy.latitude - lat) * Math.PI / 180;
        const dLng = (pharmacy.longitude - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(pharmacy.latitude * Math.PI / 180) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return { ...pharmacy, distance };
      }).sort((a, b) => a.distance - b.distance);
      
      setPharmacies(pharmaciesWithDistance);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchColleagues = async (lat, lng) => {
    try {
      // Lấy danh sách users từ localStorage
      const { getFromLocalStorage } = await import('../utils/mockData');
      const users = getFromLocalStorage('users', []);
      
      // Lọc đồng nghiệp (cùng role PHARMACY_REP và cùng hub)
      const colleagues = users.filter(u => 
        u.role === 'PHARMACY_REP' && 
        u.id !== user?.id &&
        (user?.hub ? u.hub === user.hub : true) &&
        (u.latitude && u.longitude)
      );
      
      // Tính khoảng cách
      const colleaguesWithDistance = colleagues.map(colleague => {
        const colleagueLat = colleague.latitude || colleague.location?.lat;
        const colleagueLng = colleague.longitude || colleague.location?.lng;
        const R = 6371000;
        const dLat = (colleagueLat - lat) * Math.PI / 180;
        const dLng = (colleagueLng - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(colleagueLat * Math.PI / 180) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return { 
          ...colleague, 
          distance,
          latitude: colleagueLat,
          longitude: colleagueLng
        };
      }).sort((a, b) => a.distance - b.distance);
      
      setColleagues(colleaguesWithDistance);
    } catch (error) {
      console.error('Error fetching colleagues:', error);
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const formatLastSeen = (date) => {
    if (!date) return 'Chưa có thông tin';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div className="loading-spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #1a5ca2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '16px', color: '#1a5ca2', fontWeight: '600' }}>
            Đang tải bản đồ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
      paddingBottom: '20px'
    }}>
      {/* Mobile Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '15px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/home" style={{ fontSize: '24px', textDecoration: 'none', color: '#1a5ca2' }}>
          ←
        </Link>
        <h1 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          margin: 0,
          color: '#1a5ca2',
          flex: 1,
          textAlign: 'center'
        }}>
          🗺️ Bản Đồ
        </h1>
        <div style={{ width: '24px' }}></div>
      </div>

      <div style={{ padding: '15px' }}>
        {/* Tabs - Mobile Optimized */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '15px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <button 
            onClick={() => setActiveTab('pharmacies')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'pharmacies' 
                ? 'linear-gradient(135deg, #1a5ca2, #3eb4a8)' 
                : 'transparent',
              color: activeTab === 'pharmacies' ? '#fff' : '#1a5ca2',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🏥 Nhà thuốc ({pharmacies.length})
          </button>
          <button 
            onClick={() => setActiveTab('colleagues')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'colleagues' 
                ? 'linear-gradient(135deg, #1a5ca2, #3eb4a8)' 
                : 'transparent',
              color: activeTab === 'colleagues' ? '#fff' : '#1a5ca2',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            👥 Đồng nghiệp ({colleagues.length})
          </button>
        </div>

        {activeTab === 'pharmacies' ? (
          <>
            {/* Info Banner */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '15px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <p style={{ 
                color: '#1a5ca2', 
                fontSize: '14px', 
                fontWeight: '600',
                margin: 0
              }}>
                {user?.hub ? `Hub ${user.hub}` : 'Tất cả nhà thuốc'}: <strong>{pharmacies.length}</strong> nhà thuốc
              </p>
            </div>

            {/* Map Container - Mobile Optimized */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '15px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              height: '400px',
              position: 'relative'
            }}>
              <MapContainer 
                center={userLocation} 
                zoom={13} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Marker vị trí user */}
                <Marker position={userLocation}>
                  <Popup>
                    <div style={{ padding: '5px' }}>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>📍 Vị trí của bạn</h3>
                      <p style={{ margin: 0, fontSize: '12px' }}>Bạn đang ở đây</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Markers cho các nhà thuốc */}
                {pharmacies.map((pharmacy) => (
                  <Marker 
                    key={pharmacy.id} 
                    position={[pharmacy.latitude, pharmacy.longitude]}
                  >
                    <Popup>
                      <div style={{ padding: '5px', minWidth: '200px' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                          🏥 {pharmacy.name}
                        </h3>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}>
                          <strong>📋 Mã:</strong> {pharmacy.code}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}>
                          <strong>📍 Địa chỉ:</strong> {pharmacy.address}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}>
                          <strong>📞 SĐT:</strong> {pharmacy.phone}
                        </p>
                        {pharmacy.distance && (
                          <p style={{ margin: '4px 0', fontSize: '12px', color: '#1a5ca2', fontWeight: '600' }}>
                            📏 {formatDistance(pharmacy.distance)}
                          </p>
                        )}
                        <Link 
                          to={`/create-order`}
                          style={{
                            display: 'block',
                            marginTop: '10px',
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                            color: '#fff',
                            textAlign: 'center',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          📋 Tạo đơn hàng
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Danh sách nhà thuốc - Mobile Card Layout */}
            <div>
              <h3 style={{ 
                color: '#fff', 
                textAlign: 'center', 
                marginBottom: '15px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                📋 Danh sách nhà thuốc
              </h3>
              
              {pharmacies.length === 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏥</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', color: '#1a1a2e' }}>
                    Không có nhà thuốc nào
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Bạn chưa có nhà thuốc được phân công trong khu vực này
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pharmacies.map((pharmacy) => (
                    <div 
                      key={pharmacy.id} 
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        padding: '15px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: '12px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            margin: '0 0 8px 0', 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: '#1a1a2e'
                          }}>
                            🏥 {pharmacy.name}
                          </h3>
                          <div style={{
                            display: 'inline-block',
                            background: 'rgba(26, 92, 162, 0.1)',
                            color: '#1a5ca2',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            marginBottom: '8px'
                          }}>
                            {pharmacy.code}
                          </div>
                          <p style={{ 
                            color: '#666', 
                            margin: '8px 0',
                            fontSize: '13px',
                            lineHeight: '1.5'
                          }}>
                            📍 {pharmacy.address}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '12px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '10px'
                      }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <strong>📞 SĐT:</strong><br />
                          {pharmacy.phone}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <strong>👤 Chủ:</strong><br />
                          {pharmacy.owner}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <strong>📍 Hub:</strong><br />
                          {pharmacy.hub}
                        </div>
                        {pharmacy.distance && (
                          <div style={{ fontSize: '12px', color: '#1a5ca2', fontWeight: '600' }}>
                            <strong>📏 Khoảng cách:</strong><br />
                            {formatDistance(pharmacy.distance)}
                          </div>
                        )}
                      </div>

                      <Link 
                        to={`/create-order`}
                        style={{
                          display: 'block',
                          padding: '12px',
                          background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                          color: '#fff',
                          textAlign: 'center',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(26, 92, 162, 0.3)'
                        }}
                      >
                        📋 Tạo đơn hàng
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Đồng nghiệp Section - Mobile Optimized */
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '15px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <p style={{ 
                color: '#1a5ca2', 
                fontSize: '14px', 
                fontWeight: '600',
                margin: 0
              }}>
                Tìm thấy <strong>{colleagues.length}</strong> đồng nghiệp gần bạn
              </p>
            </div>

            {colleagues.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', color: '#1a1a2e' }}>
                  Không có đồng nghiệp nào gần bạn
                </h3>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Thử mở rộng bán kính tìm kiếm hoặc quay lại sau
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {colleagues.map((colleague) => (
                  <div 
                    key={colleague.id} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      padding: '15px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        position: 'relative'
                      }}>
                        👨‍⚕️
                        {colleague.isOnline && (
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#10b981',
                            border: '2px solid #fff'
                          }}></div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: '0 0 6px 0', 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: '#1a1a2e'
                        }}>
                          {colleague.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                          <div>📍 Hub: {colleague.hub}</div>
                          <div>🆔 Mã: {colleague.id}</div>
                          {colleague.distance && (
                            <div style={{ color: '#1a5ca2', fontWeight: '600' }}>
                              📏 {formatDistance(colleague.distance)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: '10px',
                      background: '#f9fafb',
                      borderRadius: '10px',
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      <div style={{ marginBottom: '4px' }}>📞 {colleague.phone}</div>
                      <div>🕒 {formatLastSeen(colleague.lastLogin || colleague.createdAt)}</div>
                    </div>

                    <Link 
                      to={`/chat/${colleague.id}`}
                      style={{
                        display: 'block',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                        color: '#fff',
                        textAlign: 'center',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(26, 92, 162, 0.3)'
                      }}
                    >
                      💬 Nhắn tin
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS Animation for Loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Map;
