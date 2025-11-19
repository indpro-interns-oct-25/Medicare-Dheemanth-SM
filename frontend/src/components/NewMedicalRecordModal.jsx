import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './NewMedicalRecordModal.css';

export default function NewMedicalRecordModal({ open, onClose, onCreated }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    record_type: 'Diagnosis',
    description: '',
    status: 'Pending'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API_URL}/patients/`, { headers }),
      axios.get(`${API_URL}/doctors/`, { headers })
    ])
      .then(([pRes, dRes]) => {
        setPatients(pRes.data.data || []);
        setDoctors(dRes.data.data || []);
      })
      .catch(() => setError('Failed loading patients/doctors'));
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.patient || !form.doctor || !form.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        patient: Number(form.patient),
        doctor: Number(form.doctor),
        record_type: form.record_type,
        description: form.description,
        status: form.status
      };

      const res = await axios.post(`${API_URL}/medical-records/`, payload, { headers });
      
      if (res.data?.success) {
        setForm({
          patient: '',
          doctor: '',
          record_type: 'Diagnosis',
          description: '',
          status: 'Pending'
        });
        onCreated();
        onClose();
      } else {
        setError('Failed to upload record');
      }
    } catch (err) {
      const msg = err.response?.data?.errors
        ? JSON.stringify(err.response.data.errors)
        : 'Server error uploading record';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload New Medical Record</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Patient *</label>
            <select name="patient" value={form.patient} onChange={handleChange} required>
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Doctor *</label>
            <select name="doctor" value={form.doctor} onChange={handleChange} required>
              <option value="">Select doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Record Type</label>
            <select name="record_type" value={form.record_type} onChange={handleChange}>
              <option value="Diagnosis">Diagnosis</option>
              <option value="Lab Report">Lab Report</option>
              <option value="Prescription">Prescription</option>
              <option value="Imaging">Imaging</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label>Description *</label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter medical record details..."
              required
            ></textarea>
          </div>

          <div className="modal-actions span-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
