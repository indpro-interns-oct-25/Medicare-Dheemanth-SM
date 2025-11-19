import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './PatientReportModal.css';

const PatientReportModal = ({ open, patientId, onClose }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && patientId) {
      fetchPatientDetails();
    }
  }, [open, patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/doctor/patients/${patientId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPatientData(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content patient-report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Patient Medical Report</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading-section">
            <p>Loading patient report...</p>
          </div>
        ) : patientData ? (
          <>
            <div className="report-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                👤 Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'medical-records' ? 'active' : ''}`}
                onClick={() => setActiveTab('medical-records')}
              >
                📋 Medical Records ({patientData.medical_records?.length || 0})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                📅 Appointments ({patientData.appointments?.length || 0})
              </button>
            </div>

            <div className="report-content">
              {activeTab === 'overview' && (
                <div className="overview-section">
                  <div className="patient-header-card">
                    <div className="patient-avatar">
                      {patientData.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="patient-header-info">
                      <h3>{patientData.name}</h3>
                      <p className="patient-id">ID: {patientData.patient_id}</p>
                      <span className={`status-badge ${getStatusClass(patientData.status)}`}>
                        {patientData.status}
                      </span>
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-card">
                      <div className="info-icon">📧</div>
                      <div className="info-content">
                        <label>Email Address</label>
                        <p>{patientData.email}</p>
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="info-icon">📱</div>
                      <div className="info-content">
                        <label>Phone Number</label>
                        <p>{patientData.phone}</p>
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="info-icon">🎂</div>
                      <div className="info-content">
                        <label>Age</label>
                        <p>{patientData.age} years</p>
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="info-icon">⚧️</div>
                      <div className="info-content">
                        <label>Gender</label>
                        <p>{patientData.gender}</p>
                      </div>
                    </div>

                    <div className="info-card full-width">
                      <div className="info-icon">🏥</div>
                      <div className="info-content">
                        <label>Medical Condition</label>
                        <p>{patientData.condition || 'None specified'}</p>
                      </div>
                    </div>

                    <div className="info-card full-width">
                      <div className="info-icon">📅</div>
                      <div className="info-content">
                        <label>Registration Date</label>
                        <p>{formatDate(patientData.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="summary-stats">
                    <div className="stat-card">
                      <div className="stat-value">{patientData.medical_records?.length || 0}</div>
                      <div className="stat-label">Medical Records</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{patientData.appointments?.length || 0}</div>
                      <div className="stat-label">Total Appointments</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {patientData.appointments?.filter(a => a.status === 'Completed').length || 0}
                      </div>
                      <div className="stat-label">Completed Visits</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'medical-records' && (
                <div className="medical-records-section">
                  <h3>📋 Medical History</h3>
                  {patientData.medical_records && patientData.medical_records.length > 0 ? (
                    <div className="records-list">
                      {patientData.medical_records.map((record) => (
                        <div key={record.id} className="record-card">
                          <div className="record-header">
                            <div className="record-type">
                              <span className="type-icon">
                                {record.record_type === 'Diagnosis' ? '🩺' : 
                                 record.record_type === 'Lab Report' ? '🔬' : 
                                 record.record_type === 'Prescription' ? '💊' : 
                                 record.record_type === 'Imaging' ? '📸' : '📋'}
                              </span>
                              <strong>{record.record_type}</strong>
                            </div>
                            <span className={`status-badge ${getStatusClass(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                          <div className="record-body">
                            <p className="record-description">{record.description}</p>
                            <div className="record-footer">
                              <span className="record-doctor">👨‍⚕️ {record.doctor_name}</span>
                              <span className="record-date">📅 {formatDate(record.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <p>No medical records found for this patient</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="appointments-section">
                  <h3>📅 Appointment History</h3>
                  {patientData.appointments && patientData.appointments.length > 0 ? (
                    <div className="appointments-table-container">
                      <table className="appointments-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Doctor</th>
                            <th>Status</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientData.appointments.map((appointment) => (
                            <tr key={appointment.id}>
                              <td>{formatDate(appointment.date)}</td>
                              <td>{formatTime(appointment.time)}</td>
                              <td>{appointment.type}</td>
                              <td>{appointment.doctor_name}</td>
                              <td>
                                <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                              </td>
                              <td className="notes-cell">{appointment.notes || 'No notes'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📅</div>
                      <p>No appointments found for this patient</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Close</button>
              <button className="btn-primary" onClick={() => window.print()}>🖨️ Print Report</button>
            </div>
          </>
        ) : (
          <div className="error-section">
            <p>Failed to load patient data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientReportModal;
