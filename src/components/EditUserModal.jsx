import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Mail, Shield, Sparkles, Loader2, Save } from 'lucide-react';

export const EditUserModal = ({ isOpen, onClose, user, onSave, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'user',
    planName: 'none'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'user',
        planName: 'none'
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Foydalanuvchini Tahrirlash
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                @{user.username || 'user'} &middot; ID: {user.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Ism Familiya */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 dark:text-gray-300">To'liq Ism (F.I.SH)</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Masalan: Temurmalik Abdullayev"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Telefon */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 dark:text-gray-300">Telefon Raqami</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 dark:text-gray-300">Email Manzili</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="foydalanuvchi@mail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Rol va Obuna biriktirish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Rol */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Foydalanuvchi Roli</label>
              <CustomSelect
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                disabled={user.username === 'temurmalik'}
                options={[
                  { value: 'user', label: 'Talaba (Oddiy Foydalanuvchi)', subtext: 'Darsliklar va topshiriqlar' },
                  { value: 'admin', label: 'Ma\'mur (Admin)', subtext: 'To\'liq boshqaruv huquqlari' }
                ]}
              />
            </div>

            {/* Obuna biriktirish */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Yangi Tarif Biriktirish</label>
              <CustomSelect
                value={formData.planName}
                onChange={(val) => setFormData({ ...formData, planName: val })}
                options={[
                  { value: 'none', label: 'O\'zgarishsiz qoldirish', subtext: 'Mavjud holat saqlanadi' },
                  { value: '1_month', label: 'Plus Obuna (+1 oylik)', subtext: '50 000 so\'m' },
                  { value: '2_months', label: 'Pro Obuna (+2 oylik)', subtext: '90 000 so\'m' },
                  { value: '3_months', label: 'Ultra Obuna (+3 oylik)', subtext: '120 000 so\'m' }
                ]}
              />
            </div>

          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Saqlash</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};
