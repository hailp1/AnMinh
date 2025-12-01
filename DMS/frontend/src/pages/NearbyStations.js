import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStationsNearby } from '../utils/mockData';
import StarRating from '../components/StarRating';

const NearbyStations = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [stations, setStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(10000); // 10km default
  const [vehicleFilter, setVehicleFilter] = useState(searchParams.get('filter') || 'all'); // all, car, motorbike

  useEffect(() => {
    getCurrentLocationAndStations();
  }, [searchRadius, vehicleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentLocationAndStations = () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyStations(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to TP.HCM center
          setUserLocation({ lat: 10.7769, lng: 106.7009 });
          fetchNearbyStations(10.7769, 106.7009);
        }
      );
    } else {
      setUserLocation({ lat: 10.7769, lng: 106.7009 });
      fetchNearbyStations(10.7769, 106.7009);
    }
  };

  const fetchNearbyStations = async (lat, lng) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let nearbyStations = getStationsNearby(lat, lng, searchRadius);
    
    // Filter by vehicle type
    if (vehicleFilter !== 'all') {
      nearbyStations = nearbyStations.filter(station => 
        station.supportedVehicles && station.supportedVehicles.includes(vehicleFilter)
      );
    }
    
    setStations(nearbyStations);
    setLoading(false);
  };



  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
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

  if (loading) {
    return (
      <div className="nearby-container">
        <div className="loading-ios">
          <div className="loading-spinner"></div>
          <p>Đang tìm trạm sạc gần bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nearby-container">
      {/* Header */}
      <div className="nearby-header">
        <div className="header-content">
          <h1>⚡ Trạm sạc gần bạn</h1>
          <p>Chào {user?.name}, tìm thấy {stations.length} trạm sạc</p>
        </div>
        
        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/map" className="action-btn secondary">
            <span className="action-icon">🗺️</span>
            <span>Bản đồ</span>
          </Link>
          <Link to="/create-station" className="action-btn primary">
            <span className="action-icon">➕</span>
            <span>Thêm trạm</span>
          </Link>
        </div>

        {/* Vehicle Type Filter */}
        <div className="vehicle-filter">
          <h3>🚗 Loại phương tiện</h3>
          <div className="filter-buttons vehicle-buttons">
            <button
              className={`filter-btn ${vehicleFilter === 'all' ? 'active' : ''}`}
              onClick={() => setVehicleFilter('all')}
            >
              Tất cả
            </button>
            <button
              className={`filter-btn ${vehicleFilter === 'car' ? 'active' : ''}`}
              onClick={() => setVehicleFilter('car')}
            >
              🚗 Ô tô
            </button>
            <button
              className={`filter-btn ${vehicleFilter === 'motorbike' ? 'active' : ''}`}
              onClick={() => setVehicleFilter('motorbike')}
            >
              🏍️ Xe máy
            </button>
          </div>
        </div>

        {/* Search Radius Filter */}
        <div className="radius-filter">
          <h3>📍 Bán kính tìm kiếm</h3>
          <div className="filter-buttons">
            {[5000, 10000, 20000, 50000].map(radius => (
              <button
                key={radius}
                className={`filter-btn ${searchRadius === radius ? 'active' : ''}`}
                onClick={() => setSearchRadius(radius)}
              >
                {radius < 1000 ? `${radius}m` : `${radius/1000}km`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stations List */}
      <div className="stations-list">
        {stations.length > 0 ? (
          stations.map((station, index) => (
            <div key={station.id} className="station-card-ios" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="station-header">
                <div className="station-info">
                  <h3>{station.name}</h3>
                  <p className="station-address">{station.address}</p>
                </div>
                <div className="station-distance">
                  <span className="distance-badge">{getDistanceText(station)}</span>
                  {station.isVerified && (
                    <span className="verified-badge">✅</span>
                  )}
                </div>
              </div>

              <div className="station-details">
                <div className="detail-row">
                  <span className="detail-label">⭐ Đánh giá</span>
                  <span className="detail-value">
                    <StarRating 
                      rating={station.rating} 
                      totalRatings={station.totalRatings}
                      size="normal"
                    />
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">🔌 Loại sạc</span>
                  <span className="detail-value">{station.chargerTypes.join(', ')}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">🚗 Phương tiện</span>
                  <span className="detail-value">
                    {station.supportedVehicles?.includes('car') && '🚗'}
                    {station.supportedVehicles?.includes('motorbike') && '🏍️'}
                    {!station.supportedVehicles && '🚗🏍️'}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">💰 Giá từ</span>
                  <span className="detail-value price">
                    {formatPrice(Math.min(...station.pricing.map(p => p.pricePerHour)))}đ/giờ
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">🕒 Giờ mở</span>
                  <span className="detail-value">
                    {station.operatingHours.is24Hours ? '24/7' : 
                     `${station.operatingHours.open} - ${station.operatingHours.close}`}
                  </span>
                </div>
              </div>

              {station.promotions.length > 0 && (
                <div className="promotion-badge">
                  🎁 {station.promotions[0].title} - Giảm {station.promotions[0].discount}%
                </div>
              )}

              <div className="station-actions">
                <Link to={`/station/${station.id}`} className="view-detail-btn">
                  Xem chi tiết
                  <span className="arrow">→</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <h3>Không tìm thấy trạm sạc</h3>
            <p>Thử tăng bán kính tìm kiếm hoặc thêm trạm sạc mới</p>
            <Link to="/create-station" className="action-btn primary">
              ➕ Thêm trạm sạc
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyStations;