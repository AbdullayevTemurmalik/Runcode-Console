import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Check, 
  RefreshCw, 
  Trash2, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { CheckPreviewModal } from '../components/CheckPreviewModal';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { PaymentsFilterTabs } from '../components/payments/PaymentsFilterTabs';
import { PaymentsTable } from '../components/payments/PaymentsTable';

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

  // Modal holatlari
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orderToRestore, setOrderToRestore] = useState(null);
  const [orderToForceDelete, setOrderToForceDelete] = useState(null);

  const handleApprove = (orderId) => {
    approveMutation.mutate(orderId);
  };

  const handleRejectConfirm = (arg1, arg2, arg3) => {
    let orderId = selectedOrderForReject?.id;
    let reason = arg1;
    let customNote = arg2 || '';

    // Agar 1-argument orderId bo'lsa (masalan: onConfirmReject(order.id, reason, note))
    if (typeof arg1 === 'number' && typeof arg2 === 'string') {
      orderId = arg1;
      reason = arg2;
      customNote = arg3 || '';
    } else if (typeof arg3 === 'number') {
      orderId = arg3;
    }

    if (!orderId || !reason) return;

    rejectMutation.mutate({
      orderId,
      reason,
      customNote
    });
    setSelectedOrderForReject(null);
  };

  const handleDelete = (orderId) => {
    setOrderToDelete(orderId);
  };

  const filteredOrders = orders.filter((ord) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      ord.user_name?.toLowerCase().includes(term) ||
      ord.user_username?.toLowerCase().includes(term) ||
      ord.user_email?.toLowerCase().includes(term) ||
      ord.user_phone?.includes(term) ||
      String(ord.id).includes(term)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center space-x-2.5">
              <span>{isTrashTab ? 'O\'chirilgan To\'lovlar (Savat)' : 'To\'lovlar Boshqaruvi'}</span>
              <Sparkles className="w-5 h-5 text-brand-500 animate-pulse" />
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isTrashTab
              ? 'Savatga o\'tkazilgan to\'lovlar ro\'yxati. Ularni qayta tiklashingiz yoki bazadan butunlay o\'chirishingiz mumkin.'
              : 'Foydalanuvchilar tomonidan yuborilgan to\'lov cheklarini tasdiqlash, rad etish va to\'liq nazorat qilish.'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {isTrashTab && trashCount > 0 && (
            <button
              onClick={() => setIsClearTrashModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Savatni Tozalash</span>
            </button>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2.5 rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-black/30 hover:bg-gray-50 dark:hover:bg-white/[0.05] text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center space-x-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-brand-500' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Bildirishnoma (Feedback Message) */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 animate-in fade-in duration-300 ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
        }`}>
          {feedbackMessage.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="font-semibold">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <PaymentsFilterTabs
        statusFilter={statusFilter}
        handleTabChange={handleTabChange}
        pendingCount={pendingCount}
        trashCount={trashCount}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Orders Table */}
      <PaymentsTable
        filteredOrders={filteredOrders}
        isLoading={isLoading}
        isTrashTab={isTrashTab}
        setSelectedOrderForPreview={setSelectedOrderForPreview}
        setSelectedOrderForEdit={setSelectedOrderForEdit}
        setSelectedOrderForReject={setSelectedOrderForReject}
        handleApprove={handleApprove}
        handleDelete={handleDelete}
        setOrderToRestore={setOrderToRestore}
        setOrderToForceDelete={setOrderToForceDelete}
        approveMutation={approveMutation}
        rejectMutation={rejectMutation}
        softDeleteMutation={softDeleteMutation}
        restoreMutation={restoreMutation}
        forceDeleteMutation={forceDeleteMutation}
      />

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
