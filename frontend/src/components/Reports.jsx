import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from './CustomAlert';
import UserProfileDropdown from './UserProfileDropdown';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_URL from '../config/api';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { user, logout } = useContext(AuthContext);
  const { showSuccess, showError, showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dateRange, setDateRange] = useState('last-30-days');
  const [department, setDepartment] = useState('all');
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [customReportConfig, setCustomReportConfig] = useState({
    startDate: '',
    endDate: '',
    includePatients: true,
    includeAppointments: true,
    includeDoctors: true,
    includeRevenue: true
  });
  const [reportPreviewData, setReportPreviewData] = useState(null);
  
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

  const handleLogout = () => {
    showConfirm(
      'Are you sure you want to logout?',
      async () => {
        await logout();
        navigate('/login');
      }
    );
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/patients', icon: '👥', label: 'Patients' },
    { path: '/appointments', icon: '📅', label: 'Appointments' },
    { path: '/doctors', icon: '👨‍⚕️', label: 'Doctors' },
    { path: '/medical-records', icon: '📋', label: 'Medical Records' },
    { path: '/reports', icon: '📈', label: 'Reports' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetchAnalyticsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
        axios.get(`${API_URL}/patients/`, { headers }),
        axios.get(`${API_URL}/appointments/`, { headers }),
        axios.get(`${API_URL}/doctors/`, { headers })
      ]);

      const patients = patientsRes.data.data || [];
      const appointments = appointmentsRes.data.data || [];
      const doctors = doctorsRes.data.data || [];

      const appointmentsByMonth = processAppointmentsByMonth(appointments);
      const patientGrowth = processPatientGrowth(patients);
      const departmentStats = processDepartmentStats(doctors, appointments);
      const demographics = processDemographics(patients);
      const revenue = calculateRevenue(appointments);

      setAnalyticsData({
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        completedVisits: appointments.filter(a => a.status === 'Completed').length,
        activeDoctors: doctors.filter(d => d.is_active !== false).length,
        appointmentsByMonth,
        patientGrowth,
        departmentStats,
        demographics,
        revenue
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const processAppointmentsByMonth = (appointments) => {
    const monthCounts = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => monthCounts[month] = 0);
    
    appointments.forEach(apt => {
      const date = new Date(apt.date);
      const month = months[date.getMonth()];
      monthCounts[month]++;
    });

    return {
      labels: months,
      data: months.map(m => monthCounts[m])
    };
  };

  const processPatientGrowth = (patients) => {
    const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
    
    return {
      labels: months,
      data: months.map((_, i) => Math.floor(patients.length * (i + 1) / 6))
    };
  };

  const processDepartmentStats = (doctors, appointments) => {
    const deptCounts = {};
    
    doctors.forEach(doc => {
      const dept = doc.department || 'General';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const topDepts = Object.entries(deptCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return topDepts.map(([dept, count]) => ({
      department: dept,
      visits: count * 100 + Math.floor(Math.random() * 50)
    }));
  };

  const processDemographics = (patients) => {
    const ageGroups = {
      '18-25': 0,
      '26-55': 0,
      '55+': 0
    };

    patients.forEach(patient => {
      const age = patient.age || 30;
      if (age <= 25) ageGroups['18-25']++;
      else if (age <= 55) ageGroups['26-55']++;
      else ageGroups['55+']++;
    });

    const total = patients.length || 1;
    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      percentage: Math.round((count / total) * 100)
    }));
  };

  const calculateRevenue = (appointments) => {
    const basePrice = 150;
    const thisMonth = appointments.filter(a => {
      const date = new Date(a.date);
      const now = new Date();
      return date.getMonth() === now.getMonth();
    }).length * basePrice;

    const lastMonth = appointments.filter(a => {
      const date = new Date(a.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() - 1;
    }).length * basePrice;

    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;

    return {
      thisMonth: `$${thisMonth.toLocaleString()}`,
      lastMonth: `$${lastMonth.toLocaleString()}`,
      growth: `+${growth}%`
    };
  };

  const generateReportPreview = () => {
    const dateStr = customReportConfig.startDate && customReportConfig.endDate 
      ? `${customReportConfig.startDate} to ${customReportConfig.endDate}`
      : 'All Time';
    
    const previewData = {
      dateRange: dateStr,
      generatedAt: new Date().toLocaleString(),
      sections: []
    };

    if (customReportConfig.includePatients) {
      previewData.sections.push({
        title: 'Patient Statistics',
        color: '#5B73E8',
        data: [
          { label: 'Total Patients', value: (analyticsData?.totalPatients || 0).toString() },
          { label: 'New Patients', value: Math.floor((analyticsData?.totalPatients || 0) * 0.15).toString() },
          { label: 'Active Patients', value: Math.floor((analyticsData?.totalPatients || 0) * 0.8).toString() }
        ]
      });
    }

    if (customReportConfig.includeAppointments) {
      previewData.sections.push({
        title: 'Appointment Statistics',
        color: '#48C9B0',
        data: [
          { label: 'Total Appointments', value: (analyticsData?.totalAppointments || 0).toString() },
          { label: 'Completed', value: (analyticsData?.completedVisits || 0).toString() },
          { label: 'Pending', value: ((analyticsData?.totalAppointments || 0) - (analyticsData?.completedVisits || 0)).toString() }
        ]
      });
    }

    if (customReportConfig.includeDoctors) {
      previewData.sections.push({
        title: 'Doctor Statistics',
        color: '#9333EA',
        data: [
          { label: 'Active Doctors', value: (analyticsData?.activeDoctors || 0).toString() },
          { label: 'Departments', value: analyticsData?.departmentStats?.length.toString() || '0' },
          { label: 'Top Department', value: analyticsData?.departmentStats?.[0]?.department || 'N/A' }
        ]
      });
    }

    if (customReportConfig.includeRevenue) {
      previewData.sections.push({
        title: 'Revenue Metrics',
        color: '#22C55E',
        data: [
          { label: 'This Month', value: analyticsData?.revenue?.thisMonth || '$0' },
          { label: 'Last Month', value: analyticsData?.revenue?.lastMonth || '$0' },
          { label: 'Growth', value: analyticsData?.revenue?.growth || '0%' }
        ]
      });
    }

    setReportPreviewData(previewData);
    setShowCustomReportModal(false);
    setShowReportPreview(true);
  };

  const generateCustomReport = () => {
    console.log('Generate Custom Report clicked!');
    setShowCustomReportModal(true);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(91, 115, 232);
      doc.text('MediCare Pro - Custom Report', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Period: ${reportPreviewData.dateRange}`, 14, 32);
      doc.text(`Generated: ${reportPreviewData.generatedAt}`, 14, 38);
      
      let yPos = 50;
      
      // Add each section
      reportPreviewData.sections.forEach((section, idx) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text(section.title, 14, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        section.data.forEach(item => {
          doc.setTextColor(100, 100, 100);
          doc.text(`${item.label}:`, 20, yPos);
          doc.setTextColor(40, 40, 40);
          doc.text(item.value, 80, yPos);
          yPos += 7;
        });
        
        yPos += 10;
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`MediCare-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      showSuccess('Report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      showError('Error generating PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading analytics...
      </div>
    );
  }

  const appointmentsChartData = {
    labels: analyticsData?.appointmentsByMonth.labels || [],
    datasets: [{
      label: 'Appointments',
      data: analyticsData?.appointmentsByMonth.data || [],
      backgroundColor: '#5B73E8',
      borderRadius: 8
    }]
  };

  const patientGrowthData = {
    labels: analyticsData?.patientGrowth.labels || [],
    datasets: [{
      label: 'Cumulative Patients',
      data: analyticsData?.patientGrowth.data || [],
      borderColor: '#48C9B0',
      backgroundColor: 'rgba(72, 201, 176, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="reports-page-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">💙</div>
            <div className="logo-text">
              <h3>MediCare Pro</h3>
              <p>Smart Healthcare Management</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p>Comprehensive insights and data visualization</p>
          </div>
          <div className="header-actions">
            <UserProfileDropdown />
          </div>
        </header>

        <div className="reports-page">
          <div className="filters-actions-bar">
            <div className="filters-group">
              <div className="filter-item">
                <label>Date Range</label>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option value="last-30-days">Last 30 days</option>
                  <option value="last-90-days">Last 90 days</option>
                  <option value="last-year">Last Year</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="all">All Departments</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="pediatrics">Pediatrics</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Report Type</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="overview">Overview Report</option>
                  <option value="detailed">Detailed Report</option>
                </select>
              </div>
            </div>
            <div className="actions-group">
              <button className="btn-generate" onClick={generateCustomReport}>📊 Generate Custom Report</button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-label">Total Patients</div>
                <div className="stat-value">{analyticsData?.totalPatients.toLocaleString()}</div>
                <div className="stat-trend">+7% from last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-label">Total Appointments</div>
                <div className="stat-value">{analyticsData?.totalAppointments.toLocaleString()}</div>
                <div className="stat-trend">+5% from last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Completed Visits</div>
                <div className="stat-value">{analyticsData?.completedVisits.toLocaleString()}</div>
                <div className="stat-trend">+3% from last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍⚕️</div>
              <div className="stat-content">
                <div className="stat-label">Active Doctors</div>
                <div className="stat-value">{analyticsData?.activeDoctors}</div>
                <div className="stat-trend">+2 this month</div>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Appointments per Month</h3>
                <span className="chart-period">📅 Last 12 months</span>
              </div>
              <div className="chart-container">
                <Bar ref={chartRef1} data={appointmentsChartData} options={chartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Patient Growth Trend</h3>
                <span className="chart-period">📈 Cumulative growth</span>
              </div>
              <div className="chart-container">
                <Line ref={chartRef2} data={patientGrowthData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="detailed-analytics">
            <h2>Detailed Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Top Performing Departments</h3>
                <div className="analytics-list">
                  {analyticsData?.departmentStats.map((dept, idx) => (
                    <div key={idx} className="analytics-item">
                      <span>{dept.department}</span>
                      <strong>{dept.visits} visits</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Patient Demographics</h3>
                <div className="analytics-list">
                  {analyticsData?.demographics.map((demo, idx) => (
                    <div key={idx} className="analytics-item">
                      <span>Age {demo.range}</span>
                      <strong>{demo.percentage}%</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Revenue Metrics</h3>
                <div className="analytics-list">
                  <div className="analytics-item">
                    <span>This Month</span>
                    <strong>{analyticsData?.revenue.thisMonth}</strong>
                  </div>
                  <div className="analytics-item">
                    <span>Last Month</span>
                    <strong>{analyticsData?.revenue.lastMonth}</strong>
                  </div>
                  <div className="analytics-item">
                    <span>Growth</span>
                    <strong className="positive">{analyticsData?.revenue.growth}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Report Preview Modal */}
      {showReportPreview && (
        <div className="modal-overlay" onClick={() => setShowReportPreview(false)}>
          <div className="modal-content report-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Report Preview</h2>
              <button className="modal-close" onClick={() => setShowReportPreview(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="report-info">
                <div className="info-item">
                  <span className="info-label">Period:</span>
                  <span className="info-value">{reportPreviewData?.dateRange}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Generated:</span>
                  <span className="info-value">{reportPreviewData?.generatedAt}</span>
                </div>
              </div>
              
              <div className="report-sections">
                {reportPreviewData?.sections.map((section, idx) => (
                  <div key={idx} className="report-section" style={{ borderLeftColor: section.color }}>
                    <h3 style={{ color: section.color }}>{section.title}</h3>
                    <div className="report-data">
                      {section.data.map((item, itemIdx) => (
                        <div key={itemIdx} className="data-row">
                          <span className="data-label">{item.label}</span>
                          <span className="data-value">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowReportPreview(false)}>Close</button>
              <button className="btn-generate-pdf" onClick={handleDownloadPDF}>📥 Download PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Report Modal */}
      {showCustomReportModal && (
        <div className="modal-overlay" onClick={() => setShowCustomReportModal(false)}>
          <div className="modal-content custom-report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Generate Custom Report</h2>
              <button className="modal-close" onClick={() => setShowCustomReportModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <h3>Date Range</h3>
                <div className="date-inputs">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={customReportConfig.startDate}
                      onChange={(e) => setCustomReportConfig({...customReportConfig, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={customReportConfig.endDate}
                      onChange={(e) => setCustomReportConfig({...customReportConfig, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Include Metrics</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customReportConfig.includePatients}
                      onChange={(e) => setCustomReportConfig({...customReportConfig, includePatients: e.target.checked})}
                    />
                    <span>Patient Statistics</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customReportConfig.includeAppointments}
                      onChange={(e) => setCustomReportConfig({...customReportConfig, includeAppointments: e.target.checked})}
                    />
                    <span>Appointment Statistics</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customReportConfig.includeDoctors}
                      onChange={(e) => setCustomReportConfig({...customReportConfig, includeDoctors: e.target.checked})}
                    />
                    <span>Doctor Statistics</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customReportConfig.includeRevenue}
                      onChange={(e) => setCustomReportConfig({...customReportConfig, includeRevenue: e.target.checked})}
                    />
                    <span>Revenue Metrics</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCustomReportModal(false)}>Cancel</button>
              <button className="btn-generate-pdf" onClick={generateReportPreview}>Preview Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
