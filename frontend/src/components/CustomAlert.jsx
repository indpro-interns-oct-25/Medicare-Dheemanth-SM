import React, { createContext, useContext, useState, useCallback } from 'react';
import './CustomAlert.css';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const alert = { id, message, type, duration };
    
    setAlerts(prev => [...prev, alert]);

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    showAlert(message, 'success', duration);
  }, [showAlert]);

  const showError = useCallback((message, duration) => {
    showAlert(message, 'error', duration);
  }, [showAlert]);

  const showWarning = useCallback((message, duration) => {
    showAlert(message, 'warning', duration);
  }, [showAlert]);

  const showInfo = useCallback((message, duration) => {
    showAlert(message, 'info', duration);
  }, [showAlert]);

  const showConfirm = useCallback((message, onConfirm, onCancel) => {
    const id = Date.now() + Math.random();
    const alert = { 
      id, 
      message, 
      type: 'confirm',
      onConfirm: () => {
        onConfirm && onConfirm();
        removeAlert(id);
      },
      onCancel: () => {
        onCancel && onCancel();
        removeAlert(id);
      }
    };
    
    setAlerts(prev => [...prev, alert]);
  }, []);

  return (
    <AlertContext.Provider value={{ 
      showAlert, 
      showSuccess, 
      showError, 
      showWarning, 
      showInfo,
      showConfirm,
      removeAlert 
    }}>
      {children}
      <div className="custom-alerts-container">
        {alerts.map(alert => (
          <CustomAlertItem 
            key={alert.id} 
            alert={alert} 
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

const CustomAlertItem = ({ alert, onClose }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      case 'confirm':
        return '?';
      default:
        return 'ℹ';
    }
  };

  const getTitle = () => {
    switch (alert.type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      case 'confirm':
        return 'Confirm Action';
      default:
        return 'Notification';
    }
  };

  if (alert.type === 'confirm') {
    return (
      <div className={`custom-alert custom-alert-${alert.type}`}>
        <div className="custom-alert-content">
          <div className="custom-alert-icon-wrapper">
            <div className={`custom-alert-icon icon-${alert.type}`}>
              {getIcon()}
            </div>
          </div>
          <div className="custom-alert-body">
            <h4 className="custom-alert-title">{getTitle()}</h4>
            <p className="custom-alert-message">{alert.message}</p>
            <div className="custom-alert-actions">
              <button 
                className="custom-alert-btn btn-confirm"
                onClick={alert.onConfirm}
              >
                Confirm
              </button>
              <button 
                className="custom-alert-btn btn-cancel"
                onClick={alert.onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`custom-alert custom-alert-${alert.type}`}>
      <div className="custom-alert-content">
        <div className="custom-alert-icon-wrapper">
          <div className={`custom-alert-icon icon-${alert.type}`}>
            {getIcon()}
          </div>
        </div>
        <div className="custom-alert-body">
          <h4 className="custom-alert-title">{getTitle()}</h4>
          <p className="custom-alert-message">{alert.message}</p>
        </div>
        <button className="custom-alert-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="custom-alert-progress">
        <div 
          className="custom-alert-progress-bar" 
          style={{ 
            animation: alert.duration > 0 ? `progress ${alert.duration}ms linear` : 'none'
          }}
        />
      </div>
    </div>
  );
};
