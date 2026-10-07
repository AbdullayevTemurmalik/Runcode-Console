import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  AlertCircle,
  Loader2, 
  FileText, 
  Search, 
  Check, 
  RefreshCw, 
  Phone, 
  User, 
  Image as ImageIcon, 
  Pencil, 
  Trash2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { CheckPreviewModal } from '../components/CheckPreviewModal';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const PaymentsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForPreview, setSelectedOrderForPreview] = useState(null);
  const [selectedOrderForReject, setSelectedOrderForReject] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isClearTrashModalOpen, setIsClearTrashModalOpen] = useState(false);

  // URL parametr o'zgarganda sinxronlash
  useEffect(() => {
    const s = searchParams.get('status') || '';
    if (s !== statusFilter) {
      setStatusFilter(s);
    }
  }, [searchParams]);

  const handleTabChange = (key) => {
    setStatusFilter(key);
    if (key) {
      setSearchParams({ status: key });
    } else {
      setSearchParams({});
    }
  };

  // Savat va umumiy statistika hisoblagichlari
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats-count'],
    queryFn: () => adminApi.get('/admin/stats'),
    staleTime: 1000 * 15,
    refetchInterval: 15000
  });
  const trashCount = statsData?.stats?.trashCount || 0;

  // TanStack Query orqali to'lovlarni olish (Oddiy yoki Savat)
  const isTrashTab = statusFilter === 'trash';
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => {
      if (isTrashTab) {
        return adminApi.get('/admin/trash/orders');
      }
      return adminApi.get(`/admin/orders${statusFilter ? `?status=${statusFilter}` : ''}`);
    },
    staleTime: 1000 * 5,
    refetchInterval: 15000
  });

  const orders = data?.orders || [];
  const pendingCount = statsData?.stats?.pendingOrders ?? orders.filter(o => o.status === 'pending').length;

  // Tasdiqlash (Approve) Mutation
  const approveMutation = useMutation({
    mutationFn: (orderId) => adminApi.post(`/admin/orders/${orderId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-count'] });
      refetch();
      setFeedbackMessage({ type: 'success', text: 'To\'lov tasdiqlandi va foydalanuvchiga obuna yoqildi!' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: err.message || 'Tasdiqlashda xatolik yuz berdi' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  });

  // Rad etish (Reject) Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ orderId, reason, customNote }) =>
      adminApi.post(`/admin/orders/${orderId}/reject`, { reason, customNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-count'] });
      refetch();
      setFeedbackMessage({ type: 'success', text: 'To\'lov muvaffaqiyatli rad etildi va foydalanuvchiga bildirishnoma yuborildi.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: err.message || 'Rad etishda xatolik yuz berdi' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  });

  // Savatga yuborish (Soft Delete) Mutation
  const softDeleteMutation = useMutation({
    mutationFn: (orderId) => adminApi.delete(`/admin/orders/${orderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trash-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-count'] });
      refetch();
      setFeedbackMessage({ 
        type: 'success', 
        text: 'To\'lov muvaffaqiyatli Savatga o\'tkazildi! Uni Savat bo\'limidan istalgan vaqt qaytarishingiz mumkin.' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: err.message || 'Savatga o\'tkazishda xatolik yuz berdi' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  });

  // Savatdan Qaytarish (Restore) Mutation
  const restoreMutation = useMutation({
    mutationFn: (orderId) => adminApi.post(`/admin/orders/${orderId}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trash-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-count'] });
      refetch();
      setFeedbackMessage({ 
        type: 'success', 
        text: 'To\'lov savatdan muvaffaqiyatli qaytarildi va faol to\'lovlar ro\'yxatiga o\'tkazildi!' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: err.message || 'Qaytarishda xatolik yuz berdi' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  });

  // Butunlay o'chirish (Force Delete) Mutation
  const forceDeleteMutation = useMutation({
    mutationFn: (orderId) => adminApi.delete(`/admin/orders/${orderId}/force`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trash-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-count'] });
      refetch();
      setFeedbackMessage({ type: 'success', text: 'To\'lov butunlay o\'chirildi.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
      setOrderToForceDelete(null);
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: err.message || 'O\'chirishda xatolik yuz berdi' });
      setTimeout(() => setFeedbackMessage(null), 4000);
      setOrderToForceDelete(null);
    }
  });

  // Savatni butunlay tozalash (Clear Trash) Mutation
  const clearTrashMutation = useMutation({
    mutationFn: () => adminApi.delete('/admin/trash/orders/clear'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trash-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-count'] });
      refetch();
      setFeedbackMessage({ type: 'success', text: 'Savat muvaffaqiyatli tozalandi!' });
      setTimeout(() => setFeedbackMessage(null), 4000);
      setIsClearTrashModalOpen(false);
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: err.message || 'Savatni tozalashda xatolik yuz berdi' });
      setTimeout(() => setFeedbackMessage(null), 4000);
      setIsClearTrashModalOpen(false);
    }
  });

  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orderToRestore, setOrderToRestore] = useState(null);
  const [orderToForceDelete, setOrderToForceDelete] = useState(null);

  const handleApprove = (orderId) => {
    approveMutation.mutate(orderId);
  };

  const handleRejectConfirm = async (orderId, reason, customNote) => {
    return rejectMutation.mutateAsync({ orderId, reason, customNote });
  };

  const handleDelete = (orderId) => {
    setOrderToDelete(orderId);
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.user_name?.toLowerCase().includes(term) ||
      o.user_email?.toLowerCase().includes(term) ||
      o.user_username?.toLowerCase().includes(term) ||
      o.user_phone?.includes(term) ||
      String(o.id).includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {isTrashTab ? 'Savatdagi To\'lovlar (Chiqindi)' : 'To\'lov Cheklari Monitoringi'}
            </h1>
            {isTrashTab ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {orders.length} ta o'chirilgan
              </span>
            ) : pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                {pendingCount} ta kutilmoqda
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isTrashTab 
              ? 'Savatdagi to\'lovlarni "Qaytarish" orqali yana faol ro\'yxatga chiqarishingiz yoki butunlay o\'chirishingiz mumkin'
              : 'Foydalanuvchilar yuborgan cheklar, ularning holati va obuna tasdiqlash markazi'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto flex-wrap">
          {/* Savatni Tozalash tugmasi (faqat savat tabida va kamida 1 ta to'lov bo'lsa) */}
          {isTrashTab && orders.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearTrashModalOpen(true)}
              disabled={clearTrashMutation.isPending}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Savatni Bo'shatish</span>
            </button>
          )}

          {/* Yangilash tugmasi */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-[#101422] border border-gray-200/80 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Yangilanmoqda...' : 'Yangilash'}</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 animate-in fade-in shadow-sm ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
        }`}>
          {feedbackMessage.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="font-semibold">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-[#101422]/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { key: '', label: 'Barchasi', count: null },
            { key: 'pending', label: 'Kutilmoqda', count: pendingCount, countColor: 'bg-amber-500 text-white' },
            { key: 'approved', label: 'Tasdiqlangan', count: null },
            { key: 'rejected', label: 'Rad etilgan', count: null }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === tab.key
                  ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-md shadow-brand-500/25 ring-1 ring-white/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  statusFilter === tab.key ? 'bg-white text-brand-600' : tab.countColor
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}

          {/* Savat Tab */}
          <button
            onClick={() => handleTabChange('trash')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              statusFilter === 'trash'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25 ring-1 ring-white/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Savat</span>
            {trashCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black leading-none ${
                statusFilter === 'trash' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
              }`}>
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ism, username, telefon yoki ID..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-black/30 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/[0.07] overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/40">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-gray-400 font-medium">To'lovlar yuklanmoqda...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] text-gray-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {isTrashTab 
                ? 'Savat bo\'sh. Hozircha birorta ham o\'chirilgan to\'lov yo\'q.' 
                : 'Hozircha birorta ham to\'lov buyurtmasi topilmadi.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/[0.02] text-gray-400 dark:text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-200/80 dark:border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Foydalanuvchi</th>
                  <th className="px-6 py-4">Tarif & Summa</th>
                  <th className="px-6 py-4">To'lov Usuli</th>
                  <th className="px-6 py-4">{isTrashTab ? 'Asl Holati' : 'Holat'}</th>
                  <th className="px-6 py-4">Chek Rasmi</th>
                  <th className="px-6 py-4">{isTrashTab ? 'O\'chirilgan Sana' : 'Sana'}</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-gray-500 dark:text-gray-400">
                      #{ord.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand-500/20">
                          {ord.user_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{ord.user_name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
                            {ord.user_username && <span className="text-brand-600 dark:text-brand-400 font-semibold">@{ord.user_username}</span>}
                            {ord.user_phone && <span>&bull; {ord.user_phone}</span>}
                          </div>
                          <p className="text-[10px] text-gray-400 truncate max-w-xs">{ord.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          ord.plan_name === '1_month'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : ord.plan_name === '2_months'
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {ord.plan_name === '1_month' ? 'Plus (1 Oylik)' : ord.plan_name === '2_months' ? 'Pro (2 Oylik)' : 'Ultra (3 Oylik)'}
                        </span>
                        <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                          {ord.amount.toLocaleString()} so'm
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300 text-[11px] font-semibold border border-gray-200/50 dark:border-white/[0.05]">
                        {ord.payment_method === 'apps' ? 'Ilova (Click/Payme/Uzum)' : 'Bankomat (Naqd)'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ord.status === 'approved' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Check className="w-3 h-3 mr-1 text-emerald-500" />
                          Tasdiqlangan
                        </span>
                      ) : ord.status === 'rejected' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <X className="w-3 h-3 mr-1 text-rose-500" />
                            Rad etilgan
                          </span>
                          {ord.rejection_reason && (
                            <p className="text-[10px] text-rose-500 max-w-xs truncate" title={ord.rejection_reason}>
                              {ord.rejection_reason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-1.5" />
                          {ord.receipt_url ? 'Tekshirish kutilmoqda' : 'Chek kutilmoqda'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {ord.receipt_url ? (
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForPreview(ord)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-[11px] font-bold hover:bg-brand-500/20 transition-all cursor-pointer active:scale-95 shadow-sm"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Ko'rish</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Yuklanmagan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-[11px] whitespace-nowrap">
                      {isTrashTab ? (
                        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span>
                            {ord.deleted_at 
                              ? new Date(ord.deleted_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : 'Noma\'lum'}
                          </span>
                        </div>
                      ) : (
                        new Date(ord.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        {/* Chekni ko'rish tugmasi */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForPreview(ord)}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                          title="Tafsilotlar & Chek"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* AGAR SAVAT BO'LIMIDA BO'LSA: QAYTARISH VA BUTUNLAY O'CHIRISH */}
                        {isTrashTab ? (
                          <>
                            {/* QAYTARISH (RESTORE) TUGMASI */}
                            <button
                              type="button"
                              onClick={() => setOrderToRestore(ord)}
                              disabled={restoreMutation.isPending}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1 transition-all cursor-pointer"
                              title="Faol to'lovlar safiga qaytarish"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Qaytarish</span>
                            </button>

                            {/* BUTUNLAY O'CHIRISH */}
                            <button
                              type="button"
                              onClick={() => setOrderToForceDelete(ord)}
                              disabled={forceDeleteMutation.isPending}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Butunlay o'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Tahrirlash (Edit) tugmasi - faol to'lovlar uchun */}
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForEdit(ord)}
                              className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 transition-colors cursor-pointer"
                              title="To'lovni tahrirlash"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Savatga o'tkazish (Soft delete) tugmasi */}
                            <button
                              type="button"
                              onClick={() => handleDelete(ord.id)}
                              disabled={softDeleteMutation.isPending}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Savatga yuborish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Tasdiqlash / Rad etish agar pending bo'lsa */}
                            {ord.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(ord.id)}
                                  disabled={approveMutation.isPending}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1 transition-all cursor-pointer"
                                  title="Tasdiqlash"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Tasdiqlash</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForReject(ord)}
                                  disabled={rejectMutation.isPending}
                                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                                  title="Rad etish"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Rad etish</span>
                                </button>
                              </>
                            )}
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chekni ko'rish modali */}
      <CheckPreviewModal
        isOpen={!!selectedOrderForPreview}
        onClose={() => setSelectedOrderForPreview(null)}
        order={selectedOrderForPreview}
        onApprove={handleApprove}
        onReject={(ord) => setSelectedOrderForReject(ord)}
      />

      {/* 4 sababli Rad etish modali */}
      <RejectReasonModal
        isOpen={!!selectedOrderForReject}
        onClose={() => setSelectedOrderForReject(null)}
        order={selectedOrderForReject}
        onConfirmReject={handleRejectConfirm}
      />

      {/* To'lovni tahrirlash modali */}
      <EditOrderModal
        isOpen={!!selectedOrderForEdit}
        onClose={() => setSelectedOrderForEdit(null)}
        order={selectedOrderForEdit}
        onSaveSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats-count'] });
          refetch();
          setFeedbackMessage({ type: 'success', text: 'To\'lov ma\'lumotlari muvaffaqiyatli saqlandi!' });
          setTimeout(() => setFeedbackMessage(null), 4000);
        }}
      />

      {/* To'lovni Savatga yuborish tasdiqlash modali */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) {
            softDeleteMutation.mutate(orderToDelete);
            setOrderToDelete(null);
          }
        }}
        title="To'lovni savatga o'tkazish"
        message={`Haqiqatan ham #${orderToDelete}-raqamli to'lov buyurtmasini savatga o'tkazmoqchimisiz? Uni istalgan vaqt "Savat" bo'limidan qaytarib olishingiz mumkin.`}
        confirmText="Ha, savatga yuborish"
        cancelText="Bekor qilish"
        type="warning"
        loading={softDeleteMutation.isPending}
      />

      {/* Savatdan Qaytarish Tasdiqlash Modali */}
      <ConfirmModal
        isOpen={!!orderToRestore}
        onClose={() => setOrderToRestore(null)}
        onConfirm={() => {
          if (orderToRestore) {
            restoreMutation.mutate(orderToRestore.id);
            setOrderToRestore(null);
          }
        }}
        title="To'lovni savatdan qaytarish"
        message={`Haqiqatan ham #${orderToRestore?.id}-raqamli (${orderToRestore?.user_name}) to'lov buyurtmasini yana faol to'lovlar ro'yxatiga qaytarmoqchimisiz?`}
        confirmText="Ha, qaytarish"
        cancelText="Bekor qilish"
        type="info"
        loading={restoreMutation.isPending}
      />

      {/* Butunlay O'chirish Tasdiqlash Modali */}
      <ConfirmModal
        isOpen={!!orderToForceDelete}
        onClose={() => setOrderToForceDelete(null)}
        onConfirm={() => {
          if (orderToForceDelete) {
            forceDeleteMutation.mutate(orderToForceDelete.id);
            setOrderToForceDelete(null);
          }
        }}
        title="To'lovni butunlay o'chirish"
        message={`Haqiqatan ham #${orderToForceDelete?.id}-raqamli to'lov buyurtmasini ma'lumotlar bazasidan BUTUNLAY o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.`}
        confirmText="Ha, butunlay o'chirish"
        cancelText="Bekor qilish"
        type="danger"
        loading={forceDeleteMutation.isPending}
      />

      {/* Savatni Tozalash Tasdiqlash Modali */}
      <ConfirmModal
        isOpen={isClearTrashModalOpen}
        onClose={() => setIsClearTrashModalOpen(false)}
        onConfirm={() => clearTrashMutation.mutate()}
        title="Savatni butunlay tozalash"
        message="Haqiqatan ham savatdagi barcha o'chirilgan to'lovlarni BUTUNLAY tozalamoqchimisiz? Bu to'lovlar bazadan butunlay yo'q qilinadi va uni ortga qaytarib bo'lmaydi."
        confirmText="Ha, savatni tozalash"
        cancelText="Bekor qilish"
        type="danger"
        loading={clearTrashMutation.isPending}
      />

    </div>
  );
};
