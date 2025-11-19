import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import ViewPatientModal from './ViewPatientModal';
import PatientReportModal from './PatientReportModal';
import Avatar from './Avatar';
import axios from 'axios';
import API_URL from '../config/api';
import './DoctorPatients.css';

const DoctorPatients = () => {
  const { user, logout } = useContext(AuthContext);
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
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
    { path: '/doctor/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/doctor/patients', icon: '👥', label: 'My Patients' },
    { path: '/doctor/appointments', icon: '📅', label: 'Appointments' },
    { path: '/doctor/settings', icon: '⚙️', label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/doctor/patients/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPatients(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleViewReport = (patient) => {
    setSelectedPatientId(patient.id);
    setShowReportModal(true);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.patient_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && patient.status === 'Active') ||
                      (activeTab === 'inactive' && patient.status === 'Inactive');
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading patients...
      </div>
    );
  }

  return (
    <div className="patients-page-wrapper">
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
            <h1>My Patients</h1>
            <p>View and manage your assigned patients</p>
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

        <div className="patients-page">
          <div className="page-controls">
            <div className="tabs-container">
              <button 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({patients.length})
              </button>
              <button 
                className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active ({patients.filter(p => p.status === 'Active').length})
              </button>
              <button 
                className={`tab ${activeTab === 'inactive' ? 'active' : ''}`}
                onClick={() => setActiveTab('inactive')}
              >
                Inactive ({patients.filter(p => p.status === 'Inactive').length})
              </button>
            </div>
            
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="patients-table">
            <table>
              <thead>
                <tr>
                  <th>PATIENT ID</th>
                  <th>NAME <span className="sort-icon">▲</span></th>
                  <th>AGE <span className="sort-icon">▲</span></th>
                  <th>GENDER</th>
                  <th>CONTACT</th>
                  <th>CONDITION</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <tr key={patient.id}>
                      <td className="patient-id">{patient.patient_id || `P00${patient.id}`}</td>
                      <td className="patient-name">{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>
                        <span className={`gender-badge ${patient.gender?.toLowerCase()}`}>
                          {patient.gender}
                        </span>
                      </td>
                      <td>{patient.contact || patient.phone}</td>
                      <td>{patient.condition}</td>
                      <td>
                        <span className={`status-badge ${patient.status?.toLowerCase()}`}>
                          {patient.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn" 
                            onClick={() => handleViewPatient(patient)}
                            title="View Patient"
                          >
                            👁️
                          </button>
                          <button 
                            className="action-btn report-btn" 
                            onClick={() => handleViewReport(patient)}
                            title="View Report"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      No patients assigned to you yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ViewPatientModal
        open={showViewModal}
        patient={selectedPatient}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPatient(null);
        }}
      />

      <PatientReportModal
        open={showReportModal}
        patientId={selectedPatientId}
        onClose={() => {
          setShowReportModal(false);
          setSelectedPatientId(null);
        }}
      />
    </div>
  );
};

export default DoctorPatients;
