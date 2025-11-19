import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import Avatar from './Avatar';
import './UserProfileDropdown.css';

const UserProfileDropdown = () => {
  const { user, logout } = useContext(AuthContext);
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = (e) => {
    e.stopPropagation();
    showConfirm(
      'Are you sure you want to logout?',
      async () => {
        await logout();
        navigate('/login');
      }
    );
  };

  return (
    <div className="user-profile-dropdown" onClick={() => setShowProfileMenu(!showProfileMenu)}>
      <Avatar name={user?.first_name || user?.username || 'Admin'} size="medium" />
      <span>{user?.first_name || user?.username || 'Admin'}</span>
      <span className="dropdown-icon">▼</span>
      
      {showProfileMenu && (
        <div className="profile-dropdown">
          <div className="dropdown-item" onClick={() => navigate('/settings')}>
            <span>⚙️</span> Settings
          </div>
          <div className="dropdown-item" onClick={() => navigate('/profile')}>
            <span>👤</span> My Profile
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-item logout-item" onClick={handleLogout}>
            <span>🚪</span> Logout
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
