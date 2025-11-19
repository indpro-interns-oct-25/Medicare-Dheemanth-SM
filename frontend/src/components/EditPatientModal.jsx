import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './EditPatientModal.css';

const EditPatientModal = ({ open, patient, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: '',
    condition: '',
    assigned_doctor: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || '',
        age: patient.age || '',
        gender: patient.gender || 'Male',
        contact: patient.contact || '',
        email: patient.email || '',
        condition: patient.condition || '',
        assigned_doctor: patient.assigned_doctor || ''
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.age || !form.contact) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const res = await axios.put(`${API_URL}/patients/${patient.id}/`, form, { headers });
      
      if (res.data?.success) {
        onUpdated();
        onClose();
      } else {
        setError('Failed to update patient');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error updating patient';
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
          <h2>Edit Patient</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group span-2">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group span-2">
            <label>Medical Condition</label>
            <input
              type="text"
              name="condition"
              value={form.condition}
              onChange={handleChange}
            />
          </div>

          <div className="form-group span-2">
            <label>Assigned Doctor</label>
            <input
              type="text"
              name="assigned_doctor"
              value={form.assigned_doctor}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions span-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;
