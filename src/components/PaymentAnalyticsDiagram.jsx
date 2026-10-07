import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentAnalyticsDiagram = ({ stats }) => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'statuses'
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const planBreakdown = stats?.planBreakdown || [];
  const statusBreakdown = stats?.statusBreakdown || [];
  const totalRevenue = stats?.totalRevenue || 0;

  // Rejalar konfiguratsiyasi va ranglari
  const planConfigs = {
    '1_month': {
      title: 'Plus (1 Oylik)',
      price: 50000,
      color: '#10b981', // emerald-500
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: Zap
    },
    '2_months': {
      title: 'Pro (2 Oylik)',
      price: 90000,
      color: '#06b6d4', // cyan-500
      gradient: 'from-cyan-500 to-blue-500',
      bgLight: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      icon: TrendingUp
    },
    '3_months': {
      title: 'Ultra (3 Oylik)',
      price: 120000,
      color: '#8b5cf6', // purple-500
      gradient: 'from-purple-500 to-indigo-500',
      bgLight: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      icon: Sparkles
    }
  };

  // Rejalar bo'yicha ma'lumotlarni yig'ish
  const plansData = Object.keys(planConfigs).map((key) => {
    const found = planBreakdown.find((p) => p.plan_name === key);
    const count = found ? found.count : 0;
    const revenue = found ? found.revenue : 0;
    const percentage = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
    return {
      key,
      ...planConfigs[key],
      count,
      revenue,
      percentage
    };
  });

  // Agar barcha rejalar 0 bo'lsa (yangi baza bo'lsa), grafik ko'rinishi uchun defolt bo'sh holat
  const hasRevenue = totalRevenue > 0;

  // Aylana SVG (Donut Chart) hisob-kitobi
  // radius = 80, aylananing perimetri = 2 * Math.PI * 80 ≈ 502.65
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSegments = plansData.map((plan) => {
    // Agar tushum bo'lmasa, har biriga teng bo'lak
    const pct = hasRevenue ? plan.percentage : 33.33;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += pct;

    return {
      ...plan,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40 space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/[0.05] pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <PieChart className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
              To'lovlar va Daromad Tahlili Diagrammasi
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Platformada tasdiqlangan barcha to'lovlar, sotilgan tariflar ulushi va foizli taqsimoti
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.05] self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'plans'
                ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Tariflar Ulushi (100%)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('statuses')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'statuses'
                ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Cheklar Holati
          </button>
        </div>
      </div>

      {activeTab === 'plans' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Chap ustun: Aylana (Donut) Diagramma */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              
              {/* Orqa fon aylanasi */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  className="stroke-gray-100 dark:stroke-white/[0.05]"
                  strokeWidth="20"
                  fill="transparent"
                />

                {/* Dinamik segmentlar */}
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.key}
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke={segment.color}
                    strokeWidth={hoveredPlan === segment.key ? '24' : '20'}
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500 cursor-pointer"
                    onMouseEnter={() => setHoveredPlan(segment.key)}
                    onMouseLeave={() => setHoveredPlan(null)}
                  />
                ))}
              </svg>

              {/* Markaziy yozuv va summa */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                  {hoveredPlan ? planConfigs[hoveredPlan]?.title : 'Jami Tushum'}
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-gray-900 dark:text-white mt-0.5 tracking-tight">
                  {hoveredPlan 
                    ? (plansData.find(p => p.key === hoveredPlan)?.revenue || 0).toLocaleString()
                    : totalRevenue.toLocaleString()
                  } <span className="text-xs font-sans text-emerald-500">so'm</span>
                </p>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1">
                  {hoveredPlan
                    ? `${plansData.find(p => p.key === hoveredPlan)?.percentage || 0}% umumiy ulush`
                    : '100% Tasdiqlangan'
                  }
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real vaqt rejimida hisoblangan daromad ko'rsatkichi</span>
            </div>
          </div>

          {/* O'ng ustun: Tariflar kartochkalari va foiz shkalalari */}
          <div className="lg:col-span-7 space-y-3.5">
            {plansData.map((plan) => {
              const Icon = plan.icon;
              const isHovered = hoveredPlan === plan.key;

              return (
                <div
                  key={plan.key}
                  onMouseEnter={() => setHoveredPlan(plan.key)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? 'bg-gray-50 dark:bg-white/[0.05] border-brand-500/50 shadow-md scale-[1.01]'
                      : 'bg-white/60 dark:bg-white/[0.02] border-gray-200/70 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${plan.bgLight}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {plan.title}
                        </h4>
                        <span className="text-[11px] text-gray-400">
                          {plan.price.toLocaleString()} so'm / tarif narxi
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm sm:text-base font-black font-mono text-gray-900 dark:text-white">
                        {plan.revenue.toLocaleString()} <span className="text-xs font-normal text-emerald-500">so'm</span>
                      </p>
                      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        {plan.count} dona sotilgan • <span style={{ color: plan.color }}>{plan.percentage}%</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${plan.gradient} transition-all duration-700`}
                      style={{ width: `${Math.max(hasRevenue ? plan.percentage : 0, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Statuslar bo'yicha cheklar xulosasi */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Tasdiqlangan */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Tasdiqlangan</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {statusBreakdown.find(s => s.status === 'approved')?.count || 0} dona
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Muvaffaqiyatli qabul qilingan va obuna yoqilgan
            </p>
          </div>

          {/* Kutilayotgan */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Kutilmoqda</span>
              <Clock className="w-5 h-5 text-amber-500 animate-spin" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {stats?.pendingOrders || 0} dona
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin tekshiruvini kutayotgan haqiqiy cheklar
            </p>
          </div>

          {/* Rad etilgan */}
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Rad etilgan</span>
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {statusBreakdown.find(s => s.status === 'rejected')?.count || 0} dona
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Noto'g'ri chek yoki pul tushmagani sababli bekor qilingan
            </p>
          </div>

        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.05] text-xs">
        <span className="text-gray-400">
          Cheklarni boshqarish va yangi to'lovlarni ko'rish:
        </span>
        <Link
          to="/payments"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
        >
          <span>To'lovlar bo'limiga o'tish</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};
