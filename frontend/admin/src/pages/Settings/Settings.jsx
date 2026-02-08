// frontend/admin/src/pages/Settings/Settings.jsx
import React, { useState } from 'react';
import { 
  Save, 
  Database, 
  Shield, 
  Bell, 
  Mail,
  Server,
  Globe,
  Key,
  Users,
  Lock
} from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'EduChain Platform',
    siteUrl: 'https://educhain.edu.vn',
    adminEmail: 'admin@educhain.edu.vn',
    supportEmail: 'support@educhain.edu.vn',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    maintenanceMode: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    ipWhitelist: '',
    apiRateLimit: 1000
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@educhain.edu.vn',
    smtpPassword: '••••••••',
    fromName: 'EduChain Platform',
    fromEmail: 'noreply@educhain.edu.vn'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newUserRegistration: true,
    systemErrors: true,
    securityAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    backupLocation: '/backups/educhain'
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'backup', label: 'Backup', icon: Server }
  ];

  const handleSave = () => {
    console.log('Saving settings...');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="admin-settings-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">System Settings</h1>
          <p className="settings-subtitle">Configure platform settings and preferences</p>
        </div>
        {saveSuccess && (
          <div className="success-alert">
            <span>✓</span> Settings saved successfully!
          </div>
        )}
      </div>

      <div className="settings-layout">
        {/* Sidebar */}
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

        {/* Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">General Settings</h2>
                <p className="section-description">Configure basic platform settings</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Site Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Site URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={generalSettings.siteUrl}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={generalSettings.adminEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, adminEmail: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Support Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select
                    className="form-select"
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                  >
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
                    <option value="America/New_York">America/New York (GMT-5)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Language</label>
                  <select
                    className="form-select"
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={generalSettings.maintenanceMode}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Enable Maintenance Mode</span>
                  </label>
                  <p className="form-hint">When enabled, only administrators can access the system</p>
                </div>
              </div>

              <div className="section-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Security Settings</h2>
                <p className="section-description">Configure security and access control</p>
              </div>

              <div className="security-settings">
                <div className="security-group">
                  <h3 className="security-group-title">Authentication</h3>
                  <div className="security-options">
                    <div className="security-option">
                      <div className="security-option-info">
                        <div className="security-option-label">Two-Factor Authentication</div>
                        <div className="security-option-description">Require 2FA for all admin users</div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorRequired}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorRequired: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="security-option">
                      <div className="security-option-info">
                        <div className="security-option-label">Session Timeout (minutes)</div>
                        <div className="security-option-description">Auto logout after inactivity</div>
                      </div>
                      <input
                        type="number"
                        className="form-input small"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="security-option">
                      <div className="security-option-info">
                        <div className="security-option-label">Max Login Attempts</div>
                        <div className="security-option-description">Lock account after failed attempts</div>
                      </div>
                      <input
                        type="number"
                        className="form-input small"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="security-group">
                  <h3 className="security-group-title">Password Policy</h3>
                  <div className="security-options">
                    <div className="security-option">
                      <div className="security-option-info">
                        <div className="security-option-label">Minimum Password Length</div>
                      </div>
                      <input
                        type="number"
                        className="form-input small"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="security-option">
                      <div className="security-option-info">
                        <div className="security-option-label">Require Special Characters</div>
                        <div className="security-option-description">Password must contain symbols</div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={securitySettings.passwordRequireSpecialChar}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireSpecialChar: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="security-group">
                  <h3 className="security-group-title">API Security</h3>
                  <div className="security-options">
                    <div className="security-option">
                      <div className="security-option-info">
                        <div className="security-option-label">API Rate Limit (requests/hour)</div>
                        <div className="security-option-description">Limit API calls per user</div>
                      </div>
                      <input
                        type="number"
                        className="form-input small"
                        value={securitySettings.apiRateLimit}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, apiRateLimit: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={18} />
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Email Configuration</h2>
                <p className="section-description">Configure SMTP settings for email delivery</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">SMTP Host</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Port</label>
                  <input
                    type="number"
                    className="form-input"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">From Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">From Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="test-email-section">
                <button className="btn btn-secondary">
                  <Mail size={18} />
                  Send Test Email
                </button>
              </div>

              <div className="section-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={18} />
                  Save Email Settings
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Notification Settings</h2>
                <p className="section-description">Configure admin email notifications</p>
              </div>

              <div className="notification-groups">
                <div className="notification-group">
                  <h3 className="notification-group-title">System Notifications</h3>
                  <div className="notification-list">
                    <div className="notification-item">
                      <div className="notification-info">
                        <div className="notification-label">New User Registration</div>
                        <div className="notification-description">Get notified when users register</div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.newUserRegistration}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newUserRegistration: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-info">
                        <div className="notification-label">System Errors</div>
                        <div className="notification-description">Critical error alerts</div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.systemErrors}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, systemErrors: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-info">
                        <div className="notification-label">Security Alerts</div>
                        <div className="notification-description">Failed login attempts and suspicious activity</div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.securityAlerts}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, securityAlerts: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="notification-group">
                  <h3 className="notification-group-title">Report Notifications</h3>
                  <div className="notification-list">
                    <div className="notification-item">
                      <div className="notification-info">
                        <div className="notification-label">Daily Reports</div>
                        <div className="notification-description">Receive daily activity summary</div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.dailyReports}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, dailyReports: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-info">
                        <div className="notification-label">Weekly Reports</div>
                        <div className="notification-description">Weekly summary every Monday</div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.weeklyReports}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-info">
                        <div className="notification-label">Monthly Reports</div>
                        <div className="notification-description">Monthly statistics report</div>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notificationSettings.monthlyReports}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, monthlyReports: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={18} />
                  Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Database Management</h2>
                <p className="section-description">Database information and operations</p>
              </div>

              <div className="database-info-cards">
                <div className="database-info-card">
                  <div className="database-card-icon">
                    <Database size={32} />
                  </div>
                  <div className="database-card-content">
                    <div className="database-card-label">Database Size</div>
                    <div className="database-card-value">2.4 GB</div>
                  </div>
                </div>

                <div className="database-info-card">
                  <div className="database-card-icon">
                    <Users size={32} />
                  </div>
                  <div className="database-card-content">
                    <div className="database-card-label">Total Records</div>
                    <div className="database-card-value">12,543</div>
                  </div>
                </div>

                <div className="database-info-card">
                  <div className="database-card-icon">
                    <Server size={32} />
                  </div>
                  <div className="database-card-content">
                    <div className="database-card-label">Server Status</div>
                    <div className="database-card-value status-active">Online</div>
                  </div>
                </div>
              </div>

              <div className="database-actions-section">
                <h3 className="subsection-title">Database Operations</h3>
                <div className="database-actions-grid">
                  <button className="database-action-btn">
                    <Database size={20} />
                    <span>Optimize Database</span>
                  </button>
                  <button className="database-action-btn">
                    <Server size={20} />
                    <span>Check Integrity</span>
                  </button>
                  <button className="database-action-btn">
                    <Save size={20} />
                    <span>Export Database</span>
                  </button>
                  <button className="database-action-btn danger">
                    <Database size={20} />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </div>

              <div className="warning-section">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h4 className="warning-title">Caution</h4>
                  <p className="warning-text">
                    Database operations can affect system performance. 
                    It's recommended to perform these actions during low-traffic periods.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Backup Configuration</h2>
                <p className="section-description">Configure automatic backup settings</p>
              </div>

              <div className="backup-status-card">
                <div className="backup-status-header">
                  <h3>Last Backup</h3>
                  <span className="backup-status-badge success">Successful</span>
                </div>
                <div className="backup-status-info">
                  <div className="backup-info-item">
                    <span className="backup-info-label">Date:</span>
                    <span className="backup-info-value">February 5, 2026 02:00 AM</span>
                  </div>
                  <div className="backup-info-item">
                    <span className="backup-info-label">Size:</span>
                    <span className="backup-info-value">2.4 GB</span>
                  </div>
                  <div className="backup-info-item">
                    <span className="backup-info-label">Location:</span>
                    <span className="backup-info-value">/backups/educhain/2026-02-05.sql</span>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup}
                      onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Enable Automatic Backup</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Backup Frequency</label>
                  <select
                    className="form-select"
                    value={backupSettings.backupFrequency}
                    onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                    disabled={!backupSettings.autoBackup}
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Backup Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={backupSettings.backupTime}
                    onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })}
                    disabled={!backupSettings.autoBackup}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Retention Period (days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={backupSettings.retentionDays}
                    onChange={(e) => setBackupSettings({ ...backupSettings, retentionDays: parseInt(e.target.value) })}
                    disabled={!backupSettings.autoBackup}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Backup Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={backupSettings.backupLocation}
                    onChange={(e) => setBackupSettings({ ...backupSettings, backupLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="backup-actions">
                <button className="btn btn-secondary">
                  <Server size={18} />
                  Create Backup Now
                </button>
                <button className="btn btn-secondary">
                  <Download size={18} />
                  Download Latest Backup
                </button>
              </div>

              <div className="section-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={18} />
                  Save Backup Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}