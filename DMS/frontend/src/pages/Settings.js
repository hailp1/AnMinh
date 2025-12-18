import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = (type) => {
    setSyncing(true);
    setMessage(`Đang đồng bộ ${type}...`);

    // Simulate API call
    setTimeout(() => {
      setSyncing(false);
      setMessage(`✅ Đã đồng bộ ${type} thành công!`);
      setTimeout(() => setMessage(''), 3000);
    }, 1500);
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  const Section = ({ title, children }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '0 20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '20px 0 10px', paddingTop: '20px', fontSize: '1rem', color: '#1E4A8B' }}>{title}</h3>
      <div style={{ paddingBottom: '10px' }}>{children}</div>
    </div>
  );

  const ActionRow = ({ icon, label, onClick, danger, value }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer'
      }}
    >
      <span style={{ fontSize: '1.2rem', marginRight: '12px', width: '24px', textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1, fontSize: '1rem', color: danger ? '#dc2626' : '#333' }}>{label}</div>
      {value && <div style={{ color: '#666', fontSize: '0.9rem' }}>{value}</div>}
      {!value && <span style={{ color: '#ccc' }}>›</span>}
    </div>
  );

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1a1a2e' }}>Cài đặt</h1>

      {message && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '20px',
          zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {message}
        </div>
      )}

      <Section title="Dữ liệu & Đồng bộ">
        <ActionRow
          icon="🔄"
          label={syncing ? "Đang đồng bộ..." : "Đồng bộ tất cả"}
          onClick={() => !syncing && handleSync('dữ liệu')}
        />
        <ActionRow
          icon="📦"
          label="Cập nhật danh mục sản phẩm"
          onClick={() => !syncing && handleSync('sản phẩm')}
        />
        <ActionRow
          icon="🏥"
          label="Cập nhật danh sách khách hàng"
          onClick={() => !syncing && handleSync('khách hàng')}
        />
      </Section>

      <Section title="Cấu hình ứng dụng">
        <ActionRow icon="🌐" label="Ngôn ngữ" value="Tiếng Việt" />
        <ActionRow icon="🎨" label="Giao diện" value="Sáng" />
        <ActionRow icon="🖨️" label="Cấu hình máy in" value="Chưa kết nối" />
      </Section>

      <Section title="Tài khoản">
        <ActionRow icon="🔐" label="Đổi mật khẩu" onClick={() => alert('Tính năng đang phát triển')} />
        <ActionRow icon="🚪" label="Đăng xuất" danger onClick={handleLogout} />
      </Section>

      <div style={{ textAlign: 'center', marginTop: '40px', color: '#999', fontSize: '0.8rem' }}>
        <div>An Minh DMS Mobile App</div>
        <div>Version 1.0.0 (Build 20251205)</div>
      </div>
    </div>
  );
};

export default Settings;