import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  // Force API URL for debugging - Temporary Public Link
  const API_BASE = 'https://dms.ammedtech.com/api';

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState(null); // 'success', 'error', null

  const navigate = useNavigate();

  useEffect(() => {
    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedAdminUser');
    if (rememberedUser) {
      setFormData(prev => ({ ...prev, username: rememberedUser }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetStatus(null);

    // Simulate API call
    setTimeout(() => {
      if (resetEmail.includes('@')) {
        setResetStatus('success');
      } else {
        setResetStatus('error');
      }
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = `${API_BASE}/auth/login`;

      // Treat username as employeeCode for admin login via API
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}: ${response.statusText}`);
      }

      if (!data.user || data.user.role !== 'ADMIN') {
        throw new Error('Tài khoản không có quyền ADMIN');
      }

      // Save token for admin API calls
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      localStorage.setItem('adminLoginTime', new Date().toISOString());

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedAdminUser', formData.username);
      } else {
        localStorage.removeItem('rememberedAdminUser');
      }

      // Navigate to admin dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsForgotPasswordMode(!isForgotPasswordMode);
    setError('');
    setResetStatus(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1E4A8B 0%, #0F2A50 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src="/image/logo.webp"
              alt="Logo"
              style={{ width: '60%', height: '60%', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150?text=AM';
              }}
            />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '8px',
            letterSpacing: '-0.025em'
          }}>
            {isForgotPasswordMode ? 'Khôi phục mật khẩu' : 'Admin Portal'}
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            margin: 0
          }}>
            {isForgotPasswordMode
              ? 'Nhập email để nhận hướng dẫn đặt lại mật khẩu'
              : 'Đăng nhập để truy cập hệ thống quản trị'}
          </p>
        </div>

        {isForgotPasswordMode ? (
          // Forgot Password Form
          <form onSubmit={handleForgotPasswordSubmit}>
            {resetStatus === 'success' ? (
              <div style={{
                padding: '16px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                marginBottom: '24px',
                color: '#047857',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                ✅ Đã gửi email hướng dẫn! Vui lòng kiểm tra hộp thư của bạn.
              </div>
            ) : (
              <>
                {resetStatus === 'error' && (
                  <div style={{
                    padding: '12px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    color: '#DC2626',
                    fontSize: '14px'
                  }}>
                    ⚠️ Email không hợp lệ. Vui lòng kiểm tra lại.
                  </div>
                )}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Email đăng ký
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@company.com"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
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
                    padding: '14px',
                    background: '#2563EB',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={toggleMode}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                color: '#4B5563',
                border: 'none',
                marginTop: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              ← Quay lại đăng nhập
            </button>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '12px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                marginBottom: '24px',
                color: '#DC2626',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Tên đăng nhập / Mã NV
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="VD: HAILP"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#9CA3AF',
                    padding: '4px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#4B5563'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#2563EB',
                    cursor: 'pointer'
                  }}
                />
                Ghi nhớ đăng nhập
              </label>

              <button
                type="button"
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#2563EB',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }}
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;

