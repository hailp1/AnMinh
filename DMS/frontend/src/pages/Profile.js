import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, refreshUser } = useAuth(); // Assuming refreshUser exists to reload profile
  const [loading, setLoading] = useState(false);

  // Auto-refresh profile on mount to get latest stats
  useEffect(() => {
    if (refreshUser) refreshUser();
  }, []);

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Vui lòng đăng nhập</div>;
  }

  const getRoleName = (role) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'SALES_REP': return 'Trình dược viên';
      case 'SALES_MANAGER': return 'Giám sát bán hàng';
      default: return role;
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ fontSize: '1.2rem', marginRight: '12px', width: '24px', textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>{label}</div>
        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>{value || '---'}</div>
      </div>
    </div>
  );

  // Use stats from backend or default to 0
  const stats = user.stats || { monthlySales: 0, monthlyOrders: 0, visitCount: 0, visitTarget: 0 };
  const kpiPercent = stats.visitTarget > 0 ? Math.round((stats.visitCount / stats.visitTarget) * 100) : 0;

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1E4A8B 0%, #3b82f6 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(30, 74, 139, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'white',
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1E4A8B',
          border: '4px solid rgba(255,255,255,0.3)'
        }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem' }}>{user.name}</h2>
        <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>{getRoleName(user.role)}</div>
        <div style={{
          marginTop: '12px',
          display: 'inline-block',
          background: 'rgba(255,255,255,0.2)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.85rem'
        }}>
          Mã NV: {user.employeeCode || 'N/A'}
        </div>
      </div>

      {/* Personal Info */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '0 20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '20px 0 10px', paddingTop: '20px', fontSize: '1rem', color: '#1E4A8B' }}>Thông tin cá nhân</h3>
        <InfoRow icon="📧" label="Email" value={user.email} />
        <InfoRow icon="📱" label="Số điện thoại" value={user.phone} />
      </div>

      {/* Work Info */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '0 20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '20px 0 10px', paddingTop: '20px', fontSize: '1rem', color: '#1E4A8B' }}>Thông tin công việc</h3>
        <InfoRow icon="🗺️" label="Tuyến bán hàng" value={user.routeCode} />
        <InfoRow icon="📍" label="Khu vực" value={user.region?.name} />
        <InfoRow icon="🏢" label="Kênh" value={user.channel} />
        <InfoRow icon="👤" label="Quản lý trực tiếp" value={user.manager?.name} />
      </div>

      {/* KPI Summary (Real Data) */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1E4A8B' }}>Kết quả tháng này</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Doanh số</div>
            <div style={{ fontSize: '1.0rem', fontWeight: 'bold', color: '#059669' }}>{formatCurrency(stats.monthlySales)}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Đơn hàng</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.monthlyOrders}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Viếng thăm</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.visitCount}/{stats.visitTarget}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>KPI Viếng thăm</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#6366f1' }}>{kpiPercent}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;