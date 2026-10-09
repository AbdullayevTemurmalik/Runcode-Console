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
  Activity
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

  // 4 ta asosiy tariflarning to'liq konfiguratsiyasi (Ixcham koordinatalar)
  const planConfigs = {
    '7_days': {
      id: '7_days',
      title: 'Plus (7 Kunlik)',
      shortTitle: '7 Kunlik',
      level: '1-daraja (Boshlang\'ich)',
      price: 20000,
      priceFormatted: "20,000 so'm",
      color: '#0ea5e9', // sky-500
      gradient: 'from-sky-400 to-cyan-500',
      bgLight: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      icon: Zap,
      // Ixcham SVG koordinatalari (pastki nuqta)
      x: 95,
      y: 130
    },
    '1_month': {
      id: '1_month',
      title: 'Pro (1 Oylik)',
      shortTitle: '1 Oylik',
      level: '2-daraja (Ommabop)',
      price: 50000,
      priceFormatted: "50,000 so'm",
      color: '#2563eb', // blue-600
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      icon: TrendingUp,
      // Ixcham SVG koordinatalari (ko'tarilish)
      x: 285,
      y: 98
    },
    '2_months': {
      id: '2_months',
      title: 'Pro+ (2 Oylik)',
      shortTitle: '2 Oylik',
      level: '3-daraja (O\'rta muddat)',
      price: 90000,
      priceFormatted: "90,000 so'm",
      color: '#10b981', // emerald-500
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: ShieldCheck,
      // Ixcham SVG koordinatalari (yuqoriroq pog'ona)
      x: 485,
      y: 62
    },
    '3_months': {
      id: '3_months',
      title: 'Ultra (3 Oylik)',
      shortTitle: '3 Oylik',
      level: '4-daraja (Maksimal VIP)',
      price: 120000,
      priceFormatted: "120,000 so'm",
      color: '#a855f7', // purple-500
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      icon: Sparkles,
      // Ixcham SVG koordinatalari (eng yuqori cho'qqi)
      x: 695,
      y: 24
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
  const activeHovered = hoveredPlan ? plansData.find(p => p.key === hoveredPlan) : null;

  // Aylana SVG (Donut Chart) hisob-kitobi (Ixcham radius = 62)
  const radius = 62;
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
    <div className="relative overflow-hidden p-3.5 sm:p-4.5 rounded-2xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-lg shadow-gray-200/30 dark:shadow-black/30 space-y-3">
      
      {/* 1. Header & Tabs (Ixcham bir qatorli qism) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 dark:border-white/[0.05] pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20">
            <Activity className="w-3.5 h-3.5" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              To'lovlar va Daromad Tahlili
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
              7 kunlikdan 3 oylikkacha bo'lgan o'sish chizig'i va taqsimot
            </p>
          </div>
        </div>

        {/* 3 ta Tab Rejimi (Ixcham tugmalar) */}
        <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.05] self-start sm:self-auto text-[11px] font-bold gap-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('trend')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'trend'
                ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-brand-500" />
            <span>O'sish Trend Chizig'i</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('donut')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'donut'
                ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3 h-3 text-indigo-500" />
            <span>Aylana (100%)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('statuses')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'statuses'
                ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Cheklar</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1-TAB: YUQORIGA KO'TARILUVCHI O'SISH TREND CHIZIG'I      */}
      {/* ======================================================== */}
      {activeTab === 'trend' && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          
          {/* STATIK BARQAROR HUD STATUS PANELI (Qat'iy h-8.5 sm:h-9 balandlik - Hech qachon sakramaydi!) */}
          <div className="h-8.5 sm:h-9 px-3 rounded-xl bg-gray-100/70 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.05] flex items-center justify-between text-xs overflow-hidden">
            {activeHovered ? (
              <>
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activeHovered.color }} />
                  <span className="font-black text-gray-900 dark:text-white truncate">
                    {activeHovered.title}
                  </span>
                  <span className="text-[10px] text-gray-400 hidden xs:inline">
                    ({activeHovered.priceFormatted})
                  </span>
                </div>
                <div className="flex items-center space-x-3 font-mono text-[11px] flex-shrink-0">
                  <span className="text-gray-600 dark:text-gray-300 font-bold">
                    {activeHovered.count} dona
                  </span>
                  <span className="text-emerald-500 font-black">
                    {activeHovered.revenue.toLocaleString()} so'm
                  </span>
                  <span className="font-black px-1.5 py-0.2 rounded-md bg-white dark:bg-white/10" style={{ color: activeHovered.color }}>
                    {activeHovered.percentage}%
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-[11px] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                  <span className="truncate">Tariflar zinapoyasi bo'yicha yuqoriga o'suvchi dinamika (7k → 1oy → 2oy → 3oy)</span>
                </div>
                <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 flex-shrink-0">
                  Jami: <span className="font-black text-emerald-500">{totalRevenue.toLocaleString()} so'm</span>
                </div>
              </>
            )}
          </div>

          {/* IXCHAM SVG DIAGRAMMA (Bitta ekranga sig'adigan ixcham balandlik) */}
          <div className="relative w-full rounded-2xl bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 dark:from-white/[0.02] dark:via-[#101422] dark:to-white/[0.01] border border-gray-200/60 dark:border-white/[0.05] p-2.5 sm:p-3 overflow-hidden">
            
            <svg 
              className="w-full h-[145px] sm:h-[165px] select-none block" 
              viewBox="0 0 800 178" 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Maydon (Area) Gradiyenti */}
                <linearGradient id="compactAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.30" />
                  <stop offset="35%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="70%" stopColor="#2563eb" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>

                {/* Chiziq (Stroke) Gradiyenti - 7 kunlikdan 3 oylikkacha o'suvchi ranglar */}
                <linearGradient id="compactLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="33%" stopColor="#2563eb" />
                  <stop offset="66%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>

                {/* Neon Glow nuri */}
                <filter id="compactNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Gorizontal Narx Shkalalari (4 ta pog'ona) */}
              {[
                { y: 24, label: '120k so\'m' },
                { y: 62, label: '90k so\'m' },
                { y: 98, label: '50k so\'m' },
                { y: 130, label: '20k so\'m' },
              ].map((grid, idx) => (
                <g key={idx} className="pointer-events-none">
                  <line 
                    x1="70" 
                    y1={grid.y} 
                    x2="750" 
                    y2={grid.y} 
                    className="stroke-gray-200/70 dark:stroke-white/[0.05]" 
                    strokeWidth="1" 
                    strokeDasharray="3 4" 
                  />
                  <text 
                    x="62" 
                    y={grid.y + 3.5} 
                    textAnchor="end" 
                    className="text-[9px] font-mono font-bold fill-gray-400 dark:fill-gray-500"
                  >
                    {grid.label}
                  </text>
                </g>
              ))}

              {/* X-o'qi Asosiy Boshlang'ich Chizig'i (Baseline) */}
              <line 
                x1="70" 
                y1="148" 
                x2="750" 
                y2="148" 
                className="stroke-gray-300 dark:stroke-white/10 pointer-events-none" 
                strokeWidth="1" 
              />

              {/* 2. Vertikal yo'naltiruvchi chiziqlar */}
              {plansData.map((pt) => {
                const isHovered = hoveredPlan === pt.key;
                return (
                  <line
                    key={`vguide-${pt.key}`}
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2="148"
                    stroke={pt.color}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className={`pointer-events-none transition-opacity duration-200 ${
                      isHovered ? 'opacity-70' : 'opacity-25'
                    }`}
                  />
                );
              })}

              {/* 3. Chiziq ostidagi maydon (Area Fill) */}
              {/* x0=95, y0=130 -> x1=285, y1=98 -> x2=485, y2=62 -> x3=695, y3=24 */}
              <path
                d="M 95 130 C 190 130, 190 98, 285 98 C 385 98, 385 62, 485 62 C 590 62, 590 24, 695 24 L 695 148 L 95 148 Z"
                fill="url(#compactAreaGrad)"
                className="pointer-events-none"
              />

              {/* 4. ASOSIY YUQORIGA KO'TARILUVCHI SILLIQ CHIZIQ (Rising Curve) */}
              <path
                d="M 95 130 C 190 130, 190 98, 285 98 C 385 98, 385 62, 485 62 C 590 62, 590 24, 695 24"
                fill="none"
                stroke="url(#compactLineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#compactNeonGlow)"
                className="pointer-events-none"
              />

              {/* 5. NUQTALAR (Vizual qismlar pointer-events-none, faqat hitbox tinglaydi) */}
              {plansData.map((pt) => {
                const isHovered = hoveredPlan === pt.key;

                return (
                  <g key={`node-${pt.key}`}>
                    
                    {/* Tashqi nurli doira */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 15 : 10}
                      fill={pt.color}
                      fillOpacity={isHovered ? 0.35 : 0.18}
                      className="pointer-events-none transition-all duration-200"
                    />

                    {/* O'rta chegara doirasi */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 8 : 6}
                      fill={pt.color}
                      fillOpacity={isHovered ? 0.85 : 0.55}
                      className="pointer-events-none transition-all duration-200"
                    />

                    {/* Markaziy oq nuqta */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 4.5 : 3.5}
                      fill="#ffffff"
                      stroke={pt.color}
                      strokeWidth="2"
                      className="pointer-events-none transition-all duration-200"
                    />

                    {/* Nuqta ustidagi ixcham nishon (Badge) */}
                    <g transform={`translate(${pt.x}, ${pt.y - 18})`} className="pointer-events-none">
                      <rect
                        x="-38"
                        y="-9"
                        width="76"
                        height="18"
                        rx="9"
                        className={`transition-colors duration-200 ${
                          isHovered 
                            ? 'fill-gray-900 dark:fill-white stroke-2' 
                            : 'fill-white dark:fill-[#151b2e] stroke-1'
                        }`}
                        stroke={pt.color}
                      />
                      <text
                        x="0"
                        y="2.5"
                        textAnchor="middle"
                        className={`text-[9px] font-black font-mono tracking-tight transition-colors duration-200 ${
                          isHovered 
                            ? 'fill-white dark:fill-gray-900' 
                            : 'fill-gray-900 dark:fill-white'
                        }`}
                      >
                        {pt.revenue > 0 ? `${(pt.revenue / 1000).toLocaleString()}k so'm` : pt.priceFormatted}
                      </text>
                    </g>

                    {/* X-o'qi ostidagi Tarif nomi */}
                    <text
                      x={pt.x}
                      y="164"
                      textAnchor="middle"
                      className={`text-[10px] font-black pointer-events-none transition-colors duration-150 ${
                        isHovered 
                          ? 'fill-gray-900 dark:fill-white' 
                          : 'fill-gray-500 dark:fill-gray-400'
                      }`}
                    >
                      {pt.shortTitle}
                    </text>

                    {/* QAT'IY BARQAROR HITBOX: Hech qachon o'lchami o'zgarmaydi, sakramaydi va bag bo'lmaydi */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="26"
                      fill="#000000"
                      fillOpacity="0"
                      style={{ cursor: 'pointer', pointerEvents: 'all' }}
                      onMouseEnter={() => setHoveredPlan(pt.key)}
                      onMouseLeave={() => setHoveredPlan(null)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 4 TA TARIF BO'YICHA IXCHAM VA CHIROYLI KARTALAR (Bitta ekranga to'liq sig'adi) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {plansData.map((plan) => {
              const Icon = plan.icon;
              const isHovered = hoveredPlan === plan.key;

              return (
                <div
                  key={plan.key}
                  onMouseEnter={() => setHoveredPlan(plan.key)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-colors duration-150 cursor-pointer ${
                    isHovered
                      ? 'bg-gray-50/90 dark:bg-white/[0.06] border-brand-500 shadow-sm ring-1 ring-brand-500/30'
                      : 'bg-white/60 dark:bg-white/[0.02] border-gray-200/70 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2 truncate">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 ${plan.bgLight}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {plan.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium block truncate">
                          {plan.priceFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-gray-100 dark:border-white/[0.04]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 text-[10px]">Tushum:</span>
                      <span className="font-mono font-black text-emerald-500">
                        {plan.revenue.toLocaleString()} <span className="text-[9px] font-sans">so'm</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-400">Sotilgan:</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {plan.count} ta • <span style={{ color: plan.color }}>{plan.percentage}%</span>
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${plan.gradient} transition-all duration-500`}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center animate-in fade-in duration-200 py-1">
          
          {/* Chap ustun: Aylana (Donut) Diagramma */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-gray-100 dark:stroke-white/[0.05]"
                  strokeWidth="16"
                  fill="transparent"
                />

                {donutSegments.map((segment) => (
                  <circle
                    key={segment.key}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={segment.color}
                    strokeWidth={hoveredPlan === segment.key ? '20' : '16'}
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredPlan(segment.key)}
                    onMouseLeave={() => setHoveredPlan(null)}
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-none">
                <span className="text-[9px] uppercase font-black tracking-wider text-gray-400">
                  {hoveredPlan ? planConfigs[hoveredPlan]?.shortTitle : 'Jami Tushum'}
                </span>
                <p className="text-base sm:text-lg font-black font-mono text-gray-900 dark:text-white mt-0.5 tracking-tight">
                  {hoveredPlan 
                    ? (plansData.find(p => p.key === hoveredPlan)?.revenue || 0).toLocaleString()
                    : totalRevenue.toLocaleString()
                  } <span className="text-[10px] font-sans text-emerald-500">so'm</span>
                </p>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  {hoveredPlan
                    ? `${plansData.find(p => p.key === hoveredPlan)?.percentage || 0}% ulush`
                    : '100% Tasdiqlangan'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* O'ng ustun: Tariflar ro'yxati */}
          <div className="lg:col-span-7 space-y-2">
            {plansData.map((plan) => {
              const Icon = plan.icon;
              const isHovered = hoveredPlan === plan.key;

              return (
                <div
                  key={plan.key}
                  onMouseEnter={() => setHoveredPlan(plan.key)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`p-2.5 rounded-xl border transition-colors duration-150 cursor-pointer ${
                    isHovered
                      ? 'bg-gray-50 dark:bg-white/[0.05] border-brand-500/50 shadow-xs'
                      : 'bg-white/60 dark:bg-white/[0.02] border-gray-200/70 dark:border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${plan.bgLight}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {plan.title}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-gray-900 dark:text-white mr-2">
                        {plan.revenue.toLocaleString()} so'm
                      </span>
                      <span className="text-[10px] font-bold" style={{ color: plan.color }}>
                        {plan.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${plan.gradient} transition-all duration-500`}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 animate-in fade-in duration-200">
          
          {/* Tasdiqlangan */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Tasdiqlangan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {statusBreakdown.find(s => s.status === 'approved')?.count || 0} dona
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Muvaffaqiyatli qabul qilingan to'lovlar
            </p>
          </div>

          {/* Kutilayotgan */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Kutilmoqda</span>
              <Clock className="w-4 h-4 text-amber-500 animate-spin" />
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {stats?.pendingOrders || 0} dona
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Admin tekshiruvidagi cheklar
            </p>
          </div>

          {/* Rad etilgan */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Rad etilgan</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {statusBreakdown.find(s => s.status === 'rejected')?.count || 0} dona
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Bekor qilingan cheklar
            </p>
          </div>

        </div>
      )}

      {/* Footer Navigation (Ixcham) */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-white/[0.05] text-[11px]">
        <span className="text-gray-400">
          Cheklarni ko'rish va boshqarish:
        </span>
        <Link
          to="/payments"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
        >
          <span>To'lovlar jadvaliga o'tish</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  );
};
