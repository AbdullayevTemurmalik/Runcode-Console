import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Check, 
  CreditCard, 
  User, 
  Calendar, 
  AlertCircle, 
  Loader2, 
  FileText,
  DollarSign
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { CustomSelect } from './CustomSelect';

export const EditOrderModal = ({ order, isOpen, onClose, onSaveSuccess }) => {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [planName, setPlanName] = useState(order?.plan_name || '1_month');
  const [amount, setAmount] = useState(order?.amount || (order?.plan_name === '7_days' ? 20000 : order?.plan_name === '3_months' ? 120000 : order?.plan_name === '2_months' ? 90000 : 50000));
  const [paymentMethod, setPaymentMethod] = useState(order?.payment_method || 'apps');
  const [rejectionReason, setRejectionReason] = useState(order?.rejection_reason || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'pending');
      const p = order.plan_name || '1_month';
      setPlanName(p);
      setAmount(order.amount || (p === '7_days' ? 20000 : p === '3_months' ? 120000 : p === '2_months' ? 90000 : 50000));
      setPaymentMethod(order.payment_method || 'apps');
      setRejectionReason(order.rejection_reason || '');
    }
  }, [order]);

  const handlePlanChange = (newPlan) => {
    setPlanName(newPlan);
    if (newPlan === '7_days') setAmount(20000);
    else if (newPlan === '1_month') setAmount(50000);
    else if (newPlan === '2_months') setAmount(90000);
    else if (newPlan === '3_months') setAmount(120000);
  };

  if (!isOpen || !order) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await adminApi.put(`/admin/orders/${order.id}`, {
        status,
        plan_name: planName,
        amount: Number(amount),
        payment_method: paymentMethod,
        rejection_reason: status === 'rejected' ? (rejectionReason || 'Administrator tomonidan rad etildi') : null
      });

      if (data.success) {
        if (onSaveSuccess) onSaveSuccess(data.order);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'To\'lovni tahrirlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Dark Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true" 
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden my-8 z-10 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                To'lovni Tahrirlash #{order.id}
              </h3>
              <p className="text-xs text-gray-500">
                Foydalanuvchi: <strong className="text-gray-700 dark:text-gray-300">{order.user_name || order.user_email}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Holat (Status) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              To'lov Holati (Status):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('approved')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  status === 'approved'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-500/50'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tasdiqlangan</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  status === 'pending'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-500/50'
                }`}
              >
                <span>Kutilmoqda</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('rejected')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  status === 'rejected'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-rose-500/50'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Rad etilgan</span>
              </button>
            </div>
          </div>

          {/* 2. Tarif nomi va Summa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tarif rejasi:
              </label>
              <CustomSelect
                value={planName}
                onChange={(val) => handlePlanChange(val)}
                options={[
                  { value: '7_days', label: '7 Kunlik (Plus - 20 000 so\'m)' },
                  { value: '1_month', label: '1 Oylik (Pro - 50 000 so\'m)' },
                  { value: '2_months', label: '2 Oylik (Pro+ - 90 000 so\'m)' },
                  { value: '3_months', label: '3 Oylik (Ultra - 120 000 so\'m)' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Summa (so'm):
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step={1000}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-mono font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. To'lov usuli */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              To'lov usuli:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('apps')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === 'apps'
                    ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Mobil Ilova (Click/Payme)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bankomat')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === 'bankomat'
                    ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Bankomat Orqali
              </button>
            </div>
          </div>

          {/* 4. Rad etish sababi yoki izoh (agar rejected bo'lsa) */}
          {status === 'rejected' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Rad etish sababi:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="Chek ma'lumotlari to'g'ri kelmadi yoki summa kam..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>O'zgarishlarni Saqlash</span>
            </button>
          </div>

        </form>

      </div>
      </div>
    </div>,
    document.body
  );
};
