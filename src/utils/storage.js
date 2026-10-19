/**
 * Safe localStorage and sessionStorage wrappers for Admin
 * Prevents unhandled SecurityError and QuotaExceededError crashes
 * on mobile browsers in private browsing mode, restricted iframes, or WebViews.
 */

export const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};
