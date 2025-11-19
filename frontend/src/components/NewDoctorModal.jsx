import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './NewDoctorModal.css';

export default function NewDoctorModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: 'Cardiology',
    experience: '',
    password: 'doctor123'
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
    
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const res = await axios.post(`${API_URL}/doctors/create/`, form, { headers });
      
      if (res.data?.success) {
        setForm({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          specialization: 'Cardiology',
          experience: '',
          password: 'doctor123'
        });
        onCreated();
        onClose();
      } else {
        setError('Failed to add doctor');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error adding doctor';
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
          <h2>Add New Doctor</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Enter last name"
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
              placeholder="doctor@example.com"
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
            <label>Specialization</label>
            <select name="specialization" value={form.specialization} onChange={handleChange}>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="5"
              min="0"
            />
          </div>

          <div className="form-group span-2">
            <label>Initial Password</label>
            <input
              type="text"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Default: doctor123"
            />
            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
              Doctor can change this after first login
            </small>
          </div>

          <div className="modal-actions span-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
