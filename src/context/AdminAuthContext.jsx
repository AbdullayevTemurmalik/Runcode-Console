import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const token = localStorage.getItem('runcode_admin_token');
      if (!token) return null;
      const cached = localStorage.getItem('runcode_admin_user');
      if (cached) return JSON.parse(cached);
      return { role: 'admin', username: 'temur', fullName: 'Temur Abdullayev (Admin)' };
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const fetchCurrentAdmin = async () => {
    const token = localStorage.getItem('runcode_admin_token');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const data = await adminApi.get('/auth/me');
      if (data && data.success && data.user && data.user.role === 'admin') {
        setAdmin(data.user);
        localStorage.setItem('runcode_admin_user', JSON.stringify(data.user));
      } else if (data && data.success === false) {
        logout();
      }
    } catch (error) {
      console.warn('[AdminAuth] Sessiyani tekshirish ogohlantirishi:', error.message);
      // Faqat token bekor qilingan yoki 401 bo'lgandagina logout qilamiz
      const msg = String(error.message || '');
      if (msg.includes('401') || msg.includes('eskirgan') || msg.includes('topilmadi')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAdmin();
  }, []);

  const login = async (username, password) => {
    const data = await adminApi.post('/auth/admin-login', { username, password });
    if (data.success && data.token) {
      if (data.user && data.user.role !== 'admin') {
        throw new Error('Sizda administratorlik huquqi mavjud emas.');
      }
      localStorage.setItem('runcode_admin_token', data.token);
      if (data.user) {
        localStorage.setItem('runcode_admin_user', JSON.stringify(data.user));
      }
      setAdmin(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('runcode_admin_token');
    localStorage.removeItem('runcode_admin_user');
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
