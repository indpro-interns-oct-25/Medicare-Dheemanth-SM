import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import UserProfileDropdown from './UserProfileDropdown';
import NewPatientModal from './NewPatientModal';
import ViewPatientModal from './ViewPatientModal';
import EditPatientModal from './EditPatientModal';
import axios from 'axios';
import API_URL from '../config/api';
import './Patients.css';

const Patients = () => {
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
      `Are you sure you want to delete ${patient.name}? This action cannot be undone.`,
      async () => {
        try {
          const token = localStorage.getItem('access_token');
          await axios.delete(`${API_URL}/patients/${patient.id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          showSuccess('Patient deleted successfully!');
          fetchPatients();
        } catch (error) {
          console.error('Error deleting patient:', error);
          showError('Failed to delete patient. Please try again.');
        }
      }
    );
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
          <div className="header-left">
            <h1>Patients Management</h1>
            <p>Manage and monitor all patient records</p>
          </div>
          <div className="header-actions">
            <UserProfileDropdown />
          </div>
        </header>

        <div className="patients-page">
          <div className="page-controls">
            <div className="tabs-container">
              <button 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button 
                className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active
              </button>
              <button 
                className={`tab ${activeTab === 'inactive' ? 'active' : ''}`}
                onClick={() => setActiveTab('inactive')}
              >
                Inactive
              </button>
            </div>
            
            <div className="search-add-container">
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
              <button 
                className="btn-add-patient"
                onClick={() => setShowNewPatientModal(true)}
              >
                + Add New Patient
              </button>
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
                  <th>ASSIGNED DOCTOR</th>
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
                      <td>{patient.assigned_doctor || 'Dr. Smith'}</td>
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
                            ✂️
                          </button>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDeletePatient(patient)}
                            title="Delete Patient"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <NewPatientModal
        open={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        onCreated={async () => {
          await fetchPatients();
          setShowNewPatientModal(false);
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
        }}
        onUpdated={async () => {
          await fetchPatients();
          setShowEditModal(false);
          setSelectedPatient(null);
        }}
      />
    </div>
  );
};

export default Patients;
