import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../hooks/usePageTransition';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/mockData';
import vehicleModels from '../data/vehicleModels.json';

const QuickRegister = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Password, 4: Basic Info, 5: Additional Info, 6: Pharmacy Info (for PHARMACY)
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'PHARMACY_REP', // PHARMACY_REP, PHARMACY, DELIVERY
    hub: '', // Trung tâm, Củ Chi, Đồng Nai (chỉ cho PHARMACY_REP)
    gender: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleModelId: '',
    location: null,
    address: '',
    // Pharmacy info for PHARMACY
    pharmacyName: '',
    pharmacyAddress: '',
    pharmacyLocation: null,
    owner: '',
    type: 'Nhà thuốc'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVehicleModels, setShowVehicleModels] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateWithTransition } = usePageTransition();

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Kiểm tra nếu có số điện thoại từ trang Login
    if (location.state?.phone && location.state?.fromLogin) {
      const phoneFromLogin = location.state.phone;
      const formattedPhone = formatPhoneNumber(phoneFromLogin);
      
      setFormData(prev => ({
        ...prev,
        phone: formattedPhone
      }));
      
      // Hiển thị thông báo từ Login nếu có
      if (location.state.message) {
        setError('');
        // Tự động gửi OTP sau 2 giây để người dùng đọc thông báo
        setTimeout(() => {
          sendOTP();
        }, 2000);
      }
    }
    
    // Load cached phone numbers
    const cachedPhones = getFromLocalStorage('registeredPhones', []);
    if (cachedPhones.length > 0) {
      console.log('Cached registered phones:', cachedPhones);
    }
  }, [location.state]);

  // Format phone number
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return cleaned.slice(0, 10).replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const sendOTP = async () => {
    const cleanPhone = formData.phone.replace(/\s/g, '');
    
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      setError('Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    
    console.log(`SMS OTP sent to ${cleanPhone}: ${otp}`);
    
    setStep(2);
    setLoading(false);
    
    // Start countdown
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Show OTP in alert for demo
    setTimeout(() => {
      const message = location.state?.fromLogin 
        ? `Chào mừng! Mã OTP để tạo tài khoản mới: ${otp}`
        : `Demo: Mã OTP của bạn là ${otp}`;
      alert(message);
    }, 500);
  };

  const verifyOTP = async () => {
    if (formData.otp !== generatedOtp) {
      setError('Mã OTP không đúng');
      return;
    }

    setError('');
    setStep(3); // Chuyển đến step setup password
  };

  const completeBasicRegistration = async () => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }

    setLoading(true);
    setError('');

    // Nếu là nhà thuốc, chuyển đến step tạo trạm
    if (formData.role === 'PHARMACY') {
      setLoading(false);
      setStep(6);
      return;
    }
    
    // Nếu là Trình dược viên, cần có Hub
    if (formData.role === 'PHARMACY_REP' && !formData.hub) {
      setError('Vui lòng chọn Hub phụ trách');
      setLoading(false);
      return;
    }

    const cleanPhone = formData.phone.replace(/\s/g, '');
    
    const result = await register(
      cleanPhone,
      formData.name,
      formData.role,
      {
        password: formData.password,
        hub: formData.hub,
        gender: formData.gender,
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        vehicleModelId: formData.vehicleModelId,
        location: formData.location,
        address: formData.address
      }
    );

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigateWithTransition(result.redirect || '/home');
      }, 1500);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const completePharmacyRegistration = async () => {
    if (!formData.pharmacyName.trim()) {
      setError('Vui lòng nhập tên nhà thuốc');
      return;
    }

    if (!formData.pharmacyLocation) {
      setError('Vui lòng chọn vị trí nhà thuốc');
      return;
    }

    if (!formData.owner.trim()) {
      setError('Vui lòng nhập tên chủ nhà thuốc');
      return;
    }

    setLoading(true);
    setError('');

    const cleanPhone = formData.phone.replace(/\s/g, '');
    
    const result = await register(
      cleanPhone,
      formData.name,
      formData.role,
      {
        password: formData.password,
        gender: formData.gender,
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        location: formData.location,
        address: formData.address,
        pharmacyInfo: {
          name: formData.pharmacyName,
          address: formData.pharmacyAddress,
          location: formData.pharmacyLocation,
          owner: formData.owner,
          type: formData.type
        }
      }
    );

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigateWithTransition(result.redirect || '/home');
      }, 1500);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  // Lấy vị trí hiện tại với improved error handling
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          
          // Reverse geocoding với timeout và fallback
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          try {
            // Thêm timeout cho fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=vi`,
              { 
                signal: controller.signal,
                headers: {
                  'User-Agent': 'SapharcoSales-App/1.0'
                }
              }
            );
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.display_name) {
                address = data.display_name;
              }
            }
          } catch (error) {
            console.log('Geocoding failed, using coordinates:', error.message);
            // Fallback to simple address format
            address = `Vị trí: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
          }
          
          setFormData(prev => ({
            ...prev,
            location,
            address
          }));
          
          setLoading(false);
        },
        (error) => {
          console.error('Location error:', error);
          setError('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setError('Trình duyệt không hỗ trợ định vị');
      setLoading(false);
    }
  };

  const resendOTP = () => {
    if (countdown > 0) return;
    sendOTP();
  };

  const handleBackClick = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigateWithTransition('/');
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return '📱';
      case 2: return '🔐';
      case 3: return '🔑';
      case 4: return '👤';
      case 5: return '🚗';
      case 6: return showSuccess ? '🎉' : '🏥';
      default: return '📱';
    }
  };

  const getStepTitle = () => {
    // Thêm thông báo đặc biệt cho step 1 khi đến từ Login
    if (step === 1 && location.state?.fromLogin) {
      return 'Tạo tài khoản mới';
    }
    
    switch (step) {
      case 1: return 'Số điện thoại';
      case 2: return 'Xác thực OTP';
      case 3: return 'Tạo mật khẩu';
      case 4: return 'Thông tin cơ bản';
      case 5: return 'Thông tin bổ sung';
      case 6: return showSuccess ? 'Hoàn tất!' : 'Thông tin nhà thuốc';
      default: return 'Đăng ký';
    }
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '28px',
        padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'auto'
      }}>
        {/* Header with Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '35px',
          position: 'relative',
          flexShrink: 0
        }}>
          <button 
            onClick={handleBackClick} 
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              background: 'rgba(26, 92, 162, 0.15)',
              border: 'none',
              borderRadius: '12px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '22px',
              color: '#1a5ca2',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(26, 92, 162, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(26, 92, 162, 0.25)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(26, 92, 162, 0.15)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ←
          </button>

          {step === 1 && (
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.15), rgba(62, 180, 168, 0.15))',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(26, 92, 162, 0.2)'
            }}>
              <img 
                src="/image/logo.png" 
                alt="Sapharco Sales" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '50%'
                }}
              />
            </div>
          )}
          
          <h1 style={{
            fontSize: '34px',
            fontWeight: 'bold',
            color: '#1a1a2e',
            margin: '0 0 12px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Đăng ký
          </h1>
        </div>

        {/* Progress Indicator */}
        <div style={{
          marginBottom: '20px',
          flexShrink: 0
        }}>
          <div style={{
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div 
              style={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                width: `${(step / (formData.role === 'PHARMACY' ? 6 : 5)) * 100}%`,
                transition: 'width 0.3s ease'
              }}
            ></div>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#666',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            Bước {step}/{formData.role === 'PHARMACY' ? 6 : 5}
          </div>
        </div>

        {/* Form Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '28px',
            textAlign: 'center',
            flexShrink: 0
          }}>
            {getStepTitle()}
          </div>

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <div className="auth-form">
              {/* Thông báo đặc biệt khi chuyển từ Login */}
              {location.state?.fromLogin && location.state?.message && (
                <div className="auth-info-message">
                  <span className="info-icon">ℹ️</span>
                  <span>{location.state.message}</span>
                </div>
              )}

              {error && (
                <div className="auth-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">📱</span>
                  <span>Số điện thoại</span>
                </label>
                <div className="phone-input-container">
                  <span className="country-code">🇻🇳 +84</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="0901 234 567"
                    maxLength={12}
                    className="auth-input phone-field"
                    style={{
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  />
                </div>
              </div>

              <button 
                onClick={sendOTP}
                disabled={loading || formData.phone.replace(/\s/g, '').length !== 10}
                className="auth-btn auth-btn-primary"
              >
                {loading ? (
                  <div className="btn-loading">
                    <div className="loading-spinner"></div>
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  'Gửi mã xác thực'
                )}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="auth-form">
              <div className="otp-info">
                <p>Nhập mã 6 số đã gửi đến</p>
                <strong>{formData.phone}</strong>
              </div>

              {error && (
                <div className="auth-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">🔐</span>
                  <span>Mã xác thực</span>
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="123456"
                  className="auth-input otp-input"
                  maxLength={6}
                  style={{
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <button 
                onClick={verifyOTP}
                disabled={formData.otp.length !== 6}
                className="auth-btn auth-btn-primary"
              >
                Xác thực
              </button>

              <div className="resend-section">
                {countdown > 0 ? (
                  <p className="countdown">Gửi lại sau {countdown}s</p>
                ) : (
                  <button onClick={resendOTP} className="auth-link-btn">
                    Gửi lại mã
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Password Setup */}
          {step === 3 && (
            <div className="auth-form">
              <div className="step-info">
                <p>Tạo mật khẩu để bảo mật tài khoản của bạn</p>
              </div>

              {error && (
                <div className="auth-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">🔑</span>
                  <span>Mật khẩu</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className="auth-input"
                  minLength={6}
                  style={{
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
                <div className="password-requirements">
                  <div className={`requirement ${formData.password.length >= 6 ? 'met' : ''}`}>
                    {formData.password.length >= 6 ? '✅' : '⭕'} Tối thiểu 6 ký tự
                  </div>
                  <div className={`requirement ${/[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 'met' : ''}`}>
                    {/[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password) ? '✅' : '⭕'} Có chữ và số
                  </div>
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">🔐</span>
                  <span>Xác nhận mật khẩu</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu"
                  className="auth-input"
                  style={{
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
                {formData.confirmPassword && (
                  <div className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                    {formData.password === formData.confirmPassword ? '✅ Mật khẩu khớp' : '❌ Mật khẩu không khớp'}
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (formData.password.length < 6) {
                    setError('Mật khẩu phải có ít nhất 6 ký tự');
                    return;
                  }
                  if (formData.password !== formData.confirmPassword) {
                    setError('Mật khẩu xác nhận không khớp');
                    return;
                  }
                  setError('');
                  setStep(4);
                }}
                disabled={!formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword || formData.password.length < 6}
                className="auth-btn auth-btn-primary"
              >
                Tiếp tục
              </button>

              <div className="security-info">
                <div className="security-tips">
                  <span className="security-icon">🛡️</span>
                  <div className="security-text">
                    <strong>Bảo mật tài khoản</strong>
                    <span>Mật khẩu sẽ được mã hóa và bảo mật tuyệt đối</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: User Info */}
          {step === 4 && !showSuccess && (
            <div className="auth-form">
              {/* Welcome message đặc biệt khi đến từ Login */}
              {location.state?.fromLogin && (
                <div className="auth-welcome-message">
                  <span className="welcome-icon">🎉</span>
                  <div className="welcome-text">
                    <strong>Chào mừng bạn đến với Sapharco Sales!</strong>
                    <span>Hãy hoàn thiện thông tin để tạo tài khoản mới</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="auth-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">👤</span>
                  <span>Họ và tên</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="auth-input"
                  style={{
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">🎯</span>
                  <span>Loại tài khoản</span>
                </label>
                <div className="role-selection-grid">
                  <div
                    className={`role-card ${formData.role === 'PHARMACY_REP' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'PHARMACY_REP', hub: '' })}
                  >
                    <div className="role-card-header">
                      <div className="role-icon-large">👨‍⚕️</div>
                      <div className="role-badge user">Phổ biến</div>
                    </div>
                    <div className="role-card-content">
                      <h3>Trình dược viên</h3>
                      <p>Nhập đơn hàng cho các nhà thuốc</p>
                      <ul className="role-features">
                        <li>📋 Nhập đơn hàng</li>
                        <li>🗺️ Xem nhà thuốc phụ trách</li>
                        <li>💬 Chat với đồng nghiệp</li>
                        <li>📊 Theo dõi doanh số</li>
                      </ul>
                    </div>
                    <div className="role-card-footer">
                      <div className="selection-indicator">
                        {formData.role === 'PHARMACY_REP' ? '✅ Đã chọn' : 'Chọn'}
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`role-card ${formData.role === 'PHARMACY' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'PHARMACY', hub: '' })}
                  >
                    <div className="role-card-header">
                      <div className="role-icon-large">🏥</div>
                      <div className="role-badge owner">Nhà thuốc</div>
                    </div>
                    <div className="role-card-content">
                      <h3>Nhà thuốc</h3>
                      <p>Quản lý nhà thuốc và đơn hàng</p>
                      <ul className="role-features">
                        <li>🏥 Quản lý nhà thuốc</li>
                        <li>📦 Xem đơn hàng</li>
                        <li>📊 Thống kê bán hàng</li>
                        <li>💬 Liên hệ trình dược viên</li>
                      </ul>
                    </div>
                    <div className="role-card-footer">
                      <div className="selection-indicator">
                        {formData.role === 'PHARMACY' ? '✅ Đã chọn' : 'Chọn'}
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`role-card ${formData.role === 'DELIVERY' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'DELIVERY', hub: '' })}
                  >
                    <div className="role-card-header">
                      <div className="role-icon-large">🚚</div>
                      <div className="role-badge delivery">Giao hàng</div>
                    </div>
                    <div className="role-card-content">
                      <h3>Giao hàng</h3>
                      <p>Vận chuyển và giao hàng</p>
                      <ul className="role-features">
                        <li>🚚 Nhận đơn giao hàng</li>
                        <li>📍 Theo dõi tuyến đường</li>
                        <li>✅ Xác nhận giao hàng</li>
                        <li>💰 Theo dõi thu nhập</li>
                      </ul>
                    </div>
                    <div className="role-card-footer">
                      <div className="selection-indicator">
                        {formData.role === 'DELIVERY' ? '✅ Đã chọn' : 'Chọn'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hub selection for Pharmacy Rep - Beautiful Design */}
              {formData.role === 'PHARMACY_REP' && (
                <div className="auth-form-group">
                  <label className="auth-label">
                    <span className="label-icon">📍</span>
                    <span>Hub Phụ trách</span>
                  </label>
                  <div className="hub-selection-grid">
                    {[
                      { name: 'Trung tâm', icon: '🏢', description: 'Khu vực trung tâm TP.HCM' },
                      { name: 'Củ Chi', icon: '🌾', description: 'Huyện Củ Chi' },
                      { name: 'Đồng Nai', icon: '🏭', description: 'Tỉnh Đồng Nai' }
                    ].map((hub) => (
                      <div
                        key={hub.name}
                        className={`hub-card ${formData.hub === hub.name ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, hub: hub.name })}
                      >
                        <div className="hub-card-icon">{hub.icon}</div>
                        <div className="hub-card-content">
                          <h4>{hub.name}</h4>
                          <p>{hub.description}</p>
                        </div>
                        <div className="hub-card-check">
                          {formData.hub === hub.name ? '✓' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => {
                  if (formData.role === 'PHARMACY_REP' && !formData.hub) {
                    setError('Vui lòng chọn Hub phụ trách');
                    return;
                  }
                  setStep(5);
                }}
                disabled={!formData.name.trim() || (formData.role === 'PHARMACY_REP' && !formData.hub)}
                className="auth-btn auth-btn-primary"
              >
                Tiếp tục
              </button>

              <button 
                onClick={completeBasicRegistration}
                className="auth-link-btn"
                style={{ marginTop: '12px' }}
              >
                Bỏ qua và đăng ký ngay
              </button>

              <div className="welcome-bonus">
                <div className="bonus-info">
                  <span className="bonus-icon">🎁</span>
                  <div className="bonus-text">
                    <strong>Chào mừng!</strong>
                    <span>Nhận ngay 50 điểm thưởng</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Additional Info - Simplified (Gender only) */}
          {step === 5 && !showSuccess && (
            <div className="auth-form">
              <div className="step-info">
                <p>Hoàn thiện thông tin để nhận <strong>100 token thưởng</strong> 🎁</p>
              </div>

              {error && (
                <div className="auth-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">👤</span>
                  <span>Giới tính</span>
                </label>
                <div className="gender-selector">
                  {['Nam', 'Nữ', 'Khác'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      className={`gender-option ${formData.gender === gender ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, gender })}
                    >
                      {gender === 'Nam' ? '👨' : gender === 'Nữ' ? '👩' : '👤'} {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">📍</span>
                  <span>Vị trí hiện tại</span>
                </label>
                <div className="location-section">
                  {formData.location ? (
                    <div className="location-info">
                      <div className="location-icon">✅</div>
                      <div className="location-text">
                        <strong>Đã lấy vị trí</strong>
                        <span>{formData.address}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={loading}
                      className="location-btn"
                    >
                      {loading ? (
                        <div className="btn-loading">
                          <div className="loading-spinner"></div>
                          <span>Đang lấy vị trí...</span>
                        </div>
                      ) : (
                        <>
                          <span className="location-icon">📍</span>
                          <span>Lấy vị trí hiện tại</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <button 
                onClick={completeBasicRegistration}
                disabled={loading}
                className="auth-btn auth-btn-primary"
              >
                {loading ? (
                  <div className="btn-loading">
                    <div className="loading-spinner"></div>
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  '🎉 Hoàn tất đăng ký'
                )}
              </button>

              <div className="completion-bonus">
                <div className="bonus-info">
                  <span className="bonus-icon">🏆</span>
                  <div className="bonus-text">
                    <strong>Thưởng hoàn thiện profile:</strong>
                    <span>+100 token + 50 điểm nếu điền đầy đủ thông tin</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Pharmacy Info (for PHARMACY) */}
          {step === 6 && !showSuccess && (
            <div className="auth-form">
              <div className="step-info">
                <p>Thông tin nhà thuốc của bạn 🏥</p>
              </div>

              {error && (
                <div className="auth-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">🏥</span>
                  <span>Tên nhà thuốc</span>
                </label>
                <input
                  type="text"
                  value={formData.pharmacyName}
                  onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                  placeholder="Nhà thuốc ABC, Nhà thuốc XYZ..."
                  className="auth-input"
                  required
                  style={{
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">👤</span>
                  <span>Chủ nhà thuốc</span>
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Họ và tên chủ nhà thuốc"
                  className="auth-input"
                  required
                  style={{
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">📍</span>
                  <span>Địa chỉ nhà thuốc</span>
                </label>
                <div className="location-section">
                  {formData.pharmacyLocation ? (
                    <div className="location-info">
                      <div className="location-icon">✅</div>
                      <div className="location-text">
                        <strong>Đã chọn vị trí</strong>
                        <span>{formData.pharmacyAddress}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pharmacyLocation: null, pharmacyAddress: '' })}
                        className="location-change-btn"
                      >
                        Đổi
                      </button>
                    </div>
                  ) : (
                    <div className="location-options">
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.location) {
                            setFormData({ 
                              ...formData, 
                              pharmacyLocation: formData.location,
                              pharmacyAddress: formData.address || 'Vị trí hiện tại'
                            });
                          } else {
                            getCurrentLocation();
                          }
                        }}
                        className="location-btn"
                      >
                        <span className="location-icon">📍</span>
                        <span>Sử dụng vị trí hiện tại</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const address = prompt('Nhập địa chỉ nhà thuốc:');
                          if (address) {
                            setFormData({ 
                              ...formData, 
                              pharmacyAddress: address,
                              pharmacyLocation: { lat: 0, lng: 0 } // Placeholder
                            });
                          }
                        }}
                        className="location-btn secondary"
                      >
                        <span className="location-icon">✏️</span>
                        <span>Nhập địa chỉ thủ công</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={completePharmacyRegistration}
                disabled={loading || !formData.pharmacyName.trim() || !formData.pharmacyLocation || !formData.owner.trim()}
                className="auth-btn auth-btn-primary"
              >
                {loading ? (
                  <div className="btn-loading">
                    <div className="loading-spinner"></div>
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  '🎉 Hoàn tất đăng ký'
                )}
              </button>
            </div>
          )}

          {/* Success State */}
          {showSuccess && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#f0fdf4',
              borderRadius: '12px',
              color: '#16a34a'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>Đăng ký thành công! Chuyển hướng...</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default QuickRegister;