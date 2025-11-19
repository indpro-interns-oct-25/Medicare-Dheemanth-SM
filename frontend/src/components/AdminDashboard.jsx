import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import Avatar from './Avatar';
import NewAppointmentModal from './NewAppointmentModal';
import axios from 'axios';
import API_URL from '../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { showSuccess, showError, showConfirm } = useAlert();
  const navigate = useNavigate();
  
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todaysAppointments: 0,
    pendingRecords: 0
  });
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
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

  useEffect(() => {
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [patientsRes, doctorsRes, appointmentsRes, notificationsRes] = await Promise.all([
        axios.get(`${API_URL}/patients/`, { headers }),
        axios.get(`${API_URL}/doctors/`, { headers }),
        axios.get(`${API_URL}/appointments/`, { headers }),
        axios.get(`${API_URL}/notifications/`, { headers })
      ]);

      const patients = patientsRes.data.data || [];
      const doctors = doctorsRes.data.data || [];
      const appointments = appointmentsRes.data.data || [];
      const notifs = notificationsRes.data.data || [];

      const today = new Date().toISOString().split('T')[0];
      const todaysApts = appointments.filter(apt => apt.date === today);

      setStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        todaysAppointments: todaysApts.length,
        pendingRecords: 3
      });

      setTodaysAppointments(todaysApts.slice(0, 5));
      setNotifications(notifs);
      
      setRecentActivities([
        { icon: '👤', title: 'New patient registered', description: 'John Doe registered 2 minutes ago' },
        { icon: '📅', title: 'Appointment confirmed', description: 'Dr. Sarah Wilson - 2:30 PM' }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleVerifyPatient = async (userId, action) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/verify-patient/${userId}/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showSuccess(response.data.message);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error verifying patient:', error);
      showError('Failed to verify patient. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.25rem' }}>
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
              <p>Smart Healthcare Management</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/patients')}>
            <span className="nav-icon">👥</span>
            <span>Patients</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/appointments')}>
            <span className="nav-icon">📅</span>
            <span>Appointments</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/doctors')}>
            <span className="nav-icon">👨‍⚕️</span>
            <span>Doctors</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/medical-records')}>
            <span className="nav-icon">📋</span>
            <span>Medical Records</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/reports')}>
            <span className="nav-icon">📈</span>
            <span>Reports</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/settings')}>
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </button>
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
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <span className="bell-icon">🔔</span>
              {notifications.filter(n => !n.is_read && n.notification_type === 'patient_registration').length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.is_read && n.notification_type === 'patient_registration').length}
                </span>
              )}
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <span className="close-btn" onClick={(e) => {
                      e.stopPropagation();
                      setShowNotifications(false);
                    }}>✕</span>
                  </div>
                  <div className="notifications-list">
                    {notifications.filter(n => !n.is_read).length > 0 ? (
                      notifications.filter(n => !n.is_read).map(notif => (
                        <div key={notif.id} className="notification-item">
                          <div className="notification-icon-wrapper">
                            {notif.notification_type === 'patient_registration' ? (
                              <div className="notification-icon registration">
                                <span>👤</span>
                              </div>
                            ) : (
                              <div className="notification-icon default">
                                <span>🔔</span>
                              </div>
                            )}
                          </div>
                          <div className="notification-content">
                            <div className="notification-header">
                              <h4 className="notification-title">{notif.title}</h4>
                              <span className="notification-time">
                                {new Date(notif.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="notification-message">{notif.message}</p>
                            {notif.notification_type === 'patient_registration' && (
                              <div className="notification-actions">
                                <button 
                                  className="btn-approve"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifyPatient(notif.user_id, 'approve');
                                  }}
                                >
                                  <span className="btn-icon">✓</span>
                                  Approve
                                </button>
                                <button 
                                  className="btn-reject"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifyPatient(notif.user_id, 'reject');
                                  }}
                                >
                                  <span className="btn-icon">✕</span>
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#EEF2FF' }}>👥</div>
            <div className="stat-content">
              <h3>Total Patients</h3>
              <p className="stat-value">{stats.totalPatients}</p>
              <span className="stat-trend">↑ +12% from last month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#D1FAE5' }}>👨‍⚕️</div>
            <div className="stat-content">
              <h3>Total Doctors</h3>
              <p className="stat-value">{stats.totalDoctors}</p>
              <span className="stat-trend">↑ +3 new this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E0E7FF' }}>📅</div>
            <div className="stat-content">
              <h3>Today's Appointments</h3>
              <p className="stat-value">{stats.todaysAppointments}</p>
              <span className="stat-trend">📋 23 pending</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FEE2E2' }}>📋</div>
            <div className="stat-content">
              <h3>Pending Records</h3>
              <p className="stat-value">{stats.pendingRecords}</p>
              <span className="stat-alert">⚠️ Requires attention</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Today's Appointments</h2>
            <button className="btn-new-appointment" onClick={() => setShowNewAppointmentModal(true)}>
              + New Appointment
            </button>
          </div>
          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>PATIENT</th>
                  <th>DOCTOR</th>
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
                      <td>{apt.doctor_name}</td>
                      <td>{apt.time}</td>
                      <td>{apt.type}</td>
                      <td><span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                      <td><button className="btn-action">View</button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', fontSize: '1.15rem' }}>
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
            <h2>Recent Activities</h2>
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <div className="action-card" onClick={() => navigate('/patients')}>
                <span className="action-icon">➕</span>
                <span className="action-icon-small">👤</span>
                <p>Add Patient</p>
              </div>
              <div className="action-card" onClick={() => setShowNewAppointmentModal(true)}>
                <span className="action-icon">📅</span>
                <p>Schedule Appointment</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NewAppointmentModal
        open={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onCreated={async () => {
          await fetchDashboardData();
          setShowNewAppointmentModal(false);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
