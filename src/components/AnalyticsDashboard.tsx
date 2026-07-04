import React, { useState } from 'react';
import { Project, AuditSummary, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { exportProjectToPDF } from '../utils/pdfExport';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileDown, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Lightbulb, 
  ShieldAlert,
  Flame,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface AnalyticsDashboardProps {
  project: Project;
  summary: AuditSummary;
}

export default function AnalyticsDashboard({ project, summary }: AnalyticsDashboardProps) {
  const { t, language } = useLanguage();
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null);

  // Calculate category stats
  const baseCatStats = CATEGORIES.map(cat => {
    const devicesInCat = project.devices.filter(d => d.category === cat.id);
    const dailyKWh = devicesInCat.reduce((sum, d) => sum + ((d.watts * d.hoursPerDay * d.quantity) / 1000), 0);
    const count = devicesInCat.reduce((sum, d) => sum + d.quantity, 0);
    const percentage = summary.totalDailyKWh > 0 ? (dailyKWh / summary.totalDailyKWh) * 100 : 0;
    
    // Custom stroke color matching the category
    let strokeColor = '#94a3b8'; // slate-400
    if (cat.id === 'heating_cooling') strokeColor = '#f43f5e'; // rose-500
    else if (cat.id === 'kitchen') strokeColor = '#f59e0b'; // amber-500
    else if (cat.id === 'lighting') strokeColor = '#eab308'; // yellow-500
    else if (cat.id === 'entertainment') strokeColor = '#6366f1'; // indigo-500
    else if (cat.id === 'office_tech') strokeColor = '#06b6d4'; // cyan-500
    else if (cat.id === 'laundry_utility') strokeColor = '#10b981'; // emerald-500

    return { 
      ...cat, 
      dailyKWh, 
      count, 
      percentage,
      strokeColor
    };
  }).filter(c => c.count > 0);

  let tempAccum = 0;
  const catStats = baseCatStats.map(stat => {
    const accumulatedBefore = tempAccum;
    tempAccum += stat.percentage;
    return {
      ...stat,
      accumulatedBefore
    };
  });

  // SVG Donut Chart Constants
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~314.159

  // Active hover category info for center of donut
  const activeDisplayCat = hoveredCategory 
    ? catStats.find(c => c.id === hoveredCategory)
    : catStats.length > 0 ? catStats[0] : null;

  // Top 5 Energy Consuming Devices
  const topConsumers = [...project.devices]
    .map(d => ({
      ...d,
      dailyKWh: (d.watts * d.hoursPerDay * d.quantity) / 1000,
      annualCost: ((d.watts * d.hoursPerDay * d.quantity) / 1000) * 365 * project.ratePerKWh
    }))
    .sort((a, b) => b.dailyKWh - a.dailyKWh)
    .slice(0, 5);

  const maxDailyKWh = topConsumers.length > 0 ? topConsumers[0].dailyKWh : 1;

  // Footprint Rating Heuristics
  // Average household daily is ~30 kWh. 
  // Let's rate this audit's daily usage:
  const getRating = (kwh: number) => {
    if (kwh === 0) return { label: t('ratingIncomplete'), color: 'text-slate-400', bg: 'bg-slate-950', border: 'border-slate-800', desc: t('ratingIncompleteDesc') };
    if (kwh < 10) return { label: t('ratingEco'), color: 'text-emerald-400', bg: 'bg-emerald-950/20', border: 'border-emerald-500/30', desc: t('ratingEcoDesc') };
    if (kwh < 25) return { label: t('ratingEfficient'), color: 'text-cyan-400', bg: 'bg-cyan-950/20', border: 'border-cyan-500/30', desc: t('ratingEfficientDesc') };
    if (kwh < 45) return { label: t('ratingHigh'), color: 'text-amber-400', bg: 'bg-amber-950/20', border: 'border-amber-500/30', desc: t('ratingHighDesc') };
    return { label: t('ratingHeavy'), color: 'text-rose-400', bg: 'bg-rose-950/20', border: 'border-rose-500/30', desc: t('ratingHeavyDesc') };
  };

  const rating = getRating(summary.totalDailyKWh);

  const handlePdfExport = () => {
    exportProjectToPDF(project, summary, language);
  };

  return (
    <div id="analytics-dashboard-panel" className="space-y-6">
      {/* 1. Bento KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Card */}
        <div className="bg-brand-panel border border-brand-border p-4 rounded-none relative overflow-hidden group hover:bg-brand-panel-light transition-colors shadow-none">
          <div className="absolute top-0 right-0 p-4 opacity-5 -translate-y-2 translate-x-2 group-hover:scale-110 transition-transform">
            <Activity className="w-16 h-16 text-brand-dark" />
          </div>
          <span className="text-[10px] font-mono tracking-wider text-brand-darktext bg-brand-dark px-1.5 py-0.5 uppercase font-bold">
            {t('dailyAuditMetric')}
          </span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-brand-text tracking-tight font-sans">
              {project.currency}{summary.totalDailyCost.toFixed(2)}
            </span>
            <span className="text-brand-text opacity-75 text-xs font-serif italic">{t('perDay')}</span>
          </div>
          <div className="mt-1 text-brand-text text-xs flex items-center gap-1 font-mono uppercase">
            <span className="font-bold">{summary.totalDailyKWh.toFixed(2)} kWh</span> {t('dailyLoad')}
          </div>
        </div>

        {/* Monthly Card */}
        <div className="bg-brand-panel border border-brand-border p-4 rounded-none relative overflow-hidden group hover:bg-brand-panel-light transition-colors shadow-none">
          <div className="absolute top-0 right-0 p-4 opacity-5 -translate-y-2 translate-x-2 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-brand-dark" />
          </div>
          <span className="text-[10px] font-mono tracking-wider text-brand-darktext bg-brand-dark px-1.5 py-0.5 uppercase font-bold">
            {t('estMonthlyImpact')}
          </span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-brand-text tracking-tight font-sans">
              {project.currency}{summary.totalMonthlyCost.toFixed(2)}
            </span>
            <span className="text-brand-text opacity-75 text-xs font-serif italic">{t('perMonth')}</span>
          </div>
          <div className="mt-1 text-brand-text text-xs flex items-center gap-1 font-mono uppercase">
            <span className="font-bold">{summary.totalMonthlyKWh.toFixed(0)} kWh</span> {t('monthlyLoad')}
          </div>
        </div>

        {/* Annual Card */}
        <div className="bg-brand-panel border border-brand-border p-4 rounded-none relative overflow-hidden group hover:bg-brand-panel-light transition-colors shadow-none">
          <div className="absolute top-0 right-0 p-4 opacity-5 -translate-y-2 translate-x-2 group-hover:scale-110 transition-transform">
            <DollarSign className="w-16 h-16 text-brand-dark" />
          </div>
          <span className="text-[10px] font-mono tracking-wider text-brand-darktext bg-brand-dark px-1.5 py-0.5 uppercase font-bold">
            {t('estAnnualImpact')}
          </span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-brand-text tracking-tight font-sans">
              {project.currency}{summary.totalAnnualCost.toFixed(2)}
            </span>
            <span className="text-brand-text opacity-75 text-xs font-serif italic">{t('perYear')}</span>
          </div>
          <div className="mt-1 text-brand-text text-xs flex items-center gap-1 font-mono uppercase">
            <span className="font-bold">{summary.totalAnnualKWh.toFixed(0)} kWh</span> {t('annualLoad')}
          </div>
        </div>
      </div>

      {/* 2. Rating Badge & PDF Download */}
      <div className={`border-2 border-brand-border rounded-none p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-none bg-brand-panel-light`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 bg-brand-dark border border-brand-border rounded-none shrink-0 text-brand-darktext">
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-brand-text uppercase tracking-wider">
                {t('ratingLabel')}
              </span>
              <span className="text-xs font-black uppercase tracking-wide px-1.5 py-0.5 bg-brand-dark text-brand-darktext font-mono">
                {rating.label}
              </span>
            </div>
            <p className="text-xs text-brand-text font-serif italic mt-0.5">{rating.desc}</p>
          </div>
        </div>

        <button
          onClick={handlePdfExport}
          className="bg-brand-dark hover:bg-brand-text hover:text-brand-bg text-brand-darktext font-bold px-4 py-2 rounded-none text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-brand-border grow-0 shrink-0 self-start sm:self-center uppercase tracking-wider font-mono"
        >
          <FileDown className="w-3.5 h-3.5" /> {t('exportPdfBtn')}
        </button>
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT CHART: Category Breakdown Donut */}
        <div className="bg-brand-panel border border-brand-border rounded-none p-4 shadow-none flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-brand-text font-black mb-0.5">
              {t('energyAllocationTitle')}
            </h3>
            <p className="text-xs text-brand-text opacity-70 font-serif italic">
              {t('energyAllocationSub')}
            </p>
          </div>

          {catStats.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-brand-text opacity-60 text-xs font-mono uppercase">
              {t('noDevicesDetected')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-4">
              {/* Donut Column */}
              <div className="sm:col-span-6 flex justify-center relative">
                <svg width="150" height="150" viewBox="0 0 160 160" className="transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#D1D0CC" 
                    strokeWidth={strokeWidth}
                  />
                  {catStats.map((stat) => {
                    const sliceLength = (stat.percentage / 100) * circumference;
                    const strokeDasharray = `${sliceLength} ${circumference - sliceLength}`;
                    const strokeDashoffset = circumference - (stat.accumulatedBefore / 100) * circumference;

                    const isFocused = hoveredCategory === stat.id;

                    // Industrial theme colors
                    let color = '#141414';
                    if (stat.id === 'heating_cooling') color = '#b91c1c'; // solid dark red
                    else if (stat.id === 'kitchen') color = '#c2410c'; // amber/orange
                    else if (stat.id === 'lighting') color = '#a16207'; // deep yellow
                    else if (stat.id === 'entertainment') color = '#1e3a8a'; // dark blue
                    else if (stat.id === 'office_tech') color = '#0f766e'; // teal
                    else if (stat.id === 'laundry_utility') color = '#15803d'; // green

                    return (
                      <circle
                        key={stat.id}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={isFocused ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        onMouseEnter={() => setHoveredCategory(stat.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {activeDisplayCat ? (
                    <div className="text-center px-4">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-brand-text font-black block truncate max-w-[100px]">
                        {t(activeDisplayCat.id)}
                      </span>
                      <span className="text-xl font-bold text-brand-text block tracking-tighter">
                        {activeDisplayCat.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[8px] font-mono text-brand-text opacity-70 block">
                        {activeDisplayCat.dailyKWh.toFixed(1)} KWH/D
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-[10px] font-mono text-brand-text opacity-60 uppercase block">
                        {t('donutSelect')}
                      </span>
                      <span className="text-xs font-bold text-brand-text block">
                        {t('donutCategory')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legends Column */}
              <div className="sm:col-span-6 space-y-1 max-h-[180px] overflow-y-auto pr-1">
                {catStats.map((stat) => {
                  const isFocused = hoveredCategory === stat.id;
                  let color = '#141414';
                  if (stat.id === 'heating_cooling') color = '#b91c1c';
                  else if (stat.id === 'kitchen') color = '#c2410c';
                  else if (stat.id === 'lighting') color = '#a16207';
                  else if (stat.id === 'entertainment') color = '#1e3a8a';
                  else if (stat.id === 'office_tech') color = '#0f766e';
                  else if (stat.id === 'laundry_utility') color = '#15803d';

                  return (
                    <div
                      key={stat.id}
                      onMouseEnter={() => setHoveredCategory(stat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex items-center justify-between p-1 border transition-colors cursor-pointer rounded-none ${
                        isFocused 
                          ? 'bg-brand-dark text-brand-darktext border-brand-border' 
                          : 'bg-white border-brand-border hover:bg-brand-panel-light'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span 
                          className="w-2 h-2 shrink-0 border border-brand-border" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] font-mono uppercase truncate font-bold">
                          {t(stat.id)}
                        </span>
                      </div>
                      <div className="text-right font-mono text-[10px] font-black pl-2 shrink-0">
                        {stat.percentage.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-brand-border text-[9px] text-brand-text font-mono uppercase text-center">
            {t('activeCategoriesCount')} {catStats.length}
          </div>
        </div>

        {/* RIGHT CHART: Top 5 Devices Bar Chart */}
        <div className="bg-brand-panel border border-brand-border rounded-none p-4 shadow-none flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-brand-text font-black mb-0.5">
              {t('criticalRanksTitle')}
            </h3>
            <p className="text-xs text-brand-text opacity-70 font-serif italic">
              {t('criticalRanksSub')}
            </p>
          </div>

          {topConsumers.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-brand-text opacity-60 text-xs font-mono uppercase">
              {t('noInventoryRegistered')}
            </div>
          ) : (
            <div className="space-y-3 my-4">
              {topConsumers.map((device, idx) => {
                const ratio = device.dailyKWh / maxDailyKWh;
                const widthPercent = Math.max(8, ratio * 100);
                const cat = CATEGORIES.find(c => c.id === device.category);

                return (
                  <div key={device.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase">
                      <span className="font-bold text-brand-text truncate max-w-[180px]">
                        {idx + 1}. {device.name}
                        <span className="text-[9px] opacity-60 ml-1.5 font-normal">
                          ({cat ? t(cat.id) : device.category})
                        </span>
                      </span>
                      <span className="font-bold text-brand-text">
                        {device.dailyKWh.toFixed(2)} KWH <span className="text-[9px] opacity-60 font-normal">/ {project.currency}{device.annualCost.toFixed(0)} {t('perYear').split('/')[1] || 'yr'}</span>
                      </span>
                    </div>
                    {/* Bar track */}
                    <div className="h-3 bg-white border border-brand-border rounded-none overflow-hidden">
                      <div
                        className="h-full bg-brand-dark transition-all duration-300"
                        style={{ 
                          width: `${widthPercent}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-brand-border text-[9px] text-brand-text font-mono uppercase text-center">
            {t('maxPeakLabel')} {topConsumers.length > 0 ? `${topConsumers[0].dailyKWh.toFixed(2)} KWH/DAY` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
