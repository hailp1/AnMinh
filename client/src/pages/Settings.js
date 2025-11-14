import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageTransition } from '../hooks/usePageTransition';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { navigateWithTransition } = usePageTransition();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehicleModel: '',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      shareLocation: true,
      shareProfile: false,
      shareActivity: false
    },
    preferences: {
      language: 'vi',
      currency: 'VND',
      units: 'metric',
      theme: 'auto'
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        vehicleType: user.vehicleType || '',
        vehicleModel: user.vehicleModel || '',
        notifications: {
          email: user.notifications?.email ?? true,
          push: user.notifications?.push ?? true,
          sms: user.notifications?.sms ?? false,
          marketing: user.notifications?.marketing ?? false
        },
        privacy: {
          shareLocation: user.privacy?.shareLocation ?? true,
          shareProfile: user.privacy?.shareProfile ?? false,
          shareActivity: user.privacy?.shareActivity ?? false
        },
        preferences: {
          language: user.preferences?.language || 'vi',
          currency: user.preferences?.currency || 'VND',
          units: user.preferences?.units || 'metric',
          theme: user.preferences?.theme || 'auto'
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        notifications: formData.notifications,
        privacy: formData.privacy,
        preferences: formData.preferences
      };

      updateUser(updatedUser);
      setMessage('✅ Settings saved successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save settings. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        // Handle account deletion
        logout();
        navigateWithTransition('/');
      }
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'account', name: 'Account', icon: '🔐' }
  ];

  if (!user) {
    return (
      <div className="settings-container">
        <div className="settings-error">
          <h2>❌ Access Denied</h2>
          <p>Please log in to access settings.</p>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div className="settings-header-content">
          <Link to="/home" className="back-btn">
            <span className="back-icon">←</span>
          </Link>
          <div className="settings-title-section">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="settings-content">
        {/* Tabs Navigation */}
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-tab-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>👤 Profile Information</h2>
                <p>Update your personal information and vehicle details</p>
              </div>

              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                    disabled
                  />
                  <small className="form-help">Phone number cannot be changed</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select vehicle type</option>
                      <option value="car">Electric Car</option>
                      <option value="motorbike">Electric Motorbike</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vehicle Model</label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., VinFast VF8, Tesla Model 3"
                    />
                  </div>
                </div>

                <div className="user-stats-display">
                  <div className="stat-card">
                    <span className="stat-icon">⭐</span>
                    <div className="stat-info">
                      <span className="stat-value">{user.points || 0}</span>
                      <span className="stat-label">Points</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">🎁</span>
                    <div className="stat-info">
                      <span className="stat-value">{user.invitedFriends || 0}</span>
                      <span className="stat-label">Friends Invited</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">📅</span>
                    <div className="stat-info">
                      <span className="stat-value">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="stat-label">Member Since</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>🔔 Notification Preferences</h2>
                <p>Choose how you want to receive notifications</p>
              </div>

              <div className="settings-form">
                <div className="toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📧 Email Notifications</h4>
                      <p>Receive updates about your charging sessions and account</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.notifications.email}
                        onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📱 Push Notifications</h4>
                      <p>Get instant alerts on your device</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.notifications.push}
                        onChange={(e) => handleNestedChange('notifications', 'push', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>💬 SMS Notifications</h4>
                      <p>Receive text messages for important updates</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.notifications.sms}
                        onChange={(e) => handleNestedChange('notifications', 'sms', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📢 Marketing Communications</h4>
                      <p>Receive promotional offers and news</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.notifications.marketing}
                        onChange={(e) => handleNestedChange('notifications', 'marketing', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>🔒 Privacy Settings</h2>
                <p>Control your privacy and data sharing preferences</p>
              </div>

              <div className="settings-form">
                <div className="toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📍 Share Location</h4>
                      <p>Allow the app to access your location for finding nearby stations</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.privacy.shareLocation}
                        onChange={(e) => handleNestedChange('privacy', 'shareLocation', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>👤 Public Profile</h4>
                      <p>Make your profile visible to other users</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.privacy.shareProfile}
                        onChange={(e) => handleNestedChange('privacy', 'shareProfile', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <h4>📊 Share Activity</h4>
                      <p>Share your charging activity with the community</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.privacy.shareActivity}
                        onChange={(e) => handleNestedChange('privacy', 'shareActivity', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="privacy-info">
                  <div className="info-card">
                    <h4>🛡️ Data Protection</h4>
                    <p>Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>⚙️ App Preferences</h2>
                <p>Customize your app experience</p>
              </div>

              <div className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">🌐 Language</label>
                    <select
                      value={formData.preferences.language}
                      onChange={(e) => handleNestedChange('preferences', 'language', e.target.value)}
                      className="form-select"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">💰 Currency</label>
                    <select
                      value={formData.preferences.currency}
                      onChange={(e) => handleNestedChange('preferences', 'currency', e.target.value)}
                      className="form-select"
                    >
                      <option value="VND">Vietnamese Dong (₫)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="JPY">Japanese Yen (¥)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">📏 Units</label>
                    <select
                      value={formData.preferences.units}
                      onChange={(e) => handleNestedChange('preferences', 'units', e.target.value)}
                      className="form-select"
                    >
                      <option value="metric">Metric (km, kW)</option>
                      <option value="imperial">Imperial (miles, hp)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">🎨 Theme</label>
                    <select
                      value={formData.preferences.theme}
                      onChange={(e) => handleNestedChange('preferences', 'theme', e.target.value)}
                      className="form-select"
                    >
                      <option value="auto">Auto (System)</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>🔐 Account Management</h2>
                <p>Manage your account security and data</p>
              </div>

              <div className="settings-form">
                <div className="account-actions">
                  <div className="action-card">
                    <div className="action-info">
                      <h4>🔑 Change Password</h4>
                      <p>Update your account password for better security</p>
                    </div>
                    <button className="action-btn secondary">
                      Change Password
                    </button>
                  </div>

                  <div className="action-card">
                    <div className="action-info">
                      <h4>📱 Two-Factor Authentication</h4>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <button className="action-btn secondary">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="action-card">
                    <div className="action-info">
                      <h4>📄 Download Data</h4>
                      <p>Export all your account data and activity</p>
                    </div>
                    <button className="action-btn secondary">
                      Download Data
                    </button>
                  </div>

                  <div className="action-card danger">
                    <div className="action-info">
                      <h4>🗑️ Delete Account</h4>
                      <p>Permanently delete your account and all data</p>
                    </div>
                    <button 
                      className="action-btn danger"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>

                <div className="account-info">
                  <div className="info-card">
                    <h4>📊 Account Statistics</h4>
                    <div className="account-stats">
                      <div className="account-stat">
                        <span className="stat-label">Account Type:</span>
                        <span className="stat-value">{user.role === 'STATION_OWNER' ? 'Station Owner' : 'User'}</span>
                      </div>
                      <div className="account-stat">
                        <span className="stat-label">Member Since:</span>
                        <span className="stat-value">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="account-stat">
                        <span className="stat-label">Last Login:</span>
                        <span className="stat-value">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          {message && (
            <div className={`settings-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          <button 
            onClick={handleSave}
            disabled={loading}
            className="save-btn"
          >
            {loading ? (
              <div className="btn-loading">
                <div className="loading-spinner"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <>
                <span className="save-icon">💾</span>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;