import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(storedAdmin);
      setAdminUser(user);
    } catch (err) {
      navigate('/admin/login');
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
    navigate('/admin/login');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: '📊 Dashboard',
      path: '/admin/dashboard',
      icon: '📊'
    },
    {
      id: 'customers',
      label: '👥 Quản lý khách hàng',
      path: '/admin/customers',
      icon: '👥'
    },
    {
      id: 'routes',
      label: '🗺️ Quản lý lộ trình',
      path: '/admin/routes',
      icon: '🗺️'
    },
    {
      id: 'map',
      label: '📍 Bản đồ định vị',
      path: '/admin/map',
      icon: '📍'
    },
    {
      id: 'reports',
      label: '📈 Báo cáo & Thống kê',
      path: '/admin/reports',
      icon: '📈'
    },
    {
      id: 'orders',
      label: '📦 Quản lý đơn hàng',
      path: '/admin/orders',
      icon: '📦'
    },
    {
      id: 'products',
      label: '💊 Quản lý sản phẩm',
      path: '/admin/products',
      icon: '💊'
    },
    {
      id: 'users',
      label: '👤 Quản lý người dùng',
      path: '/admin/users',
      icon: '👤'
    },
    {
      id: 'settings',
      label: '⚙️ Cài đặt hệ thống',
      path: '/admin/settings',
      icon: '⚙️'
    }
  ];

  if (!adminUser) {
    return null; // Will redirect to login
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f5f7fa'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? (isMobile ? '100%' : '280px') : (isMobile ? '0' : '80px'),
        background: 'linear-gradient(180deg, #1a5ca2 0%, #1a1a2e 100%)',
        color: '#fff',
        transition: 'width 0.3s ease, transform 0.3s ease',
        position: isMobile ? 'fixed' : 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: isMobile && sidebarOpen ? 1000 : 1000,
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        display: isMobile && !sidebarOpen ? 'none' : 'block'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: '8px',
            overflow: 'hidden'
          }}>
            <img 
              src="/image/logo.png" 
              alt="Sapharco" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#fff'
              }}>
                Sapharco DMS
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0
            }}>
              {adminUser.name ? adminUser.name[0].toUpperCase() : 'A'}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {adminUser.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  {adminUser.username}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav style={{ padding: '16px 0' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                padding: '14px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: isActive(item.path) 
                  ? 'rgba(62, 180, 168, 0.3)' 
                  : 'transparent',
                borderLeft: isActive(item.path) 
                  ? '3px solid #3eb4a8' 
                  : '3px solid transparent',
                transition: 'all 0.2s',
                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.8)'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px', flexShrink: 0 }}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span style={{
                  fontSize: '14px',
                  fontWeight: isActive(item.path) ? '600' : '400'
                }}>
                  {item.label.replace(/^[^\s]+\s/, '')}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#1a1a2e'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span>Thu gọn</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? '0' : (sidebarOpen ? '280px' : '80px'),
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Bar */}
        <div style={{
          background: '#fff',
          padding: isMobile ? '12px 16px' : '16px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            minWidth: 0
          }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  padding: '8px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ☰
              </button>
            )}
            <div style={{
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: '600',
              color: '#1a1a2e',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '16px',
            flexShrink: 0
          }}>
            {!isMobile && (
              <div style={{
                fontSize: '14px',
                color: '#666',
                whiteSpace: 'nowrap'
              }}>
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
              style={{
                padding: isMobile ? '8px 12px' : '8px 16px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#fecaca';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fee2e2';
              }}
            >
              {isMobile ? 'Đăng xuất' : 'Đăng xuất'}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div style={{
          padding: isMobile ? '16px' : '32px',
          minHeight: 'calc(100vh - 80px)',
          boxSizing: 'border-box'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

