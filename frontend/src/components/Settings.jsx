import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import UserProfileDropdown from './UserProfileDropdown';
import Avatar from './Avatar';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const { showSuccess, showError, showWarning, showInfo, showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Profile settings state
  const [fullName, setFullName] = useState('Dr. John Smith');
  const [email, setEmail] = useState('john.smith@medicare.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [department, setDepartment] = useState('Cardiology');

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Security settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Preferences state
  const [lightMode, setLightMode] = useState(true);
  const [language, setLanguage] = useState('en-US');
  
  // Additional state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [hasChanges, setHasChanges] = useState(false);

  const handleLogout = () => {
    showConfirm(
      'Are you sure you want to logout?',
      async () => {
        await logout();
        navigate('/login');
      }
    );
  };

  // Dynamic menu items based on user role
  const getMenuItems = () => {
    if (user?.role === 'doctor') {
      return [
        { path: '/doctor/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/doctor/patients', icon: '👥', label: 'My Patients' },
        { path: '/doctor/appointments', icon: '📅', label: 'Appointments' },
        { path: '/doctor/settings', icon: '⚙️', label: 'Settings' }
      ];
    }
    return [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/patients', icon: '👥', label: 'Patients' },
      { path: '/appointments', icon: '📅', label: 'Appointments' },
      { path: '/doctors', icon: '👨‍⚕️', label: 'Doctors' },
      { path: '/medical-records', icon: '📋', label: 'Medical Records' },
      { path: '/reports', icon: '📈', label: 'Reports' },
      { path: '/settings', icon: '⚙️', label: 'Settings' }
    ];
  };

  const menuItems = getMenuItems();

  const isActive = (path) => location.pathname === path;

  const handleSaveChanges = () => {
    const changes = [];
    
    if (fullName !== 'Dr. John Smith') changes.push('Full Name');
    if (email !== 'john.smith@medicare.com') changes.push('Email');
    if (phone !== '+1 (555) 123-4567') changes.push('Phone');
    if (department !== 'Cardiology') changes.push('Department');
    
    if (changes.length > 0) {
      showSuccess(`Settings saved successfully!\n\nUpdated: ${changes.join(', ')}\n\nNotifications: Email ${emailNotifications ? 'ON' : 'OFF'}, SMS ${smsAlerts ? 'ON' : 'OFF'}, Push ${pushNotifications ? 'ON' : 'OFF'}\n\nTheme: ${lightMode ? 'Light Mode' : 'Dark Mode'}\nLanguage: ${language}`);
      setHasChanges(false);
    } else {
      showInfo('No changes detected.\n\nYour notification preferences and theme settings are active.');
    }
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      showError('Please fill in both password fields.');
      return;
    }
    
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters long.');
      return;
    }
    
    if (currentPassword === newPassword) {
      showWarning('New password must be different from current password.');
      return;
    }
    
    showSuccess('Password updated successfully!\n\nYour password has been changed. Please use your new password for future logins.');
    setCurrentPassword('');
    setNewPassword('');
  };
  
  
  const handleEnable2FA = () => {
    if (is2FAEnabled) {
      showConfirm(
        'This will reduce your account security. Are you sure you want to disable 2FA?',
        () => {
          setIs2FAEnabled(false);
          showSuccess('Two-Factor Authentication has been disabled for your account.');
        }
      );
    } else {
      showConfirm(
        "You'll receive a verification code via email whenever you log in from a new device. Continue?",
        () => {
          setIs2FAEnabled(true);
          showSuccess('Two-Factor Authentication is now active. A verification code will be sent to your email on next login.');
        }
      );
    }
  };

  return (
    <div className="settings-page-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">💙</div>
            <div className="logo-text">
              <h3>MediCare Pro</h3>
              <p>Smart Healthcare Management</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Settings</h1>
            <p>Manage your account preferences and security settings</p>
          </div>
          <div className="header-actions">
            <UserProfileDropdown />
          </div>
        </header>

        <div className="settings-page">
          {/* Profile Settings */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-icon">👤</span>
                <h2>Profile Settings</h2>
              </div>
              <p className="section-description">Update your personal information and profile picture</p>
            </div>

            <div className="settings-card">
              <div className="profile-photo-section">
                <Avatar name={user?.first_name || user?.username || fullName} size="xxlarge" />
                <p className="avatar-note">Your profile avatar is generated from your name</p>
              </div>

              <div className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setHasChanges(true); }}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setHasChanges(true); }}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setHasChanges(true); }}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select value={department} onChange={(e) => { setDepartment(e.target.value); setHasChanges(true); }}>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-icon">🔔</span>
                <h2>Notification Settings</h2>
              </div>
              <p className="section-description">Configure how you receive alerts and notifications</p>
            </div>

            <div className="settings-card">
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Email Notifications</h4>
                  <p>Receive notifications via email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>SMS Alerts</h4>
                  <p>Receive urgent alerts via SMS</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Push Notifications</h4>
                  <p>Browser and mobile push notifications</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-icon">🔒</span>
                <h2>Security Settings</h2>
              </div>
              <p className="section-description">Manage your account security and authentication</p>
            </div>

            <div className="settings-card">
              <div className="security-item">
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>{is2FAEnabled ? '✅ 2FA is currently enabled' : 'Add an extra layer of security to your account'}</p>
                </div>
                <button 
                  className={`btn-enable-2fa ${is2FAEnabled ? 'enabled' : ''}`}
                  onClick={handleEnable2FA}
                >
                  {is2FAEnabled ? '🔓 Disable 2FA' : '🔐 Enable 2FA'}
                </button>
              </div>

              <div className="password-section">
                <h4>Change Password</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <button className="btn-update-password" onClick={handleUpdatePassword}>
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-icon">⚙️</span>
                <h2>Preferences</h2>
              </div>
              <p className="section-description">Customize your application experience</p>
            </div>

            <div className="settings-card">
              <div className="preference-row">
                <div className="preference-item">
                  <h4>Theme Mode</h4>
                  <div className="theme-toggle">
                    <span className="theme-icon">☀️</span>
                    <span>Light Mode</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={lightMode}
                        onChange={(e) => setLightMode(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="preference-item">
                  <h4>Language</h4>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en-US">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-actions">
            <button className="btn-save-changes" onClick={handleSaveChanges}>
              💾 Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
