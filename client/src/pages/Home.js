import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customersData from '../data/customers.json';

const Home = () => {
  const { user } = useAuth();
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if (user) {
      getCurrentLocationAndPharmacies();
    } else {
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentLocationAndPharmacies = () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyPharmacies(latitude, longitude);
          setLocationError(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(true);
          // Fallback to TP.HCM center
          setUserLocation({ lat: 10.7769, lng: 106.7009 });
          fetchNearbyPharmacies(10.7769, 106.7009);
        }
      );
    } else {
      setLocationError(true);
      setUserLocation({ lat: 10.7769, lng: 106.7009 });
      fetchNearbyPharmacies(10.7769, 106.7009);
    }
  };

  const fetchNearbyPharmacies = async (lat, lng) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allPharmacies = customersData?.customers || [];
    
    // Lọc theo Hub phụ trách nếu user là Trình dược viên
    let filteredPharmacies = allPharmacies;
    if (user && user.hub) {
      filteredPharmacies = allPharmacies.filter(pharmacy => pharmacy.hub === user.hub);
    }
    
    // Tính khoảng cách và sắp xếp
    const pharmaciesWithDistance = filteredPharmacies.map(pharmacy => {
      const distance = calculateDistance(lat, lng, pharmacy.latitude, pharmacy.longitude);
      return { ...pharmacy, distance };
    }).sort((a, b) => a.distance - b.distance);
    
    setNearbyPharmacies(pharmaciesWithDistance.slice(0, 5)); // Top 5 closest
    setLoading(false);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDistanceText = (pharmacy) => {
    if (!userLocation || !pharmacy.distance) return '';
    const distance = pharmacy.distance;
    
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const openDirections = (pharmacy) => {
    console.log('Opening directions to:', pharmacy.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };



  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Get relevant charger types based on user's vehicle
  const getRelevantChargerTypes = (station, userVehicleType) => {
    if (!station || !station.pricing || !Array.isArray(station.pricing) || station.pricing.length === 0) {
      return [];
    }
    
    // Filter charger types based on vehicle compatibility
    let relevantChargers = station.pricing.filter(p => 
      p && p.chargerType && typeof p.chargerType === 'string' && p.pricePerHour
    );
    
    if (userVehicleType === 'motorbike') {
      // Xe máy điện thường dùng AC Slow và AC Fast
      relevantChargers = relevantChargers.filter(p => 
        p.chargerType.includes('AC') && !p.chargerType.includes('DC')
      );
    } else if (userVehicleType === 'car') {
      // Ô tô điện có thể dùng tất cả loại sạc
      relevantChargers = relevantChargers;
    }
    
    // Sort by price (cheapest first) and limit to 2 most relevant
    return relevantChargers
      .sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0))
      .slice(0, 2);
  };

  const getChargerIcon = (chargerType) => {
    if (!chargerType || typeof chargerType !== 'string') return '🔋';
    if (chargerType.includes('DC')) return '🚀';
    if (chargerType.includes('22kW')) return '⚡';
    if (chargerType.includes('7kW')) return '🔌';
    return '🔋';
  };

  const getChargerDisplayName = (chargerType) => {
    if (!chargerType || typeof chargerType !== 'string') return 'Standard';
    if (chargerType.includes('DC Fast (50kW)')) return 'DC 50kW';
    if (chargerType.includes('AC Fast (22kW)')) return 'AC 22kW';
    if (chargerType.includes('AC Fast (7kW)')) return 'AC 7kW';
    if (chargerType.includes('AC Slow (3.7kW)')) return 'AC 3.7kW';
    return chargerType.split('(')[0].trim();
  };

  // Guest user view
  if (!user) {
    return (
      <div className="mobile-home-guest">
        {/* Status Bar Spacer */}
        <div className="status-bar-spacer"></div>
        
        {/* App Header */}
        <div className="mobile-header">
          <div className="app-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Sapharco Sales</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="hero-card">
          <div className="hero-icon">⚡</div>
          <h1>Tìm trạm sạc gần bạn</h1>
          <p>Hơn 1000+ trạm sạc trên toàn quốc</p>
          
          <div className="quick-stats">
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Trạm sạc</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Hỗ trợ</span>
            </div>
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Người dùng</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mobile-actions">
          <Link to="/register" className="btn-primary-mobile">
            <span className="btn-icon">📱</span>
            <div className="btn-content">
              <span className="btn-title">Đăng ký nhanh</span>
              <span className="btn-subtitle">Chỉ cần số điện thoại</span>
            </div>
            <span className="btn-arrow">→</span>
          </Link>
          
          <Link to="/login" className="btn-secondary-mobile">
            <span className="btn-icon">🔐</span>
            <span className="btn-text">Đăng nhập</span>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mobile-features">
          <h2>Tính năng nổi bật</h2>
          
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">📍</div>
              <div className="feature-content">
                <h3>Định vị GPS</h3>
                <p>Tìm trạm gần nhất</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-content">
                <h3>Sạc nhanh</h3>
                <p>Tiết kiệm thời gian</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <div className="feature-content">
                <h3>Giá rẻ</h3>
                <p>So sánh giá tốt nhất</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div className="feature-content">
                <h3>An toàn</h3>
                <p>Trạm được kiểm định</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bottom-cta">
          <div className="cta-content">
            <h3>Bắt đầu hành trình xanh</h3>
            <p>Tham gia ngay hôm nay</p>
          </div>
          <Link to="/register" className="cta-button">
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    );
  }

  // Logged in user view
  return (
    <div className="home-logged-in">
      {/* Header */}
      <div className="home-header">
        <div className="user-greeting">
          <h1>Xin chào, {user.name}! 👋</h1>
          <p>
            {locationError ? 
              '📍 Sử dụng vị trí mặc định TP.HCM' : 
              '📍 Đã xác định vị trí của bạn'
            }
          </p>
        </div>
        
        <div className="user-points">
          <div className="points-badge">
            <span className="points-icon">⭐</span>
            <span className="points-value">{user.points || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-home">
        <Link to="/map" className="action-card">
          <div className="action-icon">🗺️</div>
          <div className="action-text">
            <strong>Xem bản đồ</strong>
            <span>Khám phá khu vực</span>
          </div>
          <div className="action-arrow">→</div>
        </Link>
      </div>

      {/* Nearby Pharmacies - Các nhà thuốc chăm sóc */}
      <div className="nearby-section">
        <div className="section-header">
          <h2>🏥 Các nhà thuốc chăm sóc</h2>
          <Link to="/map" className="see-all-btn">Xem tất cả</Link>
        </div>

        {loading ? (
          <div className="loading-stations">
            <div className="loading-spinner"></div>
            <p>Đang tìm nhà thuốc gần bạn...</p>
          </div>
        ) : nearbyPharmacies.length > 0 ? (
          <div className="stations-grid">
            {nearbyPharmacies.map((pharmacy, index) => (
              <div key={pharmacy.id} className="station-card-compact" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="station-main-info">
                  <div className="station-header-compact">
                    <h3>🏥 {pharmacy.name}</h3>
                    <div className="station-badges">
                      <span className="distance-badge">{getDistanceText(pharmacy)}</span>
                      <span className="verified-badge" style={{ background: 'rgba(26, 92, 162, 0.1)', color: '#1a5ca2' }}>
                        {pharmacy.code}
                      </span>
                    </div>
                  </div>
                  
                  <div className="station-details-compact">
                    <div className="detail-item">
                      <span style={{ fontSize: '14px', color: '#666' }}>📍 {pharmacy.address}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span style={{ fontSize: '14px', color: '#666' }}>📞 {pharmacy.phone}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span style={{ fontSize: '14px', color: '#1a5ca2', fontWeight: '600' }}>
                        Hub: {pharmacy.hub}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="station-actions-compact">
                  <button 
                    onClick={() => openDirections(pharmacy)}
                    className="directions-btn"
                  >
                    🧭 Chỉ đường
                  </button>
                  
                  <Link 
                    to={`/station/${pharmacy.id}`}
                    className="details-btn"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-stations">
            <div className="no-stations-icon">🏥</div>
            <h3>Không tìm thấy nhà thuốc nào</h3>
            <p>Bạn chưa có nhà thuốc được phân công trong khu vực này</p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <Link to="/create-station" className="bottom-action-btn primary">
          <span className="action-icon">➕</span>
          <span>Thêm trạm sạc</span>
        </Link>
        
        <Link to="/profile" className="bottom-action-btn secondary">
          <span className="action-icon">👤</span>
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;