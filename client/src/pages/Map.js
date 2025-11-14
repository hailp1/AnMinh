import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStationsNearby, getNearbyUsers, initializeNearbyUsers } from '../utils/mockData';
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
        u.hub === user?.hub &&
        u.location
      );
      
      // Tính khoảng cách
      const colleaguesWithDistance = colleagues.map(colleague => {
        const R = 6371000;
        const dLat = (colleague.location.lat - lat) * Math.PI / 180;
        const dLng = (colleague.location.lng - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(colleague.location.lat * Math.PI / 180) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return { ...colleague, distance };
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

  const getRatingStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) {
    return <div className="loading">Đang tải bản đồ...</div>;
  }

  return (
    <div className="map-container">
      <h2>🗺️ Khám phá khu vực</h2>
      
      {/* Tabs */}
      <div className="map-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pharmacies' ? 'active' : ''}`}
          onClick={() => setActiveTab('pharmacies')}
        >
          🏥 Nhà thuốc phụ trách ({pharmacies.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'colleagues' ? 'active' : ''}`}
          onClick={() => setActiveTab('colleagues')}
        >
          👥 Đồng nghiệp ({colleagues.length})
        </button>
      </div>

      {activeTab === 'pharmacies' ? (
        <>
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '1.1rem' }}>
              {user?.hub ? `Nhà thuốc Hub ${user.hub}` : 'Tất cả nhà thuốc'}: <strong>{pharmacies.length}</strong> nhà thuốc
            </p>
          </div>

          <MapContainer 
            center={userLocation} 
            zoom={13} 
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marker vị trí user */}
        <Marker position={userLocation}>
          <Popup>
            <div className="station-popup">
              <h3>📍 Vị trí của bạn</h3>
              <p>Bạn đang ở đây</p>
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
              <div className="station-popup">
                <h3>🏥 {pharmacy.name}</h3>
                <p><strong>📋 Mã:</strong> {pharmacy.code}</p>
                <p><strong>📍 Địa chỉ:</strong> {pharmacy.address}</p>
                <p><strong>📞 SĐT:</strong> {pharmacy.phone}</p>
                <p><strong>👤 Chủ nhà thuốc:</strong> {pharmacy.owner}</p>
                <p><strong>📍 Hub:</strong> {pharmacy.hub}</p>
                {pharmacy.distance && (
                  <p><strong>📏 Khoảng cách:</strong> {formatDistance(pharmacy.distance)}</p>
                )}
                <Link 
                  to={`/create-order`}
                  className="btn-primary"
                  style={{ marginTop: '0.75rem', display: 'block', textAlign: 'center' }}
                >
                  📋 Tạo đơn hàng
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Danh sách nhà thuốc */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1.5rem' }}>
          📋 Danh sách nhà thuốc phụ trách
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="station-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3>🏥 {pharmacy.name}</h3>
                  <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>📍 {pharmacy.address}</p>
                </div>
                <span style={{ background: 'rgba(26, 92, 162, 0.1)', color: '#1a5ca2', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                  {pharmacy.code}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p><strong>📞 SĐT:</strong> {pharmacy.phone}</p>
                  <p><strong>👤 Chủ nhà thuốc:</strong> {pharmacy.owner}</p>
                </div>
                <div>
                  <p><strong>📍 Hub:</strong> {pharmacy.hub}</p>
                  {pharmacy.distance && (
                    <p><strong>📏 Khoảng cách:</strong> {formatDistance(pharmacy.distance)}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>🏥 {pharmacy.type}</strong>
                </div>
                <Link to={`/create-order`} className="btn-primary">
                  📋 Tạo đơn hàng
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      ) : (
        /* Đồng nghiệp Section */
        <div className="nearby-users-section">
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '1.1rem' }}>
              Tìm thấy <strong>{colleagues.length}</strong> đồng nghiệp gần bạn
            </p>
          </div>

          <div className="users-grid">
            {colleagues.map((colleague) => (
              <div key={colleague.id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">
                    <span className="avatar-icon">👨‍⚕️</span>
                    {colleague.isOnline && <div className="online-indicator"></div>}
                  </div>
                  <div className="user-info">
                    <h3>{colleague.name}</h3>
                    <p className="user-status">📍 Hub: {colleague.hub}</p>
                    <p className="user-distance">📏 {formatDistance(colleague.distance)}</p>
                    <p className="user-code">🆔 Mã: {colleague.id}</p>
                  </div>
                </div>

                <div className="user-details">
                  <div className="user-stats">
                    <span>📞 {colleague.phone}</span>
                    <span>📍 {colleague.hub}</span>
                    <span>🕒 {formatLastSeen(colleague.lastLogin || colleague.createdAt)}</span>
                  </div>
                </div>

                <div className="user-actions">
                  <Link 
                    to={`/chat/${colleague.id}`}
                    className="btn-primary"
                  >
                    💬 Nhắn tin
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {colleagues.length === 0 && (
            <div className="no-users">
              <div className="no-users-icon">👥</div>
              <h3>Không có đồng nghiệp nào gần bạn</h3>
              <p>Thử mở rộng bán kính tìm kiếm hoặc quay lại sau</p>
            </div>
          )}
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <div className="modal-overlay" onClick={() => setShowUserProfile(null)}>
          <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showUserProfile.avatar} {showUserProfile.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowUserProfile(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-label">Đánh giá</span>
                  <span className="stat-value">⭐ {showUserProfile.rating}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Chuyến đi</span>
                  <span className="stat-value">🚗 {showUserProfile.totalTrips}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tham gia</span>
                  <span className="stat-value">📅 {new Date(showUserProfile.joinedDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              
              <div className="profile-info">
                <p><strong>Phương tiện:</strong> {showUserProfile.vehicle}</p>
                <p><strong>Trạng thái:</strong> {showUserProfile.status}</p>
                <p><strong>Khoảng cách:</strong> {formatDistance(showUserProfile.distance)}</p>
                <p><strong>Hoạt động:</strong> {formatLastSeen(showUserProfile.lastSeen)}</p>
              </div>
              
              <div className="profile-bio">
                <h4>Giới thiệu</h4>
                <p>{showUserProfile.bio}</p>
              </div>
              
              <div className="modal-actions">
                <Link 
                  to={`/chat/${showUserProfile.id}`}
                  className="btn-primary"
                  onClick={() => setShowUserProfile(null)}
                >
                  💬 Nhắn tin
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;