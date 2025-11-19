import './ViewPatientModal.css';

const ViewPatientModal = ({ open, patient, onClose }) => {
  if (!open || !patient) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-patient-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Patient Details</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="patient-details-grid">
          <div className="detail-row">
            <div className="detail-item">
              <label>Patient ID</label>
              <p>{patient.patient_id || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Full Name</label>
              <p>{patient.name}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <label>Age</label>
              <p>{patient.age} years</p>
            </div>
            <div className="detail-item">
              <label>Gender</label>
              <p>{patient.gender}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <label>Contact Number</label>
              <p>{patient.contact}</p>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <p>{patient.email || 'N/A'}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <label>Medical Condition</label>
              <p>{patient.condition}</p>
            </div>
            <div className="detail-item">
              <label>Assigned Doctor</label>
              <p>{patient.assigned_doctor}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <label>Status</label>
              <p>
                <span className={`status-badge ${patient.status?.toLowerCase()}`}>
                  {patient.status || 'Active'}
                </span>
              </p>
            </div>
            <div className="detail-item">
              <label>Registration Date</label>
              <p>{new Date(patient.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientModal;
