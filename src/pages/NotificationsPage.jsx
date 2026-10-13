import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Bell, 
  Send, 
  Users, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Tag, 
  Info, 
  ShieldAlert, 
  Smartphone,
  Search,
  Check
} from 'lucide-react';
import adminApi from '../services/adminApi';

export const NotificationsPage = () => {
  const [target, setTarget] = useState('all'); // 'all' | 'user'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // 'info' | 'promo' | 'system' | 'update'
  const [sendTelegram, setSendTelegram] = useState(true);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  // 1. Foydalanuvchilar ro'yxatini olish (bitta userni tanlash uchun)
  const { data: usersData } = useQuery({
    queryKey: ['admin-notification-users'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/users');
      return res?.users || [];
    }
  });

  const usersList = usersData || [];
  const telegramConnectedCount = usersList.filter(u => u.telegram_chat_id).length;

  const filteredUsers = usersList.filter(u => {
    if (!searchUser) return true;
    const q = searchUser.toLowerCase();
    const name = (u.full_name || u.firstName || '').toLowerCase();
    const uname = (u.username || '').toLowerCase();
    const id = String(u.id);
    return name.includes(q) || uname.includes(q) || id.includes(q);
  });

  const sendMutation = useMutation({
    mutationFn: async (payload) => {
      return await adminApi.post('/admin/notifications/send', payload);
    },
    onSuccess: (data) => {
      setSuccessNotice(data.message || 'Xabarnoma muvaffaqiyatli yuborildi!');
      setErrorNotice('');
      setTitle('');
      setMessage('');
      if (target === 'user') setSelectedUserId('');
      setTimeout(() => setSuccessNotice(''), 6000);
    },
    onError: (err) => {
      setErrorNotice(err.message || 'Xabarnomani yuborishda xatolik yuz berdi.');
      setSuccessNotice('');
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    setErrorNotice('');
    setSuccessNotice('');

    if (!title.trim()) {
      setErrorNotice('Iltimos, xabarnoma sarlavhasini kiriting.');
      return;
    }
    if (!message.trim()) {
      setErrorNotice('Iltimos, xabarnoma matnini kiriting.');
      return;
    }
    if (target === 'user' && !selectedUserId) {
      setErrorNotice('Iltimos, qabul qiluvchi foydalanuvchini tanlang.');
      return;
    }

    sendMutation.mutate({
      target,
      userId: target === 'user' ? selectedUserId : undefined,
      title: title.trim(),
      message: message.trim(),
      type,
      sendTelegram
    });
  };


  return (
    <div className="space-y-6">
      {/* Yuqori Sarlavha & Statistika */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Xabarnomalar Markazi
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Foydalanuvchilarga xabarnoma, e'lon va yangiliklar yuborish
              </p>
            </div>
          </div>
        </div>

        {/* Statistika ko'rsatkichlari */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-white/[0.08] shadow-xs flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-brand-500" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Jami Userlar</span>
              <span className="text-xs font-black font-mono text-gray-900 dark:text-white">{usersList.length} nafar</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-white/[0.08] shadow-xs flex items-center space-x-2.5">
            <Smartphone className="w-4 h-4 text-sky-500" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Botga Ulangan</span>
              <span className="text-xs font-black font-mono text-sky-600 dark:text-sky-400">{telegramConnectedCount} nafar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Xabarnoma Yuborish Formasi */}
      <div className="bg-white/90 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-gray-200/80 dark:border-white/[0.07] shadow-xl space-y-5">
        <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-white/5 pb-3">
          <Send className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
            Yangi Xabarnoma Yaratish
          </h2>
        </div>

        {/* Muvaffaqiyat xabari */}
        {successNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Xatolik xabari */}
        {errorNotice && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {/* 1. Qabul qiluvchilar rejimi (Target Selector) */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Qabul Qiluvchilar
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTarget('all');
                  setSelectedUserId('');
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition cursor-pointer ${
                  target === 'all'
                    ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/[0.02]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  target === 'all' ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Barcha Foydalanuvchilar (Ommaviy)</p>
                  <p className="text-[11px] text-gray-400">Saytdagi barcha {usersList.length} nafar foydalanuvchiga yuboriladi</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTarget('user')}
                className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition cursor-pointer ${
                  target === 'user'
                    ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/[0.02]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  target === 'user' ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Muayyan Bitta Foydalanuvchi</p>
                  <p className="text-[11px] text-gray-400">ID yoki username bo'yicha aniq bitta akkauntga yuborish</p>
                </div>
              </button>
            </div>
          </div>

          {/* Agar bitta foydalanuvchi tanlangan bo'lsa: Qidiruv va tanlash */}
          {target === 'user' && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Foydalanuvchini tanlang (ID / Username / Ism)
                </span>
                {selectedUserId && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Tanlandi: #{selectedUserId}
                  </span>
                )}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="ID raqami yoki username bo'yicha qidiring (masalan: 1 yoki @aziz)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#0c101d] border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {filteredUsers.length === 0 ? (
                  <p className="text-xs text-gray-400 py-3 text-center">Foydalanuvchi topilmadi</p>
                ) : (
                  filteredUsers.slice(0, 15).map(u => {
                    const isSelected = String(selectedUserId) === String(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedUserId(u.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500/15 text-brand-600 dark:text-brand-300 font-bold'
                            : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#0c101d] text-gray-700 dark:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                            #{u.id}
                          </span>
                          <span className="text-xs truncate font-semibold">
                            {u.full_name || u.firstName || 'Foydalanuvchi'}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">
                            @{u.username || 'username'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {u.telegram_chat_id && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-500" title="Botga ulangan">
                              Bot faol
                            </span>
                          )}
                          {isSelected && <Check className="w-4 h-4 text-brand-500" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 2. Xabarnoma Turi (Type) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Xabarnoma Turi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'info', label: "Ma'lumot", icon: Info, color: 'text-blue-500' },
                { id: 'promo', label: 'Aksiya / Promo', icon: Tag, color: 'text-purple-500' },
                { id: 'update', label: 'Yangilanish', icon: Sparkles, color: 'text-emerald-500' },
                { id: 'system', label: 'Tizim', icon: ShieldAlert, color: 'text-amber-500' },
              ].map(item => {
                const isSelected = type === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/[0.02] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Sarlavha (Title) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Sarlavha
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Yangi RUNCODE2026 Promokodi Faollashtirildi!"
              className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* 4. Matn (Message) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Xabarnoma Matni
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Xabarnoma batafsil mazmuni, promokod ma'lumotlari yoki o'quv dasturidagi muhim yangiliklar..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
            />
          </div>

          {/* 5. Telegram orqali ham yuborish (Maxsus Dizayndagi Interaktiv Switch) */}
          <div
            onClick={() => setSendTelegram(!sendTelegram)}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-4 ${
              sendTelegram
                ? 'bg-gradient-to-r from-sky-500/10 via-brand-500/10 to-indigo-500/10 border-sky-500/40 ring-1 ring-sky-500/20 shadow-md shadow-sky-500/5'
                : 'bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  sendTelegram
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                    : 'bg-gray-200 dark:bg-white/10 text-gray-400'
                }`}
              >
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    @RunCodeVerifyBot Telegram Boti Orqali Yuborish
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors ${
                      sendTelegram
                        ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30'
                        : 'bg-gray-200/60 dark:bg-white/10 text-gray-500 dark:text-gray-400 border-transparent'
                    }`}
                  >
                    {sendTelegram ? 'Faol' : 'O\'chirilgan'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  Platforma bilan bir qatorda botga ulangan barcha o'quvchilarning Telegram chatiga to'g'ridan-to'g'ri xabarnoma yetkaziladi
                </p>
              </div>
            </div>

            {/* Custom Modern Toggle Pill */}
            <div
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex items-center px-1 flex-shrink-0 ${
                sendTelegram ? 'bg-sky-500' : 'bg-gray-300 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  sendTelegram ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* 6. Yuborish tugmasi */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-brand-500/20 disabled:opacity-50 cursor-pointer transition"
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Xabarnomani Yuborish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
