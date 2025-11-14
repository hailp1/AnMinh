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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5ca2 0%, #3eb4a8 50%, #e5aa42 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'pulse 20s ease-in-out infinite'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '40px 30px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header with Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <button 
            onClick={handleBackClick} 
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(26, 92, 162, 0.1)',
              border: 'none',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#1a5ca2',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(26, 92, 162, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(26, 92, 162, 0.1)'}
          >
            ←
          </button>

          <img 
            src="/image/logo.png" 
            alt="Sapharco Sales" 
            style={{
              maxWidth: '120px',
              height: 'auto',
              marginBottom: '15px'
            }}
          />
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1a5ca2',
            margin: '0 0 8px 0'
          }}>
            Sapharco Sales
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            Đăng nhập vào tài khoản của bạn
          </p>
        </div>

        {/* Hero Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: '36px',
            boxShadow: '0 8px 24px rgba(26, 92, 162, 0.3)'
          }}>
            {showSuccess ? (
              <div style={{ color: '#fff', fontSize: '40px' }}>✓</div>
            ) : (
              <div style={{ color: '#fff' }}>🔐</div>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div>
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '25px'
          }}>
            {showSuccess ? 'Đăng nhập thành công! 🎉' : 'Chào mừng trở lại'}
          </div>
          
          {!showSuccess && (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1a5ca2'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  maxLength={12}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1a5ca2'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
              </div>

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
                    : '0 4px 12px rgba(26, 92, 162, 0.3)',
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
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button 
                  type="button"
                  onClick={() => navigateWithTransition('/forgot-password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1a5ca2',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>
            </form>
          )}

          {showSuccess && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#f0fdf4',
              borderRadius: '12px',
              color: '#16a34a'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>Chuyển hướng đến trang chủ...</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showSuccess && (
          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: '0 0 10px 0'
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
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(26, 92, 162, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(26, 92, 162, 0.1)';
              }}
            >
              Đăng ký ngay
            </button>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default Login;
