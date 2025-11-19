import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/auth/profile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, {
        email,
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.data.access);
        localStorage.setItem('refresh_token', response.data.data.refresh);
        setUser(response.data.data.user);
        return { success: true, user: response.data.data.user };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      await axios.post(`${API_URL}/auth/logout/`, 
        { refresh },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('access_token')}` 
          }
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
