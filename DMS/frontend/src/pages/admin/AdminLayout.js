import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check admin authentication
    const storedAdmin = localStorage.getItem('adminUser');
    if (!storedAdmin) {
      console.log('AdminLayout: No adminUser in localStorage, redirecting to login');
      navigate('/Anminh/admin');
      return;
    }

    try {
      const user = JSON.parse(storedAdmin);
      setAdminUser(user);
    } catch (err) {
      navigate('/Anminh/admin');
    }

    // Handle window resize
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    navigate('/Anminh/admin');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: '📊 Dashboard',
      path: '/Anminh/admin/dashboard',
      icon: '📊'
    },
    {
      id: 'customers',
      label: '👥 Quản lý khách hàng',
      path: '/Anminh/admin/customers',
      icon: '👥'
    },
    {
      id: 'routes',
      label: '🗺️ Quản lý lộ trình',
      path: '/Anminh/admin/routes',
      icon: '🗺️'
    },
    {
      id: 'map',
      label: '📍 Bản đồ định vị',
      path: '/Anminh/admin/map',
      icon: '📍'
    },
    {
      id: 'reports',
      label: '📈 Báo cáo & Thống kê',
      path: '/Anminh/admin/reports',
      icon: '📈'
    },
    {
      id: 'orders',
      label: '📦 Quản lý đơn hàng',
      path: '/Anminh/admin/orders',
      icon: '📦'
    },
    {
      id: 'products',
      label: '💊 Quản lý sản phẩm',
      path: '/Anminh/admin/products',
      icon: '💊'
    },
    {
      id: 'users',
      label: '👤 Quản lý người dùng',
      path: '/Anminh/admin/users',
      icon: '👤'
    },
    {
      id: 'settings',
      label: '⚙️ Cài đặt hệ thống',
      path: '/Anminh/admin/settings',
      icon: '⚙️'
    },
    {
      id: 'promotions',
      label: '🎁 Quản lý khuyến mãi',
      path: '/Anminh/admin/promotions',
      icon: '🎁'
    },
    {
      id: 'loyalty',
      label: '💎 Quản lý tích lũy',
      path: '/Anminh/admin/loyalty',
      icon: '💎'
    },
    {
      id: 'customer-segments',
      label: '🏷️ Phân nhóm khách hàng',
      path: '/Anminh/admin/segments',
      icon: '🏷️'
    },
    {
      id: 'trade-activities',
      label: '🎯 Hoạt động thương mại',
      path: '/Anminh/admin/trade-activities',
      icon: '🎯'
    },
    {
      id: 'kpi',
      label: '📊 KPI & Thưởng',
      path: '/Anminh/admin/kpi',
      icon: '📊'
    },
    {
      id: 'approvals',
      label: '✅ Quản lý Phê duyệt',
      path: '/Anminh/admin/approvals',
      icon: '✅'
    }
  ];

  if (!adminUser) {
    return null; // Will redirect to login
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'expanded' : ''} ${isMobile ? 'mobile' : ''} ${isMobile && !sidebarOpen ? 'closed' : 'open'}`}>
        {/* Logo */}
        <div className="admin-sidebar-header">
          <div className="admin-logo-container">
            <img
              src="/image/logo.webp"
              alt="An Minh Business System"
              className="admin-logo-img"
            />
          </div>
          {sidebarOpen && (
            <div>
              <div className="admin-brand-text">
                An Minh Business System
              </div>
              <div className="admin-brand-subtext">
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="admin-user-info">
          <div className="admin-user-container">
            <div className="admin-user-avatar">
              {adminUser.name ? adminUser.name[0].toUpperCase() : 'A'}
            </div>
            {sidebarOpen && (
              <div className="admin-user-details">
                <div className="admin-user-name">
                  {adminUser.name}
                </div>
                <div className="admin-user-username">
                  {adminUser.username}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="admin-nav">
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">
                {item.icon}
              </span>
              {sidebarOpen && (
                <span className="admin-nav-label">
                  {item.label.replace(/^[^\s]+\s/, '')}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Toggle Sidebar (footer) - visible on desktop */}
        {!isMobile && (
          <div className="admin-sidebar-footer">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`admin-sidebar-collapse-btn ${!sidebarOpen ? 'collapsed' : ''}`}
              title={sidebarOpen ? "Thu gọn" : "Mở rộng"}
            >
              <span>{sidebarOpen ? '◀' : '▶'}</span>
              {sidebarOpen && <span>Thu gọn</span>}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="admin-mobile-overlay"
        />
      )}

      {/* Main Content */}
      <div className={`admin-main-content ${sidebarOpen ? 'expanded' : ''} ${isMobile ? 'mobile' : ''}`}>

        {/* Top Bar */}
        <div className={`admin-top-bar ${isMobile ? 'mobile' : 'desktop'}`}>
          <div className="admin-top-bar-left">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="admin-mobile-menu-btn"
              >
                ☰
              </button>
            )}
            <div className={`admin-page-title ${isMobile ? 'mobile' : 'desktop'}`}>
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </div>
          </div>

          <div className={`admin-top-bar-right ${isMobile ? 'mobile' : 'desktop'}`}>
            {!isMobile && (
              <div className="admin-date-display">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`admin-logout-btn ${isMobile ? 'mobile' : 'desktop'}`}
            >
              {isMobile ? 'Đăng xuất' : 'Đăng xuất'}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className={`admin-page-container ${isMobile ? 'mobile' : 'desktop'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

