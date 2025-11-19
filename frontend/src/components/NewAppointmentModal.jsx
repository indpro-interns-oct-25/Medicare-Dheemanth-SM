import { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './NewAppointmentModal.css';

export default function NewAppointmentModal({ open, onClose, onCreated }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    type: 'Consultation',
    status: 'Scheduled',
    notes: ''
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
    if (!form.patient || !form.doctor || !form.date || !form.time) {
      setError('Please fill patient, doctor, date and time');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        patient: Number(form.patient),
        doctor: Number(form.doctor),
        date: form.date,
        time: form.time,
        type: form.type,
        status: form.status,
        notes: form.notes || ''
      };
      const res = await axios.post(`${API_URL}/appointments/`, payload, { headers });
      if (res.data?.success) {
        setForm({
          patient: '',
          doctor: '',
          date: '',
          time: '',
          type: 'Consultation',
          status: 'Scheduled',
          notes: ''
        });
        onCreated();
        onClose();
      } else {
        setError('Create failed');
      }
    } catch (err) {
      const msg = err.response?.data?.errors
        ? JSON.stringify(err.response.data.errors)
        : 'Server error creating appointment';
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
          <h2>Schedule New Appointment</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Patient</label>
            <select name="patient" value={form.patient} onChange={handleChange} required>
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} • {p.email}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Doctor</label>
            <select name="doctor" value={form.doctor} onChange={handleChange} required>
              <option value="">Select doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.last_name} • {d.department || 'General'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input type="time" name="time" value={form.time} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option>Consultation</option>
              <option>Follow-up</option>
              <option>Check-up</option>
              <option>Procedure</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option>Scheduled</option>
              <option>Confirmed</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label>Notes</label>
            <textarea name="notes" rows="3" value={form.notes} onChange={handleChange} placeholder="Optional"></textarea>
          </div>

          <div className="modal-actions span-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
