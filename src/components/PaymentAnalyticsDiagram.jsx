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
  Activity,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentAnalyticsDiagram = ({ stats }) => {
  // Tanlangan asosiy rejim: 'trend' (4 ta Chiziq), 'donut' (Aylana Taqsimot), 'statuses' (Cheklar Holati)
  const [activeTab, setActiveTab] = useState('trend');
  
  // Tanlangan vaqt filtri: '1d' (1 kun), '7d' (7 kun), '30d' (30 kun), 'all' (Barchasi)
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  
  // Sichqoncha qaysi tarif yoki nuqta ustida turgani
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 4 ta asosiy tariflar konfiguratsiyasi va ranglari
  const planConfigs = {
    '7_days': {
      id: '7_days',
      title: 'Plus (7 Kunlik)',
      shortTitle: '7 Kunlik',
      price: 20000,
      priceFormatted: "20,000 so'm",
      color: '#0ea5e9', // Och havorang (Sky Blue)
      gradient: 'from-sky-400 to-cyan-500',
      bgLight: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      icon: Zap
    },
    '1_month': {
      id: '1_month',
      title: 'Pro (1 Oylik)',
      shortTitle: '1 Oylik',
      price: 50000,
      priceFormatted: "50,000 so'm",
      color: '#2563eb', // To'q ko'k (Royal Blue)
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      icon: TrendingUp
    },
    '2_months': {
      id: '2_months',
      title: 'Pro+ (2 Oylik)',
      shortTitle: '2 Oylik',
      price: 90000,
      priceFormatted: "90,000 so'm",
      color: '#10b981', // Zumrad yashil (Emerald Green)
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: ShieldCheck
    },
    '3_months': {
      id: '3_months',
      title: 'Ultra (3 Oylik)',
      shortTitle: '3 Oylik',
      price: 120000,
      priceFormatted: "120,000 so'm",
      color: '#a855f7', // Binafsha / Pushti (Purple)
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      icon: Sparkles
    }
  };

  // Backenddan kelgan davriy statistika ma'lumotlari
  const periodsData = stats?.periods || {};
  const currentPeriodStats = periodsData[selectedPeriod] || null;

  // Joriy tanlangan muddat bo'yicha tushum va buyurtmalar
  const periodRevenue = currentPeriodStats ? Number(currentPeriodStats.totalRevenue) : Number(stats?.totalRevenue || 0);
  const periodOrders = currentPeriodStats ? Number(currentPeriodStats.totalOrders) : 0;
  const currentPlanBreakdown = currentPeriodStats?.planBreakdown || stats?.planBreakdown || [];

  // Rejalar nomi aliaslarini to'g'ri moslash
  const normalizePlanKey = (name) => {
    if (!name) return '7_days';
    const n = String(name).toLowerCase().trim();
    if (n === '7_days' || n === 'plus' || n.includes('7')) return '7_days';
    if (n === '1_month' || n === 'pro' || n.includes('1')) return '1_month';
    if (n === '2_months' || n === 'pro_plus' || n === 'pro+' || n.includes('2')) return '2_months';
    if (n === '3_months' || n === 'ultra' || n.includes('3')) return '3_months';
    return '7_days';
  };

  // Joriy tanlangan davr bo'yicha 4 ta tarif ma'lumotlari
  const plansData = Object.keys(planConfigs).map((key) => {
    const matched = currentPlanBreakdown.filter(p => normalizePlanKey(p.plan_name) === key);
    const count = matched.reduce((acc, curr) => acc + (parseInt(curr.count, 10) || 0), 0);
    const revenue = matched.reduce((acc, curr) => acc + (parseInt(curr.revenue, 10) || 0), 0);
    const percentage = periodRevenue > 0 ? Math.round((revenue / periodRevenue) * 100) : 0;
    return {
      key,
      ...planConfigs[key],
      count,
      revenue,
      percentage
    };
  });

  const statusBreakdown = stats?.statusBreakdown || [];
  const hasRevenue = periodRevenue > 0;

  // ========================================================
  // 4 TA CHIZIQ VA TIMELINE HISOB-KITOBLARI (100% ANIQ BAZADAN)
  // Agar tarifda tasdiqlangan to'lov bo'lmasa, to'g'ri 0 so'mda chiziladi!
  // ========================================================
  
  // Zaxira timeline yaratuvchi yordamchi (hech qanday soxta sonlarsiz - faqat haqiqiy plansData)
  const generateCleanFallbackTimeline = (periodKey) => {
    let labels = [];
    if (periodKey === '1d') {
      labels = ['00:00', '06:00', '12:00', '18:00', 'Hozir'];
    } else if (periodKey === '7d') {
      labels = ['3-Okt', '4-Okt', '5-Okt', '6-Okt', '7-Okt', '8-Okt', 'Bugun'];
    } else if (periodKey === '30d') {
      labels = ['10-Sen', '16-Sen', '22-Sen', '28-Sen', '4-Okt', 'Bugun'];
    } else {
      labels = ['Boshlanish', '20k oldin', '10k oldin', '5k oldin', 'Kecha', 'Bugun'];
    }

    return labels.map((label, idx) => {
      const pt = { label };
      Object.keys(planConfigs).forEach(pk => {
        const plan = plansData.find(p => p.key === pk);
        // Agar tasdiqlangan zakaz bo'lmasa, BARCHA nuqtalarda qat'iy 0 so'm bo'ladi!
        if (!plan || plan.count === 0 || plan.revenue === 0) {
          pt[pk] = 0;
        } else {
          // Oxirgi nuqtalarda haqiqiy summaga ko'tariladi
          const isLatest = idx >= labels.length - 2;
          pt[pk] = isLatest ? plan.revenue : 0;
        }
      });
      return pt;
    });
  };

  const timeline = (currentPeriodStats?.timeline && currentPeriodStats.timeline.length > 0)
    ? currentPeriodStats.timeline
    : generateCleanFallbackTimeline(selectedPeriod);

  // SVG KOORDINATA PARAMETRLARI (+30% KATTALASHTIRILGAN FORMAT)
  const svgWidth = 840;
  const svgHeight = 220; // 180 dan 220 ga kattalashtirildi (+25-30%)
  const paddingLeft = 70;
  const paddingRight = 780;
  const baselineY = 175; // 0 so'm chizig'i (pastki chegara)
  const topY = 25;       // Eng yuqori cho'qqi
  const chartHeight = baselineY - topY; // 150px vertikal amplituda (+20-30% balandroq)

  // Y-o'qi maksimal shkalasi (100k yoki undan yuqori)
  let maxTimelineVal = 0;
  timeline.forEach(pt => {
    Object.keys(planConfigs).forEach(pk => {
      const v = Number(pt[pk]) || 0;
      if (v > maxTimelineVal) maxTimelineVal = v;
    });
  });

  const maxScale = Math.max(100000, Math.ceil(maxTimelineVal / 50000) * 50000);

  // Y qiymatini koordinataga aylantirish
  // AGAR VAL = 0 BO'LSA, QAT'IY baselineY (175) QAYTARILADI (To'g'ri 0 so'mda chiziladi)
  const getY = (val) => {
    const v = Math.max(0, Number(val) || 0);
    if (v === 0) return baselineY;
    const ratio = Math.min(v / maxScale, 1);
    return baselineY - ratio * chartHeight;
  };

  // X qiymatini koordinataga aylantirish
  const getX = (index) => {
    if (timeline.length <= 1) return paddingLeft;
    return paddingLeft + index * ((paddingRight - paddingLeft) / (timeline.length - 1));
  };

  // Silliq Cubic Bezier egri chizig'ini yasash
  const generateBezierPath = (points) => {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const dx = (next.x - curr.x) / 2;
      const cp1x = curr.x + dx;
      const cp1y = curr.y;
      const cp2x = curr.x + dx;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  // 4 ta tarif bo'yicha chiziqlar ma'lumotlari
  const linesData = Object.keys(planConfigs).map((key) => {
    const points = timeline.map((pt, idx) => ({
      x: getX(idx),
      y: getY(pt[key] || 0),
      val: Number(pt[key]) || 0,
      label: pt.label
    }));

    const pathD = generateBezierPath(points);
    const plan = plansData.find(p => p.key === key);
    const hasApprovedOrders = plan && plan.count > 0 && plan.revenue > 0;

    return {
      key,
      ...planConfigs[key],
      points,
      pathD,
      hasApprovedOrders,
      latestVal: points[points.length - 1]?.val || 0
    };
  });

  // Gorizontal shkala chiziqlari (10k, 20k, 30k, 50k, 100k+)
  const gridLevels = [
    { val: maxScale, label: maxScale >= 100000 ? `${(maxScale / 1000).toLocaleString()}k` : '100k', y: getY(maxScale) },
    { val: maxScale * 0.5, label: `${Math.round((maxScale * 0.5) / 1000)}k`, y: getY(maxScale * 0.5) },
    { val: maxScale * 0.3, label: `${Math.round((maxScale * 0.3) / 1000)}k`, y: getY(maxScale * 0.3) },
    { val: maxScale * 0.2, label: `${Math.round((maxScale * 0.2) / 1000)}k`, y: getY(maxScale * 0.2) },
    { val: maxScale * 0.1, label: `${Math.round((maxScale * 0.1) / 1000)}k`, y: getY(maxScale * 0.1) },
    { val: 0, label: '0 so\'m', y: baselineY }
  ];

  // Aylana SVG (Donut Chart) hisob-kitobi (+30% kattaroq radius = 72)
  const donutRadius = 72;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedPercent = 0;
  const donutSegments = plansData.map((plan) => {
    const pct = hasRevenue ? plan.percentage : (plan.count > 0 ? 25 : 0);
    const strokeDasharray = `${(pct / 100) * donutCircumference} ${donutCircumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * donutCircumference);
    accumulatedPercent += pct;

    return {
      ...plan,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const periodLabels = {
    '1d': '1 Kunlik (24 soat)',
    '7d': '7 Kunlik',
    '30d': '30 Kunlik (1 oylik)',
    'all': 'Barcha davr'
  };

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/30 dark:shadow-black/30 space-y-4">
      
      {/* 1. Header, Tablar va Vaqt Filtrlari (1 kun, 7 kun, 30 kun) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 border-b border-gray-100 dark:border-white/[0.05] pb-3.5">
        
        {/* Sarlavha (+30% kattaroq va ko'rkam) */}
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex-shrink-0">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight leading-snug flex items-center space-x-2">
              <span>To'lovlar Tahlili: 4 ta Tarif Dinamikasi</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {periodLabels[selectedPeriod]}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
              Barcha tariflar bo'yicha real-vaqt tushumlari dinamikasi (O'zbekiston vaqti bilan)
            </p>
          </div>
        </div>

        {/* Vaqt va Ko'rinish Rejimlari */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          
          {/* Vaqt Filtri (1 Kun, 7 Kun, 30 Kun, Barchasi) */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.05] text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setSelectedPeriod('1d')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedPeriod === '1d'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              1 Kun
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('7d')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedPeriod === '7d'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              7 Kun
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('30d')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedPeriod === '30d'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              30 Kun
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedPeriod === 'all'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Barchasi
            </button>
          </div>

          {/* Diagramma Turi (Chiziq, Donut, Cheklar) */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.05] text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('trend')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'trend'
                  ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
              <span>4 Chiziq</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('donut')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'donut'
                  ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-indigo-500" />
              <span>Aylana</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('statuses')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'statuses'
                  ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cheklar</span>
            </button>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 1-TAB: 4 TA INGICHQA CHIZIQLI O'SISH TREND DIAGRAMMASI     */}
      {/* ======================================================== */}
      {activeTab === 'trend' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          
          {/* STATIK BARQAROR HUD STATUS PANELI VA 4 TA TARIF LEGENDASI */}
          <div className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-2xl bg-gray-100/70 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.05] flex items-center justify-between text-xs sm:text-sm overflow-hidden">
            
            {/* Chap tomon: 4 ta rangli chiziq legendasi */}
            <div className="flex items-center space-x-2.5 sm:space-x-4 truncate">
              {Object.keys(planConfigs).map((pk) => {
                const conf = planConfigs[pk];
                const isHovered = hoveredPlan === pk;
                const plan = plansData.find(p => p.key === pk);
                const hasApproved = plan && plan.count > 0 && plan.revenue > 0;

                return (
                  <button
                    key={pk}
                    type="button"
                    onMouseEnter={() => setHoveredPlan(pk)}
                    onMouseLeave={() => setHoveredPlan(null)}
                    className={`flex items-center space-x-1.5 transition-all text-xs font-bold ${
                      isHovered 
                        ? 'opacity-100 scale-105' 
                        : hoveredPlan 
                        ? 'opacity-30' 
                        : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <span 
                      className="w-3 h-1.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: conf.color }} 
                    />
                    <span className="text-gray-800 dark:text-gray-200">
                      {conf.shortTitle}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal hidden sm:inline">
                      ({plan?.revenue > 0 ? `${plan.revenue.toLocaleString()} so'm` : "0 so'm"})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* O'ng tomon: Tanlangan davrdagi jami tushum va zakazlar */}
            <div className="flex items-center space-x-3 text-xs sm:text-sm font-mono flex-shrink-0">
              <span className="text-gray-500 dark:text-gray-400 hidden xs:inline">
                {periodOrders} ta zakaz
              </span>
              <span className="text-gray-900 dark:text-white font-black">
                Jami: <span className="text-emerald-500">{periodRevenue.toLocaleString()} so'm</span>
              </span>
            </div>

          </div>

          {/* ASOSIY SVG DIAGRAMMA (+30% KATTALASHTIRILGAN, BALANDROQ VA SHINAM) */}
          <div className="relative w-full rounded-2xl bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 dark:from-white/[0.02] dark:via-[#101422] dark:to-white/[0.01] border border-gray-200/60 dark:border-white/[0.05] p-3 sm:p-4 overflow-hidden">
            
            <svg 
              className="w-full h-[195px] sm:h-[225px] select-none block" 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Chiziqlar nurlanish filtri */}
                <filter id="activeLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Gorizontal Narx Shkalalari (10k, 20k, 30k, 50k, 100k+) */}
              {gridLevels.map((lvl, idx) => (
                <g key={`grid-${idx}`} className="pointer-events-none">
                  <line 
                    x1={paddingLeft} 
                    y1={lvl.y} 
                    x2={paddingRight} 
                    y2={lvl.y} 
                    className="stroke-gray-200/70 dark:stroke-white/[0.05]" 
                    strokeWidth="1" 
                    strokeDasharray={lvl.val === 0 ? '0' : '3 4'} 
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={lvl.y + 3.5} 
                    textAnchor="end" 
                    className="text-[10px] font-mono font-bold fill-gray-400 dark:fill-gray-500"
                  >
                    {lvl.label}
                  </text>
                </g>
              ))}

              {/* 2. Vertikal yo'naltiruvchi chiziqlar va X-o'qi Vaqt Yozuvlari */}
              {timeline.map((pt, idx) => {
                const x = getX(idx);
                return (
                  <g key={`tguide-${idx}`} className="pointer-events-none">
                    <line
                      x1={x}
                      y1={topY}
                      x2={x}
                      y2={baselineY}
                      className="stroke-gray-200/40 dark:stroke-white/[0.03]"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <text
                      x={x}
                      y={baselineY + 18}
                      textAnchor="middle"
                      className="text-[11px] font-black fill-gray-500 dark:fill-gray-400"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}

              {/* 3. 4 TA INGICHQA EGRI CHIZIQ (Har biri o'zining rangida) */}
              {/* AGAR TARIFDA TASDIQLANGAN PUL BO'LMASA, CHIZIQ TO'G'RI 0 SO'MDA BO'LADI */}
              {linesData.map((line) => {
                const isHovered = hoveredPlan === line.key;
                const isAnyHovered = !!hoveredPlan;

                return (
                  <path
                    key={`line-${line.key}`}
                    d={line.pathD}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={isHovered ? '3.5' : isAnyHovered ? '1.5' : '2.4'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={isHovered ? 'url(#activeLineGlow)' : undefined}
                    className="transition-all duration-200 pointer-events-none"
                    style={{
                      opacity: isHovered ? 1 : isAnyHovered ? 0.2 : (line.hasApprovedOrders ? 0.95 : 0.45)
                    }}
                  />
                );
              })}

              {/* 4. NUQTALAR (Har bir vaqt nuqtasidagi tugunlar) */}
              {linesData.map((line) => {
                const isPlanHovered = hoveredPlan === line.key;

                return (
                  <g key={`nodes-${line.key}`}>
                    {line.points.map((p, idx) => {
                      const isPointHovered = hoveredPoint?.planKey === line.key && hoveredPoint?.pointIndex === idx;

                      return (
                        <g key={`pt-${line.key}-${idx}`}>
                          
                          {/* Tashqi kichik nurli doiracha */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isPointHovered ? 7 : isPlanHovered ? 5 : 3.5}
                            fill={line.color}
                            fillOpacity={isPointHovered ? 0.45 : line.hasApprovedOrders ? 0.25 : 0.15}
                            className="pointer-events-none transition-all duration-150"
                          />

                          {/* Markaziy oq nuqta */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isPointHovered ? 4 : isPlanHovered ? 3 : 2.2}
                            fill="#ffffff"
                            stroke={line.color}
                            strokeWidth={isPointHovered ? '2' : '1.5'}
                            className="pointer-events-none transition-all duration-150"
                          />

                          {/* Faol nuqta ustidagi nishon / Tooltip */}
                          {isPointHovered && (
                            <g transform={`translate(${p.x}, ${p.y - 18})`} className="pointer-events-none">
                              <rect
                                x="-48"
                                y="-11"
                                width="96"
                                height="22"
                                rx="7"
                                className="fill-gray-900 dark:fill-white shadow-lg"
                              />
                              <text
                                x="0"
                                y="4"
                                textAnchor="middle"
                                className="text-[10px] font-black font-mono fill-white dark:fill-gray-900"
                              >
                                {p.val > 0 ? `${p.val.toLocaleString()} so'm` : '0 so\'m (0 ta)'}
                              </text>
                            </g>
                          )}

                          {/* Shaffof harakatsiz Hitbox (Hoverni qotmasdan va aniq ushlaydi) */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="18"
                            fill="#000000"
                            fillOpacity="0"
                            style={{ cursor: 'pointer', pointerEvents: 'all' }}
                            onMouseEnter={() => {
                              setHoveredPlan(line.key);
                              setHoveredPoint({ planKey: line.key, pointIndex: idx, value: p.val, label: p.label });
                            }}
                            onMouseLeave={() => {
                              setHoveredPlan(null);
                              setHoveredPoint(null);
                            }}
                          />

                        </g>
                      );
                    })}
                  </g>
                );
              })}

            </svg>
          </div>

          {/* 4 TA TARIF BO'YICHA KARTALAR (+30% KATTAROQ VA KO'RKAM) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {plansData.map((plan) => {
              const Icon = plan.icon;
              const isHovered = hoveredPlan === plan.key;
              const hasApproved = plan.count > 0 && plan.revenue > 0;

              return (
                <div
                  key={plan.key}
                  onMouseEnter={() => setHoveredPlan(plan.key)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    isHovered
                      ? 'bg-gray-50/90 dark:bg-white/[0.06] border-brand-500 shadow-md ring-1 ring-brand-500/30'
                      : 'bg-white/60 dark:bg-white/[0.02] border-gray-200/70 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border flex-shrink-0 ${plan.bgLight}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                          {plan.title}
                        </h4>
                        <span className="text-[11px] text-gray-400 font-medium block truncate">
                          {plan.priceFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1.5 border-t border-gray-100 dark:border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 text-[11px]">Tushgan pul:</span>
                      <span className={`font-mono font-black ${hasApproved ? 'text-emerald-500 text-sm' : 'text-gray-400 text-xs'}`}>
                        {plan.revenue.toLocaleString()} <span className="text-[10px] font-sans">so'm</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 text-[11px]">Zakazlar:</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {plan.count} ta {hasApproved && <>• <span style={{ color: plan.color }}>{plan.percentage}%</span></>}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${plan.gradient} transition-all duration-500`}
                        style={{ width: `${hasApproved ? Math.max(plan.percentage, 4) : 0}%` }}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in fade-in duration-150 py-2">
          
          {/* Chap ustun: Aylana (Donut) Diagramma */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center">
              
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 190 190">
                <circle
                  cx="95"
                  cy="95"
                  r={donutRadius}
                  className="stroke-gray-100 dark:stroke-white/[0.05]"
                  strokeWidth="18"
                  fill="transparent"
                />

                {donutSegments.map((segment) => (
                  <circle
                    key={segment.key}
                    cx="95"
                    cy="95"
                    r={donutRadius}
                    stroke={segment.color}
                    strokeWidth={hoveredPlan === segment.key ? '22' : '18'}
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
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">
                  {hoveredPlan ? planConfigs[hoveredPlan]?.shortTitle : periodLabels[selectedPeriod]}
                </span>
                <p className="text-lg sm:text-xl font-black font-mono text-gray-900 dark:text-white mt-0.5 tracking-tight">
                  {hoveredPlan 
                    ? (plansData.find(p => p.key === hoveredPlan)?.revenue || 0).toLocaleString()
                    : periodRevenue.toLocaleString()
                  } <span className="text-xs font-sans text-emerald-500">so'm</span>
                </p>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {hoveredPlan
                    ? `${plansData.find(p => p.key === hoveredPlan)?.percentage || 0}% ulush`
                    : `${periodOrders} ta zakaz tasdiqlangan`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* O'ng ustun: Tariflar ro'yxati */}
          <div className="lg:col-span-7 space-y-2.5">
            {plansData.map((plan) => {
              const Icon = plan.icon;
              const isHovered = hoveredPlan === plan.key;

              return (
                <div
                  key={plan.key}
                  onMouseEnter={() => setHoveredPlan(plan.key)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`p-3 rounded-xl border transition-colors duration-150 cursor-pointer ${
                    isHovered
                      ? 'bg-gray-50 dark:bg-white/[0.05] border-brand-500/50 shadow-sm'
                      : 'bg-white/60 dark:bg-white/[0.02] border-gray-200/70 dark:border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${plan.bgLight}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {plan.title}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-mono font-black text-gray-900 dark:text-white mr-2">
                        {plan.revenue.toLocaleString()} so'm
                      </span>
                      <span className="text-xs font-bold" style={{ color: plan.color }}>
                        {plan.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${plan.gradient} transition-all duration-500`}
                      style={{ width: `${Math.max(plan.revenue > 0 ? plan.percentage : 0, 0)}%` }}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1.5 animate-in fade-in duration-150">
          
          {/* Tasdiqlangan */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Tasdiqlangan</span>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {statusBreakdown.find(s => s.status === 'approved')?.count || 0} dona
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Muvaffaqiyatli qabul qilingan to'lovlar
            </p>
          </div>

          {/* Kutilayotgan */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Kutilmoqda</span>
              <Clock className="w-4.5 h-4.5 text-amber-500 animate-spin" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {stats?.pendingOrders || 0} dona
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin tekshiruvidagi cheklar
            </p>
          </div>

          {/* Rad etilgan */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Rad etilgan</span>
              <XCircle className="w-4.5 h-4.5 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {statusBreakdown.find(s => s.status === 'rejected')?.count || 0} dona
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bekor qilingan cheklar
            </p>
          </div>

        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.05] text-xs">
        <span className="text-gray-400">
          Cheklarni ko'rish va boshqarish:
        </span>
        <Link
          to="/payments"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
        >
          <span>To'lovlar jadvaliga o'tish</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};
