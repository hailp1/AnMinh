
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InviteFriends from './InviteFriends';

const Navbar = () => {
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
    <nav className="navbar-enhanced">
      {/* Brand Section */}
      <div className="navbar-brand-section">
        <Link to="/" className="navbar-brand-enhanced">
          <div className="brand-icon">⚡</div>
          <div className="brand-text">
            <span className="brand-name">Sapharco Sales</span>
            <span className="brand-tagline">Sales Management</span>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-nav-desktop">
        <Link 
          to="/map" 
          className={`nav-item-enhanced ${isActive('/map') ? 'active' : ''}`}
        >
          <span className="nav-icon">🗺️</span>
          <span className="nav-text">Map</span>
        </Link>
        
        <Link 
          to="/create-station" 
          className={`nav-item-enhanced ${isActive('/create-station') ? 'active' : ''}`}
        >
          <span className="nav-icon">➕</span>
          <span className="nav-text">Add Station</span>
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
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role === 'STATION_OWNER' ? 'Station Owner' : 'User'}</span>
            </div>
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

      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

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
          
          <Link 
            to="/create-station" 
            className={`mobile-nav-item ${isActive('/create-station') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">➕</span>
            <span className="nav-text">Add Station</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </Link>
          
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