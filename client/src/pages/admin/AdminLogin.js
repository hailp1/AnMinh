import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      // Treat username as employeeCode for admin login via API
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      if (!data.user || data.user.role !== 'ADMIN') {
        throw new Error('Tài khoản không có quyền ADMIN');
      }

      // Save token for admin API calls
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      localStorage.setItem('adminLoginTime', new Date().toISOString());

      // Navigate to admin dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1E4A8B',
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
              src="/image/logo.webp"
              alt="An Minh Business System Admin"
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
            An Minh Business System Admin
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
              👤 Mã nhân viên (ADMIN)
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="VD: ADMIN001"
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
                e.target.style.borderColor = '#1E4A8B';
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
                e.target.style.borderColor = '#1E4A8B';
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
                : '#F29E2E',
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


        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

