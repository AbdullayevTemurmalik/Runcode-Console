import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentAdmin = async () => {
    const token = localStorage.getItem('runcode_admin_token');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const data = await adminApi.get('/auth/me');
      if (data.success && data.user && data.user.role === 'admin') {
        setAdmin(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Admin avtorizatsiyasida xatolik:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAdmin();
  }, []);

  const login = async (email, password) => {
    const data = await adminApi.post('/auth/login', { email, password });
    if (data.success && data.token) {
      if (data.user.role !== 'admin') {
        throw new Error('Sizda administratorlik huquqi mavjud emas.');
      }
      localStorage.setItem('runcode_admin_token', data.token);
      setAdmin(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('runcode_admin_token');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: !!admin,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
