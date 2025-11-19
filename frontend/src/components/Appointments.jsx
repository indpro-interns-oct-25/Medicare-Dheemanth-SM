import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import NewAppointmentModal from './NewAppointmentModal';
import axios from 'axios';
import API_URL from '../config/api';
import UserProfileDropdown from './UserProfileDropdown';

import './Appointments.css';

const Appointments = () => {
  const { user, logout } = useContext(AuthContext);
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [dateRange, setDateRange] = useState('today');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

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
    fetchAppointments();
  }, []);

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

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return '';
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          {prevMonthDays - i}
        </div>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate;
      const hasAppointment = appointments.some(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getDate() === day && 
               aptDate.getMonth() === currentDate.getMonth() &&
               aptDate.getFullYear() === currentDate.getFullYear();
      });
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${hasAppointment ? 'has-appointment' : ''}`}
          onClick={() => setSelectedDate(day)}
        >
          {day}
          {hasAppointment && <span className="appointment-dot completed"></span>}
        </div>
      );
    }
    
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div key={`next-${day}`} className="calendar-day other-month">
          {day}
        </div>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="appointments-page-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">💙</div>
            <div className="logo-text">
              <h3>MediCare Pro</h3>
              <p>Appointments Management</p>
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
          <h1>Appointments</h1>
          <div className="header-actions">
            <UserProfileDropdown />
          </div>
        </header>

        <div className="appointments-page">
          <div className="page-header">
            <p>Manage and schedule patient appointments</p>
            <button 
              className="btn-schedule"
              onClick={() => setShowNewAppointmentModal(true)}
            >
              + Schedule New Appointment
            </button>
          </div>

          <div className="appointments-content">
            <div className="calendar-section">
              <div className="section-header">
                <h2>Calendar View</h2>
              </div>

              <div className="calendar">
                <div className="calendar-header">
                  <button className="calendar-nav" onClick={previousMonth}>‹</button>
                  <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                  <button className="calendar-nav" onClick={nextMonth}>›</button>
                </div>

                <div className="calendar-weekdays">
                  <div className="weekday">Sun</div>
                  <div className="weekday">Mon</div>
                  <div className="weekday">Tue</div>
                  <div className="weekday">Wed</div>
                  <div className="weekday">Thu</div>
                  <div className="weekday">Fri</div>
                  <div className="weekday">Sat</div>
                </div>

                <div className="calendar-grid">
                  {renderCalendar()}
                </div>

                <div className="calendar-legend">
                  <div className="legend-item">
                    <span className="legend-dot completed"></span>
                    <span>Completed</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot cancelled"></span>
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="appointments-list-section">
              <div className="section-header">
                <h2>Appointments List</h2>
                <span className="date-badge">Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="filters">
                <div className="filter-group">
                  <label>Date Range:</label>
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Doctor:</label>
                  <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
                    <option value="all">All Doctors</option>
                  </select>
                </div>
              </div>

              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>PATIENT NAME</th>
                    <th>DOCTOR</th>
                    <th>DATE</th>
                    <th>TIME</th>
                    <th>TYPE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.slice(0, 5).map(apt => (
                      <tr key={apt.id}>
                        <td>#{String(apt.id).padStart(3, '0')}</td>
                        <td>{apt.patient_name}</td>
                        <td>{apt.doctor_name}</td>
                        <td>{formatDate(apt.date)}</td>
                        <td>{formatTime(apt.time)}</td>
                        <td>{apt.type}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="pagination">
                <span className="pagination-info">Showing 1 to {Math.min(5, appointments.length)} of {appointments.length} appointments</span>
                <div className="pagination-buttons">
                  <button className="pagination-btn">Previous</button>
                  <button className="pagination-btn active">1</button>
                  <button className="pagination-btn">2</button>
                  <button className="pagination-btn">3</button>
                  <button className="pagination-btn">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NewAppointmentModal
        open={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onCreated={async () => {
          await fetchAppointments();
          setShowNewAppointmentModal(false);
        }}
      />
    </div>
  );
};

export default Appointments;
