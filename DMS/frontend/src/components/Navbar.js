import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InviteFriends from './InviteFriends';

const Navbar = ({ isMobileMode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Không hiển thị navbar khi chưa đăng nhập
  if (!user) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
    }
  };

  return (
    <nav className="navbar-enhanced" style={{ position: 'sticky', top: 0, width: '100%', zIndex: 1000 }}>
      {/* Brand Section */}
      <div className="navbar-brand-section">
        <Link to="/home" className="navbar-brand-enhanced" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/image/logo.webp" alt="An Minh Logo" style={{ height: '40px', marginRight: '10px' }} />
          <div className="brand-text">
            <span className="brand-name">An Minh</span>
            <span className="brand-tagline">DMS</span>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation - Hidden in Mobile Mode */}
      {!isMobileMode && (
        <div className="navbar-nav-desktop">
          <Link
            to="/map"
            className={`nav-item-enhanced ${isActive('/map') ? 'active' : ''}`}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-text">Map</span>
          </Link>

          <Link
            to="/create-pharmacy"
            className={`nav-item-enhanced ${isActive('/create-pharmacy') ? 'active' : ''}`}
          >
            <span className="nav-icon">➕</span>
            <span className="nav-text">Thêm nhà thuốc</span>
          </Link>

          <InviteFriends />

          {user.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`nav-item-enhanced admin ${isActive('/admin') ? 'active' : ''}`}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Admin</span>
            </Link>
          )}
        </div>
      )}

      {/* User Section */}
      <div className="navbar-user-section">
        <div className="user-points-display">
          <span className="points-icon">⭐</span>
          <span className="points-value">{user.points || 0}</span>
        </div>

        <div className="user-profile-dropdown">
          <button
            className="user-profile-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <div className="user-avatar">
              <span className="avatar-text">{user.name?.charAt(0)?.toUpperCase() || '👤'}</span>
            </div>
            {!isMobileMode && (
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">
                  {user.role === 'PHARMACY_REP' ? 'Trình dược viên' :
                    user.role === 'PHARMACY' ? 'Nhà thuốc' :
                      user.role === 'DELIVERY' ? 'Giao hàng' : 'User'}
                </span>
              </div>
            )}
            <span className="dropdown-arrow">▼</span>
          </button>

          {showMobileMenu && (
            <div className="user-dropdown-menu">
              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="dropdown-icon">👤</span>
                <span>Profile</span>
              </Link>

              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="dropdown-icon">⚙️</span>
                <span>Settings</span>
              </Link>

              <div className="dropdown-divider"></div>

              <button
                onClick={handleLogout}
                className="dropdown-item logout"
              >
                <span className="dropdown-icon">🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle - Visible in Mobile Mode */}
      {(isMobileMode || window.innerWidth <= 768) && (
        <button
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{ display: 'flex' }}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      )}

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="navbar-mobile-menu">
          <Link
            to="/map"
            className={`mobile-nav-item ${isActive('/map') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-text">Map</span>
          </Link>

          {/* Removed 'Thêm nhà thuốc' and 'Profile' as requested */}

          {user.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`mobile-nav-item admin ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Admin</span>
            </Link>
          )}

          <div className="mobile-nav-divider"></div>

          <button
            onClick={handleLogout}
            className="mobile-nav-item logout"
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;