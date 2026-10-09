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
  const [hoveredPoint, setHoveredPoint] = useState(null); // { planKey, pointIndex, value, label }

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
  // 4 TA CHIZIQ VA VAQT ShKALASI (TIMELINE) HISOB-KITOBLARI
  // ========================================================
  
  // Default zaxira timeline (agar backend hali ma'lumot jo'natmagan bo'lsa)
  const defaultTimelines = {
    '1d': [
      { label: '00:00', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '06:00', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '12:00', '7_days': 20000, '1_month': 0, '2_months': 0, '3_months': 120000 },
      { label: '18:00', '7_days': 20000, '1_month': 0, '2_months': 0, '3_months': 120000 },
      { label: 'Hozir', '7_days': 20000, '1_month': 0, '2_months': 0, '3_months': 120000 }
    ],
    '7d': [
      { label: '3-Okt', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '4-Okt', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '5-Okt', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '6-Okt', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '7-Okt', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '8-Okt', '7_days': 0, '1_month': 0, '2_months': 90000, '3_months': 120000 },
      { label: 'Bugun', '7_days': 20000, '1_month': 0, '2_months': 90000, '3_months': 240000 }
    ],
    '30d': [
      { label: '10-Sen', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '16-Sen', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '22-Sen', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '28-Sen', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '4-Okt',  '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: 'Bugun',  '7_days': 20000, '1_month': 0, '2_months': 90000, '3_months': 240000 }
    ],
    'all': [
      { label: 'Boshlanish', '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '20k oldin',  '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '10k oldin',  '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: '5k oldin',   '7_days': 0, '1_month': 0, '2_months': 0, '3_months': 0 },
      { label: 'Kecha',      '7_days': 0, '1_month': 0, '2_months': 90000, '3_months': 120000 },
      { label: 'Bugun',      '7_days': 20000, '1_month': 0, '2_months': 90000, '3_months': 240000 }
    ]
  };

  const timeline = (currentPeriodStats?.timeline && currentPeriodStats.timeline.length > 0)
    ? currentPeriodStats.timeline
    : defaultTimelines[selectedPeriod] || defaultTimelines['7d'];

  // SVG koordinata parametrlari
  const svgWidth = 800;
  const svgHeight = 180;
  const paddingLeft = 65;
  const paddingRight = 750;
  const baselineY = 148;
  const topY = 22;
  const chartHeight = baselineY - topY; // 126px

  // Y-o'qi maksimal shkalasi (100k yoki undan yuqori)
  // 10 ming, 20 ming, 30 ming, 50 ming, 100 ming+
  let maxTimelineVal = 0;
  timeline.forEach(pt => {
    Object.keys(planConfigs).forEach(pk => {
      const v = Number(pt[pk]) || 0;
      if (v > maxTimelineVal) maxTimelineVal = v;
    });
  });

  const maxScale = Math.max(100000, Math.ceil(maxTimelineVal / 50000) * 50000);

  // Y qiymatini koordinataga aylantirish (0 dan maxScale gacha)
  const getY = (val) => {
    const v = Math.max(0, Number(val) || 0);
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
      val: pt[key] || 0,
      label: pt.label
    }));

    const pathD = generateBezierPath(points);

    return {
      key,
      ...planConfigs[key],
      points,
      pathD,
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

  // Aylana SVG (Donut Chart) hisob-kitobi
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedPercent = 0;
  const donutSegments = plansData.map((plan) => {
    const pct = hasRevenue ? plan.percentage : 25;
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
    <div className="relative overflow-hidden p-3 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-lg shadow-gray-200/30 dark:shadow-black/30 space-y-3">
      
      {/* 1. Header, Tablar va Vaqt Filtrlari (1 kun, 7 kun, 30 kun) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 border-b border-gray-100 dark:border-white/[0.05] pb-2.5">
        
        {/* Sarlavha */}
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20 flex-shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight leading-tight flex items-center space-x-2">
              <span>To'lovlar Tahlili: 4 ta Tarif Dinamikasi</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {periodLabels[selectedPeriod]}
              </span>
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
              10k, 20k, 30k, 50k va 100k+ ko'tariluvchi alohida 4 ta ingichka chiziqlar
            </p>
          </div>
        </div>

        {/* Vaqt va Ko'rinish Rejimlari */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          
          {/* Vaqt Filtri (1 Kun, 7 Kun, 30 Kun, Barchasi) */}
          <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.05] text-[11px] font-bold gap-0.5">
            <button
              type="button"
              onClick={() => setSelectedPeriod('1d')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedPeriod === '1d'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              1 Kun
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('7d')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedPeriod === '7d'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              7 Kun
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('30d')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedPeriod === '30d'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              30 Kun
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedPeriod === 'all'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Barchasi
            </button>
          </div>

          {/* Diagramma Turi (Chiziq, Donut, Cheklar) */}
          <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.05] text-[11px] font-bold gap-0.5">
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
              <span>4 Chiziq</span>
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
              <span>Aylana</span>
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
      </div>

      {/* ======================================================== */}
      {/* 1-TAB: 4 TA INGICHQA CHIZIQLI O'SISH TREND DIAGRAMMASI     */}
      {/* ======================================================== */}
      {activeTab === 'trend' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          
          {/* STATIK BARQAROR HUD STATUS PANELI VA 4 TA TARIF LEGENDASI */}
          <div className="h-8.5 sm:h-9 px-3 rounded-xl bg-gray-100/70 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.05] flex items-center justify-between text-xs overflow-hidden">
            
            {/* Chap tomon: 4 ta rangli chiziq legendasi (hover bilan boshqariladi) */}
            <div className="flex items-center space-x-2 sm:space-x-3 truncate">
              {Object.keys(planConfigs).map((pk) => {
                const conf = planConfigs[pk];
                const isHovered = hoveredPlan === pk;

                return (
                  <button
                    key={pk}
                    type="button"
                    onMouseEnter={() => setHoveredPlan(pk)}
                    onMouseLeave={() => setHoveredPlan(null)}
                    className={`flex items-center space-x-1.5 transition-all text-[11px] font-bold ${
                      isHovered 
                        ? 'opacity-100 scale-105' 
                        : hoveredPlan 
                        ? 'opacity-35' 
                        : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-1 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: conf.color }} 
                    />
                    <span className="text-gray-800 dark:text-gray-200">
                      {conf.shortTitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* O'ng tomon: Tanlangan davrdagi jami tushum va zakazlar */}
            <div className="flex items-center space-x-3 text-[11px] font-mono flex-shrink-0">
              <span className="text-gray-500 dark:text-gray-400 hidden xs:inline">
                {periodOrders} ta zakaz
              </span>
              <span className="text-gray-900 dark:text-white font-black">
                Jami: <span className="text-emerald-500">{periodRevenue.toLocaleString()} so'm</span>
              </span>
            </div>

          </div>

          {/* ASOSIY SVG DIAGRAMMA: 4 TA INGICHQA EGRI CHIZIQ */}
          <div className="relative w-full rounded-2xl bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 dark:from-white/[0.02] dark:via-[#101422] dark:to-white/[0.01] border border-gray-200/60 dark:border-white/[0.05] p-2 sm:p-2.5 overflow-hidden">
            
            <svg 
              className="w-full h-[150px] sm:h-[170px] select-none block" 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Chiziqlar nurlanish filtri */}
                <filter id="activeLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
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
                    x={paddingLeft - 6} 
                    y={lvl.y + 3.5} 
                    textAnchor="end" 
                    className="text-[9px] font-mono font-bold fill-gray-400 dark:fill-gray-500"
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
                      y={baselineY + 16}
                      textAnchor="middle"
                      className="text-[10px] font-black fill-gray-500 dark:fill-gray-400"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}

              {/* 3. 4 TA INGICHQA EGRI CHIZIQ (Har biri o'zining rangida) */}
              {linesData.map((line) => {
                const isHovered = hoveredPlan === line.key;
                const isAnyHovered = !!hoveredPlan;

                return (
                  <path
                    key={`line-${line.key}`}
                    d={line.pathD}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={isHovered ? '3.2' : isAnyHovered ? '1.4' : '2.2'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={isHovered ? 'url(#activeLineGlow)' : undefined}
                    className="transition-all duration-200 pointer-events-none"
                    style={{
                      opacity: isHovered ? 1 : isAnyHovered ? 0.22 : 0.92
                    }}
                  />
                );
              })}

              {/* 4. NUQTALAR (Har bir vaqt nuqtasidagi tugunlar) */}
              {linesData.map((line) => {
                const isPlanHovered = hoveredPlan === line.key;
                const isAnyHovered = !!hoveredPlan;

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
                            r={isPointHovered ? 6 : isPlanHovered ? 4.5 : 3}
                            fill={line.color}
                            fillOpacity={isPointHovered ? 0.4 : 0.2}
                            className="pointer-events-none transition-all duration-150"
                          />

                          {/* Markaziy oq nuqta */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isPointHovered ? 3.5 : isPlanHovered ? 2.5 : 2}
                            fill="#ffffff"
                            stroke={line.color}
                            strokeWidth={isPointHovered ? '2' : '1.5'}
                            className="pointer-events-none transition-all duration-150"
                          />

                          {/* Faol nuqta ustidagi ixcham tooltip */}
                          {isPointHovered && (
                            <g transform={`translate(${p.x}, ${p.y - 16})`} className="pointer-events-none">
                              <rect
                                x="-42"
                                y="-10"
                                width="84"
                                height="20"
                                rx="6"
                                className="fill-gray-900 dark:fill-white"
                              />
                              <text
                                x="0"
                                y="3.5"
                                textAnchor="middle"
                                className="text-[9px] font-black font-mono fill-white dark:fill-gray-900"
                              >
                                {p.val > 0 ? `${p.val.toLocaleString()} so'm` : '0 so\'m'}
                              </text>
                            </g>
                          )}

                          {/* Shaffof harakatsiz Hitbox (Hoverni qotmasdan va aniq ushlaydi) */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="16"
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

          {/* 4 TA TARIF BO'YICHA KARTALAR (Tanlangan 1k, 7k, 30k ga qarab real-vaqtda yangilanadi) */}
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
                      <span className="text-gray-400 text-[10px]">Tushgan pul:</span>
                      <span className="font-mono font-black text-emerald-500">
                        {plan.revenue.toLocaleString()} <span className="text-[9px] font-sans">so'm</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-400">Zakazlar:</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {plan.count} ta • <span style={{ color: plan.color }}>{plan.percentage}%</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center animate-in fade-in duration-150 py-1">
          
          {/* Chap ustun: Aylana (Donut) Diagramma */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={donutRadius}
                  className="stroke-gray-100 dark:stroke-white/[0.05]"
                  strokeWidth="16"
                  fill="transparent"
                />

                {donutSegments.map((segment) => (
                  <circle
                    key={segment.key}
                    cx="80"
                    cy="80"
                    r={donutRadius}
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
                  {hoveredPlan ? planConfigs[hoveredPlan]?.shortTitle : periodLabels[selectedPeriod]}
                </span>
                <p className="text-base sm:text-lg font-black font-mono text-gray-900 dark:text-white mt-0.5 tracking-tight">
                  {hoveredPlan 
                    ? (plansData.find(p => p.key === hoveredPlan)?.revenue || 0).toLocaleString()
                    : periodRevenue.toLocaleString()
                  } <span className="text-[10px] font-sans text-emerald-500">so'm</span>
                </p>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  {hoveredPlan
                    ? `${plansData.find(p => p.key === hoveredPlan)?.percentage || 0}% ulush`
                    : `${periodOrders} ta zakaz tasdiqlangan`
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 animate-in fade-in duration-150">
          
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

      {/* Footer Navigation */}
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
