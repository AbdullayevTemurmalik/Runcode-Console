import axios from 'axios';
import { safeStorage } from '../utils/storage';

const getAdminBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== '/api') {
    return envUrl;
  }
  // Production muhitida (Vercel yoki custom domen) bevosita global Render backendga ulanish
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return 'https://runcode-engine.onrender.com/api';
  }
  return '/api';
};

const adminApi = axios.create({
  baseURL: getAdminBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

adminApi.interceptors.request.use((config) => {
  const token = safeStorage.getItem('runcode_admin_token') || safeStorage.getItem('runcode_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

adminApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const serverMessage = error.response?.data?.message;
    let message = serverMessage;
    if (!message) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        message = "Server bilan aloqa o'rnatib bo'lmadi. Iltimos, internet yoki serverni tekshiring.";
      } else if (error.response?.status === 401) {
        message = "Admin sessiyasi eskirgan yoki login/parol noto'g'ri.";
      } else if (error.response?.status === 403) {
        message = "Ushbu amalni bajarish uchun admin huquqi talab etiladi.";
      } else if (error.response?.status === 404) {
        message = "So'ralgan ma'lumot topilmadi.";
      } else if (error.response?.status >= 500) {
        message = "Serverda vaqtinchalik xatolik yuz berdi.";
      } else {
        message = error.message || 'Kutilmagan xatolik yuz berdi';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default adminApi;
