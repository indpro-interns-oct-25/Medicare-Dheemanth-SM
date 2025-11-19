import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import Avatar from './Avatar';
import axios from 'axios';
import API_URL from '../config/api';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/patient/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'confirmed':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="patient-dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">💙</div>
            <div className="logo-text">
              <h3>MediCare Pro</h3>
              <p>Patient Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">📅</span>
            <span>My Appointments</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">📋</span>
            <span>Medical Records</span>
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
          <div>
            <h1>Welcome back, {dashboardData?.patient?.name || user?.first_name}!</h1>
            <p className="subtitle">
              {dashboardData?.message || "Here's your health overview"}
            </p>
          </div>
          <div className="header-actions">
            <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <Avatar name={dashboardData?.patient?.name || user?.first_name || 'Patient'} size="medium" />
              <span>{dashboardData?.patient?.name || user?.first_name}</span>
              <span className="dropdown-icon">▼</span>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-item">
                    <span>⚙️</span> Settings
                  </div>
                  <div className="dropdown-item">
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

        {dashboardData?.message && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
            <div>
              <strong>Profile Setup Notice</strong>
              <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>{dashboardData.message}</p>
            </div>
          </div>
        )}

        <div className="patient-info-card">
          <div className="info-header">
            <h3>👤 Patient Information</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Patient ID:</span>
              <span className="info-value">{dashboardData?.patient?.patient_id || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{dashboardData?.patient?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone:</span>
              <span className="info-value">{dashboardData?.patient?.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Assigned Doctor:</span>
              <span className="info-value">{dashboardData?.patient?.assigned_doctor || 'Not Assigned'}</span>
            </div>
            {dashboardData?.patient?.age && (
              <div className="info-item">
                <span className="info-label">Age:</span>
                <span className="info-value">{dashboardData.patient.age} years</span>
              </div>
            )}
            {dashboardData?.patient?.gender && (
              <div className="info-item">
                <span className="info-label">Gender:</span>
                <span className="info-value">{dashboardData.patient.gender}</span>
              </div>
            )}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E0E7FF' }}>📅</div>
            <div className="stat-content">
              <h3>Total Appointments</h3>
              <p className="stat-value">{dashboardData?.appointments?.length || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FEE2E2' }}>📋</div>
            <div className="stat-content">
              <h3>Medical Records</h3>
              <p className="stat-value">{dashboardData?.medical_records?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>📅 My Appointments</h2>
          </div>
          <div className="appointments-list">
            {dashboardData?.appointments && dashboardData.appointments.length > 0 ? (
              dashboardData.appointments.map(apt => (
                <div key={apt.id} className="appointment-card">
                  <div className="appointment-header">
                    <div>
                      <h4>{apt.doctor_name}</h4>
                      <p className="appointment-type">{apt.type}</p>
                    </div>
                    <span 
                      className="status-badge" 
                      style={{ 
                        background: getStatusColor(apt.status), 
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem'
                      }}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{apt.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <span>{apt.time}</span>
                    </div>
                  </div>
                  {apt.notes && (
                    <div className="appointment-notes">
                      <strong>Notes:</strong> {apt.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>📅 No appointments scheduled yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>📋 Medical Records & Reports</h2>
          </div>
          <div className="records-list">
            {dashboardData?.medical_records && dashboardData.medical_records.length > 0 ? (
              dashboardData.medical_records.map(record => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <div className="record-type-badge">{record.record_type}</div>
                    <span className="record-date">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="record-body">
                    <p className="record-doctor">👨‍⚕️ Dr. {record.doctor_name}</p>
                    <p className="record-description">{record.description}</p>
                  </div>
                  <div className="record-footer">
                    <span 
                      className="record-status"
                      style={{ 
                        color: record.status === 'Completed' ? '#10b981' : '#f59e0b' 
                      }}
                    >
                      {record.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>📋 No medical records available yet</p>
              </div>
            )}
          </div>
        </div>

        {dashboardData?.message && (
          <div className="info-banner">
            ℹ️ {dashboardData.message}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
