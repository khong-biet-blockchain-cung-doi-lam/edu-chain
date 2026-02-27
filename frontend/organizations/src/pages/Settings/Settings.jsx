// frontend/organizations/src/pages/Settings/Settings.jsx
import React, { useState } from 'react';
import { 
  User, Mail, Lock, Bell, Shield, CreditCard, 
  Globe, Save, AlertCircle, Check, Eye, EyeOff 
} from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [accountSettings, setAccountSettings] = useState({
    fullName: 'Sarah Wilson',
    email: 'sarah.wilson@techcorp.com',
    phone: '+1 (555) 987-6543',
    timezone: 'America/Los_Angeles',
    language: 'en'
  });

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      newApplications: true,
      applicationUpdates: true,
      weeklyReport: true,
      marketingEmails: false
    },
    pushNotifications: {
      newApplications: true,
      applicationApproved: true,
      systemUpdates: false
    }
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30'
  });

  const tabs = [
    { id: 'account', label: 'Tài khoản', icon: User },
    { id: 'password', label: 'Mật khẩu', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'billing', label: 'Thanh toán', icon: CreditCard }
  ];

  const handleAccountSave = () => {
    console.log('Saving account settings...', accountSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Changing password...');
    // API call to change password
    setSaveSuccess(true);
    setPasswordSettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleNotificationToggle = (category, setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleSecurityToggle = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Cài đặt</h1>
          <p className="settings-subtitle">Quản lý tùy chọn bảo mật và tài khoản của bạn</p>
        </div>
        {saveSuccess && (
          <div className="success-message">
            <Check size={18} />
            Đã lưu cài đặt thành công!
          </div>
        )}
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Thông tin Tài khoản</h2>
                <p className="section-description">Cập nhật thông tin chi tiết và tùy chọn</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Họ và Tên</label>
                  <input
                    type="text"
                    className="form-input"
                    value={accountSettings.fullName}
                    onChange={(e) => setAccountSettings({ ...accountSettings, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={accountSettings.email}
                    onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số Điện thoại</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={accountSettings.phone}
                    onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Múi giờ</label>
                  <select
                    className="form-select"
                    value={accountSettings.timezone}
                    onChange={(e) => setAccountSettings({ ...accountSettings, timezone: e.target.value })}
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ngôn ngữ</label>
                  <select
                    className="form-select"
                    value={accountSettings.language}
                    onChange={(e) => setAccountSettings({ ...accountSettings, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>

              <div className="section-actions">
                <button onClick={handleAccountSave} className="btn btn-primary">
                  <Save size={18} />
                  Lưu Thay đổi
                </button>
              </div>
            </div>
          )}

          {/* Password Settings */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Đổi Mật khẩu</h2>
                <p className="section-description">Đảm bảo tài khoản của bạn đang sử dụng mật khẩu mạnh</p>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="form-grid-single">
                  <div className="form-group">
                    <label className="form-label">Mật khẩu Hiện tại</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="form-input"
                        value={passwordSettings.currentPassword}
                        onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="password-toggle"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mật khẩu Mới</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-input"
                        value={passwordSettings.newPassword}
                        onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="password-toggle"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <span className="form-hint">Phải có ít nhất 8 ký tự</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Xác nhận Mật khẩu Mới</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordSettings.confirmPassword}
                      onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="section-actions">
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} />
                    Cập nhật Mật khẩu
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Tùy chọn Thông báo</h2>
                <p className="section-description">Quản lý cách bạn nhận thông báo</p>
              </div>

              <div className="notification-group">
                <h3 className="notification-group-title">Thông báo qua Email</h3>
                <div className="notification-list">
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">Hồ sơ Ứng tuyển Mới</div>
                      <div className="notification-description">Nhận thông báo khi sinh viên nộp đơn cho học bổng</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.newApplications}
                        onChange={() => handleNotificationToggle('emailNotifications', 'newApplications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">Cập nhật Hồ sơ Ứng tuyển</div>
                      <div className="notification-description">Cập nhật về sự thay đổi trạng thái hồ sơ</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.applicationUpdates}
                        onChange={() => handleNotificationToggle('emailNotifications', 'applicationUpdates')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">Báo cáo Hàng tuần</div>
                      <div className="notification-description">Nhận bản tóm tắt hoạt động hàng tuần</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.weeklyReport}
                        onChange={() => handleNotificationToggle('emailNotifications', 'weeklyReport')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">Email Tiếp thị</div>
                      <div className="notification-description">Cập nhật về các tính năng mới và các mẹo</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications.marketingEmails}
                        onChange={() => handleNotificationToggle('emailNotifications', 'marketingEmails')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="notification-group">
                <h3 className="notification-group-title">Thông báo Đẩy (Push)</h3>
                <div className="notification-list">
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">Hồ sơ Ứng tuyển Mới</div>
                      <div className="notification-description">Thông báo qua trình duyệt khi có hồ sơ mới</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications.newApplications}
                        onChange={() => handleNotificationToggle('pushNotifications', 'newApplications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">Hồ sơ Được phê duyệt</div>
                      <div className="notification-description">Khi một hồ sơ được chấp nhận</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications.applicationApproved}
                        onChange={() => handleNotificationToggle('pushNotifications', 'applicationApproved')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">Cập nhật Hệ thống</div>
                      <div className="notification-description">Bảo trì và cập nhật nền tảng</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications.systemUpdates}
                        onChange={() => handleNotificationToggle('pushNotifications', 'systemUpdates')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Cài đặt Bảo mật</h2>
                <p className="section-description">Quản lý tùy chọn bảo mật tài khoản cá nhân</p>
              </div>

              <div className="security-list">
                <div className="security-item">
                  <div className="security-info">
                    <div className="security-label">Xác thực Hai Ngôn ngữ (2FA)</div>
                    <div className="security-description">
                      Thêm một lớp bảo mật phụ cho tài khoản của bạn
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={() => handleSecurityToggle('twoFactorAuth')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <div className="security-label">Cảnh báo Đăng nhập</div>
                    <div className="security-description">
                      Nhận thông báo khi có đăng nhập từ một thiết bị mới
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.loginAlerts}
                      onChange={() => handleSecurityToggle('loginAlerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <div className="security-label">Hết hạn Phiên đăng nhập</div>
                    <div className="security-description">
                      Tự động đăng nhập ngắt kết nối sau thời gian không hoạt động
                    </div>
                  </div>
                  <select
                    className="form-select"
                    style={{ width: '150px' }}
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  >
                    <option value="15">15 phút</option>
                    <option value="30">30 phút</option>
                    <option value="60">1 giờ</option>
                    <option value="120">2 giờ</option>
                  </select>
                </div>
              </div>

              <div className="danger-zone">
                <h3 className="danger-zone-title">Khu vực Nguy hiểm</h3>
                <div className="danger-zone-content">
                  <div className="danger-item">
                    <div>
                      <div className="danger-label">Vô hiệu hóa Tài khoản</div>
                      <div className="danger-description">
                        Tạm thời tắt thiết lập cho tài khoản của bạn
                      </div>
                    </div>
                    <button className="btn btn-danger-outline">Vô hiệu hóa</button>
                  </div>
                  <div className="danger-item">
                    <div>
                      <div className="danger-label">Xóa Tài khoản</div>
                      <div className="danger-description">
                        Xóa hoàn toàn tài khoản của bạn và mọi dữ liệu
                      </div>
                    </div>
                    <button className="btn btn-danger">Xóa Tài khoản</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Thanh toán &amp; Gói dịch vụ</h2>
                <p className="section-description">Quản lý gói thanh toán và tài khoản của bạn</p>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '4rem 2rem',
                background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
                borderRadius: '16px', border: '2px dashed #c4b5fd',
                textAlign: 'center', gap: '1.25rem', marginTop: '1rem'
              }}>
                <div style={{
                  width: '72px', height: '72px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  borderRadius: '20px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '2rem',
                  boxShadow: '0 8px 24px rgba(139,92,246,0.3)'
                }}>💳</div>

                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e1b4b', margin: '0 0 0.5rem' }}>
                    Đang phát triển
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto' }}>
                    Tính năng <strong>Thanh toán &amp; Gói dịch vụ</strong> đang được xây dựng. Chúng tôi sẽ thông báo ngay khi sẵn sàng!
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['Quản lý gói dịch vụ', 'Hoá đơn điện tử', 'Đa phương thức TT'].map(f => (
                    <span key={f} style={{
                      background: '#ede9fe', color: '#7c3aed', padding: '0.35rem 0.875rem',
                      borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600'
                    }}>{f}</span>
                  ))}
                </div>

                <div style={{
                  padding: '0.75rem 1.5rem', background: 'white',
                  borderRadius: '10px', border: '1px solid #ddd6fe',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.85rem', color: '#7c3aed', fontWeight: '600'
                }}>
                  🚀 Dự kiến ra mắt trong thời gian tới
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}