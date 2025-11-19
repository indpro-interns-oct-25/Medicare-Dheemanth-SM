import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './NewPatientModal.css';

export default function NewPatientModal({ open, onClose, onCreated, doctors }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    condition: '',
    assigned_doctor: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!form.name || !form.email || !form.phone) {
      setError('Please fill in name, email, and phone');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        condition: form.condition || '',
        assigned_doctor: form.assigned_doctor ? parseInt(form.assigned_doctor) : null,
        status: form.status
      };

      const res = await axios.post(`${API_URL}/patients/`, payload, { headers });
      
      if (res.data?.success) {
        // Reset form
        setForm({
          name: '',
          email: '',
          phone: '',
          age: '',
          gender: 'Male',
          condition: '',
          assigned_doctor: '',
          status: 'Active'
        });
        onCreated(); // Refresh patient list
        onClose();
      } else {
        setError('Failed to create patient');
      }
    } catch (err) {
      const msg = err.response?.data?.errors
        ? JSON.stringify(err.response.data.errors)
        : err.response?.data?.message || 'Server error creating patient';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content patient-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Patient</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter patient name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="patient@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 234-567-8901"
                required
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="0"
                max="150"
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
              <label>Assigned Doctor</label>
              <select name="assigned_doctor" value={form.assigned_doctor} onChange={handleChange}>
                <option value="">Select doctor (optional)</option>
                {doctors && doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name} • {d.department || 'General'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group span-2">
              <label>Medical Condition</label>
              <input
                type="text"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                placeholder="e.g., Hypertension, Diabetes"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
