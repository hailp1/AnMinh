import React from 'react';
import { clearAllLocalStorage, resetApp } from '../../utils/clearLocalStorage';

const AdminReset = () => {
  const handleClearData = () => {
    if (window.confirm('Bạn có chắc muốn xóa TẤT CẢ dữ liệu localStorage? Hành động này không thể hoàn tác!')) {
      clearAllLocalStorage();
      alert('✅ Đã xóa tất cả dữ liệu localStorage. Vui lòng refresh trang.');
    }
  };

  const handleResetApp = () => {
    if (window.confirm('Bạn có chắc muốn reset toàn bộ ứng dụng? Tất cả dữ liệu localStorage sẽ bị xóa và trang sẽ được reload!')) {
      resetApp();
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: '8px'
      }}>
        🔄 Reset Hệ Thống
      </h1>
      <p style={{
        fontSize: '14px',
        color: '#666',
        marginBottom: '32px'
      }}>
        Xóa tất cả dữ liệu mock từ localStorage
      </p>

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '600px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '12px'
          }}>
            ⚠️ Cảnh báo
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            Thao tác này sẽ xóa TẤT CẢ dữ liệu được lưu trong localStorage của trình duyệt, bao gồm:
          </p>
          <ul style={{
            fontSize: '14px',
            color: '#666',
            marginTop: '12px',
            paddingLeft: '24px',
            lineHeight: '1.8'
          }}>
            <li>Dữ liệu người dùng (users)</li>
            <li>Dữ liệu khách hàng (customers)</li>
            <li>Dữ liệu đơn hàng (orders)</li>
            <li>Dữ liệu sản phẩm (products)</li>
            <li>Thông tin đăng nhập (currentUser, token)</li>
            <li>Tất cả tin nhắn chat</li>
            <li>Cài đặt hệ thống (adminSettings)</li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleClearData}
            style={{
              padding: '12px 24px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            🗑️ Xóa dữ liệu localStorage
          </button>
          <button
            onClick={handleResetApp}
            style={{
              padding: '12px 24px',
              background: '#F29E2E',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#E08E1E'}
            onMouseOut={(e) => e.target.style.background = '#F29E2E'}
          >
            🔄 Reset và Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReset;

