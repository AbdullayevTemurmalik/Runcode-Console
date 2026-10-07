import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, LogOut, X, Loader2 } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Tasdiqlash',
  message = 'Haqiqatan ham ushbu amalni bajarmoqchimisiz?',
  confirmText = 'Ha, bajarish',
  cancelText = 'Bekor qilish',
  type = 'danger',
  loading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const isLogout = type === 'logout';
  const isDelete = type === 'danger';

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Dark Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0c0d12] border border-gray-200 dark:border-white/10 shadow-2xl shadow-rose-500/10 p-6 sm:p-8 space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Icon */}
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl ${
            isLogout
              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-rose-500/20'
              : isDelete
              ? 'bg-red-500/10 border border-red-500/20 text-red-500 shadow-red-500/20'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-amber-500/20'
          }`}>
            {isLogout ? (
              <LogOut className="w-8 h-8 ml-1" />
            ) : isDelete ? (
              <Trash2 className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer text-center"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-1/2 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 ${
              isLogout || isDelete
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/30'
                : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-amber-600/30'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogout ? (
              <LogOut className="w-4 h-4" />
            ) : isDelete ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
