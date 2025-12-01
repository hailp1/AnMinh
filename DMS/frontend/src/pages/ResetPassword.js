import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../hooks/usePageTransition';
import { useLocation } from 'react-router-dom';

const ResetPassword = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('otp'); // 'otp' | 'password' | 'success'
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  const { resetPassword } = useAuth();
  const { navigateWithTransition } = usePageTransition();
  const location = useLocation();
  
  const phone = location.state?.phone || '';

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
    // OTP countdown timer
    if (otpTimer > 0) {
      const timer = setTimeout(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResendOtp(true);
    }
  }, [otpTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limit OTP to 6 digits
    if (name === 'otp' && value.length > 6) return;
    
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate OTP verification (in real app, verify with backend)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, accept any 6-digit OTP or "123456"
    if (formData.otp.length === 6) {
      setStep('password');
    } else {
      setError('Mã OTP không hợp lệ. Vui lòng nhập 6 chữ số');
    }
    
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    // Reset password
    const result = await resetPassword(phone, formData.newPassword);
    
    if (result.success) {
      setStep('success');
      // Chuyển về trang login sau 3 giây
      setTimeout(() => {
        navigateWithTransition('/login', {
          state: {
            message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
            phone: phone
          }
        });
      }, 3000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleResendOtp = () => {
    setOtpTimer(60);
    setCanResendOtp(false);
    setFormData({ ...formData, otp: '' });
    // In real app, call API to resend OTP
  };

  const handleBackClick = () => {
    if (step === 'password') {
      setStep('otp');
    } else {
      navigateWithTransition('/forgot-password');
    }
  };

  const formatPhoneDisplay = (phone) => {
    if (phone.length === 10) {
      return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return phone;
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
          <h1 className="auth-title">
            {step === 'otp' ? 'Xác thực OTP' : 
             step === 'password' ? 'Đặt lại mật khẩu' : 
             'Hoàn tất'}
          </h1>
          <div className="auth-spacer"></div>
        </div>

        {/* Hero Icon */}
        <div className="auth-hero-section">
          <div className="auth-icon-circle">
            <div className="auth-icon">
              {step === 'success' ? (
                <div className="success-icon">✓</div>
              ) : step === 'password' ? (
                <div className="password-icon">🔐</div>
              ) : (
                <div className="otp-icon">📱</div>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="auth-form-content">
          {step === 'otp' && (
            <>
              <div className="auth-subtitle">
                Nhập mã xác thực
              </div>
              <div className="auth-description">
                Mã OTP đã được gửi đến số điện thoại <strong>{formatPhoneDisplay(phone)}</strong>
              </div>
              
              <form onSubmit={handleOtpSubmit} className="auth-form">
                {error && (
                  <div className="auth-error">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="auth-form-group">
                  <label className="auth-label">
                    <span className="label-icon">🔢</span>
                    <span>Mã OTP (6 chữ số)</span>
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="123456"
                    className="auth-input otp-input"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="otp-timer">
                  {!canResendOtp ? (
                    <span>Gửi lại mã sau {otpTimer}s</span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      className="auth-link-btn"
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="auth-btn auth-btn-primary"
                  disabled={loading || formData.otp.length !== 6}
                >
                  {loading ? (
                    <div className="btn-loading">
                      <div className="loading-spinner"></div>
                      <span>Đang xác thực...</span>
                    </div>
                  ) : (
                    'Xác thực OTP'
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="auth-subtitle">
                Tạo mật khẩu mới
              </div>
              <div className="auth-description">
                Nhập mật khẩu mới cho tài khoản của bạn
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="auth-form">
                {error && (
                  <div className="auth-error">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="auth-form-group">
                  <label className="auth-label">
                    <span className="label-icon">🔒</span>
                    <span>Mật khẩu mới</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className="auth-input"
                    minLength={6}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">
                    <span className="label-icon">🔒</span>
                    <span>Xác nhận mật khẩu</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu mới"
                    className="auth-input"
                    minLength={6}
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
                      <span>Đang cập nhật...</span>
                    </div>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="auth-subtitle">
                Đặt lại mật khẩu thành công!
              </div>
              <div className="success-message">
                <p>Mật khẩu của bạn đã được cập nhật thành công</p>
                <p>Đang chuyển hướng đến trang đăng nhập...</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;