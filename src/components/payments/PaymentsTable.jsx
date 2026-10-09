import React from 'react';
import { 
  CreditCard, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Check, 
  Image as ImageIcon, 
  Pencil, 
  Trash2, 
  RotateCcw, 
  X,
  Tag
} from 'lucide-react';

export const PaymentsTable = ({
  filteredOrders,
  isLoading,
  isTrashTab,
  setSelectedOrderForPreview,
  setSelectedOrderForEdit,
  setSelectedOrderForReject,
  handleApprove,
  handleDelete,
  setOrderToRestore,
  setOrderToForceDelete,
  approveMutation,
  rejectMutation,
  softDeleteMutation,
  restoreMutation,
  forceDeleteMutation
}) => {
  return (
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
                        ord.plan_name === '7_days'
                          ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                          : ord.plan_name === '1_month'
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : ord.plan_name === '2_months'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                      }`}>
                        {ord.plan_name === '7_days'
                          ? 'Plus (7 Kunlik)'
                          : ord.plan_name === '1_month'
                          ? 'Pro (1 Oylik)'
                          : ord.plan_name === '2_months'
                          ? 'Pro+ (2 Oylik)'
                          : ord.plan_name === '3_months'
                          ? 'Ultra (3 Oylik)'
                          : (ord.plan_name || 'Tarif')}
                      </span>
                      <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                        {ord.amount.toLocaleString()} so'm
                      </p>
                      {ord.applied_promocode && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                            <Tag className="w-2.5 h-2.5" />
                            {ord.applied_promocode} (-{ord.discount_percent}%)
                          </span>
                        </div>
                      )}
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
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForEdit(ord)}
                            className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 transition-colors cursor-pointer"
                            title="To'lovni tahrirlash"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(ord.id)}
                            disabled={softDeleteMutation.isPending}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            title="Savatga yuborish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

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
  );
};
