import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle, Download, ExternalLink, FileText, User, CreditCard } from 'lucide-react';

export const CheckPreviewModal = ({ isOpen, onClose, order, onApprove, onReject }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const isPdf = order.receipt_url?.toLowerCase().endsWith('.pdf');

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Dark Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden my-8 z-10 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              To'lov Cheki Ko'rinishi (Order #{order.id})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Order Summary Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 text-xs">
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[9px]">Foydalanuvchi</p>
              <p className="font-bold text-gray-900 dark:text-white truncate">{order.user_name}</p>
              {order.user_username && (
                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold truncate">@{order.user_username}</p>
              )}
              {order.user_phone && (
                <p className="text-[10px] text-gray-400 truncate">{order.user_phone}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[9px]">Tarif</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {order.plan_name === '1_month' ? 'Plus (1 Oylik)' : order.plan_name === '2_months' ? 'Pro (2 Oylik)' : 'Ultra (3 Oylik)'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[9px]">Summa</p>
              <p className="font-bold text-brand-600 dark:text-brand-400">{order.amount.toLocaleString()} so'm</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[9px]">To'lov Usuli</p>
              <p className="font-bold text-gray-900 dark:text-white capitalize">
                {order.payment_method === 'apps' ? 'To\'lov ilovasi' : 'Bankomat'}
              </p>
            </div>
          </div>

          {/* Receipt Image / PDF Display */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center min-h-[300px] max-h-[500px] p-2 relative">
            {order.receipt_url ? (
              isPdf ? (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">PDF Chek Hujjati</p>
                  <a
                    href={order.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
                  >
                    <span>PDF Faylni Yangi Oynada Ochish</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="overflow-auto max-h-[480px] w-full flex justify-center">
                  <img
                    src={order.receipt_url}
                    alt="Chek rasmi"
                    className="max-h-[460px] object-contain rounded-xl shadow"
                  />
                </div>
              )
            ) : (
              <p className="text-xs text-gray-400">Chek fayli yuklanmagan</p>
            )}
          </div>

          {/* Action Buttons if Pending */}
          {order.status === 'pending' && (
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReject(order);
                }}
                className="px-5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Rad Etish (Sabab Bilan)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApprove(order.id);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tasdiqlash & Obunani Yoqish</span>
              </button>
            </div>
          )}

        </div>

      </div>
      </div>
    </div>,
    document.body
  );
};
