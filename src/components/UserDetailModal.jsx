import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, Calendar, ShieldCheck, Clock, 
  Ban, Edit3, Trash2, KeyRound 
} from 'lucide-react';

export const UserDetailModal = ({ isOpen, onClose, user, onEdit, onToggleBlock, onDelete }) => {
  if (!isOpen || !user) return null;

  // Format birth date and calculate exact age
  const formatBirth = (bStr) => {
    if (!bStr) return { date: "Kiritilmagan", age: null };
    try {
      const parts = String(bStr).split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const monthsUz = [
          'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
          'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
        ];
        const monthName = monthsUz[monthIdx] || parts[1];
        const today = new Date();
        let age = today.getFullYear() - year;
        const m = today.getMonth() - monthIdx;
        if (m < 0 || (m === 0 && today.getDate() < day)) {
          age--;
        }
        return {
          date: `${day}-${monthName}, ${year}-yil`,
          day,
          month: monthName,
          year,
          age: age > 0 ? `${age} yosh` : null
        };
      }
      return { date: bStr, age: null };
    } catch {
      return { date: bStr, age: null };
    }
  };

  const birthInfo = formatBirth(user.birth_date);
  const isSuperAdmin = user.username === 'temurmalik' || user.username === 'temur';

  // Format date time helper
  const formatDateTime = (dt) => {
    if (!dt) return "Mavjud emas";
    try {
      return new Date(dt).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dt);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
        <div className="relative bg-white dark:bg-[#0f1422] w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden my-6 z-10 animate-in zoom-in-95 flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between bg-gray-50/60 dark:bg-white/[0.02]">
            <div className="flex items-center space-x-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg ${
                user.is_blocked 
                  ? 'bg-rose-500 shadow-rose-500/25'
                  : user.role === 'admin'
                  ? 'bg-gradient-to-tr from-amber-500 to-rose-500 shadow-amber-500/25'
                  : 'bg-gradient-to-tr from-brand-600 to-emerald-500 shadow-brand-500/25'
              }`}>
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center space-x-2">
                  <span>{user.full_name || user.username}</span>
                  {user.role === 'admin' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/20">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                      Talaba
                    </span>
                  )}
                </h3>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-bold font-mono">
                  @{user.username} &middot; ID: #{user.id}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* Status Alert Banner */}
            {user.is_blocked && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2">
                <Ban className="w-4 h-4 flex-shrink-0" />
                <span>Ushbu hisob hozirda ma'muriyat tomonidan bloklangan holatda.</span>
              </div>
            )}

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              
              {/* Ism & Familiya */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-brand-500" />
                  <span>Ism va Familiya</span>
                </p>
                <p className="font-extrabold text-gray-900 dark:text-white text-sm">
                  {user.first_name || user.last_name 
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : user.full_name || "Kiritilmagan"}
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
                  <span>Ism: <strong className="text-gray-700 dark:text-gray-300">{user.first_name || "—"}</strong></span>
                  <span>&middot;</span>
                  <span>Familiya: <strong className="text-gray-700 dark:text-gray-300">{user.last_name || "—"}</strong></span>
                </div>
              </div>

              {/* Tug'ilgan sana va Yoshi */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tug'ilgan Sana va Yoshi</span>
                </p>
                <div className="flex items-center space-x-2 pt-0.5">
                  <p className="font-extrabold text-gray-900 dark:text-white text-sm">
                    {birthInfo.date}
                  </p>
                  {birthInfo.age && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      {birthInfo.age}
                    </span>
                  )}
                </div>
                {birthInfo.day && (
                  <p className="text-[11px] text-gray-400">
                    Kun: {birthInfo.day} &middot; Oy: {birthInfo.month} &middot; Yil: {birthInfo.year}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Username</span>
                </p>
                <p className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
                  @{user.username}
                </p>
                <p className="text-[11px] text-gray-400">Tizimga kirish uchun asosiy login</p>
              </div>

              {/* Aloqa: Telefon & Email */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-purple-500" />
                  <span>Telefon va Email</span>
                </p>
                <p className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                  {user.phone || "Telefon kiritilmagan"}
                </p>
                <p className="font-mono text-gray-500 text-[11px] truncate">
                  {user.email || "Email kiritilmagan"}
                </p>
              </div>

              {/* Obuna Holati */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Obuna Holati</span>
                </p>
                <div className="flex items-center space-x-2 pt-0.5">
                  {user.is_subscribed ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold text-xs flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Faol ({user.active_plan})</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-gray-200 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 font-bold text-xs">
                      Bepul tarif (Obunasiz)
                    </span>
                  )}
                </div>
                {user.subscription_end_date && (
                  <p className="text-[11px] text-gray-400">
                    Tugash sanasi: {formatDateTime(user.subscription_end_date)}
                  </p>
                )}
              </div>

              {/* Tizim Faolligi */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Faollik Tarixi</span>
                </p>
                <p className="text-[11px] text-gray-700 dark:text-gray-300">
                  Ro'yxatdan o'tgan: <strong className="font-mono">{formatDateTime(user.created_at)}</strong>
                </p>
                <p className="text-[11px] text-gray-500">
                  Oxirgi kirgan: <strong className="font-mono">{formatDateTime(user.last_login_at)}</strong>
                </p>
              </div>

            </div>

            {/* Parol Xavfsizligi Eslatmasi */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center space-x-2">
              <KeyRound className="w-4 h-4 flex-shrink-0" />
              <span>Xavfsizlik talablariga binoan, foydalanuvchi paroli xeshlangan (bcrypt) va xavfsiz saqlanadi.</span>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between bg-gray-50/60 dark:bg-white/[0.02]">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] text-xs font-bold transition cursor-pointer"
            >
              Yopish
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>

              {!isSuperAdmin && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onToggleBlock(user);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                      user.is_blocked
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{user.is_blocked ? "Blokdan chiqarish" : "Bloklash"}</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onDelete(user);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-rose-600/20 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>O'chirish</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
