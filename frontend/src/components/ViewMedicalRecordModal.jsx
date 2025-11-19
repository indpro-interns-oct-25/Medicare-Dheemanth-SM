import './ViewMedicalRecordModal.css';

const ViewMedicalRecordModal = ({ open, record, onClose }) => {
  if (!open || !record) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-record-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Medical Record Details</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="record-details-grid">
          <div className="detail-row">
            <div className="detail-item">
              <label>Record ID</label>
              <p>{record.record_id || `REC-${String(record.id).padStart(3, '0')}`}</p>
            </div>
            <div className="detail-item">
              <label>Patient Name</label>
              <p>{record.patient_name}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <label>Doctor</label>
              <p>{record.doctor_name}</p>
            </div>
            <div className="detail-item">
              <label>Record Type</label>
              <p>
                <span className={`record-badge-modal ${record.record_type?.toLowerCase().replace(' ', '-')}`}>
                  {record.record_type}
                </span>
              </p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <label>Status</label>
              <p>
                <span className={`status-badge-modal ${record.status?.toLowerCase()}`}>
                  {record.status}
                </span>
              </p>
            </div>
            <div className="detail-item">
              <label>Date</label>
              <p>{new Date(record.created_at || Date.now()).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</p>
            </div>
          </div>

          <div className="detail-row full-width">
            <div className="detail-item">
              <label>Description</label>
              <div className="description-box">
                <p>{record.description || 'No description available'}</p>
              </div>
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

export default ViewMedicalRecordModal;
