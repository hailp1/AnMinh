import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../hooks/usePageTransition';

const ForgotPassword = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [formData, setFormData] = useState({
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone' | 'success'

  const { checkPhoneExists } = useAuth();
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
    
    // Format phone number
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
    
    // Kiểm tra số điện thoại có tồn tại không
    const result = await checkPhoneExists(cleanPhone);
    
    if (result.exists) {
      setStep('success');
      // Chuyển đến trang reset password sau 2 giây
      setTimeout(() => {
        navigateWithTransition('/reset-password', { 
          state: { 
            phone: cleanPhone,
            fromForgot: true 
          }
        });
      }, 2000);
    } else {
      setError('Số điện thoại chưa được đăng ký trong hệ thống');
    }
    
    setLoading(false);
  };

  const handleBackClick = () => {
    navigateWithTransition('/login');
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
          <h1 className="auth-title">Quên mật khẩu</h1>
          <div className="auth-spacer"></div>
        </div>

        {/* Hero Icon */}
        <div className="auth-hero-section">
          <div className="auth-icon-circle">
            <div className="auth-icon">
              {step === 'success' ? (
                <div className="success-icon">✓</div>
              ) : (
                <div className="forgot-icon">🔑</div>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="auth-form-content">
          {step === 'phone' && (
            <>
              <div className="auth-subtitle">
                Khôi phục mật khẩu
              </div>
              <div className="auth-description">
                Nhập số điện thoại đã đăng ký để nhận mã xác thực
              </div>
              
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

                <button 
                  type="submit" 
                  className="auth-btn auth-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="btn-loading">
                      <div className="loading-spinner"></div>
                      <span>Đang kiểm tra...</span>
                    </div>
                  ) : (
                    'Gửi mã xác thực'
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="auth-subtitle">
                Mã xác thực đã được gửi!
              </div>
              <div className="success-message">
                <p>Mã xác thực đã được gửi đến số điện thoại <strong>{formData.phone}</strong></p>
                <p>Đang chuyển hướng đến trang đặt lại mật khẩu...</p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {step === 'phone' && (
          <div className="auth-footer">
            <p className="auth-footer-text">
              Nhớ mật khẩu rồi?
            </p>
            <button 
              onClick={() => navigateWithTransition('/login')}
              className="auth-link-btn"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;