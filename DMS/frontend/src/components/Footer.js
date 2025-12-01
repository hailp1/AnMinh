import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer" style={{
      position: 'relative',
      width: '100%',
      zIndex: 1000,
      background: '#fff',
      borderTop: '1px solid #e5e7eb',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      padding: '15px 20px'
    }}>
      <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/image/logo.webp" alt="Logo" style={{ height: '24px', width: 'auto' }} />
          <span className="footer-text" style={{ fontWeight: '600', color: '#1E4A8B', fontSize: '14px' }}>An Minh DMS</span>
        </div>
        <div className="footer-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666' }}>
          <span>© 2025 AMMedtech</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>v1.0</span>
            <span>•</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;