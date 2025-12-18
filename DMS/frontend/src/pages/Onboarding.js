import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../hooks/usePageTransition';

const Onboarding = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [formData, setFormData] = useState({
    employeeCode: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, user } = useAuth();
  const { isTransitioning, navigateWithTransition } = usePageTransition();

  useEffect(() => {
    if (user) {
      navigateWithTransition('/home');
    }
  }, [user, navigateWithTransition]);

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

    // Format employee code - chuyển thành chữ hoa và loại bỏ khoảng trắng
    if (e.target.name === 'employeeCode') {
      value = value.toUpperCase().trim();
    }

    setFormData({
      ...formData,
      [e.target.name]: value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.employeeCode.trim()) {
      setError('Vui lòng nhập Mã NV');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      setLoading(false);
      return;
    }

    const result = await login(formData.employeeCode.trim(), formData.password);

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigateWithTransition(result.redirect || '/home');
      }, 1000);
    } else {
      // Hiển thị error với hướng dẫn nếu backend down
      let errorMessage = result.message || 'Đăng nhập thất bại';

      if (result.backendDown) {
        errorMessage += '\n\n💡 Giải pháp:\n- Khởi động backend: node server.js\n- Hoặc double-click: start-backend.bat\n- Hoặc dùng script: .\\scripts\\start-all.bat';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-app-container">
      {/* Status Bar */}
      <div className="onboarding-status-bar">
        <span className="onboarding-time">{currentTime}</span>
        <div className="onboarding-signal">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="onboarding-battery"></span>
      </div>

      <div className="onboarding-card">
        {/* Hero Section */}
        <div className="onboarding-hero-section">
          <div className="onboarding-icon-circle" style={{
            width: '140px',
            height: '140px',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <img
              src="/image/logo.webp"
              alt="Logo"
              className="onboarding-logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%'
              }}
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="onboarding-text-content" style={{ marginBottom: '2.5rem' }}>
          <h1 className="onboarding-app-title" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            An Minh Business System
          </h1>
          <p className="onboarding-slogan" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
            Quản lý đơn hàng - Hiệu quả tối ưu
          </p>
        </div>

        {/* Login Form */}
        <div className="onboarding-actions" style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '32px 24px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {error && (
              <div style={{
                padding: '14px 16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                marginBottom: '20px',
                color: '#FFFFFF',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                ⚠️ {error}
              </div>
            )}

            {showSuccess && (
              <div style={{
                padding: '14px 16px',
                background: 'rgba(16, 185, 129, 0.25)',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                borderRadius: '12px',
                marginBottom: '20px',
                color: '#FFFFFF',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                ✅ Đăng nhập thành công!
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: '10px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.3px'
              }}>
                Mã nhân viên
              </label>
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                placeholder="Nhập mã nhân viên"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F29E2E';
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(242, 158, 46, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
                required
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: '10px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.3px'
              }}>
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F29E2E';
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(242, 158, 46, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="onboarding-btn onboarding-btn-primary"
              disabled={loading || isTransitioning}
              style={{
                width: '100%',
                fontSize: '16px',
                fontWeight: '600',
                padding: '18px',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(242, 158, 46, 0.3)'
              }}
            >
              {loading || isTransitioning ? (
                <div className="btn-loading">
                  <div className="loading-spinner"></div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <p>© 2024 AMMedtech Team</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;