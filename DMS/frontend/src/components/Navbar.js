import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        zIndex: 999,
        padding: '12px 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '480px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <Link to="/home" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none'
          }}>
            <img
              src="/image/logo.webp"
              alt="An Minh"
              style={{ height: 32 }}
              onError={(e) => e.target.style.display = 'none'}
            />
            <div>
              <div style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1E4A8B',
                lineHeight: 1.2
              }}>
                An Minh
              </div>
              <div style={{
                fontSize: 10,
                color: '#64748B',
                fontWeight: '500'
              }}>
                DMS System
              </div>
            </div>
          </Link>

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1E4A8B, #2563EB)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 'bold'
              }}>
                {user.name?.charAt(0)?.toUpperCase() || '👤'}
              </div>
              <span style={{ fontSize: 13, fontWeight: '600', color: '#1E293B' }}>
                {user.name?.split(' ').slice(-1)[0] || 'User'}
              </span>
              <span style={{ fontSize: 10, color: '#94A3B8' }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 998
                  }}
                  onClick={() => setShowMenu(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  minWidth: 180,
                  overflow: 'hidden',
                  zIndex: 999
                }}>
                  <Link
                    to="/profile"
                    onClick={() => setShowMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#1E293B',
                      fontSize: 14,
                      fontWeight: '500',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <span>👤</span>
                    <span>Trang cá nhân</span>
                  </Link>

                  <Link
                    to="/kpi"
                    onClick={() => setShowMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#1E293B',
                      fontSize: 14,
                      fontWeight: '500',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <span>📊</span>
                    <span>KPI của tôi</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: 14,
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#FEE2E2'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;