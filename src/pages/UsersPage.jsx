import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Search, 
  Loader2, 
  UserCheck, 
  Shield, 
  X, 
  Ban, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Unlock,
  AlertTriangle,
  Phone
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { ConfirmModal } from '../components/ConfirmModal';
import { EditUserModal } from '../components/EditUserModal';

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal holatlari
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [blockModalState, setBlockModalState] = useState({ isOpen: false, user: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, user: null });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.get('/admin/users'),
    staleTime: 1000 * 60 * 2,
  });

  const users = data?.users || [];

  // 1. Bloklash mutatsiyasi
  const blockMutation = useMutation({
    mutationFn: ({ userId, isBlocked }) => 
      adminApi.put(`/admin/users/${userId}/block`, { isBlocked }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-users']);
      setBlockModalState({ isOpen: false, user: null });
      showToast(res.message || 'Amal muvaffaqiyatli bajarildi!');
    },
    onError: (err) => {
      showToast(err.message || 'Xatolik yuz berdi!');
    }
  });

  // 2. Tahrirlash mutatsiyasi
  const editMutation = useMutation({
    mutationFn: ({ userId, formData }) => 
      adminApi.put(`/admin/users/${userId}`, formData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-users']);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      showToast(res.message || 'Foydalanuvchi muvaffaqiyatli yangilandi!');
    },
    onError: (err) => {
      showToast(err.message || 'Xatolik yuz berdi!');
    }
  });

  // 3. O'chirish mutatsiyasi
  const deleteMutation = useMutation({
    mutationFn: (userId) => 
      adminApi.delete(`/admin/users/${userId}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-users']);
      setDeleteModalState({ isOpen: false, user: null });
      showToast(res.message || 'Foydalanuvchi tizimdan o\'chirildi!');
    },
    onError: (err) => {
      showToast(err.message || 'O\'chirishda xatolik yuz berdi!');
    }
  });

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term) ||
      u.phone?.includes(term) ||
      String(u.id).includes(term)
    );
  });

  const totalUsers = users.length;
  const subscribedUsers = users.filter((u) => u.is_subscribed).length;
  const blockedUsers = users.filter((u) => u.is_blocked).length;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 font-bold text-xs shadow-2xl flex items-center space-x-2 border border-gray-700 dark:border-gray-200 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Foydalanuvchilar Boshqaruvi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {totalUsers} nafar
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Foydalanuvchilarni tahrirlash (qalam), bloklash (ban) va o'chirish (savat) boshqaruvi
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ism, email yoki username..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#101422] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
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

      {/* Mini Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#101422]/80 border border-gray-200/80 dark:border-white/[0.07] flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider truncate">Jami O'quvchilar</p>
            <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white">{totalUsers} nafar</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#101422]/80 border border-gray-200/80 dark:border-white/[0.07] flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider truncate">Aktiv Obunachilar</p>
            <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">{subscribedUsers} nafar</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#101422]/80 border border-gray-200/80 dark:border-white/[0.07] flex items-center space-x-3 shadow-sm col-span-2 sm:col-span-1">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
            <Ban className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider truncate">Bloklanganlar</p>
            <p className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">{blockedUsers} nafar</p>
          </div>
        </div>
      </div>

      {/* Users Table & Responsive Container */}
      <div className="bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/[0.07] overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/40">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Foydalanuvchilar yuklanmoqda...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] text-gray-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Foydalanuvchilar topilmadi.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 dark:bg-white/[0.02] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-200/80 dark:border-white/[0.08]">
                  <tr>
                    <th className="px-5 py-3.5">Foydalanuvchi</th>
                    <th className="px-5 py-3.5">Email & Telefon</th>
                    <th className="px-5 py-3.5">Rol</th>
                    <th className="px-5 py-3.5">Obuna Holati</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {filteredUsers.map((u) => {
                    const isSuperAdmin = u.username === 'temurmalik';

                    return (
                      <tr 
                        key={u.id} 
                        className={`hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors ${
                          u.is_blocked ? 'bg-rose-500/[0.03]' : ''
                        }`}
                      >
                        {/* 1. User info */}
                        <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${
                              u.is_blocked 
                                ? 'bg-rose-500 text-white' 
                                : 'bg-gradient-to-tr from-brand-600 to-emerald-500 text-white'
                            }`}>
                              {u.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span>{u.full_name}</span>
                                {u.is_blocked && (
                                  <span className="p-0.5 rounded bg-rose-500/10 text-rose-500" title="Bloklangan">
                                    <Lock className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              {u.username && (
                                <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold font-mono">@{u.username}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Email & Phone */}
                        <td className="px-5 py-3.5">
                          <p className="font-mono text-gray-600 dark:text-gray-300">{u.email || '—'}</p>
                          {u.phone && <p className="text-[11px] text-gray-400 font-mono mt-0.5">{u.phone}</p>}
                        </td>

                        {/* 3. Role */}
                        <td className="px-5 py-3.5">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              Bosh Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-300">
                              Talaba
                            </span>
                          )}
                        </td>

                        {/* 4. Obuna */}
                        <td className="px-5 py-3.5">
                          {u.is_subscribed ? (
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Aktiv ({u.active_plan})</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Bepul</span>
                          )}
                        </td>

                        {/* 5. Status: Bloklangan vs Faol */}
                        <td className="px-5 py-3.5">
                          {u.is_blocked ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              Bloklangan
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              Faol
                            </span>
                          )}
                        </td>

                        {/* 6. AMALLAR (Qalam, Ban, Savat) */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Tahrirlash (Qalam icon) */}
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 sm:p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-500/20 transition-all cursor-pointer"
                              title="Tahrirlash (Qalam)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Bloklash (Ban icon) */}
                            {!isSuperAdmin && (
                              <button
                                onClick={() => setBlockModalState({ isOpen: true, user: u })}
                                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                                  u.is_blocked
                                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-500/20'
                                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-transparent hover:border-amber-500/20'
                                }`}
                                title={u.is_blocked ? "Blokdan chiqarish" : "Bloklash (Ban)"}
                              >
                                {u.is_blocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </button>
                            )}

                            {/* O'chirish (Savat icon) */}
                            {!isSuperAdmin && (
                              <button
                                onClick={() => setDeleteModalState({ isOpen: true, user: u })}
                                className="p-1.5 sm:p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                                title="O'chirish (Savat)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< 768px - down to 380px) */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-white/[0.04] p-2 space-y-2">
              {filteredUsers.map((u) => {
                const isSuperAdmin = u.username === 'temurmalik';

                return (
                  <div 
                    key={u.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                      u.is_blocked
                        ? 'border-rose-500/30 bg-rose-500/[0.04]'
                        : 'border-gray-200/80 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]'
                    }`}
                  >
                    {/* User header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 ${
                          u.is_blocked ? 'bg-rose-500' : 'bg-gradient-to-tr from-brand-600 to-emerald-500'
                        }`}>
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white text-xs truncate">{u.full_name}</p>
                          <p className="text-[10px] text-brand-600 dark:text-brand-400 font-mono font-semibold truncate">@{u.username}</p>
                        </div>
                      </div>

                      {/* Status badge */}
                      {u.is_blocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30 shrink-0">
                          Bloklangan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                          Faol
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-white/[0.04]">
                      <div className="truncate">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Email:</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300">{u.email || '—'}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Telefon:</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300">{u.phone || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Obuna:</span>
                        <span className="text-gray-800 dark:text-gray-200 font-semibold">{u.is_subscribed ? u.active_plan : 'Bepul'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Rol:</span>
                        <span className="text-gray-800 dark:text-gray-200 font-semibold">{u.role === 'admin' ? 'Admin' : 'Talaba'}</span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-white/[0.04]">
                      {/* Qalam */}
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsEditModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tahrirlash</span>
                      </button>

                      {/* Ban */}
                      {!isSuperAdmin && (
                        <button
                          onClick={() => setBlockModalState({ isOpen: true, user: u })}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 ${
                            u.is_blocked
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {u.is_blocked ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          <span>{u.is_blocked ? 'Ochish' : 'Bloklash'}</span>
                        </button>
                      )}

                      {/* Savat */}
                      {!isSuperAdmin && (
                        <button
                          onClick={() => setDeleteModalState({ isOpen: true, user: u })}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>O'chirish</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 1. Tahrirlash Modali (Qalam icon) */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={(userId, formData) => editMutation.mutate({ userId, formData })}
        loading={editMutation.isPending}
      />

      {/* 2. Bloklash / Blokdan Chiqarish Modali (Ban icon) */}
      <ConfirmModal
        isOpen={blockModalState.isOpen}
        onClose={() => setBlockModalState({ isOpen: false, user: null })}
        onConfirm={() => {
          if (blockModalState.user) {
            blockMutation.mutate({
              userId: blockModalState.user.id,
              isBlocked: !blockModalState.user.is_blocked
            });
          }
        }}
        loading={blockMutation.isPending}
        type={blockModalState.user?.is_blocked ? 'warning' : 'danger'}
        title={blockModalState.user?.is_blocked ? "Foydalanuvchini blokdan chiqarish" : "Foydalanuvchini bloklash (Ban)"}
        message={
          blockModalState.user?.is_blocked
            ? `Haqiqatan ham "${blockModalState.user?.full_name}" (@${blockModalState.user?.username}) hisobini blokdan chiqarmoqchimisiz? Foydalanuvchi yana tizimga kira oladi.`
            : `Haqiqatan ham "${blockModalState.user?.full_name}" (@${blockModalState.user?.username}) hisobini bloklamoqchimisiz? Bloklangan foydalanuvchi platformaga kira olmaydi.`
        }
        confirmText={blockModalState.user?.is_blocked ? "Ha, blokdan chiqarish" : "Ha, hisobni bloklash"}
        cancelText="Bekor qilish"
      />

      {/* 3. Butunlay O'chirish Modali (Savat icon) */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, user: null })}
        onConfirm={() => {
          if (deleteModalState.user) {
            deleteMutation.mutate(deleteModalState.user.id);
          }
        }}
        loading={deleteMutation.isPending}
        type="danger"
        title="Foydalanuvchini o'chirish (Savat)"
        message={`DIQQAT! "${deleteModalState.user?.full_name}" (@${deleteModalState.user?.username}) hisobini o'chirmoqchimisiz? Ushbu foydalanuvchining barcha ma'lumotlari, darslik progressi va to'lovlari tizimdan butunlay o'chiriladi.`}
        confirmText="Ha, butunlay o'chirish"
        cancelText="Bekor qilish"
      />

    </div>
  );
};
