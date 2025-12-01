import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/mockData';
import provincesData from '../data/provinces.json';
import chargerTypesData from '../data/chargerTypes.json';


const CreateStation = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    contactPhone: '',
    lat: null,
    lng: null,
    chargerTypes: [], // Will store {id, price} objects
    amenities: [],
    operatingHours: { open: '', close: '', is24Hours: false }
  });
  const [overallImages, setOverallImages] = useState([]); // Hình tổng thể
  const [chargerImages, setChargerImages] = useState([]); // Hình trụ sạc
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [addressSuggestion, setAddressSuggestion] = useState('');
  const [geocodingStatus, setGeocodingStatus] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const provinces = useMemo(() => provincesData?.provinces || [], []);
  const chargerTypes = useMemo(() => chargerTypesData?.chargerTypes || [], []);

  useEffect(() => {
    // Ensure data is loaded
    console.log('📊 Data loading status:', {
      provinces: provinces.length,
      chargerTypes: chargerTypes.length,
      provincesData: provinces.slice(0, 3).map(p => ({ code: p.code, name: p.name }))
    });
    
    if (provinces.length > 0 && chargerTypes.length > 0) {
      setDataLoaded(true);
      console.log('✅ All data loaded successfully');
    }
  }, [provinces.length, chargerTypes.length]);

  const getCurrentDistricts = () => {
    const selectedProvince = provinces.find(p => p.code === formData.province);
    return selectedProvince ? selectedProvince.districts : [];
  };

  const getCurrentWards = () => {
    const selectedProvince = provinces.find(p => p.code === formData.province);
    if (!selectedProvince) return [];
    const selectedDistrict = selectedProvince.districts.find(d => d.code === formData.district);
    return selectedDistrict?.wards || [];
  };

  // Ước tính tỉnh dựa trên tọa độ (offline fallback) - cải thiện độ chính xác
  const estimateProvinceFromCoords = (lat, lng) => {
    console.log('🗺️ Phân tích tọa độ:', { lat, lng });
    
    // Tọa độ chính xác cho các thành phố lớn
    
    // TP. Hồ Chí Minh (10.72-10.88, 106.62-106.82)
    if (lat >= 10.72 && lat <= 10.88 && lng >= 106.62 && lng <= 106.82) {
      console.log('✅ Xác định: TP. Hồ Chí Minh');
      return 'HCM';
    }
    
    // Hà Nội (20.95-21.15, 105.75-105.95)
    if (lat >= 20.95 && lat <= 21.15 && lng >= 105.75 && lng <= 105.95) {
      console.log('✅ Xác định: Hà Nội');
      return 'HN';
    }
    
    // Đà Nẵng (15.95-16.15, 108.15-108.35)
    if (lat >= 15.95 && lat <= 16.15 && lng >= 108.15 && lng <= 108.35) {
      console.log('✅ Xác định: Đà Nẵng');
      return 'DN';
    }
    
    // Hải Phòng (20.82-20.92, 106.62-106.82)
    if (lat >= 20.82 && lat <= 20.92 && lng >= 106.62 && lng <= 106.82) {
      console.log('✅ Xác định: Hải Phòng');
      return 'HP';
    }
    
    // Cần Thơ (10.02-10.12, 105.72-105.82)
    if (lat >= 10.02 && lat <= 10.12 && lng >= 105.72 && lng <= 105.82) {
      console.log('✅ Xác định: Cần Thơ');
      return 'CT';
    }
    
    // Vùng miền rộng hơn
    console.log('🔍 Phân tích theo vùng miền...');
    
    // Miền Nam (dưới 14 độ vĩ bắc)
    if (lat < 14.0) {
      console.log('📍 Vùng miền Nam');
      
      // Khu vực TP.HCM mở rộng (10.5-11.0, 106.4-107.0)
      if (lat >= 10.5 && lat <= 11.0 && lng >= 106.4 && lng <= 107.0) {
        console.log('✅ Khu vực TP.HCM mở rộng');
        return 'HCM';
      }
      
      // Khu vực Đồng Nai (10.7-11.2, 106.8-107.5)
      if (lat >= 10.7 && lat <= 11.2 && lng >= 106.8 && lng <= 107.5) {
        console.log('✅ Khu vực Đồng Nai');
        return 'DN2';
      }
      
      // Khu vực Bình Dương (10.8-11.3, 106.5-107.0)
      if (lat >= 10.8 && lat <= 11.3 && lng >= 106.5 && lng <= 107.0) {
        console.log('✅ Khu vực Bình Dương');
        return 'BD';
      }
      
      // Khu vực Long An (10.4-10.9, 105.8-106.5)
      if (lat >= 10.4 && lat <= 10.9 && lng >= 105.8 && lng <= 106.5) {
        console.log('✅ Khu vực Long An');
        return 'LA';
      }
      
      // Khu vực Tây Ninh (11.0-11.8, 106.0-106.5)
      if (lat >= 11.0 && lat <= 11.8 && lng >= 106.0 && lng <= 106.5) {
        console.log('✅ Khu vực Tây Ninh');
        return 'TN';
      }
      
      // Đồng bằng sông Cửu Long (9.0-10.5, 105.0-106.2)
      if (lat >= 9.0 && lat <= 10.5 && lng >= 105.0 && lng <= 106.2) {
        console.log('✅ Khu vực Cần Thơ/ĐBSCL');
        return 'CT';
      }
      
      // Mặc định miền Nam
      console.log('🔄 Mặc định: TP.HCM (miền Nam)');
      return 'HCM';
    }
    
    // Miền Trung (14-20 độ vĩ bắc)
    if (lat >= 14.0 && lat < 20.0) {
      console.log('📍 Vùng miền Trung');
      // Khu vực Đà Nẵng và lân cận
      if (lng >= 107.5 && lng <= 109.0) {
        console.log('✅ Khu vực Đà Nẵng');
        return 'DN';
      }
      // Miền Trung khác - mặc định Đà Nẵng
      console.log('🔄 Mặc định: Đà Nẵng (miền Trung)');
      return 'DN';
    }
    
    // Miền Bắc (trên 20 độ vĩ bắc)
    if (lat >= 20.0) {
      console.log('📍 Vùng miền Bắc');
      // Khu vực Hà Nội và lân cận
      if (lng >= 105.5 && lng <= 106.2) {
        console.log('✅ Khu vực Hà Nội');
        return 'HN';
      }
      // Khu vực Hải Phòng
      if (lng >= 106.2 && lng <= 107.0) {
        console.log('✅ Khu vực Hải Phòng');
        return 'HP';
      }
      // Miền Bắc khác - mặc định Hà Nội
      console.log('🔄 Mặc định: Hà Nội (miền Bắc)');
      return 'HN';
    }
    
    // Mặc định trả về TP.HCM
    console.log('🔄 Mặc định cuối cùng: TP.HCM');
    return 'HCM';
  };

  // Simplified reverse geocoding - chỉ sử dụng offline fallback
  const reverseGeocode = useCallback(async (lat, lng) => {
    // Tránh gọi trùng lặp
    if (isGeocoding) {
      console.log('🔄 Đang geocoding, bỏ qua request trùng lặp');
      return;
    }
    
    // Đảm bảo provinces data đã được load
    if (!provinces || provinces.length === 0) {
      console.log('⚠️ Provinces data chưa được load, bỏ qua reverse geocoding');
      setGeocodingStatus('Đang tải dữ liệu tỉnh thành...');
      return;
    }
    
    try {
      setIsGeocoding(true);
      console.log('🔍 Đang ước tính địa chỉ từ tọa độ:', lat, lng);
      setGeocodingStatus('Đang ước tính địa chỉ...');
      
      // Sử dụng offline fallback để ước tính tỉnh
      const estimatedProvince = estimateProvinceFromCoords(lat, lng);
      const estimatedProvinceData = provinces.find(p => p.code === estimatedProvince);
      const firstDistrict = estimatedProvinceData?.districts?.[0]?.code || '';
      
      console.log('🔄 Offline estimation:', {
        province: estimatedProvince,
        district: firstDistrict,
        provinceName: estimatedProvinceData?.name
      });
      
      // Cập nhật form data với province và district
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          province: estimatedProvince,
          district: firstDistrict
        }));
      }, 100);
      
      setAddressSuggestion(`Ước tính vị trí: ${estimatedProvinceData?.name || 'TP.HCM'}`);
      setGeocodingStatus('✅ Đã tự động chọn tỉnh thành dựa trên tọa độ!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setGeocodingStatus('');
      }, 3000);
      
      setIsGeocoding(false);
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      setIsGeocoding(false);
      setGeocodingStatus('Không thể ước tính địa chỉ. Vui lòng chọn tỉnh thành thủ công.');
      
      setTimeout(() => {
        setGeocodingStatus('');
      }, 3000);
    }
  }, [provinces, isGeocoding]);

  // Compress image before upload
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    const compressedImages = [];
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          compressedImages.push({
            id: Date.now() + Math.random(),
            file: compressed,
            preview: event.target.result,
            name: file.name
          });
          
          if (compressedImages.length === files.length) {
            if (type === 'overall') {
              setOverallImages(prev => [...prev, ...compressedImages]);
            } else {
              setChargerImages(prev => [...prev, ...compressedImages]);
            }
          }
        };
        reader.readAsDataURL(compressed);
      }
    }
  };

  const removeImage = (imageId, type) => {
    if (type === 'overall') {
      setOverallImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      setChargerImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const getCurrentLocation = useCallback(() => {
    setGettingLocation(true);
    setError('');
    
    if (navigator.geolocation) {
      console.log('🎯 Bắt đầu lấy vị trí GPS...');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = parseFloat(position.coords.latitude.toFixed(6));
            const lng = parseFloat(position.coords.longitude.toFixed(6));
            const accuracy = position.coords.accuracy;
            
            console.log('📍 Tọa độ GPS nhận được:', {
              lat,
              lng,
              accuracy: `${Math.round(accuracy)}m`,
              altitude: position.coords.altitude ? `${Math.round(position.coords.altitude)}m` : 'N/A',
              heading: position.coords.heading ? `${Math.round(position.coords.heading)}°` : 'N/A',
              speed: position.coords.speed ? `${Math.round(position.coords.speed * 3.6)} km/h` : 'N/A',
              timestamp: new Date(position.timestamp).toLocaleString('vi-VN')
            });
            
            // Hiển thị độ chính xác cho user
            if (accuracy > 100) {
              console.warn('⚠️ Độ chính xác GPS thấp:', `${Math.round(accuracy)}m`);
              setGeocodingStatus(`⚠️ Độ chính xác GPS: ${Math.round(accuracy)}m (khuyến nghị < 50m)`);
            } else if (accuracy > 50) {
              console.log('📍 Độ chính xác GPS trung bình:', `${Math.round(accuracy)}m`);
              setGeocodingStatus(`📍 Độ chính xác GPS: ${Math.round(accuracy)}m`);
            } else {
              console.log('✅ Độ chính xác GPS tốt:', `${Math.round(accuracy)}m`);
              setGeocodingStatus(`✅ Độ chính xác GPS tốt: ${Math.round(accuracy)}m`);
            }
            
            setFormData(prev => ({
              ...prev,
              lat,
              lng
            }));
            
            setLocationDetected(true);
            setGettingLocation(false);
            
            // Tự động đoán địa chỉ (có thể bỏ qua nếu lỗi)
            console.log('🔍 Bắt đầu reverse geocoding...');
            try {
              await reverseGeocode(lat, lng);
            } catch (geocodeError) {
              console.log('⚠️ Bỏ qua reverse geocoding, user có thể nhập thủ công:', geocodeError);
              // Không làm gì, để user tự chọn tỉnh/huyện
            }
          } catch (positionError) {
            console.error('❌ Lỗi xử lý vị trí:', positionError);
            setError('Lỗi xử lý dữ liệu vị trí. Vui lòng thử lại.');
            setGettingLocation(false);
          }
        },
        (error) => {
          console.error('❌ Lỗi lấy vị trí GPS:', error);
          let errorMessage = 'Không thể lấy vị trí hiện tại. ';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Vui lòng cho phép truy cập vị trí trong trình duyệt và thử lại.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Thông tin vị trí không khả dụng. Hãy kiểm tra GPS/WiFi.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Hết thời gian chờ lấy vị trí. Vui lòng thử lại.';
              break;
            default:
              errorMessage += 'Vui lòng thử lại hoặc nhập thủ công.';
              break;
          }
          
          setError(errorMessage);
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true, // Sử dụng GPS chính xác cao
          timeout: 30000, // Tăng timeout lên 30s để có thời gian lấy GPS chính xác
          maximumAge: 0 // Không sử dụng cache, luôn lấy vị trí mới
        }
      );
    } else {
      setError('Trình duyệt không hỗ trợ định vị GPS. Vui lòng nhập thông tin thủ công.');
      setGettingLocation(false);
    }
  }, [reverseGeocode]); // Thêm reverseGeocode dependency

  // Auto-detect location khi component mount
  useEffect(() => {
    if (dataLoaded && !locationDetected) {
      // Tự động lấy vị trí khi trang load
      const timer = setTimeout(() => {
        getCurrentLocation();
      }, 500); // Delay nhỏ để đảm bảo component đã render xong
      
      return () => clearTimeout(timer);
    }
  }, [dataLoaded, locationDetected]);

  if (!user) {
    return <div>Vui lòng đăng nhập để tạo trạm sạc</div>;
  }

  if (!dataLoaded) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('operatingHours.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        operatingHours: {
          ...formData.operatingHours,
          [field]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleChargerTypeChange = (chargerId, checked) => {
    if (checked) {
      const chargerType = chargerTypes.find(ct => ct.id === chargerId);
      const newChargerType = {
        id: chargerId,
        name: chargerType.name,
        price: chargerType.defaultPrice
      };
      setFormData({
        ...formData,
        chargerTypes: [...formData.chargerTypes, newChargerType]
      });
    } else {
      setFormData({
        ...formData,
        chargerTypes: formData.chargerTypes.filter(ct => ct.id !== chargerId)
      });
    }
  };

  const handleChargerPriceChange = (chargerId, price) => {
    setFormData({
      ...formData,
      chargerTypes: formData.chargerTypes.map(ct => 
        ct.id === chargerId ? { ...ct, price: parseInt(price) } : ct
      )
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.province || !formData.district || !formData.contactPhone) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      if (!formData.lat || !formData.lng) {
        throw new Error('Vui lòng lấy tọa độ GPS hoặc chọn vị trí trên bản đồ');
      }

      if (formData.chargerTypes.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một loại sạc');
      }



      // Tạo station mới
      const newStation = {
        id: Date.now().toString(),
        name: formData.name,
        address: formData.address,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        contactPhone: formData.contactPhone,
        latitude: formData.lat,
        longitude: formData.lng,
        rating: 0,
        totalRatings: 0,
        chargerTypes: formData.chargerTypes.map(ct => ct.name),
        pricing: formData.chargerTypes.map(ct => ({
          chargerType: ct.name,
          pricePerHour: ct.price
        })),
        amenities: formData.amenities,
        images: {
          overall: overallImages.map(img => img.name),
          charger: chargerImages.map(img => img.name)
        },
        isVerified: false,
        status: 'ACTIVE',
        operatingHours: formData.operatingHours,
        promotions: [],
        owner: {
          name: user.name,
          phone: user.phone || 'Chưa cập nhật'
        },
        ownerId: user.id,
        createdAt: new Date().toISOString()
      };

      // Lưu vào localStorage
      const stations = getFromLocalStorage('userStations', []);
      stations.push(newStation);
      saveToLocalStorage('userStations', stations);

      // Thưởng điểm cho user
      const updatedUser = { ...user, points: (user.points || 0) + 100 };
      updateUser(updatedUser);

      alert('🎉 Tạo trạm sạc thành công! Bạn được thưởng 100 điểm. Trạm sạc sẽ được xem xét để xác minh.');
      navigate('/profile');
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra');
    }
    
    setLoading(false);
  };

  return (
    <div className="create-station-container">
      {/* Back Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← Quay lại
        </button>
      </div>
      
      <div className="form-container">
        <h2>⚡ Thêm trạm sạc mới</h2>
        {error && <div className="error-message">{error}</div>}
        
        {/* GPS Location Section */}
        <div className={`location-section ${locationDetected ? 'detected' : 'detecting'}`}>
          <h3 style={{ margin: '0 0 1rem 0', color: locationDetected ? '#10b981' : '#60a5fa' }}>
            📍 Bước 1: Xác định vị trí trạm sạc
          </h3>
          
          {!locationDetected ? (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                Nhấn nút bên dưới để tự động lấy tọa độ GPS và đoán địa chỉ
              </p>
              
              {error && (
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#fca5a5'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>❌ Lỗi lấy vị trí:</div>
                  <div style={{ fontSize: '0.9rem' }}>{error}</div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="location-btn"
                >
                  {gettingLocation ? '🔄 Đang lấy vị trí...' : '🎯 Lấy vị trí hiện tại'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    console.log('🧪 Test button: Setting HCM + Q1');
                    setLocationDetected(true);
                    setFormData(prev => ({ 
                      ...prev, 
                      lat: 10.7769, 
                      lng: 106.7009, 
                      province: 'HCM',
                      district: 'Q1',
                      address: 'Test address in District 1, Ho Chi Minh City'
                    }));
                    setError('');
                  }}
                  className="manual-location-btn"
                >
                  📝 Nhập thủ công
                </button>
              </div>
              
              <div className="location-tips">
                💡 <strong>Mẹo:</strong> Để lấy vị trí chính xác, hãy đảm bảo:
                <ul>
                  <li>Cho phép truy cập vị trí trong trình duyệt</li>
                  <li>Bật GPS/Location Services trên thiết bị</li>
                  <li>Kết nối WiFi hoặc dữ liệu di động ổn định</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="location-success">
              <div className="location-info">
                <span>✅</span>
                <span>Đã lấy tọa độ GPS thành công!</span>
              </div>
              
              <div className="location-coords">
                📍 Tọa độ: {formData.lat}, {formData.lng}
              </div>
              
              {geocodingStatus && (
                <div className="location-address">
                  🔄 {geocodingStatus}
                </div>
              )}
              
              {/* Debug info */}
              <div className="debug-info">
                📊 Data: {provinces.length} tỉnh thành, {chargerTypes.length} loại sạc
                {formData.province && ` | Selected: ${provinces.find(p => p.code === formData.province)?.name || 'Unknown'}`}
              </div>
              
              {addressSuggestion && (
                <div className="location-address">
                  🏠 Địa chỉ gợi ý: {addressSuggestion}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setLocationDetected(false);
                    setFormData(prev => ({ ...prev, lat: null, lng: null, province: '', district: '', ward: '' }));
                    setAddressSuggestion('');
                    setGeocodingStatus('');
                  }}
                  className="retry-location-btn"
                >
                  🔄 Lấy lại vị trí
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${formData.lat},${formData.lng}`;
                    window.open(url, '_blank');
                  }}
                  className="retry-location-btn"
                  style={{ background: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}
                >
                  🗺️ Xem trên bản đồ
                </button>
              </div>
            </div>
          )}
        </div>
      
      <form onSubmit={handleSubmit}>
        {/* Hiển thị form khi đã có tọa độ GPS hoặc user chọn nhập thủ công */}
        {(locationDetected || formData.lat !== null) && (
          <>
            {/* Địa chỉ - Bước 2 */}
            <div className="form-section">
              <h3 className="section-title">📍 Bước 2: Xác nhận địa chỉ trạm sạc</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>🏙️ Tỉnh/Thành phố * <span className="auto-detected">(đã tự động đoán)</span></label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map(province => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.province && (
                  <div className="form-group">
                    <label>🏘️ Quận/Huyện *</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn quận/huyện</option>
                      {getCurrentDistricts().map(district => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formData.district && getCurrentWards().length > 0 && (
                <div className="form-group">
                  <label>🏠 Phường/Xã</label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                  >
                    <option value="">Chọn phường/xã (tùy chọn)</option>
                    {getCurrentWards().map(ward => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>🏢 Địa chỉ cụ thể *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé"
                  required
                />
                {addressSuggestion && !formData.address && (
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, address: addressSuggestion }))}
                    className="address-suggestion-btn"
                  >
                    💡 Sử dụng gợi ý: {addressSuggestion}
                  </button>
                )}
              </div>
            </div>

            {/* Thông tin cơ bản - Bước 3 */}
            {formData.province && formData.district && (
              <div className="form-section">
                <h3 className="section-title">📝 Bước 3: Thông tin trạm sạc</h3>
                
                <div className="form-group">
                  <label>⚡ Tên trạm sạc *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VD: Trạm sạc Vincom Quận 1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>📞 Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="VD: 0901234567"
                    required
                  />
                  <p className="field-hint">
                    Số điện thoại để khách hàng liên hệ khi có vấn đề với trạm sạc
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Thông báo cần lấy GPS trước */}
        {!locationDetected && (
          <div className="form-section" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
            <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Vui lòng lấy tọa độ GPS trước</h3>
            <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: '1.6' }}>
              Để tạo trạm sạc, bạn cần lấy tọa độ GPS chính xác của vị trí trạm sạc.<br/>
              Nhấn nút "🎯 Lấy vị trí hiện tại" ở phía trên để tiếp tục.
            </p>
          </div>
        )}
        

        {/* Loại sạc và giá cả */}
        <div className="form-section charger-types-section">
          <h3 className="section-title">🔌 Loại sạc và giá cả</h3>
          <div className="field-hint">
            <strong>💡 Hướng dẫn:</strong> Chọn các loại sạc có tại trạm của bạn và thiết lập mức giá cạnh tranh. 
            Giá cả hợp lý sẽ thu hút nhiều khách hàng hơn và tăng doanh thu.
          </div>
          
          {formData.chargerTypes.length > 0 && (
            <div className="charger-selection-counter">
              ✅ Đã chọn {formData.chargerTypes.length} loại sạc
            </div>
          )}
          
          <div className="charger-types-grid">
            {chargerTypes.map((charger) => {
              const isSelected = formData.chargerTypes.some(ct => ct.id === charger.id);
              const selectedCharger = formData.chargerTypes.find(ct => ct.id === charger.id);
              
              return (
                <div key={charger.id} className={`charger-type-card ${isSelected ? 'selected' : ''}`}>
                  <div className="charger-power-badge">{charger.power}</div>
                  <label className="charger-header">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleChargerTypeChange(charger.id, e.target.checked)}
                      className="charger-checkbox"
                    />
                    <div className="charger-icon">{charger.icon}</div>
                    <div className="charger-info">
                      <div className="charger-name">{charger.name}</div>
                      <div className="charger-desc">{charger.description}</div>
                      <div className="charger-time">⏱️ {charger.chargingTime}</div>
                      <div className="vehicle-indicators">
                        {charger.vehicleTypes.map(vehicle => (
                          <span key={vehicle} className="vehicle-indicator">
                            {vehicle === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="check-indicator">✓</div>
                  </label>
                  
                  {isSelected && (
                    <div className="charger-price-section">
                      <label className="price-label">
                        💰 Giá (VNĐ/giờ):
                        <span className="recommended-price">
                          💡 Đề xuất: {charger.defaultPrice.toLocaleString()}đ
                        </span>
                      </label>
                      <div className="price-input-group">
                        <div className="price-input-container">
                          <input
                            type="number"
                            value={selectedCharger?.price || charger.defaultPrice}
                            onChange={(e) => handleChargerPriceChange(charger.id, e.target.value)}
                            min={charger.priceRange.min}
                            max={charger.priceRange.max}
                            className="price-input"
                            placeholder={charger.defaultPrice.toString()}
                          />
                        </div>
                        <span className="price-range">
                          Khoảng giá thị trường: {charger.priceRange.min.toLocaleString()}đ - {charger.priceRange.max.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Pricing Summary */}
          {formData.chargerTypes.length > 0 && (
            <div className="pricing-summary">
              <h4 className="pricing-summary-title">
                💰 Tóm tắt giá cả ({formData.chargerTypes.length} loại sạc)
              </h4>
              <div className="pricing-summary-list">
                {formData.chargerTypes.map((chargerType) => {
                  const charger = chargerTypes.find(ct => ct.id === chargerType.id);
                  return (
                    <div key={chargerType.id} className="pricing-summary-item">
                      <span className="pricing-summary-charger">
                        {charger?.icon} {charger?.name}
                      </span>
                      <span className="pricing-summary-price">
                        {parseInt(chargerType.price || charger?.defaultPrice || 0).toLocaleString('vi-VN')}đ/giờ
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Revenue Estimate */}
          {formData.chargerTypes.length > 0 && (
            <div className="revenue-estimate">
              <h4 className="revenue-estimate-title">
                📊 Ước tính doanh thu
              </h4>
              <div className="revenue-estimate-text">
                Với {formData.chargerTypes.length} loại sạc và giá trung bình{' '}
                {Math.round(
                  formData.chargerTypes.reduce((sum, ct) => {
                    const charger = chargerTypes.find(c => c.id === ct.id);
                    return sum + parseInt(ct.price || charger?.defaultPrice || 0);
                  }, 0) / formData.chargerTypes.length
                ).toLocaleString()}đ/giờ, 
                bạn có thể thu về <strong>
                  {(Math.round(
                    formData.chargerTypes.reduce((sum, ct) => {
                      const charger = chargerTypes.find(c => c.id === ct.id);
                      return sum + parseInt(ct.price || charger?.defaultPrice || 0);
                    }, 0) / formData.chargerTypes.length
                  ) * 8 * 30).toLocaleString()}đ - {(Math.round(
                    formData.chargerTypes.reduce((sum, ct) => {
                      const charger = chargerTypes.find(c => c.id === ct.id);
                      return sum + parseInt(ct.price || charger?.defaultPrice || 0);
                    }, 0) / formData.chargerTypes.length
                  ) * 12 * 30).toLocaleString()}đ/tháng
                </strong> (ước tính 8-12 giờ sử dụng/ngày).
              </div>
            </div>
          )}
        </div>

        {/* Hình ảnh trạm sạc */}
        <div className="form-section">
          <h3 className="section-title">📸 Hình ảnh trạm sạc</h3>
          
          <div className="image-upload-row">
            {/* Hình ảnh tổng thể */}
            <div className="image-upload-group">
              <label className="image-group-label">🏢 Hình ảnh tổng thể (tối đa 3)</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'overall')}
                  className="image-input"
                  id="overall-images"
                />
                <label htmlFor="overall-images" className="image-upload-btn-small">
                  📷 Chọn hình
                </label>
                <p className="image-tip">Hình ảnh toàn cảnh trạm sạc, bãi đỗ xe, khu vực xung quanh</p>
                
                {overallImages.length > 0 && (
                  <div className="image-preview-grid">
                    {overallImages.map((image) => (
                      <div key={image.id} className="image-preview-item">
                        <img src={image.preview} alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => removeImage(image.id, 'overall')}
                          className="remove-image-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hình ảnh trụ sạc */}
            <div className="image-upload-group">
              <label className="image-group-label">🔌 Hình ảnh trụ sạc (tối đa 3)</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'charger')}
                  className="image-input"
                  id="charger-images"
                />
                <label htmlFor="charger-images" className="image-upload-btn-small">
                  📷 Chọn hình
                </label>
                <p className="image-tip">Hình ảnh chi tiết các trụ sạc, cổng sạc, bảng giá</p>
                
                {chargerImages.length > 0 && (
                  <div className="image-preview-grid">
                    {chargerImages.map((image) => (
                      <div key={image.id} className="image-preview-item">
                        <img src={image.preview} alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => removeImage(image.id, 'charger')}
                          className="remove-image-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? '⏳ Đang tạo trạm sạc...' : '🚀 Tạo trạm sạc (+100 điểm)'}
        </button>
        
        <div className="success-message">
          <p>
            🎁 Tạo trạm sạc thành công sẽ được thưởng 100 điểm!<br/>
            ✅ Sau khi được admin xác minh sẽ thưởng thêm 200 điểm nữa!
          </p>
        </div>
      </form>
      </div>
    </div>
  );
};

export default CreateStation;