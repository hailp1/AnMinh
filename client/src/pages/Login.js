import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';

const Login = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { navigateWithTransition } = usePageTransition();

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Format phone number if it's phone field
    if (e.target.name === 'phone') {
      value = formatPhoneNumber(value);
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Format phone number
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return cleaned.slice(0, 10).replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPhone = formData.phone.replace(/\s/g, '');
    const result = await login(cleanPhone, formData.password);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigateWithTransition(result.redirect || '/home');
      }, 1000);
    } else {
      // Nếu số điện thoại chưa tồn tại, tự động chuyển sang đăng ký
      if (result.phoneNotExists) {
        // Hiển thị thông báo chuyển hướng
        setError('Số điện thoại chưa được đăng ký. Đang chuyển đến trang đăng ký...');
        
        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          setLoading(false);
          navigateWithTransition('/register', { 
            state: { 
              phone: cleanPhone,
              fromLogin: true,
              message: 'Số điện thoại chưa được đăng ký. Chúng tôi sẽ giúp bạn tạo tài khoản mới! 🎉'
            }
          });
        }, 2000);
        return;
      }
      
      setError(result.message);
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigateWithTransition('/');
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1,
        maxHeight: '95vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header with Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          flexShrink: 0
        }}>
          <button 
            onClick={handleBackClick} 
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(26, 92, 162, 0.15)',
              border: 'none',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#1a5ca2',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(26, 92, 162, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(26, 92, 162, 0.25)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(26, 92, 162, 0.15)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ←
          </button>

          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            padding: '15px',
            boxShadow: '0 8px 24px rgba(26, 92, 162, 0.15)'
          }}>
            <img 
              src="/image/logo.png" 
              alt="Sapharco Sales" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a1a2e',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Sapharco Sales
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#374151',
            margin: 0,
            fontWeight: '500'
          }}>
            Đăng nhập vào tài khoản
          </p>
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {!showSuccess && (
            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {error && (
                <div style={{
                  padding: '10px 12px',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#dc2626',
                  fontSize: '13px',
                  flexShrink: 0
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                <label style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                  marginBottom: '8px'
                }}>
                  <span style={{ marginRight: '8px' }}>📱</span>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901 234 567"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a5ca2';
                    e.target.style.boxShadow = '0 0 0 3px rgba(26, 92, 162, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  maxLength={12}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                <label style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                  marginBottom: '8px'
                }}>
                  <span style={{ marginRight: '8px' }}>🔒</span>
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a5ca2';
                    e.target.style.boxShadow = '0 0 0 3px rgba(26, 92, 162, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              <div style={{ marginTop: 'auto', flexShrink: 0 }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: loading 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: loading 
                      ? 'none' 
                      : '0 6px 20px rgba(26, 92, 162, 0.4)',
                    marginBottom: '15px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(26, 92, 162, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(26, 92, 162, 0.3)';
                    }
                  }}
                >
                  {loading ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>Đang đăng nhập...</span>
                    </div>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>

                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <button 
                    type="button"
                    onClick={() => navigateWithTransition('/forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1a5ca2',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: '6px',
                      fontWeight: '500'
                    }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <div style={{
                  paddingTop: '20px',
                  borderTop: '2px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#374151',
                    margin: '0 0 12px 0',
                    fontWeight: '500'
                  }}>
                    Chưa có tài khoản?
                  </p>
                  <button 
                    onClick={() => navigateWithTransition('/register')}
                    style={{
                      background: 'rgba(26, 92, 162, 0.1)',
                      border: '2px solid #1a5ca2',
                      color: '#1a5ca2',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(26, 92, 162, 0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(26, 92, 162, 0.1)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </form>
          )}

          {showSuccess && (
            <div style={{
              textAlign: 'center',
              padding: '15px',
              background: '#f0fdf4',
              borderRadius: '10px',
              color: '#16a34a',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>Chuyển hướng đến trang chủ...</p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
