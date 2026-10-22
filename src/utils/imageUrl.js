import { safeStorage } from './storage';

/**
 * Statik fayllar (cheklar, yuklangan rasmlar) uchun to'liq URL manzilini hisoblash
 * Productionda agar VITE_API_URL=https://api.runcode.uz/api bo'lsa,
 * /uploads/file.png ni https://api.runcode.uz/uploads/file.png ga aylantiradi.
 * Lokal muhitda esa mos backend portiga (5000) yoki nisbiy yo'lga yo'naltiradi.
 */
export const getImageUrl = (path, forceAbsolute = false) => {
  if (!path) return '';
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('data:') || 
    path.startsWith('blob:')
  ) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const rawEnv = import.meta.env.VITE_API_URL;
  const apiUrl = rawEnv
    ? rawEnv
    : (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
        ? 'https://runcode-engine.onrender.com/api'
        : '');
  
  let finalUrl = cleanPath;
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    try {
      const urlObj = new URL(apiUrl);
      finalUrl = `${urlObj.origin}${cleanPath}`;
    } catch {
      // url parse xatoligi bo'lsa fallback
    }
  } else if (typeof window !== 'undefined' && forceAbsolute) {
    if (window.location.port === '5174') {
      finalUrl = `http://localhost:5000${cleanPath}`;
    } else {
      finalUrl = `${window.location.origin}${cleanPath}`;
    }
  }

  // Himoyalangan to'lov cheklariga admin tokenini qo'shish
  if (finalUrl.includes('receipt-') || finalUrl.includes('/receipts/')) {
    const adminToken = safeStorage.getItem('runcode_admin_token') || safeStorage.getItem('runcode_token');
    if (adminToken && !finalUrl.includes('token=')) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}token=${encodeURIComponent(adminToken)}`;
    }
  }

  return finalUrl;
};
