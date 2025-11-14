import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStationById, getReviewsByStationId, saveToLocalStorage, getFromLocalStorage, generateId } from '../utils/mockData';
import StarRating from '../components/StarRating';

const StationDetail = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [station, setStation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    ratings: {
      service: 0,        // Dịch vụ
      comfort: 0,        // Sự thoải mái
      pricing: 0,        // Giá cả
      location: 0,       // Vị trí
      cleanliness: 0     // Vệ sinh
    },
    comment: ''
  });

  useEffect(() => {
    loadStationData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStationData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stationData = getStationById(id);
    const reviewsData = getReviewsByStationId(id);
    
    setStation(stationData);
    setReviews(reviewsData);
    setLoading(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }

    // Tính rating tổng từ các tiêu chí
    const ratingsArray = Object.values(reviewForm.ratings);
    const averageRating = ratingsArray.reduce((sum, rating) => sum + rating, 0) / ratingsArray.length;
    
    // Tạo review mới
    const newReview = {
      id: generateId(),
      stationId: id,
      user: { name: user.name, avatar: user.avatar },
      rating: Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số thập phân
      ratings: { ...reviewForm.ratings },
      comment: reviewForm.comment,
      images: [],
      createdAt: new Date()
    };

    // Lưu review vào localStorage
    const allReviews = getFromLocalStorage('reviews', []);
    allReviews.push(newReview);
    saveToLocalStorage('reviews', allReviews);

    // Cập nhật state
    setReviews([newReview, ...reviews]);

    // Thưởng điểm cho user
    const updatedUser = { ...user, points: (user.points || 0) + 10 };
    updateUser(updatedUser);

    // Reset form
    setReviewForm({ 
      ratings: {
        service: 0,
        comfort: 0,
        pricing: 0,
        location: 0,
        cleanliness: 0
      },
      comment: '' 
    });
    setShowReviewForm(false);

    alert('Cảm ơn bạn đã đánh giá! Bạn được thưởng 10 điểm.');
  };



  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin trạm sạc...</div>;
  }

  if (!station) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>❌ Không tìm thấy trạm sạc</h2>
        <Link to="/map" className="btn-primary">🗺️ Quay lại bản đồ</Link>
      </div>
    );
  }

  return (
    <div className="station-detail-container">
      {/* Header */}
      <div className="station-header-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 className="station-title">⚡ {station.name}</h1>
            <p className="station-address">📍 {station.address}</p>
          </div>
          {station.isVerified && (
            <span className="verified-badge">
              ✅ Đã xác minh
            </span>
          )}
        </div>

        <div className="station-info-grid">
          <div className="info-section">
            <h3>⭐ Đánh giá</h3>
            <StarRating 
              rating={station.rating} 
              totalRatings={station.totalRatings}
              size="large"
            />
          </div>

          <div className="info-section">
            <h3>🕒 Giờ hoạt động</h3>
            <div className="operating-hours">
              <div className="hours-icon">🕒</div>
              <div className="hours-text">
                {station.operatingHours.is24Hours ? '24/7' : `${station.operatingHours.open} - ${station.operatingHours.close}`}
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>📞 Liên hệ</h3>
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">👤</div>
                <div className="contact-text">{station.owner.name}</div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📱</div>
                <div className="contact-text">{station.owner.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions */}
      {station.promotions.length > 0 && (
        <div className="promotion-card">
          <h3 className="promotion-title">🎁 Khuyến mãi đặc biệt</h3>
          {station.promotions.map((promo, index) => (
            <div key={index} className="promotion-item">
              <h4 style={{ color: 'var(--ios-green)', margin: '0 0 0.5rem 0' }}>
                {promo.title}
                <span className="promotion-discount">-{promo.discount}%</span>
              </h4>
              <p style={{ margin: '0.25rem 0', color: 'rgba(255, 255, 255, 0.7)' }}>{promo.description}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                📅 Có hiệu lực: {formatDate(promo.validFrom)} - {formatDate(promo.validTo)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Pricing & Charger Types */}
        <div className="pricing-card">
          <h3>💰 Bảng giá & Loại sạc</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {station.pricing.map((price, index) => {
              // Determine charger specs and icon based on type
              const getChargerDetails = (type) => {
                const details = {
                  'AC Slow (3.7kW)': { 
                    icon: '🔌', 
                    power: '3.7kW',
                    speed: 'Chậm',
                    time: '6-8h đầy'
                  },
                  'AC Fast (7kW)': { 
                    icon: '⚡', 
                    power: '7kW',
                    speed: 'Trung bình',
                    time: '3-4h đầy'
                  },
                  'AC Fast (11kW)': { 
                    icon: '⚡', 
                    power: '11kW',
                    speed: 'Nhanh',
                    time: '2-3h đầy'
                  },
                  'AC Fast (22kW)': { 
                    icon: '⚡', 
                    power: '22kW',
                    speed: 'Nhanh',
                    time: '1-2h đầy'
                  },
                  'DC Fast (50kW)': { 
                    icon: '🚀', 
                    power: '50kW',
                    speed: 'Siêu nhanh',
                    time: '30-45p đầy'
                  },
                  'DC Ultra (150kW)': { 
                    icon: '⚡', 
                    power: '150kW',
                    speed: 'Cực nhanh',
                    time: '15-20p đầy'
                  },
                  'DC Ultra (350kW)': { 
                    icon: '🔥', 
                    power: '350kW',
                    speed: 'Tức thời',
                    time: '5-10p đầy'
                  }
                };
                return details[type] || { 
                  icon: '🔌', 
                  power: 'N/A',
                  speed: 'Tiêu chuẩn',
                  time: 'Tùy xe'
                };
              };

              const chargerDetails = getChargerDetails(price.chargerType);

              return (
                <div key={index} className="pricing-item">
                  <div className="charger-type">
                    <div className="charger-icon">{chargerDetails.icon}</div>
                    <div className="charger-type-details">
                      <div className="charger-type-name">{price.chargerType}</div>
                      <div className="charger-type-specs">
                        <span className="charging-speed">{chargerDetails.speed}</span>
                        <span>⏱️ {chargerDetails.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="price-value">
                    <div>{formatPrice(price.pricePerHour)}đ</div>
                    <div className="price-unit">mỗi giờ</div>
                  </div>
                  {chargerDetails.power !== 'N/A' && (
                    <div className="power-badge">{chargerDetails.power}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Amenities */}
        <div className="pricing-card">
          <h3>🎯 Tiện ích</h3>
          <div className="amenities-grid">
            {station.amenities.map((amenity, index) => {
              const getAmenityIcon = (amenity) => {
                const icons = {
                  'WiFi': '📶',
                  'Parking': '🅿️',
                  'Cafe': '☕',
                  'Shopping Mall': '🛍️',
                  'Food Court': '🍽️',
                  'Security': '🔒',
                  'Air Conditioning': '❄️',
                  'Restaurant': '🍴',
                  'Cinema': '🎬',
                  'ATM': '🏧',
                  'Convenience Store': '🏪',
                  'Gas Station': '⛽',
                  'CCTV': '📹',
                  'Toilet': '🚻',
                  'Vending Machine': '🥤',
                  'Pharmacy': '💊',
                  'Supermarket': '🛒'
                };
                return icons[amenity] || '✨';
              };
              
              return (
                <div key={index} className="amenity-item">
                  <span className="amenity-icon">{getAmenityIcon(amenity)}</span>
                  <span className="amenity-text">{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="station-actions">
        <button 
          className="action-btn primary"
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&travelmode=driving`;
            window.open(url, '_blank');
          }}
        >
          🧭 Chỉ đường
        </button>
        <button 
          className="action-btn secondary"
          onClick={() => {
            const text = `Tôi đang ở trạm sạc ${station.name} - ${station.address}. Bạn có muốn đến không?`;
            if (navigator.share) {
              navigator.share({
                title: station.name,
                text: text,
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(`${text} ${window.location.href}`);
              alert('Đã copy link chia sẻ!');
            }
          }}
        >
          📤 Chia sẻ
        </button>
        <Link to={`/chat/${station.owner.phone}`} className="action-btn secondary">
          💬 Nhắn tin chủ trạm
        </Link>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h3 className="reviews-title">💬 Đánh giá từ khách hàng ({reviews.length})</h3>
          {user && (
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary"
            >
              ✍️ Viết đánh giá
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h3>✍️ Đánh giá trạm sạc</h3>
            
            {/* Rating Criteria */}
            <div className="rating-criteria">
              <div className="criteria-item">
                <label>🛎️ Dịch vụ</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${reviewForm.ratings.service >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({
                        ...reviewForm,
                        ratings: { ...reviewForm.ratings, service: star }
                      })}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-text">
                    {reviewForm.ratings.service > 0 ? `${reviewForm.ratings.service}/5` : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>

              <div className="criteria-item">
                <label>🛋️ Sự thoải mái</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${reviewForm.ratings.comfort >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({
                        ...reviewForm,
                        ratings: { ...reviewForm.ratings, comfort: star }
                      })}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-text">
                    {reviewForm.ratings.comfort > 0 ? `${reviewForm.ratings.comfort}/5` : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>

              <div className="criteria-item">
                <label>💰 Giá cả</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${reviewForm.ratings.pricing >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({
                        ...reviewForm,
                        ratings: { ...reviewForm.ratings, pricing: star }
                      })}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-text">
                    {reviewForm.ratings.pricing > 0 ? `${reviewForm.ratings.pricing}/5` : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>

              <div className="criteria-item">
                <label>📍 Vị trí</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${reviewForm.ratings.location >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({
                        ...reviewForm,
                        ratings: { ...reviewForm.ratings, location: star }
                      })}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-text">
                    {reviewForm.ratings.location > 0 ? `${reviewForm.ratings.location}/5` : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>

              <div className="criteria-item">
                <label>🧽 Vệ sinh</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${reviewForm.ratings.cleanliness >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({
                        ...reviewForm,
                        ratings: { ...reviewForm.ratings, cleanliness: star }
                      })}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-text">
                    {reviewForm.ratings.cleanliness > 0 ? `${reviewForm.ratings.cleanliness}/5` : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Rating Display */}
            <div className="overall-rating">
              <label>📊 Đánh giá tổng thể</label>
              <div className="overall-score">
                {(() => {
                  const ratingsArray = Object.values(reviewForm.ratings);
                  const validRatings = ratingsArray.filter(r => r > 0);
                  if (validRatings.length === 0) return 'Chưa có đánh giá';
                  const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
                  return `${average.toFixed(1)}/5 ⭐`;
                })()}
              </div>
            </div>
            
            <div className="form-group">
              <label>💭 Nhận xét chi tiết</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                placeholder="Chia sẻ trải nghiệm chi tiết của bạn về trạm sạc này..."
                rows={4}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                🚀 Gửi đánh giá (+10 điểm)
              </button>
              <button 
                type="button" 
                onClick={() => setShowReviewForm(false)}
                className="btn-secondary"
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">👤</div>
                    <div>
                      <h4 className="reviewer-name">{review.user.name}</h4>
                      <div style={{ marginTop: '0.25rem' }}>
                        <StarRating rating={review.rating} size="small" />
                      </div>
                    </div>
                  </div>
                  <div className="review-date">
                    {formatDate(review.createdAt)}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem', 
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255, 255, 255, 0.8)' }}>Chưa có đánh giá nào</h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.6)' }}>Hãy là người đầu tiên đánh giá trạm sạc này!</p>
            </div>
          )}
        </div>
      </div>

      {/* Back to Map */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/map" className="btn-secondary">
          🗺️ Quay lại bản đồ
        </Link>
      </div>
    </div>
  );
};

export default StationDetail;