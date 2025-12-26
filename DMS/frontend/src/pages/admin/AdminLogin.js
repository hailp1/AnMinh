import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  // Use relative path to avoid CORS issues (proxied by Nginx)
  const API_BASE = '/api';

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
    // Check if admin is already logged in
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        const allowedRoles = ['ADMIN', 'QL', 'KT'];
        if (user && allowedRoles.includes(user.role?.toUpperCase())) {
          // Already logged in as admin, redirect to dashboard
          navigate('/Anminh/admin/dashboard', { replace: true });
          return;
        }
      } catch (e) {
        // Invalid session, clear it
        localStorage.removeItem('adminUser');
      }
    }

    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedAdminUser');
    if (rememberedUser) {
      setFormData(prev => ({ ...prev, username: rememberedUser }));
      setRememberMe(true);
    }
  }, [navigate]);

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

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Lỗi kết nối đến server. Vui lòng kiểm tra lại.');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Lỗi ${response.status}: ${response.statusText}`);
      }

      const allowedRoles = ['ADMIN', 'QL', 'KT'];
      if (!data.user || !allowedRoles.includes(data.user.role?.toUpperCase())) {
        throw new Error('Tài khoản không có quyền truy cập trang Quản trị');
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
      navigate('/Anminh/admin/dashboard', { replace: true });
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
      width: '100%',
      background: '#020617', // Dark background matching landing page
      backgroundImage: 'radial-gradient(circle at 50% 0%, #112240 0%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '300px',
        height: '300px',
        background: 'rgba(0, 212, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '20%',
        width: '250px',
        height: '250px',
        background: 'rgba(62, 180, 168, 0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(11, 18, 33, 0.6)', // Glassmorphism dark
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <img
              src="/image/logo.webp"
              alt="Logo"
              style={{
                width: '60%',
                height: '60%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.3))'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            {isForgotPasswordMode ? 'Reset Password' : 'Admin Portal'}
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#94a3b8',
            margin: 0
          }}>
            {isForgotPasswordMode
              ? 'Enter email to receive reset instructions'
              : 'Secure access for administrators'}
          </p>
        </div>

        {/* Form Container */}
        <div style={{ width: '100%' }}>
          {isForgotPasswordMode ? (
            // Forgot Password Form
            <form onSubmit={handleForgotPasswordSubmit}>
              {resetStatus === 'success' ? (
                <div style={{
                  padding: '16px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  color: '#4ade80',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  ✅ Instructions sent! Check your inbox.
                </div>
              ) : (
                <>
                  {resetStatus === 'error' && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      color: '#f87171',
                      fontSize: '14px'
                    }}>
                      ⚠️ Invalid email. Please check again.
                    </div>
                  )}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#e2e8f0',
                      marginBottom: '8px'
                    }}>
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@company.com"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#00D4FF';
                        e.target.style.boxShadow = '0 0 0 2px rgba(0, 212, 255, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
                      background: 'linear-gradient(135deg, #00D4FF 0%, #0072FF 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
                    }}
                  >
                    {loading ? 'Sending...' : 'Send Instructions'}
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
                  color: '#94a3b8',
                  border: 'none',
                  marginTop: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                ← Back to Login
              </button>
            </form>
          ) : (
            // Login Form
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  color: '#f87171',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0',
                  marginBottom: '8px'
                }}>
                  Username / Employee Code
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. ADMIN01"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00D4FF';
                    e.target.style.boxShadow = '0 0 0 2px rgba(0, 212, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0',
                  marginBottom: '8px'
                }}>
                  Password
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
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00D4FF';
                      e.target.style.boxShadow = '0 0 0 2px rgba(0, 212, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
                      color: '#94a3b8',
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
                marginBottom: '32px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#94a3b8'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#00D4FF',
                      cursor: 'pointer'
                    }}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={toggleMode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00D4FF',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #00D4FF 0%, #0072FF 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.3)';
                  }
                }}
              >
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
