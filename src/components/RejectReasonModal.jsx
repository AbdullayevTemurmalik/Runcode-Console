import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, XCircle, Check, Loader2 } from 'lucide-react';

export const RejectReasonModal = ({ isOpen, onClose, order, onConfirmReject }) => {
  const [selectedReason, setSelectedReason] = useState('Hisobga mablag\' kelib tushmagan');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);

  const REASONS = [
    'Soxta chek taqdim etilgan',
    'Hisobga mablag\' kelib tushmagan',
    'To\'lov summasi noto\'g\'ri yoki yetarli emas',
    'Chek fotosurati sifatsiz / ma\'lumotlar o\'qib bo\'lmaydi'
  ];

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

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirmReject(selectedReason, customNote.trim(), order.id);
      onClose();
    } catch (err) {
      console.error('Rad etishda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Dark Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden my-8 z-10 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              To'lovni Rad Etish Sababi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Foydalanuvchi <strong>{order.user_name}</strong> ({order.amount.toLocaleString()} so'm) uchun rad etish sababini tanlang. Ushbu sabab to'g'ridan-to'g'ri foydalanuvchining shaxsiy bildirishnomasida ko'rsatiladi.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Standart Sabablar (Biri tanlansin):
            </label>
            {REASONS.map((r) => {
              const isSelected = selectedReason === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReason(r)}
                  className={`w-full text-left p-3.5 rounded-2xl text-xs font-semibold border flex items-center space-x-3 transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-rose-500 bg-rose-500' : 'border-gray-400'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span>{r}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Qo'shimcha izoh (ixtiyoriy):
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Masalan: Karta raqamiga pul tushmagan, chekdagi vaqt bilan mos emas..."
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/25 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              <span>Rad Etishni Tasdiqlash</span>
            </button>
          </div>
        </form>

      </div>
      </div>
    </div>,
    document.body
  );
};
