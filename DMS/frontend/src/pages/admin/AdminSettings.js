import React, { useState, useEffect } from 'react';
import { systemAPI, usersAPI } from '../../services/api';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // GENERAL SETTINGS STATE
  const [settings, setSettings] = useState({
    company_name: '',
    company_slogan: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    notify_email_orders: '0',
    notify_sys_alerts: '0',
    notify_low_stock: '0',
    auto_backup: '0'
  });

  // ACCOUNT SETTINGS STATE
  const [adminUser, setAdminUser] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadSettings();
    loadUserProfile();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemAPI.getSettings();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = () => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      const user = JSON.parse(stored);
      setAdminUser(user);
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? (checked ? '1' : '0') : value;
    setSettings({ ...settings, [name]: val });
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await systemAPI.updateSettings(settings);
      alert('Đã lưu cấu hình hệ thống thành công! ✅');
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu cấu hình ❌');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp! ❌');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone
      };
      if (profileForm.newPassword) {
        updateData.password = profileForm.newPassword;
      }

      await usersAPI.update(adminUser.id, updateData);

      const updatedUser = { ...adminUser, ...updateData };
      delete updatedUser.password;
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));

      alert('Đã cập nhật hồ sơ Admin thành công! ✅');
      setProfileForm(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error) {
      console.error(error);
      alert('Lỗi khi cập nhật hồ sơ: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/reports/export?type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AM_DMS_Export_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Xuất dữ liệu thất bại: ' + error.message);
    }
  };

  const handleBackupSQL = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/system/backup/sql', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Backup failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AM_DMS_Backup_${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Sao lưu SQL thất bại: ' + error.message);
    }
  };

  const handleGoogleDriveConnect = () => {
    const clientId = prompt('Vui lòng nhập Google Client ID của bạn (nếu có) để kết nối:');
    if (clientId) {
      alert('Đã lưu cấu hình Google Drive (Giả lập). Tính năng upload tự động sẽ được kích hoạt khi có token hợp lệ.');
    } else {
      alert('Bạn có thể tải file SQL về máy và upload thủ công lên Drive.');
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B', marginBottom: '8px' }}>Cài đặt Hệ thống</h1>
          <p style={{ color: '#64748B' }}>Quản lý toàn diện cấu hình, tài khoản và dữ liệu hệ thống DMS.</p>
        </div>
        <button onClick={activeTab === 'general' || activeTab === 'notifications' ? saveSettings : saveProfile}
          disabled={saving}
          style={{ padding: '12px 24px', borderRadius: '8px', background: saving ? '#94A3B8' : '#3B82F6', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', display: activeTab === 'backup' ? 'none' : 'block' }}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', marginBottom: '32px' }}>
        {[
          { id: 'general', label: 'Thông tin chung', icon: '🏢' },
          { id: 'account', label: 'Tài khoản Admin', icon: '👤' },
          { id: 'notifications', label: 'Cấu hình Thông báo', icon: '🔔' },
          { id: 'backup', label: 'Dữ liệu & Backup', icon: '💾' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? '#EFF6FF' : 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
              color: activeTab === tab.id ? '#3B82F6' : '#64748B',
              fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
              fontSize: '15px',
              display: 'flex', gap: '8px', alignItems: 'center'
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {loading ? <div>Đang tải...</div> : (
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '32px' }}>

          {/* TAB GENERAL */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', margin: 0 }}>Thông tin Doanh nghiệp</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Logo URL</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '8px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {settings.logo_url ? <img src={settings.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px', color: '#94A3B8' }}>🖼️</span>}
                  </div>
                  <input type="text" name="logo_url" value={settings.logo_url} onChange={handleSettingChange} className="input-field" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Tên Công ty</label>
                <input type="text" name="company_name" value={settings.company_name} onChange={handleSettingChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Slogan</label>
                <input type="text" name="company_slogan" value={settings.company_slogan} onChange={handleSettingChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Email Liên hệ</label>
                <input type="text" name="contact_email" value={settings.contact_email} onChange={handleSettingChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Số điện thoại</label>
                <input type="text" name="contact_phone" value={settings.contact_phone} onChange={handleSettingChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>
            </div>
          )}

          {/* TAB ACCOUNT */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', margin: 0 }}>Hồ sơ Admin & Bảo mật</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Họ và Tên</label>
                <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Email</label>
                <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Số điện thoại</label>
                <input type="text" name="phone" value={profileForm.phone} onChange={handleProfileChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>

              <h4 style={{ marginTop: '24px', marginBottom: 0, color: '#EF4444' }}>Thay đổi Mật khẩu</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Mật khẩu mới</label>
                <input type="password" name="newPassword" value={profileForm.newPassword} onChange={handleProfileChange} placeholder="Để trống nếu không đổi" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', gap: '24px', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: '#334155' }}>Xác nhận khẩu</label>
                <input type="password" name="confirmPassword" value={profileForm.confirmPassword} onChange={handleProfileChange} placeholder="Nhập lại mật khẩu mới" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }} />
              </div>
            </div>
          )}

          {/* TAB NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', margin: 0 }}>Cấu hình Thông báo Hệ thống</h3>

              <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <input type="checkbox" name="notify_email_orders" checked={settings.notify_email_orders === '1'} onChange={handleSettingChange} style={{ width: '20px', height: '20px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#1E293B' }}>Thông báo Đơn hàng mới qua Email</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Gửi email cho Admin và Sale Admin khi có đơn hàng mới được tạo.</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <input type="checkbox" name="notify_low_stock" checked={settings.notify_low_stock === '1'} onChange={handleSettingChange} style={{ width: '20px', height: '20px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#1E293B' }}>Cảnh báo Tồn kho thấp</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Hiển thị cảnh báo và gửi thông báo khi sản phẩm dưới mức tồn kho tối thiểu.</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <input type="checkbox" name="notify_sys_alerts" checked={settings.notify_sys_alerts === '1'} onChange={handleSettingChange} style={{ width: '20px', height: '20px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#1E293B' }}>Nhận Thông báo Bảo trì</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Nhận thông báo từ đội ngũ kỹ thuật về lịch bảo trì hoặc nâng cấp hệ thống.</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <input type="checkbox" name="auto_backup" checked={settings.auto_backup === '1'} onChange={handleSettingChange} style={{ width: '20px', height: '20px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#1E293B' }}>Sao lưu tự động hàng ngày</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Hệ thống tự động sao lưu dữ liệu vào 00:00 mỗi ngày.</div>
                </div>
              </label>
            </div>
          )}

          {/* TAB BACKUP */}
          {activeTab === 'backup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', margin: 0 }}>Sao lưu & Phục hồi</h3>

              {/* SQL Backup */}
              <div style={{ padding: '24px', background: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#0369A1' }}>Sao lưu Cơ sở dữ liệu (SQL)</h4>
                <p style={{ color: '#334155', marginBottom: '16px' }}>
                  Tải về bản sao lưu đầy đủ định dạng SQL. Bạn có thể dùng file này để khôi phục hệ thống khi cần.
                </p>
                <button onClick={handleBackupSQL} style={{ background: '#0284C7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💾</span> Tải file SQL Backup
                </button>
              </div>

              {/* Google Drive */}
              <div style={{ padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>📁</span>
                  <h4 style={{ margin: 0, color: '#1E293B' }}>Đồng bộ Google Drive</h4>
                </div>
                <p style={{ color: '#64748B', marginBottom: '16px' }}>
                  Kết nối tài khoản Google để tự động tải bản sao lưu lên Drive của bạn.
                </p>
                <button onClick={handleGoogleDriveConnect} style={{ background: '#fff', color: '#475569', border: '1px solid #CBD5E1', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#EA4335' }}>G</span> Kết nối Tài khoản Google
                </button>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '12px' }}>
                  *Lưu ý: Bạn có thể tải file SQL về máy và upload thủ công nếu chưa cấu hình API.
                </p>
              </div>

              {/* Excel Exports */}
              <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1E293B' }}>Xuất Dữ liệu Excel</h4>
                <p style={{ color: '#64748B', marginBottom: '24px' }}>Tải xuống dữ liệu dưới dạng Excel (.xlsx).</p>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => handleExportData('full')} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📥</span> Export Full Excel
                  </button>
                  <button onClick={() => handleExportData('sales')} style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📊</span> Export Sales Excel
                  </button>
                </div>
              </div>

              <div style={{ padding: '24px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#991B1B' }}>Vùng Nguy hiểm</h4>
                <p style={{ color: '#7F1D1D', marginBottom: '24px' }}>Các tác vụ này không thể hoàn tác. Hãy cẩn trọng.</p>
                <button disabled style={{ background: '#EF4444', opacity: 0.6, cursor: 'not-allowed', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }}>
                  🗑️ Xóa sạch dữ liệu (Reset System)
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminSettings;
