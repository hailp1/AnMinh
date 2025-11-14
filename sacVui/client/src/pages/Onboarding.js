import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';

const Onboarding = () => {
  const [currentTime, setCurrentTime] = useState('');
  const { isTransitioning, navigateWithTransition } = usePageTransition();

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
          <div className="onboarding-icon-circle">
            <img 
              src="/image/logo.png" 
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
        <div className="onboarding-text-content">
          <h1 className="onboarding-app-title">Sapharco Sales</h1>
          <p className="onboarding-slogan">Quản lý đơn hàng - Hiệu quả tối ưu</p>
          <p className="onboarding-description">
            Ứng dụng nhập đơn hàng cho Trình dược viên tại các nhà thuốc
          </p>
        </div>

        {/* Actions */}
        <div className="onboarding-actions">
          <button 
            onClick={() => navigateWithTransition('/register')}
            className="onboarding-btn onboarding-btn-primary"
            disabled={isTransitioning}
          >
            {isTransitioning ? (
              <div className="btn-loading">
                <div className="loading-spinner"></div>
                <span>Đang tải...</span>
              </div>
            ) : (
              'Đăng ký'
            )}
          </button>
          <button 
            onClick={() => navigateWithTransition('/login')}
            className="onboarding-btn onboarding-btn-secondary"
            disabled={isTransitioning}
          >
            Đăng nhập
          </button>
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <p>© 2024 Sapharco Sales • v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;