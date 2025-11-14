import React, { useState, useEffect } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils/mockData';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    systemName: 'Sapharco Sales DMS',
    systemVersion: '1.0.0',
    companyName: 'Sapharco',
    companyAddress: '123 Đường ABC, Quận 1, TP.HCM',
    companyPhone: '02812345678',
    companyEmail: 'info@sapharco.com',
    taxCode: '1234567890',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    orderPrefix: 'ORD',
    customerPrefix: 'NT',
    autoBackup: true,
    backupFrequency: 'daily',
    emailNotifications: true,
    smsNotifications: false,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    enableAnalytics: true
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadSettings = () => {
    const stored = getFromLocalStorage('adminSettings', null);
    if (stored) {
      setSettings({ ...settings, ...stored });
    }
  };

  const handleChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
    setSaved(false);
  };

  const handleSave = () => {
    saveToLocalStorage('adminSettings', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn reset về cài đặt mặc định?')) {
      localStorage.removeItem('adminSettings');
      loadSettings();
    }
  };

  const tabs = [
    { id: 'general', label: '⚙️ Chung', icon: '⚙️' },
    { id: 'company', label: '🏢 Công ty', icon: '🏢' },
    { id: 'notifications', label: '🔔 Thông báo', icon: '🔔' },
    { id: 'security', label: '🔒 Bảo mật', icon: '🔒' },
    { id: 'advanced', label: '🔧 Nâng cao', icon: '🔧' }
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Cài đặt hệ thống
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666'
          }}>
            Quản lý cấu hình và thiết lập hệ thống
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#1a1a2e'
            }}
          >
            🔄 Reset
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: saved 
                ? '#10b981' 
                : 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {saved ? '✓ Đã lưu' : '💾 Lưu cài đặt'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: isMobile ? '12px' : '16px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: isMobile ? '10px 16px' : '12px 20px',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, #1a5ca2, #3eb4a8)' 
                : '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === tab.id ? '#fff' : '#1a1a2e',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: isMobile ? '20px' : '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div>
            <h2 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a2e'
            }}>
              ⚙️ Cài đặt chung
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Tên hệ thống
                </label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => handleChange('systemName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Phiên bản
                  </label>
                  <input
                    type="text"
                    value={settings.systemVersion}
                    onChange={(e) => handleChange('systemVersion', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Múi giờ
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Tiền tệ
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="VND">VND (₫)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Ngôn ngữ
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Tiền tố đơn hàng
                  </label>
                  <input
                    type="text"
                    value={settings.orderPrefix}
                    onChange={(e) => handleChange('orderPrefix', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Tiền tố khách hàng
                  </label>
                  <input
                    type="text"
                    value={settings.customerPrefix}
                    onChange={(e) => handleChange('customerPrefix', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Settings */}
        {activeTab === 'company' && (
          <div>
            <h2 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a2e'
            }}>
              🏢 Thông tin công ty
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Tên công ty
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Địa chỉ
                </label>
                <textarea
                  value={settings.companyAddress}
                  onChange={(e) => handleChange('companyAddress', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={settings.companyPhone}
                    onChange={(e) => handleChange('companyPhone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleChange('companyEmail', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mã số thuế
                </label>
                <input
                  type="text"
                  value={settings.taxCode}
                  onChange={(e) => handleChange('taxCode', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div>
            <h2 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a2e'
            }}>
              🔔 Cài đặt thông báo
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '4px'
                  }}>
                    Email thông báo
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    Gửi thông báo qua email
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '26px'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.emailNotifications ? '#10b981' : '#ccc',
                    borderRadius: '26px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: '3px',
                      bottom: '3px',
                      background: '#fff',
                      borderRadius: '50%',
                      transition: '0.3s',
                      transform: settings.emailNotifications ? 'translateX(24px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '4px'
                  }}>
                    SMS thông báo
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    Gửi thông báo qua SMS
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '26px'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.smsNotifications ? '#10b981' : '#ccc',
                    borderRadius: '26px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: '3px',
                      bottom: '3px',
                      background: '#fff',
                      borderRadius: '50%',
                      transition: '0.3s',
                      transform: settings.smsNotifications ? 'translateX(24px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div>
            <h2 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a2e'
            }}>
              🔒 Cài đặt bảo mật
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Số lần đăng nhập sai tối đa
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Sau {settings.maxLoginAttempts} lần đăng nhập sai, tài khoản sẽ bị khóa tạm thời
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Thời gian hết hạn phiên (phút)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Phiên đăng nhập sẽ tự động hết hạn sau {settings.sessionTimeout} phút không hoạt động
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === 'advanced' && (
          <div>
            <h2 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a2e'
            }}>
              🔧 Cài đặt nâng cao
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '4px'
                  }}>
                    Tự động sao lưu
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    Tự động sao lưu dữ liệu định kỳ
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '26px'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => handleChange('autoBackup', e.target.checked)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.autoBackup ? '#10b981' : '#ccc',
                    borderRadius: '26px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: '3px',
                      bottom: '3px',
                      background: '#fff',
                      borderRadius: '50%',
                      transition: '0.3s',
                      transform: settings.autoBackup ? 'translateX(24px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
              </div>

              {settings.autoBackup && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Tần suất sao lưu
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleChange('backupFrequency', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="hourly">Mỗi giờ</option>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '4px'
                  }}>
                    Phân tích dữ liệu
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    Thu thập dữ liệu để cải thiện dịch vụ
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '26px'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.enableAnalytics}
                    onChange={(e) => handleChange('enableAnalytics', e.target.checked)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: settings.enableAnalytics ? '#10b981' : '#ccc',
                    borderRadius: '26px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: '3px',
                      bottom: '3px',
                      background: '#fff',
                      borderRadius: '50%',
                      transition: '0.3s',
                      transform: settings.enableAnalytics ? 'translateX(24px)' : 'translateX(0)'
                    }}></span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;

