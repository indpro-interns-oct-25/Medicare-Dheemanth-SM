import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon">💙</div>
            <span className="logo-text">MediCare Pro</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#reviews">Reviews</a>
            <a href="#contact">Contact</a>
            <button className="register-nav-btn" onClick={() => navigate('/register')}>
              Register as Patient
            </button>
            <button className="login-nav-btn" onClick={() => navigate('/login')}>
              Staff Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Smarter Healthcare Management for Everyone
            </h1>
            <p className="hero-description">
              Streamline your healthcare operations with our comprehensive management platform. From patient records to appointment scheduling, we've got you covered.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/register')}>
                Register as Patient
              </button>
              <button className="btn-secondary" onClick={() => navigate('/login')}>
                Staff Login
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-icon plus">+</div>
            <div className="floating-icon stethoscope">🩺</div>
            <img src="/hospital-building.png" alt="Hospital" className="building-img" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-container">
          <h2 className="section-title">Powerful Features for Modern Healthcare</h2>
          <p className="section-subtitle">
            Our platform provides everything you need to manage healthcare operations efficiently and effectively.
          </p>

          <div className="features-grid">
            {/* Patient Records */}
            <div className="feature-card">
              <div className="feature-icon blue">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3M7 7H17V9H7V7M7 11H17V13H7V11M7 15H17V17H7V15Z"/>
                </svg>
              </div>
              <h3 className="feature-title">Patient Records</h3>
              <p className="feature-description">
                Secure, comprehensive patient record management with easy access to medical histories, prescriptions, and lab results.
              </p>
              <ul className="feature-list">
                <li>Digital medical records</li>
                <li>HIPAA compliant security</li>
                <li>Easy search and filtering</li>
              </ul>
            </div>

            {/* Appointment Scheduling */}
            <div className="feature-card">
              <div className="feature-icon green">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M12 10H17V15H12"/>
                </svg>
              </div>
              <h3 className="feature-title">Appointment Scheduling</h3>
              <p className="feature-description">
                Streamlined appointment booking system with automated reminders, calendar integration, and real-time availability.
              </p>
              <ul className="feature-list">
                <li>Online booking system</li>
                <li>Automated reminders</li>
                <li>Calendar synchronization</li>
              </ul>
            </div>

            {/* Doctor Portal */}
            <div className="feature-card">
              <div className="feature-icon purple">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                </svg>
              </div>
              <h3 className="feature-title">Doctor Portal</h3>
              <p className="feature-description">
                Comprehensive dashboard for healthcare providers with patient management tools, scheduling, and reporting features.
              </p>
              <ul className="feature-list">
                <li>Provider dashboard</li>
                <li>Patient management</li>
                <li>Treatment planning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="reviews">
        <div className="section-container">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">
            Trusted by healthcare professionals and patients worldwide
          </p>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <Avatar name="Sarah Johnson" size="large" />
                <div className="testimonial-info">
                  <h4>Dr. Sarah Johnson</h4>
                  <p>General Practitioner</p>
                </div>
              </div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "MediCare Pro has revolutionized how I manage my practice. The patient records system is intuitive and the scheduling feature has reduced no-shows by 40%."
              </p>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <Avatar name="Michael Chen" size="large" />
                <div className="testimonial-info">
                  <h4>Michael Chen</h4>
                  <p>Hospital Administrator</p>
                </div>
              </div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "The comprehensive dashboard and reporting features have improved our operational efficiency significantly. I highly recommend for any healthcare facility."
              </p>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <Avatar name="Lakshmi Narayan" size="large" />
                <div className="testimonial-info">
                  <h4>Lakshmi Narayan</h4>
                  <p>Nurse Practitioner</p>
                </div>
              </div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "As a nurse practitioner, I love how easy it is to access patient information and update records. It's so intuitive and user-friendly."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Healthcare Management?</h2>
          <p className="cta-subtitle">
            Join thousands of healthcare professionals who trust MediCare Pro for their daily operations.
          </p>
          <div className="cta-buttons">
            <button className="btn-white" onClick={() => navigate('/login')}>
              Start Free Trial
            </button>
            <button className="btn-outline" onClick={() => navigate('/login')}>
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">💙</div>
              <span className="logo-text">MediCare Pro</span>
            </div>
            <p className="footer-description">
              Dedicated to healthcare excellence with smart, efficient management solutions for better patient care.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">📘</a>
              <a href="#" className="social-icon">🐦</a>
              <a href="#" className="social-icon">📧</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 MediCare Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
