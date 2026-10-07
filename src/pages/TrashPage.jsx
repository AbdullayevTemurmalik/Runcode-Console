import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  RotateCcw, 
  RefreshCw, 
  Search, 
  Eye, 
  Check, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon, 
  ArrowLeft,
  AlertTriangle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { CheckPreviewModal } from '../components/CheckPreviewModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const TrashPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForPreview, setSelectedOrderForPreview] = useState(null);
  const [orderToRestore, setOrderToRestore] = useState(null);
  const [orderToForceDelete, setOrderToForceDelete] = useState(null);
  const [isClearTrashModalOpen, setIsClearTrashModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Savatdagi barcha o'chirilgan buyurtmalarni olish
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-trash-orders'],
    queryFn: () => adminApi.get('/admin/trash/orders'),
    staleTime: 1000 * 5,
    refetchInterval: 15000
  });

  const trashOrders = data?.orders || [];

  // Qaytarish (Restore) Mutation
  const restoreMutation = useMutation({
    mutationFn: (orderId) => adminApi.post(`/admin/orders/${orderId}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-trash-orders']);
      queryClient.invalidateQueries(['admin-orders']);
      queryClient.invalidateQueries(['admin-stats']);
      queryClient.invalidateQueries(['admin-stats-count']);
      setFeedbackMessage({ 
        type: 'success', 
        text: 'To\'lov muvaffaqiyatli qaytarildi va "To\'lovlar & Cheklar" bo\'limiga o\'tkazildi!' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err) => {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.message || 'Qaytarishda xatolik yuz berdi' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  });

  // Butunlay o'chirish (Force Delete) Mutation
  const forceDeleteMutation = useMutation({
    mutationFn: (orderId) => adminApi.delete(`/admin/orders/${orderId}/force`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-trash-orders']);
      queryClient.invalidateQueries(['admin-stats']);
      queryClient.invalidateQueries(['admin-stats-count']);
      setFeedbackMessage({ 
        type: 'success', 
        text: 'To\'lov ma\'lumotlar bazasidan butunlay o\'chirildi.' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err) => {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.message || 'O\'chirishda xatolik yuz berdi' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  });

  // Savatni tozalash (Clear Trash) Mutation
  const clearTrashMutation = useMutation({
    mutationFn: () => adminApi.delete('/admin/trash/orders/clear'),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-trash-orders']);
      queryClient.invalidateQueries(['admin-stats']);
      queryClient.invalidateQueries(['admin-stats-count']);
      setFeedbackMessage({ 
        type: 'success', 
        text: 'Savat to\'liq tozalandi!' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err) => {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.message || 'Savatni tozalashda xatolik yuz berdi' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  });

  const filteredOrders = trashOrders.filter((o) => {
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

  const totalTrashedAmount = trashOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3">
          <Link
            to="/payments"
            className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-sm"
            title="To'lovlar bo'limiga qaytish"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Savat (Chiqindi Qutisi)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                {trashOrders.length} ta
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              O'chirilgan to'lov buyurtmalari. Xohlagan vaqt "Qaytarish" tugmasi orqali qayta faollashtirishingiz mumkin.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {trashOrders.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearTrashModalOpen(true)}
              disabled={clearTrashMutation.isPending}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Savatni tozalash</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Yangilanmoqda...' : 'Yangilash'}</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 animate-in fade-in ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
        }`}>
          {feedbackMessage.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Info Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800/80 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Savatdagi jami to'lovlar soni</p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {trashOrders.length} ta buyurtma
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/80 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Savatdagi jami summa miqdori</p>
            <p className="text-xl font-black text-brand-600 dark:text-brand-400 mt-0.5">
              {totalTrashedAmount.toLocaleString()} so'm
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800/80 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Savatdan ism, username, telefon yoki ID bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Trash Orders Table */}
      <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-gray-400">Savat yuklanmoqda...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {searchTerm ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Savat bo\'sh!'}
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchTerm
                ? 'Boshqa kalit so\'z bilan izlab ko\'ring.'
                : 'O\'chirilgan to\'lovlar mavjud emas. Agar "To\'lovlar & Cheklar" bo\'limidan biror to\'lovni o\'chirsangiz, u shu yerga tushadi.'}
            </p>
            {!searchTerm && (
              <Link
                to="/payments"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>To'lovlar bo'limiga o'tish</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Foydalanuvchi</th>
                  <th className="px-6 py-4">Tarif & Summa</th>
                  <th className="px-6 py-4">Asl Holati</th>
                  <th className="px-6 py-4">Chek</th>
                  <th className="px-6 py-4">O'chirilgan Vaqt</th>
                  <th className="px-6 py-4 text-right">Amallar (Qaytarish / O'chirish)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-500">
                      #{ord.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{ord.user_name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
                        {ord.user_username && <span className="text-brand-600 dark:text-brand-400 font-semibold">@{ord.user_username}</span>}
                        {ord.user_phone && <span>&bull; {ord.user_phone}</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate max-w-xs">{ord.user_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {ord.plan_name === '1_month' ? 'Plus (1 Oylik)' : ord.plan_name === '2_months' ? 'Pro (2 Oylik)' : 'Ultra (3 Oylik)'}
                      </p>
                      <p className="font-mono font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                        {ord.amount.toLocaleString()} so'm
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {ord.status === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          Tasdiqlangan
                        </span>
                      ) : ord.status === 'rejected' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          Rad etilgan
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                          Kutilmoqda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {ord.receipt_url ? (
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForPreview(ord)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 text-[11px] font-semibold hover:bg-brand-100 transition-colors cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Mavjud</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Yuklanmagan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-[11px] whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span>
                          {ord.deleted_at 
                            ? new Date(ord.deleted_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Noma\'lum'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        
                        {/* Chekni ko'rish tugmasi */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForPreview(ord)}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                          title="Tafsilotlar & Chek"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* QAYTARISH TUGMASI (RESTORE) */}
                        <button
                          type="button"
                          onClick={() => setOrderToRestore(ord)}
                          disabled={restoreMutation.isPending}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
                          title="To'lovlar ro'yxatiga qaytarish"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Qaytarish</span>
                        </button>

                        {/* BUTUNLAY O'CHIRISH (FORCE DELETE) */}
                        <button
                          type="button"
                          onClick={() => setOrderToForceDelete(ord)}
                          disabled={forceDeleteMutation.isPending}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Butunlay o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

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
        onApprove={() => {}}
        onReject={() => {}}
      />

      {/* Qaytarish Tasdiqlash Modali */}
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
        message={`Haqiqatan ham #${orderToRestore?.id}-raqamli (${orderToRestore?.user_name}) to'lov buyurtmasini faol to'lovlar ro'yxatiga qaytarmoqchimisiz?`}
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

      {/* Savatni Tozalash Modali */}
      <ConfirmModal
        isOpen={isClearTrashModalOpen}
        onClose={() => setIsClearTrashModalOpen(false)}
        onConfirm={() => {
          clearTrashMutation.mutate();
          setIsClearTrashModalOpen(false);
        }}
        title="Savatni butunlay tozalash"
        message={`Haqiqatan ham savatdagi barcha (${trashOrders.length} ta) o'chirilgan to'lov buyurtmalarini butunlay o'chirib tashlamoqchimisiz?`}
        confirmText="Ha, savatni tozalash"
        cancelText="Bekor qilish"
        type="danger"
        loading={clearTrashMutation.isPending}
      />

    </div>
  );
};
