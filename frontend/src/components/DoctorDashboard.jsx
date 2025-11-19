import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import Avatar from './Avatar';
import axios from 'axios';
import API_URL from '../config/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    todaysAppointments: 0,
    pendingAppointments: 0
  });
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

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
    { path: '/doctor/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/doctor/patients', icon: '👥', label: 'My Patients' },
    { path: '/doctor/appointments', icon: '📅', label: 'Appointments' },
    { path: '/doctor/settings', icon: '⚙️', label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, appointmentsRes, patientsRes] = await Promise.all([
        axios.get(`${API_URL}/doctor/stats/`, { headers }),
        axios.get(`${API_URL}/doctor/appointments/`, { headers }),
        axios.get(`${API_URL}/doctor/patients/`, { headers })
      ]);

      setStats(statsRes.data.data);

      const appointments = appointmentsRes.data.data || [];
      const today = new Date().toISOString().split('T')[0];
      const todaysApts = appointments.filter(apt => apt.date === today);
      setTodaysAppointments(todaysApts.slice(0, 5));

      const patients = patientsRes.data.data || [];
      setRecentPatients(patients.slice(0, 3));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">💙</div>
            <div className="logo-text">
              <h3>MediCare Pro</h3>
              <p>Doctor Portal</p>
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
          <div className="header-left">
            <h1>Welcome, Dr. {user?.first_name || user?.username}</h1>
            <p>Here's what's happening with your patients today</p>
          </div>
          <div className="header-actions">
            <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <Avatar name={user?.first_name || user?.username || 'Doctor'} size="medium" />
              <span>Dr. {user?.first_name || user?.username}</span>
              <span className="dropdown-icon">▼</span>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-item" onClick={() => navigate('/doctor/settings')}>
                    <span>⚙️</span> Settings
                  </div>
                  <div className="dropdown-item" onClick={() => navigate('/doctor/profile')}>
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

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#EEF2FF' }}>👥</div>
            <div className="stat-content">
              <h3>My Patients</h3>
              <p className="stat-value">{stats.totalPatients}</p>
              <span className="stat-trend">Assigned to you</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E0E7FF' }}>📅</div>
            <div className="stat-content">
              <h3>Today's Appointments</h3>
              <p className="stat-value">{stats.todaysAppointments}</p>
              <span className="stat-trend">Scheduled today</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FEF3C7' }}>⏰</div>
            <div className="stat-content">
              <h3>Pending</h3>
              <p className="stat-value">{stats.pendingAppointments}</p>
              <span className="stat-alert">⚠️ Requires attention</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#D1FAE5' }}>✅</div>
            <div className="stat-content">
              <h3>Total Appointments</h3>
              <p className="stat-value">{stats.totalAppointments}</p>
              <span className="stat-trend">All time</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Today's Appointments</h2>
            <button className="btn-view-all" onClick={() => navigate('/doctor/appointments')}>
              View All
            </button>
          </div>
          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>PATIENT</th>
                  <th>TIME</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.patient_name}</td>
                      <td>{formatTime(apt.time)}</td>
                      <td>{apt.type}</td>
                      <td><span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                      <td><button className="btn-action">View</button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      No appointments for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="recent-activities">
            <h2>Recent Patients</h2>
            {recentPatients.length > 0 ? (
              recentPatients.map((patient) => (
                <div key={patient.id} className="activity-item">
                  <div className="activity-icon">👤</div>
                  <div className="activity-content">
                    <h4>{patient.name}</h4>
                    <p>{patient.condition || 'General checkup'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                No patients assigned yet
              </p>
            )}
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <div className="action-card" onClick={() => navigate('/doctor/patients')}>
                <span className="action-icon">👥</span>
                <p>View All Patients</p>
              </div>
              <div className="action-card" onClick={() => navigate('/doctor/appointments')}>
                <span className="action-icon">📅</span>
                <p>View Appointments</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
