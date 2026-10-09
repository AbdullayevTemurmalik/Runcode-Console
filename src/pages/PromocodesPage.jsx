import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Percent, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ShieldAlert, 
  Check, 
  Copy,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { ConfirmModal } from '../components/ConfirmModal';

const AVAILABLE_PLANS = [
  { key: '7_days', label: '7 kunlik (Plus)', color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  { key: '1_month', label: '1 oylik (Pro)', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { key: '2_months', label: '2 oylik (Pro+)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { key: '3_months', label: '3 oylik (Ultra)', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
];

export const PromocodesPage = () => {
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, item: null });

  // Form State
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [durationHours, setDurationHours] = useState('24');
  const [excludedPlans, setExcludedPlans] = useState([]);
  const [formError, setFormError] = useState('');

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Promocodes
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-promocodes'],
    queryFn: () => adminApi.get('/admin/promocodes'),
    staleTime: 1000 * 30,
  });

  const promocodes = data?.promocodes || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newPromo) => adminApi.post('/admin/promocodes', newPromo),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-promocodes']);
      setCode('');
      setDiscountPercent('10');
      setDurationHours('24');
      setExcludedPlans([]);
      setFormError('');
      showToast('success', res.message || 'Promokod muvaffaqiyatli yaratildi!');
    },
    onError: (err) => {
      const msg = err.message || 'Promokod yaratishda xatolik yuz berdi';
      setFormError(msg);
      showToast('error', msg);
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.delete(`/admin/promocodes/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-promocodes']);
      setDeleteModalState({ isOpen: false, item: null });
      showToast('success', res.message || 'Promokod muvaffaqiyatli o\'chirildi!');
    },
    onError: (err) => {
      showToast('error', err.message || 'Promokodni o\'chirishda xatolik yuz berdi');
    }
  });

  const handleToggleExcludedPlan = (planKey) => {
    if (excludedPlans.includes(planKey)) {
      setExcludedPlans(excludedPlans.filter((k) => k !== planKey));
    } else {
      setExcludedPlans([...excludedPlans, planKey]);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const formattedCode = code.trim().toUpperCase();
    if (!formattedCode) {
      setFormError('Iltimos, promokod nomini kiriting');
      return;
    }

    if (formattedCode.length < 3 || formattedCode.length > 30) {
      setFormError('Promokod nomi 3 tadan 30 tagacha belgidan iborat bo\'lishi kerak');
      return;
    }

    createMutation.mutate({
      code: formattedCode,
      discount_percent: parseInt(discountPercent, 10),
      duration_hours: parseInt(durationHours, 10),
      excluded_plans: excludedPlans
    });
  };

  const handleCopy = (promoCode) => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(promoCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatRemainingTime = (expiresAt, isActive) => {
    if (!isActive) return { text: "Muddati o'tgan", isExpired: true };
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return { text: "Muddati o'tgan", isExpired: true };

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      const remHours = diffHours % 24;
      return { text: `${days} kun ${remHours}s qoldi`, isExpired: false };
    }

    return { text: `${diffHours} soat ${diffMins} daq qoldi`, isExpired: false };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-[99999] flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-top-3 ${
          toastMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Promokodlar Boshqaruvi
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Maxsus chegirmali promokodlar yaratish, amal qilish muddatlarini belgilash va nazorat qilish
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#141824] border border-gray-200/80 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-emerald-400 transition cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-brand-500' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Top Grid: Form and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Promocode Form Card */}
        <div className="lg:col-span-2 bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/[0.07] p-5 sm:p-7 shadow-xl shadow-gray-200/40 dark:shadow-black/40">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/[0.05]">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Yangi Promokod Yaratish
              </h2>
            </div>
            <span className="text-[11px] text-gray-400">Barcha maydonlar talab etiladi</span>
          </div>

          <form onSubmit={handleCreateSubmit} className="mt-5 space-y-5">
            {formError && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Promo Code Input */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Promokod Nomi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="RUNCODE2026"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-xs font-mono font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 uppercase"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Avtomatik KATTA harflarda saqlanadi</p>
              </div>

              {/* Discount Percentage Select */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Chegirma Foizi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Percent className="w-4 h-4" />
                  </div>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="5" className="dark:bg-[#141824]">5% Chegirma</option>
                    <option value="10" className="dark:bg-[#141824]">10% Chegirma</option>
                    <option value="15" className="dark:bg-[#141824]">15% Chegirma</option>
                    <option value="20" className="dark:bg-[#141824]">20% Chegirma</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Chegirma qiymati (5%, 10%, 15%, 20%)</p>
              </div>

              {/* Duration Hours Select */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Amal Qilish Muddati
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="24" className="dark:bg-[#141824]">1 kun (24 soat)</option>
                    <option value="48" className="dark:bg-[#141824]">2 kun (48 soat)</option>
                    <option value="72" className="dark:bg-[#141824]">3 kun (72 soat)</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Belgilangan muddatdan so'ng tugaydi</p>
              </div>
            </div>

            {/* Excluded Plans Custom Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Chegirma Amal Qilmaydigan Tariflar
                </label>
                <span className="text-[10px] text-gray-400">
                  {excludedPlans.length === 0 
                    ? 'Barcha tariflar uchun chegirma amal qiladi' 
                    : `${excludedPlans.length} ta tarifda chegirma ishlamaydi`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_PLANS.map((plan) => {
                  const isExcluded = excludedPlans.includes(plan.key);
                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => handleToggleExcludedPlan(plan.key)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                        isExcluded
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <p className="truncate text-[11px]">{plan.label}</p>
                        <p className={`text-[9px] font-normal ${isExcluded ? 'text-rose-500' : 'text-gray-400'}`}>
                          {isExcluded ? 'Chegirma yo\'q' : 'Chegirma bor'}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 border ${
                        isExcluded 
                          ? 'bg-rose-500 border-rose-500 text-white' 
                          : 'border-gray-300 dark:border-white/20'
                      }`}>
                        {isExcluded && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 hover:opacity-95 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yaratilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Promokodni Yaratish</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Stats & Info Card */}
        <div className="bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/[0.07] p-5 sm:p-7 shadow-xl shadow-gray-200/40 dark:shadow-black/40 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-white/[0.05]">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Promokodlar Statistikasi
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Jami yaratilgan:</span>
                <span className="text-sm font-black text-gray-900 dark:text-white font-mono">
                  {promocodes.length} ta
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Hozirda faol:</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {promocodes.filter(p => p.is_active && new Date(p.expires_at) > new Date()).length} ta
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Muddati tugagan:</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
                  {promocodes.filter(p => !p.is_active || new Date(p.expires_at) <= new Date()).length} ta
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Muhim eslatma:
            </p>
            <p className="text-[11px] leading-relaxed text-amber-600/90 dark:text-amber-400/90">
              Promokod muddati tugagach yoki o'chirilgach, yangi foydalanuvchilar undan foydalana olmaydi. Avval qilingan to'lovlar o'zgarishsiz qoladi.
            </p>
          </div>
        </div>
      </div>

      {/* Promocodes Table Card */}
      <div className="bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/[0.07] overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/40">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Tag className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Mavjud Promokodlar Ro'yxati
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-400 font-mono">
            {promocodes.length} ta yozuv
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Promokodlar yuklanmoqda...</p>
          </div>
        ) : promocodes.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] text-gray-400 flex items-center justify-center mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Hozircha birorta ham promokod yaratilmagan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/[0.02] text-gray-400 dark:text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-200/80 dark:border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">Promokod</th>
                  <th className="px-6 py-4">Chegirma</th>
                  <th className="px-6 py-4">Muddat & Qolgan Vaqt</th>
                  <th className="px-6 py-4">Istisno Qilingan Tariflar</th>
                  <th className="px-6 py-4">Holat</th>
                  <th className="px-6 py-4">Yaratilgan</th>
                  <th className="px-6 py-4 text-right">O'chirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {promocodes.map((promo) => {
                  const rem = formatRemainingTime(promo.expires_at, promo.is_active);
                  const excludedList = Array.isArray(promo.excluded_plans) ? promo.excluded_plans : [];

                  return (
                    <tr key={promo.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors group">
                      {/* Code Name & Copy */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm tracking-wide text-gray-900 dark:text-white px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200/70 dark:border-white/[0.07]">
                            {promo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(promo.code)}
                            title="Nusxalash"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                          >
                            {copiedCode === promo.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount Percent */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                          <Percent className="w-3 h-3" />
                          <span>{promo.discount_percent}%</span>
                        </span>
                      </td>

                      {/* Duration & Remaining Time */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 text-gray-900 dark:text-gray-200 font-bold">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{promo.duration_hours} soatlik ({Math.round(promo.duration_hours / 24)} kun)</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-[11px]">
                            <span className={rem.isExpired ? 'text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                              {rem.text}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">
                            Tugash: {new Date(promo.expires_at).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </td>

                      {/* Excluded Plans */}
                      <td className="px-6 py-4">
                        {excludedList.length === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Barchasiga amal qiladi
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {excludedList.map((planKey) => {
                              const planObj = AVAILABLE_PLANS.find(p => p.key === planKey);
                              return (
                                <span
                                  key={planKey}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                >
                                  {planObj ? planObj.label : planKey}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {rem.isExpired ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20">
                            <XCircle className="w-3 h-3 mr-1 text-gray-400" />
                            Muddati o'tgan
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                            Faol
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-gray-400 font-mono text-[11px]">
                        {new Date(promo.created_at).toLocaleDateString('uz-UZ')}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteModalState({ isOpen: true, item: promo })}
                          title="Promokodni o'chirish"
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, item: null })}
        onConfirm={() => {
          if (deleteModalState.item) {
            deleteMutation.mutate(deleteModalState.item.id);
          }
        }}
        title="Promokodni o'chirish"
        message={`Haqiqatan ham "${deleteModalState.item?.code}" promokodini butunlay o'chirib tashlamoqchimisiz?`}
        confirmText="Ha, o'chirish"
        cancelText="Bekor qilish"
        type="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
export default PromocodesPage;
