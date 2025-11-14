import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStationsNearby } from '../utils/mockData';
import StarRating from '../components/StarRating';

const Home = () => {
  const { user } = useAuth();
  const [nearbyStations, setNearbyStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [vehicleFilter] = useState('all'); // all, car, motorbike

  useEffect(() => {
    if (user) {
      getCurrentLocationAndStations();
    } else {
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when vehicle filter changes
  useEffect(() => {
    if (user && userLocation) {
      fetchNearbyStations(userLocation.lat, userLocation.lng);
    }
  }, [vehicleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentLocationAndStations = () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyStations(latitude, longitude);
          setLocationError(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(true);
          // Fallback to TP.HCM center
          setUserLocation({ lat: 10.7769, lng: 106.7009 });
          fetchNearbyStations(10.7769, 106.7009);
        }
      );
    } else {
      setLocationError(true);
      setUserLocation({ lat: 10.7769, lng: 106.7009 });
      fetchNearbyStations(10.7769, 106.7009);
    }
  };

  const fetchNearbyStations = async (lat, lng) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let stations = getStationsNearby(lat, lng, 50000); // 50km radius
    
    // Filter by vehicle type
    if (vehicleFilter !== 'all') {
      stations = stations.filter(station => 
        station.supportedVehicles && station.supportedVehicles.includes(vehicleFilter)
      );
    }
    
    console.log(`Searching from ${lat}, ${lng} - Found ${stations.length} stations (filter: ${vehicleFilter})`);
    setNearbyStations(stations.slice(0, 5)); // Top 5 closest
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

  const getDistanceText = (station) => {
    if (!userLocation) return '';
    const distance = calculateDistance(
      userLocation.lat, userLocation.lng, 
      station.latitude, station.longitude
    );
    
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const openDirections = (station) => {
    console.log('Opening directions to:', station.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&travelmode=driving`;
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

      {/* Nearby Stations */}
      <div className="nearby-section">
        <div className="section-header">
          <h2>⚡ Trạm sạc gần nhất</h2>
          <Link to="/nearby" className="see-all-btn">Xem tất cả</Link>
        </div>

        {/* Quick Links to Nearby with Filter */}
        <div className="quick-filter-links">
          <Link to="/nearby?filter=all" className="quick-link">
            📍 Tất cả trạm gần
          </Link>
          <Link to="/nearby?filter=car" className="quick-link car">
            🚗 Trạm sạc ô tô
          </Link>
          <Link to="/nearby?filter=motorbike" className="quick-link motorbike">
            🏍️ Trạm sạc xe máy
          </Link>
        </div>

        {loading ? (
          <div className="loading-stations">
            <div className="loading-spinner"></div>
            <p>Đang tìm trạm sạc gần bạn...</p>
          </div>
        ) : nearbyStations.length > 0 ? (
          <div className="stations-grid">
            {nearbyStations.map((station, index) => (
              <div key={station.id} className="station-card-compact" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="station-main-info">
                  <div className="station-header-compact">
                    <h3>{station.name}</h3>
                    <div className="station-badges">
                      <span className="distance-badge">{getDistanceText(station)}</span>
                      {station.isVerified && <span className="verified-badge">✅</span>}
                    </div>
                  </div>
                  
                  <div className="station-details-compact">
                    <div className="detail-item">
                      <StarRating 
                        rating={station.rating} 
                        totalRatings={station.totalRatings}
                        size="small"
                      />
                    </div>
                    
                    <div className="detail-item">
                      <span className="price-from">Từ {formatPrice(Math.min(...station.pricing.map(p => p.pricePerHour)))}đ/h</span>
                    </div>
                    
                    <div className="detail-item">
                      <div className="charger-types-display">
                        {getRelevantChargerTypes(station, user.vehicleType).map((charger, idx) => (
                          <div key={idx} className="charger-type-chip">
                            <span className="charger-icon">{getChargerIcon(charger.type)}</span>
                            <span className="charger-name">{getChargerDisplayName(charger.type)}</span>
                            <span className="charger-price">{formatPrice(charger.pricePerHour)}đ/h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {station.promotions.length > 0 && (
                    <div className="promotion-tag">
                      🎁 Giảm {station.promotions[0].discount}%
                    </div>
                  )}
                </div>

                <div className="station-actions-compact">
                  <button 
                    onClick={() => openDirections(station)}
                    className="directions-btn"
                  >
                    🧭 Chỉ đường
                  </button>
                  
                  <Link 
                    to={`/station/${station.id}`}
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
            <div className="no-stations-icon">📍</div>
            <h3>Không tìm thấy trạm sạc gần</h3>
            <p>Thử mở rộng bán kính tìm kiếm hoặc thêm trạm mới</p>
            <Link to="/create-station" className="btn-primary-ios">
              ➕ Thêm trạm sạc
            </Link>
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