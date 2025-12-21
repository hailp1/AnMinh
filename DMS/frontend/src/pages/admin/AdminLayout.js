import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedMenus, setExpandedMenus] = useState({}); // Track expanded sub-menus
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

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: '📊 Admin Dashboard',
      path: '/Anminh/admin/dashboard',
      icon: '📊'
    },

    {
      id: 'routes',
      label: '🗺️ Quản lý lộ trình',
      path: '/Anminh/admin/routes',
      icon: '🗺️'
    },
    {
      id: 'map',
      label: '📍 Bản đồ Định Vị',
      path: '/Anminh/admin/map',
      icon: '📍'
    },
    {
      id: 'reports',
      label: '📈 Báo cáo & Thống kê',
      icon: '📈',
      subItems: [
        { id: 'rpt_dashboard', label: 'Dashboard', path: '/Anminh/admin/reports?view=dashboard' },
        { id: 'rpt_biz_review', label: '🚀 Biz Review', path: '/Anminh/admin/biz-review' },
        { id: 'rpt_list', label: 'Reports', path: '/Anminh/admin/reports?view=report_list' }
      ]
    },
    {
      id: 'customer_mngt',
      label: '👥 Quản lý khách hàng',
      icon: '👥',
      subItems: [
        { id: 'cust_list', label: 'Danh sách khách hàng', path: '/Anminh/admin/customers' },
        { id: 'cust_seg', label: 'Nhóm khách hàng', path: '/Anminh/admin/segments' },
        { id: 'cust_approve', label: 'Duyệt yêu cầu', path: '/Anminh/admin/approvals' }
      ]
    },
    {
      id: 'product_mngt',
      label: '💊 Quản lý sản phẩm',
      icon: '💊',
      subItems: [
        { id: 'prod_list', label: 'Danh sách sản phẩm', path: '/Anminh/admin/products' },
        { id: 'prod_group', label: 'Danh mục & Nhóm', path: '/Anminh/admin/products' }
      ]
    },
    {
      id: 'orders',
      label: '📦 Quản lý đơn hàng',
      path: '/Anminh/admin/orders',
      icon: '📦'
    },
    {
      id: 'inventory',
      label: '🏭 Quản lý kho',
      path: '/Anminh/admin/inventory',
      icon: '🏭'
    },
    {
      id: 'users',
      label: '👤 Quản lý người dùng',
      path: '/Anminh/admin/users',
      icon: '👤'
    },
    {
      id: 'trade_mngt',
      label: '🎯 Quản lý HTTM',
      icon: '🎯',
      subItems: [
        { id: 'tm_promo', label: 'Chương trình KM', path: '/Anminh/admin/promotions' },
        { id: 'tm_loyalty', label: 'Tích lũy & Đổi quà', path: '/Anminh/admin/loyalty' },
        { id: 'tm_act', label: 'Hoạt động thương mại', path: '/Anminh/admin/trade-activities' }
      ]
    },
    {
      id: 'system',
      label: '⚙️ Hệ thống',
      icon: '⚙️',
      subItems: [
        { id: 'sys_org', label: '🏢 Cấu trúc Tổ chức', path: '/Anminh/admin/org-structure' },
        { id: 'sys_kpi', label: 'KPI & Thưởng', path: '/Anminh/admin/kpi' },
        { id: 'sys_settings', label: 'Cài đặt chung', path: '/Anminh/admin/settings' }
      ]
    }
  ];

  if (!adminUser) {
    return null; // Will redirect to login
  }

  const isActive = (path) => {
    if (!path) return false;
    // Check exact path match or query param match
    if (location.pathname === path) return true;
    if (path.includes('?')) {
      const param = path.split('?')[1];
      return location.search.includes(param);
    }
    return false;
  };

  const isParentActive = (item) => {
    if (isActive(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => isActive(sub.path));
    }
    return false;
  };

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
          {menuItems.map(item => {
            const isExpanded = expandedMenus[item.id];
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const active = isParentActive(item);

            return (
              <div key={item.id}>
                <div
                  onClick={() => hasSubItems ? toggleMenu(item.id) : navigate(item.path)}
                  className={`admin-nav-item ${active ? 'active' : ''}`}
                  style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="admin-nav-icon">
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <span className="admin-nav-label">
                        {item.label.replace(/^[^\s]+\s/, '')}
                      </span>
                    )}
                  </div>
                  {sidebarOpen && hasSubItems && (
                    <span style={{ fontSize: '10px', color: '#999' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  )}
                </div>

                {/* Sub Items */}
                {sidebarOpen && hasSubItems && isExpanded && (
                  <div style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.02)' }}>
                    {item.subItems.map(sub => (
                      <div
                        key={sub.id}
                        onClick={() => navigate(sub.path)}
                        style={{
                          padding: '10px 0',
                          fontSize: '13px',
                          color: isActive(sub.path) ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                          fontWeight: isActive(sub.path) ? '600' : '400',
                          cursor: 'pointer',
                          borderLeft: isActive(sub.path) ? '2px solid #60a5fa' : '2px solid transparent',
                          paddingLeft: '10px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive(sub.path)) e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive(sub.path)) e.target.style.color = 'rgba(255,255,255,0.7)';
                        }}
                      >
                        {sub.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
