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
  Zap,
  Layers,
  Activity,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentAnalyticsDiagram = ({ stats }) => {
  // Tanlangan tab: 'trend' (O'sish Trend Chizig'i), 'donut' (Aylana Taqsimot), 'statuses' (Cheklar Holati)
  const [activeTab, setActiveTab] = useState('trend');
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const planBreakdown = stats?.planBreakdown || [];
  const statusBreakdown = stats?.statusBreakdown || [];
  const totalRevenue = Number(stats?.totalRevenue) || 0;

  // Rejalar nomi aliaslarini to'g'ri bog'lash
  const normalizePlanKey = (name) => {
    if (!name) return '7_days';
    const n = String(name).toLowerCase().trim();
    if (n === '7_days' || n === 'plus' || n.includes('7')) return '7_days';
    if (n === '1_month' || n === 'pro' || n.includes('1')) return '1_month';
    if (n === '2_months' || n === 'pro_plus' || n === 'pro+' || n.includes('2')) return '2_months';
    if (n === '3_months' || n === 'ultra' || n.includes('3')) return '3_months';
    return '7_days';
  };

  // 4 ta asosiy tariflarning to'liq konfiguratsiyasi
  // Chiziq pastdan yuqoriga ko'tarilishi uchun x va y koordinatalari
  const planConfigs = {
    '7_days': {
      id: '7_days',
      title: 'Plus (7 Kunlik)',
      shortTitle: '7 Kunlik',
      level: '1-daraja (Boshlang\'ich)',
      price: 20000,
      priceFormatted: "20,000 so'm",
      color: '#0ea5e9', // sky-500 (Och ko'k)
      colorBorder: 'border-sky-500',
      colorBg: 'bg-sky-500',
      colorText: 'text-sky-500',
      glowColor: 'rgba(14, 165, 233, 0.45)',
      gradient: 'from-sky-400 to-cyan-500',
      bgLight: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      icon: Zap,
      // SVG koordinatalari (pastki nuqta)
      x: 120,
      y: 230
    },
    '1_month': {
      id: '1_month',
      title: 'Pro (1 Oylik)',
      shortTitle: '1 Oylik',
      level: '2-daraja (Ommabop)',
      price: 50000,
      priceFormatted: "50,000 so'm",
      color: '#2563eb', // blue-600 (Ko'k)
      colorBorder: 'border-blue-600',
      colorBg: 'bg-blue-600',
      colorText: 'text-blue-600',
      glowColor: 'rgba(37, 99, 235, 0.45)',
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      icon: TrendingUp,
      // SVG koordinatalari (ko'tarilish)
      x: 320,
      y: 175
    },
    '2_months': {
      id: '2_months',
      title: 'Pro+ (2 Oylik)',
      shortTitle: '2 Oylik',
      level: '3-daraja (O\'rta muddat)',
      price: 90000,
      priceFormatted: "90,000 so'm",
      color: '#10b981', // emerald-500 (Yashil)
      colorBorder: 'border-emerald-500',
      colorBg: 'bg-emerald-500',
      colorText: 'text-emerald-500',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: ShieldCheck,
      // SVG koordinatalari (yuqoriroq pog'ona)
      x: 520,
      y: 115
    },
    '3_months': {
      id: '3_months',
      title: 'Ultra (3 Oylik)',
      shortTitle: '3 Oylik',
      level: '4-daraja (Maksimal VIP)',
      price: 120000,
      priceFormatted: "120,000 so'm",
      color: '#a855f7', // purple-500 (Binafsha)
      colorBorder: 'border-purple-500',
      colorBg: 'bg-purple-500',
      colorText: 'text-purple-500',
      glowColor: 'rgba(168, 85, 247, 0.45)',
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      icon: Sparkles,
      // SVG koordinatalari (eng yuqori cho'qqi)
      x: 720,
      y: 50
    }
  };

  // Rejalar bo'yicha ma'lumotlarni yig'ish va foizlarini hisoblash
  const plansData = Object.keys(planConfigs).map((key) => {
    const matched = planBreakdown.filter(p => normalizePlanKey(p.plan_name) === key);
    const count = matched.reduce((acc, curr) => acc + (parseInt(curr.count, 10) || 0), 0);
    const revenue = matched.reduce((acc, curr) => acc + (parseInt(curr.revenue, 10) || 0), 0);
    const percentage = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
    return {
      key,
      ...planConfigs[key],
      count,
      revenue,
      percentage
    };
  });

  const hasRevenue = totalRevenue > 0;

  // Eng yuqori tushum va eng ko'p sotilgan tariflar
  const topRevenuePlan = [...plansData].sort((a, b) => b.revenue - a.revenue)[0];
  const topSalesPlan = [...plansData].sort((a, b) => b.count - a.count)[0];
  const activeHovered = hoveredPlan ? plansData.find(p => p.key === hoveredPlan) : null;

  // Aylana SVG (Donut Chart) hisob-kitobi
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSegments = plansData.map((plan) => {
    const pct = hasRevenue ? plan.percentage : 25;
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/[0.05] pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
              To'lovlar va Daromad Tahlili Diagrammasi
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            7 kunlik, 1 oylik, 2 oylik va 3 oylik tariflarning o'sish chizig'i va 100% taqsimot ko'rsatkichlari
          </p>
        </div>

        {/* 3 ta Tab Rejimi */}
        <div className="flex flex-wrap items-center p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.05] self-start lg:self-auto text-xs font-bold gap-1">
          
          {/* 1. O'sish Trend Chizig'i (Line Chart) */}
          <button
            type="button"
            onClick={() => setActiveTab('trend')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'trend'
                ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/60 dark:ring-white/10'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
            <span>O'sish Trend Chizig'i</span>
          </button>

          {/* 2. Aylana Taqsimot (Donut Chart) */}
          <button
            type="button"
            onClick={() => setActiveTab('donut')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'donut'
                ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/60 dark:ring-white/10'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-indigo-500" />
            <span>Aylana Taqsimot (100%)</span>
          </button>

          {/* 3. Cheklar Holati */}
          <button
            type="button"
            onClick={() => setActiveTab('statuses')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'statuses'
                ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/60 dark:ring-white/10'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cheklar Holati</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1-TAB: YUQORIGA KO'TARILUVCHI O'SISH TREND CHIZIG'I      */}
      {/* ======================================================== */}
      {activeTab === 'trend' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Yuqori Mini-Statistika Paneli */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Jami Tasdiqlangan</span>
              <p className="text-base sm:text-lg font-black font-mono text-gray-900 dark:text-white mt-0.5">
                {totalRevenue.toLocaleString()} <span className="text-xs text-emerald-500 font-sans">so'm</span>
              </p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">100% to'lovlar</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Eng Yuqori Pog'ona</span>
              <p className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                Ultra (3 Oylik)
              </p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">120,000 so'm cho'qqisi</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Asosiy Daromad Manbai</span>
              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {topRevenuePlan?.revenue > 0 ? topRevenuePlan.title : 'Kutilmoqda'}
              </p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {topRevenuePlan?.revenue > 0 ? `${topRevenuePlan.revenue.toLocaleString()} so'm (${topRevenuePlan.percentage}%)` : 'Hozircha sotuv yo\'q'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">O'sish Dinamikasi</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3" />
                  <span>Yuqoriga Ko'tariluvchi</span>
                </span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">7k → 1oy → 2oy → 3oy</span>
            </div>

          </div>

          {/* Interactive HUD / Hover Status Box */}
          <div className="p-3.5 px-4 rounded-2xl bg-gray-100/70 dark:bg-white/[0.03] border border-gray-200/70 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {activeHovered ? (
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${activeHovered.bgLight}`}>
                  <activeHovered.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-gray-900 dark:text-white">
                      {activeHovered.title}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                      {activeHovered.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Tarif narxi: <span className="font-bold text-gray-900 dark:text-white">{activeHovered.priceFormatted}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                <span>
                  Chiziqdagi nuqtalarga yoki pastdagi kartalarga sichqonchani olib boring (Rejalar o'sish dinamikasi)
                </span>
              </div>
            )}

            {activeHovered && (
              <div className="flex items-center space-x-4 self-end sm:self-auto font-mono text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">Sotilgan soni</span>
                  <span className="font-black text-gray-900 dark:text-white">{activeHovered.count} dona</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Jami tushum</span>
                  <span className="font-black text-emerald-500">{activeHovered.revenue.toLocaleString()} so'm</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Umumiy ulush</span>
                  <span className="font-black" style={{ color: activeHovered.color }}>{activeHovered.percentage}%</span>
                </div>
              </div>
            )}
          </div>

          {/* ASOSIY SVG DIAGRAMMA: Yuqoriga ko'tarilgan chiziq */}
          <div className="relative w-full overflow-x-auto rounded-3xl bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 dark:from-white/[0.02] dark:via-[#101422] dark:to-white/[0.01] border border-gray-200/60 dark:border-white/[0.06] p-4 sm:p-6">
            
            <svg 
              className="w-full h-auto min-w-[620px] sm:min-w-[700px] select-none" 
              viewBox="0 0 840 330" 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Maydon (Area) Gradiyenti */}
                <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                  <stop offset="35%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="70%" stopColor="#2563eb" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>

                {/* Chiziq (Stroke) Gradiyenti - 7 kunlikdan 3 oylikkacha o'suvchi ranglar */}
                <linearGradient id="trendLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="33%" stopColor="#2563eb" />
                  <stop offset="66%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>

                {/* Neon Glow nuri */}
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Gorizontal Shkala Chiziqlari (Tarif narxlari va Y darajalari) */}
              {[
                { y: 50, label: '120,000 so\'m', sub: 'Ultra (3 Oylik)' },
                { y: 115, label: '90,000 so\'m', sub: 'Pro+ (2 Oylik)' },
                { y: 175, label: '50,000 so\'m', sub: 'Pro (1 Oylik)' },
                { y: 230, label: '20,000 so\'m', sub: 'Plus (7 Kunlik)' },
              ].map((grid, idx) => (
                <g key={idx}>
                  <line 
                    x1="90" 
                    y1={grid.y} 
                    x2="780" 
                    y2={grid.y} 
                    className="stroke-gray-200/80 dark:stroke-white/[0.06]" 
                    strokeWidth="1" 
                    strokeDasharray="4 5" 
                  />
                  <text 
                    x="80" 
                    y={grid.y + 4} 
                    textAnchor="end" 
                    className="text-[10px] font-mono font-bold fill-gray-400 dark:fill-gray-500"
                  >
                    {grid.label}
                  </text>
                </g>
              ))}

              {/* X-o'qi Asosiy Boshlang'ich Chizig'i (Baseline) */}
              <line 
                x1="90" 
                y1="275" 
                x2="780" 
                y2="275" 
                className="stroke-gray-300 dark:stroke-white/10" 
                strokeWidth="1.5" 
              />

              {/* 2. Vertikal yo'naltiruvchi chiziqlar (har bir nuqtadan pastga tushadi) */}
              {plansData.map((pt) => {
                const isHovered = hoveredPlan === pt.key;
                return (
                  <g key={`vguide-${pt.key}`}>
                    <line
                      x1={pt.x}
                      y1={pt.y}
                      x2={pt.x}
                      y2="275"
                      stroke={pt.color}
                      strokeWidth={isHovered ? '2' : '1'}
                      strokeDasharray="4 4"
                      className="opacity-30 dark:opacity-40 transition-all duration-300"
                    />
                  </g>
                );
              })}

              {/* 3. Chiziq ostidagi maydon (Area Fill with Gradient) */}
              {/* x0=120, y0=230 -> x1=320, y1=175 -> x2=520, y2=115 -> x3=720, y3=50 */}
              <path
                d="M 120 230 C 220 230, 220 175, 320 175 C 420 175, 420 115, 520 115 C 620 115, 620 50, 720 50 L 720 275 L 120 275 Z"
                fill="url(#trendAreaGradient)"
                className="transition-opacity duration-300"
              />

              {/* 4. ASOSIY YUQORIGA KO'TARILUVCHI SILLIQ CHIZIQ (Rising Spline Curve) */}
              <path
                d="M 120 230 C 220 230, 220 175, 320 175 C 420 175, 420 115, 520 115 C 620 115, 620 50, 720 50"
                fill="none"
                stroke="url(#trendLineGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#neonGlow)"
                className="transition-all duration-300"
              />

              {/* 5. NUQTALAR (Nodes) va ularning nurlari */}
              {plansData.map((pt) => {
                const isHovered = hoveredPlan === pt.key;

                return (
                  <g 
                    key={`node-${pt.key}`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredPlan(pt.key)}
                    onMouseLeave={() => setHoveredPlan(null)}
                  >
                    {/* Katta nurlanuvchi doira (Tashqi puls) */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 20 : 13}
                      fill={pt.color}
                      fillOpacity={isHovered ? 0.35 : 0.18}
                      className="transition-all duration-300"
                    />

                    {/* O'rta chegara doirasi */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 12 : 8}
                      fill={pt.color}
                      fillOpacity={isHovered ? 0.8 : 0.5}
                      className="transition-all duration-300"
                    />

                    {/* Markaziy oq nuqta */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4.5}
                      fill="#ffffff"
                      stroke={pt.color}
                      strokeWidth="2.5"
                      className="transition-all duration-300"
                    />

                    {/* Nuqta ustidagi ma'lumot nishoni (Data Badge) */}
                    <g transform={`translate(${pt.x}, ${pt.y - 24})`}>
                      <rect
                        x="-48"
                        y="-12"
                        width="96"
                        height="22"
                        rx="11"
                        className={`transition-all duration-300 ${
                          isHovered 
                            ? 'fill-gray-900 dark:fill-white stroke-2' 
                            : 'fill-white dark:fill-[#151b2e] stroke-1'
                        }`}
                        stroke={pt.color}
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        className={`text-[10px] font-black font-mono tracking-tight transition-colors duration-300 ${
                          isHovered 
                            ? 'fill-white dark:fill-gray-900' 
                            : 'fill-gray-900 dark:fill-white'
                        }`}
                      >
                        {pt.revenue > 0 ? `${(pt.revenue / 1000).toLocaleString()}k so'm` : pt.priceFormatted}
                      </text>
                    </g>

                    {/* X-o'qi ostidagi Tarif nomi (pastda yozilgan) */}
                    <text
                      x={pt.x}
                      y="298"
                      textAnchor="middle"
                      className={`text-xs font-black transition-all duration-200 ${
                        isHovered 
                          ? 'fill-gray-900 dark:fill-white font-black scale-105' 
                          : 'fill-gray-500 dark:fill-gray-400 font-bold'
                      }`}
                    >
                      {pt.shortTitle}
                    </text>

                    {/* Pastki qatorda tarif narxi */}
                    <text
                      x={pt.x}
                      y="314"
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-gray-400 dark:fill-gray-500 font-medium"
                    >
                      {pt.priceFormatted}
                    </text>

                    {/* Katta ko'rinmas bosish maydoni (Hitbox) */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="35"
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 4 TA TARIF BO'YICHA TAHLILIY KARTOCHKALAR (Interaktiv sinxronlashgan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plansData.map((plan) => {
              const Icon = plan.icon;
              const isHovered = hoveredPlan === plan.key;

              return (
                <div
                  key={plan.key}
                  onMouseEnter={() => setHoveredPlan(plan.key)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? 'bg-gray-50 dark:bg-white/[0.06] border-brand-500 shadow-lg scale-[1.02]'
                      : 'bg-white/60 dark:bg-white/[0.02] border-gray-200/70 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${plan.bgLight}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                          {plan.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {plan.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Tarif narxi:</span>
                      <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{plan.priceFormatted}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Sotilgan:</span>
                      <span className="font-mono font-black text-gray-900 dark:text-white">
                        {plan.count} dona
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Tushum:</span>
                      <span className="font-mono font-black text-emerald-500">
                        {plan.revenue.toLocaleString()} so'm
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-400">Umumiy ulush:</span>
                      <span className="font-black text-xs" style={{ color: plan.color }}>
                        {plan.percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${plan.gradient} transition-all duration-700`}
                        style={{ width: `${Math.max(hasRevenue ? plan.percentage : 0, 3)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2-TAB: AYLANA TAQSIMOT (DONUT CHART - 100% ULUSH)        */}
      {/* ======================================================== */}
      {activeTab === 'donut' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
          
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
      )}

      {/* ======================================================== */}
      {/* 3-TAB: CHEKLAR HOLATI (STATUSES BREAKDOWN)                */}
      {/* ======================================================== */}
      {activeTab === 'statuses' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 animate-in fade-in duration-300">
          
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
              Muvaffaqiyatli qabul qilingan va obuna yoqilgan to'lovlar
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-white/[0.05] text-xs">
        <span className="text-gray-400">
          Cheklarni boshqarish, tahrirlash yoki tasdiqlash uchun:
        </span>
        <Link
          to="/payments"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
        >
          <span>Barcha to'lovlar va cheklar jadvaliga o'tish</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};
