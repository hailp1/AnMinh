import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Vui lòng đăng nhập</div>;
  }

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="station-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
        <h2 style={{ marginBottom: '2rem' }}>Profile của tôi</h2>
        
        <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <div>
              <strong>Tên:</strong> {user.name}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>📧</span>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎭</span>
            <div>
              <strong>Loại tài khoản:</strong> {
                user.role === 'PHARMACY_REP' ? '👨‍⚕️ Trình dược viên' : 
                user.role === 'PHARMACY' ? '🏥 Nhà thuốc' : 
                user.role === 'DELIVERY' ? '🚚 Giao hàng' : 
                '⚙️ Admin'
              }
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>⭐</span>
            <div>
              <strong>Điểm thưởng:</strong> <span style={{ color: '#059669', fontWeight: '700', fontSize: '1.2rem' }}>{user.points || 0} điểm</span>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/create-pharmacy" className="btn-primary">
            ➕ Thêm nhà thuốc
          </Link>
          <Link to="/map" className="btn-secondary">
            🗺️ Xem bản đồ
          </Link>
        </div>
      </div>
      
      <div className="station-card">
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🏆 Thành tích của bạn</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🆕</div>
            <div style={{ fontWeight: '600' }}>Trạm đã tạo</div>
            <div style={{ fontSize: '1.5rem', color: '#667eea', fontWeight: '700' }}>0</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ fontWeight: '600' }}>Đánh giá đã viết</div>
            <div style={{ fontSize: '1.5rem', color: '#667eea', fontWeight: '700' }}>0</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
            <div style={{ fontWeight: '600' }}>Ảnh đã upload</div>
            <div style={{ fontSize: '1.5rem', color: '#667eea', fontWeight: '700' }}>0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;