import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import NewDoctorModal from './NewDoctorModal';
import Avatar from './Avatar';
import axios from 'axios';
import API_URL from '../config/api';
import './Doctors.css';

const Doctors = () => {
  const { user, logout } = useContext(AuthContext);
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDoctorModal, setShowNewDoctorModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    showConfirm(
      'Are you sure you want to logout?',
      async () => {
        await logout();
        navigate('/login');
      }
    );
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/patients', icon: '👥', label: 'Patients' },
    { path: '/appointments', icon: '📅', label: 'Appointments' },
    { path: '/doctors', icon: '👨‍⚕️', label: 'Doctors' },
    { path: '/medical-records', icon: '📋', label: 'Medical Records' },
    { path: '/reports', icon: '📈', label: 'Reports' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/doctors/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDoctors(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = specialization === 'all' || doctor.department === specialization;
    return matchesSearch && matchesSpecialization;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading doctors...
      </div>
    );
  }

  return (
    <div className="doctors-page-wrapper">
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
              onClick={() => navigate(item.path)}
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

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Doctors Directory</h1>
          <div className="header-actions">
            <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
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
          </div>
        </header>

        <div className="doctors-page">
          <div className="page-header">
            <p>Manage and view all registered doctors</p>
            <button 
              className="btn-add-doctor"
              onClick={() => setShowNewDoctorModal(true)}
            >
              + Add Doctor
            </button>
          </div>

          <div className="filters-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
              <option value="all">All Specializations</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="doctors-grid">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-avatar">
                    <Avatar name={`${doctor.first_name} ${doctor.last_name}`} size="xxlarge" />
                    <span className="status-badge available">Available</span>
                  </div>
                  <h3>Dr. {doctor.first_name} {doctor.last_name}</h3>
                  <p className="specialization">{doctor.department || 'General'}</p>
                  <div className="rating">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="reviews">4.8 (127)</p>
                  <div className="doctor-actions">
                    <button className="action-btn view-btn" title="View Profile">
                      <span className="btn-icon">👁️</span>
                      <span>View</span>
                    </button>
                    <button className="action-btn call-btn" title="Call Doctor">
                      <span className="btn-icon">📞</span>
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#666' }}>
                No doctors found
              </p>
            )}
          </div>
        </div>
      </main>

      <NewDoctorModal
        open={showNewDoctorModal}
        onClose={() => setShowNewDoctorModal(false)}
        onCreated={async () => {
          await fetchDoctors();
          setShowNewDoctorModal(false);
        }}
      />
    </div>
  );
};

export default Doctors;
