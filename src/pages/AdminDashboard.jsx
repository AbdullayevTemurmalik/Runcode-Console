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
    trashCount: 0,
    planBreakdown: [],
    statusBreakdown: []
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 animate-in fade-in">
      
      {/* 1. Platforma Boshqaruv Markazi Banner (Ixcham va chiroyli) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900/40 via-[#101422] to-emerald-950/25 p-4 sm:p-5 border border-brand-500/20 shadow-lg shadow-brand-500/5">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Tizim Onlayn</span>
              </span>
              <span className="text-[11px] text-gray-400">RunCode Core v2.0</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Platforma Boshqaruv Markazi
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">
              Foydalanuvchilar oqimi, darslar o'zlashtirilishi, to'lov cheklari va imtihon natijalari
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            <Link
              to="/payments"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>To'lovlarni Ko'rish</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Asosiy 4 ta Statistika Kartochkalari (Ixcham va ko'rkam) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* 1. Jami Tushum */}
        <div className="group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-md shadow-gray-200/30 dark:shadow-black/30 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Jami Tushum</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {stats.totalRevenue.toLocaleString()} <span className="text-[11px] font-normal text-emerald-500 font-sans">so'm</span>
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center space-x-1 truncate">
              <CheckCircle className="w-2.5 h-2.5 text-emerald-500 inline mr-0.5 flex-shrink-0" />
              <span className="truncate">Tasdiqlangan to'lovlar summasi</span>
            </p>
          </div>
        </div>

        {/* 2. Kutilayotgan Cheklar */}
        <div className="group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-md shadow-gray-200/30 dark:shadow-black/30 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Kutilayotgan Cheklar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {stats.pendingOrders} <span className="text-[11px] font-normal font-sans">dona</span>
            </p>
            <Link 
              to="/payments?status=pending" 
              className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center"
            >
              <span>Tekshirishga o'tish</span>
              <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* 3. Faol Obunachilar */}
        <div className="group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-md shadow-gray-200/30 dark:shadow-black/30 hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Faol Obunachilar</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {stats.activeSubscriptions} <span className="text-[11px] font-normal text-indigo-400 font-sans">nafar</span>
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Premium tariflar faol</p>
          </div>
        </div>

        {/* 4. Jami O'quvchilar */}
        <div className="group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-md shadow-gray-200/30 dark:shadow-black/30 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Jami O'quvchilar</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {stats.totalUsers} <span className="text-[11px] font-normal text-cyan-400 font-sans">nafar</span>
            </p>
            <Link to="/users" className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline inline-flex items-center">
              <span>Ro'yxatni ko'rish</span>
              <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 3. Har bir to'lov va tarif bo'yicha mukammal aylanuvchi 100% grafik diagramma */}
      <PaymentAnalyticsDiagram stats={stats} />

    </div>
  );
};
