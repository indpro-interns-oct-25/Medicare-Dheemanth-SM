import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Redirect based on user role
      if (result.user?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (result.user?.role === 'receptionist') {
        navigate('/receptionist/appointments');
      } else if (result.user?.role === 'patient') {
        navigate('/patient/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message || 'Invalid email or password');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="welcome-content">
          <img src="/medical-illustration.png" alt="Medical" className="medical-img" />
          <h1>Welcome to MediCare Pro</h1>
          <p>Healthcare management platform for medical professionals. Login with your staff credentials to access the system.</p>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-card">
          <div className="brand-header">
            <div className="brand-icon">💙</div>
            <h2>MediCare Pro</h2>
            <p>Staff Portal - Authorized Access Only</p>
          </div>

          <div className="welcome-message">
            
            <p>Enter your credentials to access the system</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your staff email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : '🔒 Staff Login'}
            </button>
          </form>

          <div className="login-footer">
            <p className="help-text">Need help? Contact your system administrator</p>
            <p className="register-link-text">
              New patient? <a href="/register" className="register-link">Register here</a>
            </p>
          </div>

          <div className="security-note">
            🔒 Your data is protected with 256-bit SSL encryption
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
