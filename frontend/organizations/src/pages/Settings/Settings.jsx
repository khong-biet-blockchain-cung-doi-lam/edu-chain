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
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
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
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account preferences and security</p>
        </div>
        {saveSuccess && (
          <div className="success-message">
            <Check size={18} />
            Settings saved successfully!
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
                <h2 className="section-title">Account Information</h2>
                <p className="section-description">Update your account details and preferences</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={accountSettings.fullName}
                    onChange={(e) => setAccountSettings({ ...accountSettings, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={accountSettings.email}
                    onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={accountSettings.phone}
                    onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Timezone</label>
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
                  <label className="form-label">Language</label>
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
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Password Settings */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Change Password</h2>
                <p className="section-description">Ensure your account is using a strong password</p>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="form-grid-single">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
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
                    <label className="form-label">New Password</label>
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
                    <span className="form-hint">Must be at least 8 characters</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
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
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Notification Preferences</h2>
                <p className="section-description">Manage how you receive notifications</p>
              </div>

              <div className="notification-group">
                <h3 className="notification-group-title">Email Notifications</h3>
                <div className="notification-list">
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">New Applications</div>
                      <div className="notification-description">Get notified when students apply for scholarships</div>
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
                      <div className="notification-label">Application Updates</div>
                      <div className="notification-description">Updates on application status changes</div>
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
                      <div className="notification-label">Weekly Report</div>
                      <div className="notification-description">Receive weekly summary of activity</div>
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
                      <div className="notification-label">Marketing Emails</div>
                      <div className="notification-description">Updates about new features and tips</div>
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
                <h3 className="notification-group-title">Push Notifications</h3>
                <div className="notification-list">
                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-label">New Applications</div>
                      <div className="notification-description">Browser notifications for new applications</div>
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
                      <div className="notification-label">Application Approved</div>
                      <div className="notification-description">When an application is approved</div>
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
                      <div className="notification-label">System Updates</div>
                      <div className="notification-description">Platform updates and maintenance</div>
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
                <h2 className="section-title">Security Settings</h2>
                <p className="section-description">Manage your account security preferences</p>
              </div>

              <div className="security-list">
                <div className="security-item">
                  <div className="security-info">
                    <div className="security-label">Two-Factor Authentication</div>
                    <div className="security-description">
                      Add an extra layer of security to your account
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
                    <div className="security-label">Login Alerts</div>
                    <div className="security-description">
                      Get notified when there's a login from a new device
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
                    <div className="security-label">Session Timeout</div>
                    <div className="security-description">
                      Automatically log out after inactivity
                    </div>
                  </div>
                  <select
                    className="form-select"
                    style={{ width: '150px' }}
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              <div className="danger-zone">
                <h3 className="danger-zone-title">Danger Zone</h3>
                <div className="danger-zone-content">
                  <div className="danger-item">
                    <div>
                      <div className="danger-label">Deactivate Account</div>
                      <div className="danger-description">
                        Temporarily disable your account
                      </div>
                    </div>
                    <button className="btn btn-danger-outline">Deactivate</button>
                  </div>
                  <div className="danger-item">
                    <div>
                      <div className="danger-label">Delete Account</div>
                      <div className="danger-description">
                        Permanently delete your account and all data
                      </div>
                    </div>
                    <button className="btn btn-danger">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Billing & Subscription</h2>
                <p className="section-description">Manage your subscription and payment methods</p>
              </div>

              <div className="billing-info-card">
                <div className="billing-plan">
                  <div className="plan-badge">Pro Plan</div>
                  <div className="plan-price">$99/month</div>
                  <div className="plan-description">
                    Unlimited scholarships • Priority support • Advanced analytics
                  </div>
                </div>
                <button className="btn btn-secondary">Change Plan</button>
              </div>

              <div className="payment-methods">
                <h3 className="subsection-title">Payment Methods</h3>
                <div className="payment-card">
                  <div className="card-icon">💳</div>
                  <div className="card-details">
                    <div className="card-brand">Visa ending in 4242</div>
                    <div className="card-expiry">Expires 12/2025</div>
                  </div>
                  <div className="card-badge">Default</div>
                </div>
                <button className="btn btn-secondary">
                  <Plus size={18} />
                  Add Payment Method
                </button>
              </div>

              <div className="billing-history">
                <h3 className="subsection-title">Billing History</h3>
                <div className="invoice-list">
                  <div className="invoice-item">
                    <div className="invoice-date">Feb 1, 2026</div>
                    <div className="invoice-description">Pro Plan - Monthly</div>
                    <div className="invoice-amount">$99.00</div>
                    <button className="btn btn-link">Download</button>
                  </div>
                  <div className="invoice-item">
                    <div className="invoice-date">Jan 1, 2026</div>
                    <div className="invoice-description">Pro Plan - Monthly</div>
                    <div className="invoice-amount">$99.00</div>
                    <button className="btn btn-link">Download</button>
                  </div>
                  <div className="invoice-item">
                    <div className="invoice-date">Dec 1, 2025</div>
                    <div className="invoice-description">Pro Plan - Monthly</div>
                    <div className="invoice-amount">$99.00</div>
                    <button className="btn btn-link">Download</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}