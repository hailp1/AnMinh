import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/mockData';
import provincesData from '../data/provinces.json';
import customersData from '../data/customers.json';

const CreatePharmacy = () => {
  const { id } = useParams(); // Nếu có id thì là edit mode
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    phone: '',
    owner: '',
    hub: '',
    lat: null,
    lng: null
  });
  
  const [pharmacyImages, setPharmacyImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [addressSuggestion, setAddressSuggestion] = useState('');
  const [geocodingStatus, setGeocodingStatus] = useState('');

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const provinces = useMemo(() => provincesData?.provinces || [], []);
  const hubs = ['Trung tâm', 'Củ Chi', 'Đồng Nai'];

  // Load pharmacy data nếu là edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const pharmacy = customersData.customers.find(c => c.id === id);
      if (pharmacy) {
        setFormData({
          name: pharmacy.name || '',
          code: pharmacy.code || '',
          address: pharmacy.address || '',
          province: '',
          district: '',
          ward: '',
          phone: pharmacy.phone || '',
          owner: pharmacy.owner || '',
          hub: pharmacy.hub || '',
          lat: pharmacy.latitude || null,
          lng: pharmacy.longitude || null
        });
        if (pharmacy.latitude && pharmacy.longitude) {
          setLocationDetected(true);
        }
      }
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (provinces.length > 0) {
      setDataLoaded(true);
    }
  }, [provinces.length]);

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

  // Ước tính tỉnh dựa trên tọa độ
  const estimateProvinceFromCoords = (lat, lng) => {
    // TP. Hồ Chí Minh
    if (lat >= 10.72 && lat <= 10.88 && lng >= 106.62 && lng <= 106.82) {
      return 'HCM';
    }
    // Khu vực TP.HCM mở rộng
    if (lat >= 10.5 && lat <= 11.0 && lng >= 106.4 && lng <= 107.0) {
      return 'HCM';
    }
    // Khu vực Đồng Nai
    if (lat >= 10.7 && lat <= 11.2 && lng >= 106.8 && lng <= 107.5) {
      return 'DN2';
    }
    // Mặc định
    return 'HCM';
  };

  const reverseGeocode = useCallback(async (lat, lng) => {
    if (!provinces || provinces.length === 0) {
      setGeocodingStatus('Đang tải dữ liệu tỉnh thành...');
      return;
    }

    try {
      setGeocodingStatus('Đang ước tính địa chỉ...');
      
      const estimatedProvince = estimateProvinceFromCoords(lat, lng);
      const estimatedProvinceData = provinces.find(p => p.code === estimatedProvince);
      const firstDistrict = estimatedProvinceData?.districts?.[0]?.code || '';
      
      setFormData(prev => ({
        ...prev,
        province: estimatedProvince,
        district: firstDistrict
      }));
      
      setAddressSuggestion(`Ước tính vị trí: ${estimatedProvinceData?.name || 'TP.HCM'}`);
      setGeocodingStatus('✅ Đã tự động chọn tỉnh thành dựa trên tọa độ!');
      
      setTimeout(() => {
        setGeocodingStatus('');
      }, 3000);
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodingStatus('Không thể ước tính địa chỉ. Vui lòng chọn tỉnh thành thủ công.');
      setTimeout(() => {
        setGeocodingStatus('');
      }, 3000);
    }
  }, [provinces]);

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
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
            setPharmacyImages(prev => [...prev, ...compressedImages]);
          }
        };
        reader.readAsDataURL(compressed);
      }
    }
  };

  const removeImage = (imageId) => {
    setPharmacyImages(prev => prev.filter(img => img.id !== imageId));
  };

  const getCurrentLocation = useCallback(() => {
    setGettingLocation(true);
    setError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = parseFloat(position.coords.latitude.toFixed(6));
            const lng = parseFloat(position.coords.longitude.toFixed(6));
            const accuracy = position.coords.accuracy;
            
            if (accuracy > 100) {
              setGeocodingStatus(`⚠️ Độ chính xác GPS: ${Math.round(accuracy)}m (khuyến nghị < 50m)`);
            } else {
              setGeocodingStatus(`✅ Độ chính xác GPS tốt: ${Math.round(accuracy)}m`);
            }
            
            setFormData(prev => ({
              ...prev,
              lat,
              lng
            }));
            
            setLocationDetected(true);
            setGettingLocation(false);
            
            try {
              await reverseGeocode(lat, lng);
            } catch (geocodeError) {
              console.log('Bỏ qua reverse geocoding:', geocodeError);
            }
          } catch (positionError) {
            console.error('Lỗi xử lý vị trí:', positionError);
            setError('Lỗi xử lý dữ liệu vị trí. Vui lòng thử lại.');
            setGettingLocation(false);
          }
        },
        (error) => {
          console.error('Lỗi lấy vị trí GPS:', error);
          let errorMessage = 'Không thể lấy vị trí hiện tại. ';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Vui lòng cho phép truy cập vị trí trong trình duyệt.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Thông tin vị trí không khả dụng.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Hết thời gian chờ. Vui lòng thử lại.';
              break;
            default:
              errorMessage += 'Vui lòng thử lại hoặc nhập thủ công.';
              break;
          }
          
          setError(errorMessage);
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
    } else {
      setError('Trình duyệt không hỗ trợ định vị GPS.');
      setGettingLocation(false);
    }
  }, [reverseGeocode]);

  useEffect(() => {
    if (dataLoaded && !locationDetected && !isEditMode) {
      const timer = setTimeout(() => {
        getCurrentLocation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataLoaded, locationDetected, isEditMode]);

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Vui lòng đăng nhập để {isEditMode ? 'cập nhật' : 'tạo'} nhà thuốc</div>;
  }

  if (!dataLoaded) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Tự động tạo mã nhà thuốc nếu chưa có
  const generatePharmacyCode = () => {
    if (formData.code) return formData.code;
    const prefix = 'NT';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Validate
      if (!formData.name || !formData.address || !formData.province || !formData.district || !formData.phone) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      if (!formData.hub) {
        throw new Error('Vui lòng chọn Hub phụ trách');
      }

      if (!formData.lat || !formData.lng) {
        throw new Error('Vui lòng lấy tọa độ GPS hoặc chọn vị trí trên bản đồ');
      }

      const pharmacyCode = formData.code || generatePharmacyCode();

      const pharmacyData = {
        id: isEditMode ? id : Date.now().toString(),
        name: formData.name,
        code: pharmacyCode,
        address: formData.address,
        phone: formData.phone,
        owner: formData.owner || user.name,
        hub: formData.hub,
        latitude: formData.lat,
        longitude: formData.lng,
        type: 'Nhà thuốc',
        images: pharmacyImages.map(img => img.name),
        createdAt: isEditMode ? customersData.customers.find(c => c.id === id)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Lưu vào localStorage
      const customers = getFromLocalStorage('customers', customersData.customers || []);
      
      if (isEditMode) {
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
          customers[index] = { ...customers[index], ...pharmacyData };
        }
      } else {
        customers.push(pharmacyData);
      }
      
      saveToLocalStorage('customers', customers);

      alert(`🎉 ${isEditMode ? 'Cập nhật' : 'Tạo'} nhà thuốc thành công!`);
      navigate('/home');
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra');
    }
    
    setLoading(false);
  };

  return (
    <div className="create-station-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: '#1a5ca2',
              cursor: 'pointer',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Quay lại
          </button>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1a5ca2',
            margin: 0
          }}>
            {isEditMode ? '✏️ Cập nhật nhà thuốc' : '🏥 Thêm nhà thuốc mới'}
          </h2>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#dc2626'
          }}>
            ❌ {error}
          </div>
        )}

        {/* GPS Location Section */}
        <div style={{
          background: locationDetected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(96, 165, 250, 0.1)',
          border: `2px solid ${locationDetected ? '#10b981' : '#60a5fa'}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: locationDetected ? '#10b981' : '#60a5fa' }}>
            📍 Bước 1: Xác định vị trí nhà thuốc
          </h3>
          
          {!locationDetected ? (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                Nhấn nút bên dưới để tự động lấy tọa độ GPS
              </p>
              
              <button 
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: gettingLocation ? 'not-allowed' : 'pointer',
                  opacity: gettingLocation ? 0.7 : 1
                }}
              >
                {gettingLocation ? '🔄 Đang lấy vị trí...' : '🎯 Lấy vị trí hiện tại'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>
                  Đã lấy tọa độ GPS thành công!
                </span>
              </div>
              
              <div style={{ 
                background: '#fff',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '14px',
                color: '#666'
              }}>
                📍 Tọa độ: {formData.lat}, {formData.lng}
              </div>
              
              {geocodingStatus && (
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                  {geocodingStatus}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setLocationDetected(false);
                    setFormData(prev => ({ ...prev, lat: null, lng: null }));
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🔄 Lấy lại vị trí
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${formData.lat},${formData.lng}`;
                    window.open(url, '_blank');
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#3b82f6'
                  }}
                >
                  🗺️ Xem trên bản đồ
                </button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {(locationDetected || formData.lat !== null) && (
            <>
              {/* Địa chỉ */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  color: '#1a5ca2'
                }}>
                  📍 Bước 2: Thông tin địa chỉ
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      🏙️ Tỉnh/Thành phố *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
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
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        🏘️ Quận/Huyện *
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
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
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      🏠 Phường/Xã
                    </label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
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

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    🏢 Địa chỉ cụ thể *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Thông tin nhà thuốc */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  color: '#1a5ca2'
                }}>
                  🏥 Bước 3: Thông tin nhà thuốc
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    🏥 Tên nhà thuốc *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VD: Nhà thuốc Long Hưng"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    🆔 Mã nhà thuốc {!isEditMode && '(tự động tạo nếu để trống)'}
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="VD: NTLH001"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    📞 Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="VD: 02838345678"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    👤 Chủ nhà thuốc
                  </label>
                  <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    placeholder="VD: Nguyễn Văn Long"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    📍 Hub phụ trách *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {hubs.map(hub => (
                      <div
                        key={hub}
                        onClick={() => setFormData({ ...formData, hub })}
                        style={{
                          padding: '1rem',
                          border: `2px solid ${formData.hub === hub ? '#1a5ca2' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: formData.hub === hub 
                            ? 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))' 
                            : '#fff',
                          textAlign: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                          {hub === 'Trung tâm' ? '🏢' : hub === 'Củ Chi' ? '🌾' : '🏭'}
                        </div>
                        <div style={{ fontWeight: '600', color: formData.hub === hub ? '#1a5ca2' : '#666' }}>
                          {hub}
                        </div>
                        {formData.hub === hub && (
                          <div style={{ marginTop: '8px', color: '#1a5ca2', fontSize: '20px' }}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hình ảnh */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  color: '#1a5ca2'
                }}>
                  📸 Hình ảnh nhà thuốc (tùy chọn)
                </h3>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="pharmacy-images"
                />
                <label
                  htmlFor="pharmacy-images"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '1rem'
                  }}
                >
                  📷 Chọn hình ảnh
                </label>
                
                {pharmacyImages.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    {pharmacyImages.map((image) => (
                      <div key={image.id} style={{ position: 'relative' }}>
                        <img 
                          src={image.preview} 
                          alt="Preview" 
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(image.id)}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading 
                  ? `⏳ Đang ${isEditMode ? 'cập nhật' : 'tạo'}...` 
                  : `✅ ${isEditMode ? 'Cập nhật' : 'Tạo'} nhà thuốc`}
              </button>
            </>
          )}

          {!locationDetected && (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
              <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>
                Vui lòng lấy tọa độ GPS trước
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                Để {isEditMode ? 'cập nhật' : 'tạo'} nhà thuốc, bạn cần lấy tọa độ GPS chính xác.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePharmacy;

