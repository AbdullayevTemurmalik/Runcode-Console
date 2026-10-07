import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  ShieldCheck, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminApi from '../services/adminApi';
import { PaymentAnalyticsDiagram } from '../components/PaymentAnalyticsDiagram';

export const AdminDashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.get('/admin/stats'),
    staleTime: 1000 * 30,
    refetchInterval: 30000
  });

  const stats = statsData?.stats || {
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    issuedCertificates: 0,
    trashCount: 0,
    planBreakdown: [],
    statusBreakdown: []
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      
      {/* 1. Platforma Boshqaruv Markazi Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900/50 via-[#101422] to-emerald-950/30 p-6 sm:p-8 border border-brand-500/20 shadow-xl shadow-brand-500/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Tizim Onlayn</span>
              </span>
              <span className="text-xs text-gray-400">RunCode.uz Core v2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Platforma Boshqaruv Markazi
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              Foydalanuvchilar oqimi, darslarni o'zlashtirish, to'lov cheklari va imtihon natijalari real vaqt rejimida
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <Link
              to="/payments"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center space-x-2 active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>To'lovlarni Ko'rish</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Asosiy 4 ta Statistika Kartochkalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* 1. Jami Tushum */}
        <div className="group relative overflow-hidden p-6 rounded-3xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Jami Tushum</span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {stats.totalRevenue.toLocaleString()} <span className="text-xs font-normal text-emerald-500 font-sans">so'm</span>
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-500 inline mr-1" />
              <span>Tasdiqlangan to'lovlar summasi</span>
            </p>
          </div>
        </div>

        {/* 2. Kutilayotgan Cheklar */}
        <div className="group relative overflow-hidden p-6 rounded-3xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Kutilayotgan Cheklar</span>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {stats.pendingOrders} <span className="text-xs font-normal font-sans">dona</span>
            </p>
            <Link 
              to="/payments?status=pending" 
              className="text-[11px] text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center group-hover:translate-x-0.5 transition-transform"
            >
              <span>Tekshirishga o'tish</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* 3. Faol Obunachilar */}
        <div className="group relative overflow-hidden p-6 rounded-3xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Faol Obunachilar</span>
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {stats.activeSubscriptions} <span className="text-xs font-normal text-indigo-400 font-sans">nafar</span>
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Premium tariflar faol</p>
          </div>
        </div>

        {/* 4. Jami O'quvchilar */}
        <div className="group relative overflow-hidden p-6 rounded-3xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Jami O'quvchilar</span>
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {stats.totalUsers} <span className="text-xs font-normal text-cyan-400 font-sans">nafar</span>
            </p>
            <Link to="/users" className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline inline-flex items-center">
              <span>Ro'yxatni ko'rish</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>

      </div>

      {/* 3. Har bir to'lov va tarif bo'yicha mukammal aylanuvchi 100% grafik diagramma */}
      <PaymentAnalyticsDiagram stats={stats} />

    </div>
  );
};
