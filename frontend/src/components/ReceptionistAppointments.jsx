import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import NewAppointmentModal from './NewAppointmentModal';
import Avatar from './Avatar';
import axios from 'axios';
import API_URL from '../config/api';
import './ReceptionistAppointments.css';

const ReceptionistAppointments = () => {
  const { user, logout } = useContext(AuthContext);
  const { showSuccess, showError, showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
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
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/appointments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAppointments(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateFilter === 'today') {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= today && aptDate <= weekFromNow;
      });
    } else if (dateFilter === 'upcoming') {
      filtered = filtered.filter(apt => new Date(apt.date) >= today);
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${API_URL}/appointments/${appointmentId}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ));
      showSuccess('Appointment status updated successfully!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      showError('Failed to update appointment status. Please try again.');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    showConfirm(
      'Are you sure you want to cancel this appointment? This action cannot be undone.',
      async () => {
        try {
          const token = localStorage.getItem('access_token');
          await axios.delete(`${API_URL}/appointments/${appointmentId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setAppointments(appointments.filter(apt => apt.id !== appointmentId));
          showSuccess('Appointment cancelled successfully!');
        } catch (error) {
          console.error('Error deleting appointment:', error);
          showError('Failed to cancel appointment. Please try again.');
        }
      }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="receptionist-appointments-wrapper">
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
            <h1>Appointment Management</h1>
            <p>Schedule and manage patient appointments</p>
          </div>
          <div className="header-actions">
            <button className="btn-add" onClick={() => setShowNewModal(true)}>
              ➕ Schedule Appointment
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

        <div className="appointments-page">
          <div className="filters-section">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by patient or doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div className="appointments-stats">
            <div className="stat-card">
              <div className="stat-icon scheduled">📅</div>
              <div className="stat-info">
                <h3>{appointments.filter(a => a.status === 'Scheduled').length}</h3>
                <p>Scheduled</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon confirmed">✅</div>
              <div className="stat-info">
                <h3>{appointments.filter(a => a.status === 'Confirmed').length}</h3>
                <p>Confirmed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pending">⏳</div>
              <div className="stat-info">
                <h3>{appointments.filter(a => a.status === 'Pending').length}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon total">📊</div>
              <div className="stat-info">
                <h3>{filteredAppointments.length}</h3>
                <p>Total Results</p>
              </div>
            </div>
          </div>

          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PATIENT NAME</th>
                  <th>DOCTOR</th>
                  <th>DATE</th>
                  <th>TIME</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map(apt => (
                    <tr key={apt.id}>
                      <td className="apt-id">#{String(apt.id).padStart(3, '0')}</td>
                      <td className="patient-name">{apt.patient_name}</td>
                      <td>{apt.doctor_name}</td>
                      <td>{formatDate(apt.date)}</td>
                      <td>{formatTime(apt.time)}</td>
                      <td>{apt.type}</td>
                      <td>
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className={`status-select ${getStatusClass(apt.status)}`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteAppointment(apt.id)}
                            title="Cancel Appointment"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      No appointments found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-info">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        </div>
      </main>

      <NewAppointmentModal
        open={showNewModal}
        onClose={() => {
          setShowNewModal(false);
          fetchAppointments();
        }}
      />
    </div>
  );
};

export default ReceptionistAppointments;
