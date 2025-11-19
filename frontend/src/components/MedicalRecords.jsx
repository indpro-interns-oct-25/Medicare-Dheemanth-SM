import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import NewMedicalRecordModal from './NewMedicalRecordModal';
import ViewMedicalRecordModal from './ViewMedicalRecordModal';
import UserProfileDropdown from './UserProfileDropdown';
import Avatar from './Avatar';
import axios from 'axios';
import jsPDF from 'jspdf';
import API_URL from '../config/api';
import './MedicalRecords.css';

const MedicalRecords = () => {
  const { user, logout } = useContext(AuthContext);
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recordType, setRecordType] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

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
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/medical-records/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRecords(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching records:', error);
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.record_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = recordType === 'all' || record.record_type === recordType;
    return matchesSearch && matchesType;
  });

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleDownloadRecord = async (record) => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(91, 115, 232);
      doc.text('Medical Record', 105, 20, { align: 'center' });
      
      // Add a line
      doc.setDrawColor(91, 115, 232);
      doc.line(20, 25, 190, 25);
      
      // Reset color for content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      
      // Add record details
      let yPos = 40;
      const lineHeight = 10;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Record ID:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(record.record_id || `REC-${String(record.id).padStart(3, '0')}`, 60, yPos);
      
      yPos += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Name:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(record.patient_name, 60, yPos);
      
      yPos += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(record.doctor_name, 60, yPos);
      
      yPos += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text('Record Type:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(record.record_type, 60, yPos);
      
      yPos += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text('Status:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(record.status, 60, yPos);
      
      yPos += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text('Date:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(record.created_at || Date.now()).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }), 60, yPos);
      
      // Add description
      yPos += lineHeight * 2;
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', 20, yPos);
      yPos += lineHeight;
      doc.setFont('helvetica', 'normal');
      
      const description = record.description || 'No description available';
      const splitDescription = doc.splitTextToSize(description, 170);
      doc.text(splitDescription, 20, yPos);
      
      // Add footer
      yPos = 280;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by MediCare Pro - Healthcare Management System', 105, yPos, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 5, { align: 'center' });
      
      // Save the PDF
      const fileName = `${record.patient_name.replace(/\s+/g, '_')}-${record.record_type.replace(/\s+/g, '_')}-${record.record_id || record.id}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const getRecordTypeBadge = (type) => {
    const badges = {
      'Diagnosis': 'diagnosis',
      'Lab Report': 'lab-report',
      'Prescription': 'prescription',
      'Imaging': 'imaging'
    };
    return badges[type] || 'diagnosis';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading medical records...
      </div>
    );
  }

  return (
    <div className="medical-records-page-wrapper">
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
          <h1>Medical Records</h1>
          <div className="header-actions">
            <UserProfileDropdown />
          </div>
        </header>

        <div className="medical-records-page">
          <div className="page-header">
            <p>Manage patient medical records and documents</p>
            <button 
              className="btn-upload-record"
              onClick={() => setShowNewRecordModal(true)}
            >
              + Upload New Record
            </button>
          </div>

          <div className="search-filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Date Range:</label>
              <div className="date-range">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="dd-mm-yyyy"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Record Type:</label>
              <select value={recordType} onChange={(e) => setRecordType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="Diagnosis">Diagnosis</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Imaging">Imaging</option>
              </select>
            </div>

            <button className="btn-clear-filters">🔄 Clear Filters</button>
          </div>

          <div className="records-section">
            <h2>Patient Records</h2>
            <table className="records-table">
              <thead>
                <tr>
                  <th>RECORD ID</th>
                  <th>PATIENT NAME</th>
                  <th>DOCTOR</th>
                  <th>DATE</th>
                  <th>RECORD TYPE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map(record => (
                    <tr key={record.id}>
                      <td className="record-id">{record.record_id || `REC-${String(record.id).padStart(3, '0')}`}</td>
                      <td>
                        <div className="patient-cell">
                          <Avatar name={record.patient_name} size="small" />
                          <span>{record.patient_name}</span>
                        </div>
                      </td>
                      <td>{record.doctor_name}</td>
                      <td>{new Date(record.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>
                        <span className={`record-badge ${getRecordTypeBadge(record.record_type)}`}>
                          {record.record_type}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view" 
                            title="View Record"
                            onClick={() => handleViewRecord(record)}
                          >
                            👁️
                          </button>
                          <button 
                            className="action-btn download" 
                            title="Download Record"
                            onClick={() => handleDownloadRecord(record)}
                          >
                            📥
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <NewMedicalRecordModal
        open={showNewRecordModal}
        onClose={() => setShowNewRecordModal(false)}
        onCreated={async () => {
          await fetchRecords();
          setShowNewRecordModal(false);
        }}
      />

      <ViewMedicalRecordModal
        open={showViewModal}
        record={selectedRecord}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
};

export default MedicalRecords;
