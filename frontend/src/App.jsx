import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AlertProvider } from './components/CustomAlert';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import PatientRegister from './components/PatientRegister';
import AdminDashboard from './components/AdminDashboard';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import Doctors from './components/Doctors';
import MedicalRecords from './components/MedicalRecords';
import Reports from './components/Reports';
import Settings from './components/Settings';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorPatients from './components/DoctorPatients';
import DoctorAppointments from './components/DoctorAppointments';
import ReceptionistAppointments from './components/ReceptionistAppointments';
import ReceptionistPatients from './components/ReceptionistPatients';
import PatientDashboard from './components/PatientDashboard';
import { useContext } from 'react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AlertProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<PatientRegister />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/patient/dashboard" element={
              <PrivateRoute>
                <PatientDashboard />
              </PrivateRoute>
            } />
            <Route path="/patients" element={
              <PrivateRoute>
                <Patients />
              </PrivateRoute>
            } />
            <Route path="/appointments" element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            } />
            <Route path="/doctors" element={
              <PrivateRoute>
                <Doctors />
              </PrivateRoute>
            } />
            <Route path="/medical-records" element={
              <PrivateRoute>
                <MedicalRecords />
              </PrivateRoute>
            } />
            <Route path="/reports" element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/doctor/dashboard" element={
              <PrivateRoute>
                <DoctorDashboard />
              </PrivateRoute>
            } />
            <Route path="/doctor/patients" element={
              <PrivateRoute>
                <DoctorPatients />
              </PrivateRoute>
            } />
            <Route path="/doctor/appointments" element={
              <PrivateRoute>
                <DoctorAppointments />
              </PrivateRoute>
            } />
            <Route path="/doctor/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/receptionist/appointments" element={
              <PrivateRoute>
                <ReceptionistAppointments />
              </PrivateRoute>
            } />
            <Route path="/receptionist/patients" element={
              <PrivateRoute>
                <ReceptionistPatients />
              </PrivateRoute>
            } />
          </Routes>
        </AuthProvider>
      </AlertProvider>
    </BrowserRouter>
  );
}

export default App;
