import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Demo users
  const demoUsers = {
    'admin': 'admin',
    'ketoan': 'ketoan'
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check demo users
      if (demoUsers[formData.username] && demoUsers[formData.username] === formData.password) {
        // Create admin user object
        const adminUser = {
          id: `admin_${formData.username}`,
          name: formData.username === 'admin' ? 'Administrator' : 'Kế toán',
          username: formData.username,
          phone: formData.username === 'admin' ? '0900000000' : '0900000001',
          role: 'ADMIN',
          email: `${formData.username}@sapharco.com`,
          hub: 'Trung tâm',
          permissions: {
            manageUsers: true,
            manageCustomers: true,
            manageRoutes: true,
            viewAnalytics: true,
            systemSettings: formData.username === 'admin'
          }
        };

        // Save to localStorage
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        localStorage.setItem('adminLoginTime', new Date().toISOString());

        // Navigate to admin dashboard
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '28px',
        padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.15), rgba(62, 180, 168, 0.15))',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(26, 92, 162, 0.2)'
          }}>
            <img 
              src="/image/logo.png" 
              alt="Sapharco Admin" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1a1a2e',
            margin: '0 0 12px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Sapharco Admin
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#374151',
            margin: 0,
            fontWeight: '500'
          }}>
            Hệ thống quản trị DMS
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '14px 16px',
              background: '#fee2e2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              marginBottom: '24px',
              color: '#dc2626',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a2e',
              marginBottom: '10px'
            }}>
              👤 Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="admin hoặc ketoan"
              style={{
                width: '100%',
                padding: '16px 18px',
                border: '2px solid #d1d5db',
                borderRadius: '14px',
                fontSize: '17px',
                boxSizing: 'border-box',
                color: '#1a1a2e',
                background: '#fff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a5ca2';
                e.target.style.boxShadow = '0 0 0 4px rgba(26, 92, 162, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a2e',
              marginBottom: '10px'
            }}>
              🔒 Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              style={{
                width: '100%',
                padding: '16px 18px',
                border: '2px solid #d1d5db',
                borderRadius: '14px',
                fontSize: '17px',
                boxSizing: 'border-box',
                color: '#1a1a2e',
                background: '#fff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a5ca2';
                e.target.style.boxShadow = '0 0 0 4px rgba(26, 92, 162, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading 
                ? 'none' 
                : '0 8px 24px rgba(26, 92, 162, 0.4)',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          {/* Demo Users Info */}
          <div style={{
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '12px',
            fontSize: '13px',
            color: '#666',
            textAlign: 'center'
          }}>
            <strong>Demo Users:</strong><br />
            admin / admin<br />
            ketoan / ketoan
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

