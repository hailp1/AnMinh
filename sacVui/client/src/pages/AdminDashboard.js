import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../hooks/usePageTransition';
import { getFromLocalStorage } from '../utils/mockData';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { navigateWithTransition } = usePageTransition();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStations: 0,
    activeUsers: 0,
    revenue: 0
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = () => {
    const allUsers = getFromLocalStorage('users', []);
    const stations = getFromLocalStorage('stations', []);
    
    setUsers(allUsers);
    setStats({
      totalUsers: allUsers.length,
      totalStations: stations.length,
      activeUsers: allUsers.filter(u => {
        const lastLogin = new Date(u.lastLogin);
        const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLogin <= 7; // Active trong 7 ngày
      }).length,
      revenue: Math.floor(Math.random() * 50000000) // Mock revenue
    });
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-card">
          <div className="denied-icon">🚫</div>
          <h2>Truy cập bị từ chối</h2>
          <p>Bạn không có quyền truy cập trang quản trị này</p>
          <button 
            onClick={() => navigateWithTransition('/home')}
            className="back-home-btn"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title">
          <h1>🛡️ Bảng điều khiển Admin</h1>
          <p>Chào mừng, {user.name}</p>
        </div>
        <div className="admin-user-info">
          <div className="admin-badge">ADMIN</div>
          <div className="admin-phone">{user.phone}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Tổng người dùng</div>
          </div>
        </div>
        
        <div className="stat-card stations">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalStations}</div>
            <div className="stat-label">Nhà thuốc</div>
          </div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeUsers}</div>
            <div className="stat-label">Hoạt động (7 ngày)</div>
          </div>
        </div>
        
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{(stats.revenue / 1000000).toFixed(1)}M</div>
            <div className="stat-label">Doanh thu (VNĐ)</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-actions">
        <h2>Thao tác nhanh</h2>
        <div className="actions-grid">
          <button className="action-btn users-btn">
            <span className="action-icon">👥</span>
            <span>Quản lý người dùng</span>
          </button>
          
          <button className="action-btn stations-btn">
            <span className="action-icon">🏪</span>
            <span>Quản lý nhà thuốc</span>
          </button>
          
          <button className="action-btn analytics-btn">
            <span className="action-icon">📊</span>
            <span>Thống kê & Báo cáo</span>
          </button>
          
          <button className="action-btn settings-btn">
            <span className="action-icon">⚙️</span>
            <span>Cài đặt hệ thống</span>
          </button>
        </div>
      </div>

      {/* Recent Users */}
      <div className="admin-recent-users">
        <h2>Người dùng mới nhất</h2>
        <div className="users-table">
          <div className="table-header">
            <div>Tên</div>
            <div>Số điện thoại</div>
            <div>Vai trò</div>
            <div>Ngày tạo</div>
          </div>
          {users.slice(0, 5).map(user => (
            <div key={user.id} className="table-row">
              <div className="user-name">
                <span className="user-avatar">{user.name ? user.name[0] : '👤'}</span>
                <span>{user.name || 'Chưa cập nhật'}</span>
              </div>
              <div className="user-phone">{user.phone}</div>
              <div className={`user-role ${user.role.toLowerCase()}`}>
                {user.role === 'ADMIN' ? '🛡️ Admin' : 
                 user.role === 'STATION_OWNER' ? '🏪 Chủ trạm' : '👤 Người dùng'}
              </div>
              <div className="user-date">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="admin-system-info">
        <h2>Thông tin hệ thống</h2>
        <div className="system-cards">
          <div className="system-card">
            <div className="system-icon">🔧</div>
            <div className="system-content">
              <div className="system-title">Phiên bản</div>
              <div className="system-value">v1.0.0</div>
            </div>
          </div>
          
          <div className="system-card">
            <div className="system-icon">🌐</div>
            <div className="system-content">
              <div className="system-title">Môi trường</div>
              <div className="system-value">Production</div>
            </div>
          </div>
          
          <div className="system-card">
            <div className="system-icon">📅</div>
            <div className="system-content">
              <div className="system-title">Cập nhật cuối</div>
              <div className="system-value">{new Date().toLocaleDateString('vi-VN')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;