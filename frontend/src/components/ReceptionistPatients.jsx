import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import NewPatientModal from './NewPatientModal';
import ViewPatientModal from './ViewPatientModal';
import EditPatientModal from './EditPatientModal';
import Avatar from './Avatar';
import axios from 'axios';
import API_URL from '../config/api';
import './ReceptionistPatients.css';

const ReceptionistPatients = () => {
  const { user, logout } = useContext(AuthContext);
  const { showSuccess, showError, showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
    { path: '/receptionist/appointments', icon: '📅', label: 'Appointments' },
    { path: '/receptionist/patients', icon: '👥', label: 'Patient Registration' }
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/patients/`, {
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

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDeletePatient = async (patient) => {
    showConfirm(
      `Are you sure you want to remove ${patient.name} from the system? This action cannot be undone.`,
      async () => {
        try {
          const token = localStorage.getItem('access_token');
          await axios.delete(`${API_URL}/patients/${patient.id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          showSuccess('Patient removed successfully!');
          fetchPatients();
        } catch (error) {
          console.error('Error deleting patient:', error);
          showError('Failed to remove patient. Please try again.');
        }
      }
    );
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="receptionist-patients-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">💙</div>
            <div className="logo-text">
              <h3>MediCare Pro</h3>
              <p>Receptionist Portal</p>
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
            <h1>Patient Registration</h1>
            <p>Register and manage patient records</p>
          </div>
          <div className="header-actions">
            <button className="btn-add" onClick={() => setShowNewPatientModal(true)}>
              ➕ Register New Patient
            </button>
            <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <Avatar name={user?.first_name || user?.username || 'Receptionist'} size="medium" />
              <span>{user?.first_name || user?.username}</span>
              <span className="dropdown-icon">▼</span>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
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
                All Patients ({patients.length})
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
                placeholder="Search patients by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="patients-stats">
            <div className="stat-card">
              <div className="stat-icon total">👥</div>
              <div className="stat-info">
                <h3>{patients.length}</h3>
                <p>Total Patients</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon active">✅</div>
              <div className="stat-info">
                <h3>{patients.filter(p => p.status === 'Active').length}</h3>
                <p>Active</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon inactive">⏸️</div>
              <div className="stat-info">
                <h3>{patients.filter(p => p.status === 'Inactive').length}</h3>
                <p>Inactive</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon results">📊</div>
              <div className="stat-info">
                <h3>{filteredPatients.length}</h3>
                <p>Showing</p>
              </div>
            </div>
          </div>

          <div className="patients-table">
            <table>
              <thead>
                <tr>
                  <th>PATIENT ID</th>
                  <th>NAME</th>
                  <th>AGE</th>
                  <th>GENDER</th>
                  <th>CONTACT</th>
                  <th>EMAIL</th>
                  <th>CONDITION</th>
                  <th>ASSIGNED DOCTOR</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <tr key={patient.id}>
                      <td className="patient-id">{patient.patient_id || `P${String(patient.id).padStart(3, '0')}`}</td>
                      <td className="patient-name">{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>
                        <span className={`gender-badge ${patient.gender?.toLowerCase()}`}>
                          {patient.gender}
                        </span>
                      </td>
                      <td>{patient.contact || patient.phone}</td>
                      <td className="email-cell">{patient.email}</td>
                      <td>{patient.condition}</td>
                      <td>{patient.assigned_doctor}</td>
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
                            className="action-btn edit-btn"
                            onClick={() => handleEditPatient(patient)}
                            title="Edit Patient"
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeletePatient(patient)}
                            title="Remove Patient"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                      {searchQuery ? 'No patients found matching your search' : 'No patients registered yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-info">
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
        </div>
      </main>

      <NewPatientModal
        open={showNewPatientModal}
        onClose={() => {
          setShowNewPatientModal(false);
          fetchPatients();
        }}
      />

      <ViewPatientModal
        open={showViewModal}
        patient={selectedPatient}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPatient(null);
        }}
      />

      <EditPatientModal
        open={showEditModal}
        patient={selectedPatient}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPatient(null);
          fetchPatients();
        }}
      />
    </div>
  );
};

export default ReceptionistPatients;
