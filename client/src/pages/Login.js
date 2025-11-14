import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';

const Login = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Format phone number if it's phone field
    if (e.target.name === 'phone') {
      value = formatPhoneNumber(value);
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Format phone number
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return cleaned.slice(0, 10).replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPhone = formData.phone.replace(/\s/g, '');
    const result = await login(cleanPhone, formData.password);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigateWithTransition(result.redirect || '/home');
      }, 1000);
    } else {
      // Nếu số điện thoại chưa tồn tại, tự động chuyển sang đăng ký
      if (result.phoneNotExists) {
        // Hiển thị thông báo chuyển hướng
        setError('Số điện thoại chưa được đăng ký. Đang chuyển đến trang đăng ký...');
        
        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          setLoading(false);
          navigateWithTransition('/register', { 
            state: { 
              phone: cleanPhone,
              fromLogin: true,
              message: 'Số điện thoại chưa được đăng ký. Chúng tôi sẽ giúp bạn tạo tài khoản mới! 🎉'
            }
          });
        }, 2000);
        return;
      }
      
      setError(result.message);
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigateWithTransition('/');
  };

  return (
    <div className="auth-app-container">
      {/* Status Bar */}
      <div className="auth-status-bar">
        <span className="auth-time">{currentTime}</span>
        <div className="auth-signal">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="auth-battery"></span>
      </div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <button onClick={handleBackClick} className="auth-back-btn">
            <span className="back-icon">←</span>
          </button>
          <h1 className="auth-title">Đăng nhập</h1>
          <div className="auth-spacer"></div>
        </div>

        {/* Hero Icon */}
        <div className="auth-hero-section">
          <div className="auth-icon-circle">
            <div className="auth-icon">
              {showSuccess ? (
                <div className="success-icon">✓</div>
              ) : (
                <div className="login-icon">🔐</div>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="auth-form-content">
          <div className="auth-subtitle">
            {showSuccess ? 'Đăng nhập thành công!' : 'Chào mừng trở lại'}
          </div>
          
          {!showSuccess && (
            <form onSubmit={handleSubmit} className="auth-form">
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
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901 234 567"
                  className="auth-input"
                  maxLength={12}
                  required
                />
              </div>
              
              <div className="auth-form-group">
                <label className="auth-label">
                  <span className="label-icon">🔒</span>
                  <span>Mật khẩu</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="auth-input"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="auth-btn auth-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="btn-loading">
                    <div className="loading-spinner"></div>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="auth-forgot-password">
                <button 
                  type="button"
                  onClick={() => navigateWithTransition('/forgot-password')}
                  className="auth-forgot-link"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </form>
          )}

          {showSuccess && (
            <div className="success-message">
              <p>Chuyển hướng đến trang chủ...</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showSuccess && (
          <div className="auth-footer">
            <p className="auth-footer-text">
              Chưa có tài khoản?
            </p>
            <button 
              onClick={() => navigateWithTransition('/register')}
              className="auth-link-btn"
            >
              Đăng ký ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;