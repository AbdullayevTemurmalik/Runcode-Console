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
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    try {
      const urlObj = new URL(apiUrl);
      return `${urlObj.origin}${cleanPath}`;
    } catch {
      // url parse xatoligi bo'lsa fallback
    }
  }

  if (typeof window !== 'undefined' && forceAbsolute) {
    if (window.location.port === '5174') {
      return `http://localhost:5000${cleanPath}`;
    }
    return `${window.location.origin}${cleanPath}`;
  }

  return cleanPath;
};
