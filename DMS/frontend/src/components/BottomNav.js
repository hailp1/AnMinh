import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { path: '/home', icon: '🏠', label: 'Trang chủ', activeIcon: '🏠' },
        { path: '/customers', icon: '👥', label: 'Khách hàng', activeIcon: '👥' },
        { path: '/promotions', icon: '🎁', label: 'CTKM', activeIcon: '🎁' },
        { path: '/products', icon: '📦', label: 'Sản phẩm', activeIcon: '📦' },
        { path: '/profile', icon: '👤', label: 'Cá nhân', activeIcon: '👤' }
    ];

    const isActive = (path) => {
        if (path === '/home') return location.pathname === '/home';
        return location.pathname.startsWith(path);
    };

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '8px 0',
                maxWidth: '480px',
                margin: '0 auto'
            }}>
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                padding: '6px 0',
                                textDecoration: 'none',
                                color: active ? '#1E4A8B' : '#64748B',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                            }}
                        >
                            {/* Active Indicator */}
                            {active && (
                                <div style={{
                                    position: 'absolute',
                                    top: -8,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 32,
                                    height: 3,
                                    background: 'linear-gradient(90deg, #1E4A8B, #2563EB)',
                                    borderRadius: '0 0 4px 4px'
                                }} />
                            )}

                            {/* Icon Container */}
                            <div style={{
                                fontSize: 24,
                                transform: active ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.2s ease',
                                filter: active ? 'drop-shadow(0 2px 4px rgba(30,74,139,0.3))' : 'none'
                            }}>
                                {active ? item.activeIcon : item.icon}
                            </div>

                            {/* Label */}
                            <span style={{
                                fontSize: 11,
                                fontWeight: active ? '700' : '500',
                                transition: 'all 0.2s ease'
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
