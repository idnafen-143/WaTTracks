import React, { useState } from 'react';
import { Project, Device, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { generatePersonalizedTips, GeneratedTip } from '../utils/tipGenerator';
import { useLanguage } from '../context/LanguageContext';
import { 
  Lightbulb, 
  Leaf, 
  TrendingDown, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Plus,
  Trash2,
  Sparkles,
  ClipboardList,
  Flame,
  ArrowUpRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

interface TipsPanelProps {
  project: Project;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export default function TipsPanel({ project, onUpdateProject }: TipsPanelProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'action_plan'>('recommendations');
  const [customTipInput, setCustomTipInput] = useState('');

  const devices = project.devices;
  const rate = project.ratePerKWh || 0.15;
  const currency = project.currency || '$';

  // Retrieve or initialize stored tip data from project
  const savedTipIds = project.savedTipIds || [];
  const customTips = project.customTips || [];

  // Generate dynamic personalized recommendations
  const allGeneratedTips = generatePersonalizedTips(project, language);

  // Find tips that are saved
  const savedGeneratedTips = allGeneratedTips.filter(tip => savedTipIds.includes(tip.id));

  // Handle tip save / unsave toggling
  const handleToggleSaveTip = (tipId: string) => {
    let newSavedIds = [...savedTipIds];
    if (newSavedIds.includes(tipId)) {
      newSavedIds = newSavedIds.filter(id => id !== tipId);
    } else {
      newSavedIds.push(tipId);
    }
    onUpdateProject(project.id, { savedTipIds: newSavedIds });
  };

  // Add custom user-authored tip
  const handleAddCustomTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTipInput.trim()) return;
    const updatedCustom = [...customTips, customTipInput.trim()];
    onUpdateProject(project.id, { customTips: updatedCustom });
    setCustomTipInput('');
  };

  // Delete custom tip
  const handleDeleteCustomTip = (index: number) => {
    const updatedCustom = customTips.filter((_, idx) => idx !== index);
    onUpdateProject(project.id, { customTips: updatedCustom });
  };

  // Calculate Cumulative Action Plan Savings
  const savedTipsAnnualSavings = savedGeneratedTips.reduce((sum, t) => sum + t.annualSavings, 0);
  const savedTipsMonthlySavings = savedTipsAnnualSavings / 12;

  // Identify top energy-consuming devices and categories for diagnostic insights
  const deviceLoads = devices.map(d => ({
    ...d,
    dailyKWh: (d.watts * d.hoursPerDay * d.quantity) / 1000,
    annualCost: ((d.watts * d.hoursPerDay * d.quantity) / 1000) * 365 * rate
  })).sort((a, b) => b.dailyKWh - a.dailyKWh);

  const topDevice = deviceLoads[0];

  const categoryLoads = CATEGORIES.map(cat => {
    const devInCat = devices.filter(d => d.category === cat.id);
    const dailyKWh = devInCat.reduce((sum, d) => sum + ((d.watts * d.hoursPerDay * d.quantity) / 1000), 0);
    return { ...cat, dailyKWh };
  }).sort((a, b) => b.dailyKWh - a.dailyKWh);

  const topCategory = categoryLoads[0] && categoryLoads[0].dailyKWh > 0 ? categoryLoads[0] : null;

  const isFr = language === 'fr';

  return (
    <div id="efficiency-tips-panel" className="bg-brand-panel border border-brand-border rounded-none p-5 shadow-none text-brand-text">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xs font-mono font-black uppercase tracking-wider text-brand-text flex items-center gap-1.5">
            <span className="p-1 bg-brand-dark text-brand-darktext border border-brand-border rounded-none">
              <Leaf className="w-4 h-4 text-emerald-400" />
            </span>
            {t('tipsPanelHeader')}
          </h2>
          <p className="text-brand-text opacity-70 text-[10px] font-serif italic mt-0.5">
            {t('tipsPanelSub')}
          </p>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="bg-white border border-brand-border p-6 rounded-none text-center text-brand-text opacity-70 text-xs font-mono uppercase tracking-wider">
          {t('registerDevicesTips')}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Diagnostic Stats Overlay */}
          <div className="bg-brand-panel-light border border-brand-border p-3.5 space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-text opacity-80 border-b border-brand-border pb-1.5 flex items-center justify-between">
              <span>{t('automatedProfileHeader')}</span>
              <span className="text-emerald-800 font-black">{isFr ? 'ANALYSE IA' : 'AI ANALYZED'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-brand-text opacity-60 uppercase block">{t('primaryUtilityHog')}</span>
                {topDevice ? (
                  <div className="font-mono font-bold text-brand-text truncate">
                    {topDevice.name} <span className="text-rose-800">({topDevice.dailyKWh.toFixed(1)} kWh/d)</span>
                  </div>
                ) : (
                  <div className="text-brand-text opacity-50 italic">{isFr ? 'Aucun détecté' : 'None detected'}</div>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-brand-text opacity-60 uppercase block">{t('highestLoadCat')}</span>
                {topCategory ? (
                  <div className="font-mono font-bold text-brand-text truncate">
                    {t(topCategory.id)} <span className="text-rose-800">({topCategory.dailyKWh.toFixed(1)} kWh/d)</span>
                  </div>
                ) : (
                  <div className="text-brand-text opacity-50 italic">{isFr ? 'Aucun détecté' : 'None detected'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="flex border-b border-brand-border">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-2 font-mono font-bold text-[10px] uppercase tracking-wider transition-colors border-r border-brand-border cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'recommendations' 
                  ? 'bg-brand-dark text-brand-darktext' 
                  : 'bg-white hover:bg-brand-panel-light text-brand-text'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('aiRecommendationsTab', { count: allGeneratedTips.length })}
            </button>
            <button
              onClick={() => setActiveTab('action_plan')}
              className={`flex-1 py-2 font-mono font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'action_plan' 
                  ? 'bg-brand-dark text-brand-darktext' 
                  : 'bg-white hover:bg-brand-panel-light text-brand-text'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              {t('savedActionPlanTab', { count: savedTipIds.length + customTips.length })}
            </button>
          </div>

          {/* TAB 1: AI RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {allGeneratedTips.length === 0 ? (
                <div className="bg-white border border-brand-border p-5 rounded-none text-center text-brand-text opacity-60 text-xs font-mono uppercase">
                  {t('noRecommendations')}
                </div>
              ) : (
                allGeneratedTips.map((tip) => {
                  const isSaved = savedTipIds.includes(tip.id);
                  return (
                    <div 
                      key={tip.id} 
                      className="bg-white border border-brand-border p-3.5 rounded-none flex flex-col justify-between gap-3 hover:border-brand-text transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1 bg-brand-panel border border-brand-border text-brand-text shrink-0 mt-0.5">
                          {tip.type === 'upgrade' && <ArrowUpRight className="w-3.5 h-3.5 text-blue-700" />}
                          {tip.type === 'behavioral' && <Lightbulb className="w-3.5 h-3.5 text-yellow-600" />}
                          {tip.type === 'vampire' && <Zap className="w-3.5 h-3.5 text-indigo-600" />}
                          {tip.type === 'maintenance' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-mono font-black text-brand-text uppercase text-[11px]">{tip.title}</h4>
                            <span className={`text-[8px] font-mono uppercase font-bold px-1 border ${
                              tip.impact === 'High' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                              tip.impact === 'Medium' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              'bg-slate-50 text-slate-800 border-slate-200'
                            }`}>
                              {isFr ? `${tip.impact === 'High' ? 'Haut' : tip.impact === 'Medium' ? 'Moyen' : 'Bas'} Impact` : `${tip.impact} Impact`}
                            </span>
                          </div>
                          <p className="text-brand-text leading-snug opacity-80">{tip.description}</p>
                          <p className="text-[10px] font-mono text-brand-text bg-brand-panel px-2 py-1 border border-brand-border inline-block uppercase mt-1">
                            <span className="font-bold text-brand-dark">{t('actionLabel')}</span> {tip.actionableStep}
                          </p>
                        </div>
                      </div>

                      {/* Footer pricing and bookmark toggler */}
                      <div className="flex items-center justify-between border-t border-brand-border pt-2 text-[10px] font-mono">
                        <div className="text-emerald-800 font-bold">
                          {isFr ? 'ÉCONOMIES ESTIMÉES :' : 'EST. SAVINGS:'} {currency}{tip.monthlySavings.toFixed(2)}{isFr ? '/mois' : '/mo'} <span className="opacity-40">|</span> {currency}{tip.annualSavings.toFixed(2)}{isFr ? '/an' : '/yr'}
                        </div>
                        <button
                          onClick={() => handleToggleSaveTip(tip.id)}
                          className={`flex items-center gap-1 px-2.5 py-0.5 border text-[9px] uppercase font-bold transition-colors cursor-pointer rounded-none ${
                            isSaved 
                              ? 'bg-emerald-800 text-white border-emerald-900 hover:bg-rose-900 hover:border-rose-950' 
                              : 'bg-brand-panel text-brand-text border-brand-border hover:bg-brand-dark hover:text-brand-darktext'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-3 h-3" />
                              <span>{t('savedLabel')}</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 h-3" />
                              <span>{t('saveToPlanLabel')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SAVED ACTION PLAN */}
          {activeTab === 'action_plan' && (
            <div className="space-y-4">
              
              {/* Savings Dashboard of the Action Plan */}
              {(savedGeneratedTips.length > 0 || customTips.length > 0) && (
                <div className="bg-brand-dark text-brand-darktext border border-brand-border p-3.5 rounded-none flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-widest block opacity-70">
                      {t('actionPlanTargets')}
                    </span>
                    <span className="text-lg font-mono font-black uppercase">
                      -{currency}{savedTipsAnnualSavings.toFixed(2)} <span className="text-[10px] font-normal opacity-70">/ {isFr ? 'AN' : 'YEAR'}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold block">
                      -{currency}{savedTipsMonthlySavings.toFixed(2)} / {isFr ? 'MOIS' : 'MO'}
                    </span>
                    <span className="text-[8px] font-mono opacity-75 uppercase">
                      ~{((savedTipsAnnualSavings / (rate || 0.15)) / 365).toFixed(1)} {t('kwhSavedPerDay')}
                    </span>
                  </div>
                </div>
              )}

              {/* Saved Tips List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {savedGeneratedTips.length === 0 && customTips.length === 0 ? (
                  <div className="bg-white border border-brand-border p-6 rounded-none text-center text-brand-text opacity-60 text-xs font-mono uppercase">
                    {t('emptyActionPlan')}
                  </div>
                ) : (
                  <>
                    {/* Render bookmarked AI tips */}
                    {savedGeneratedTips.map((tip) => (
                      <div 
                        key={tip.id} 
                        className="bg-white border border-brand-border p-2.5 rounded-none flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-brand-text uppercase truncate text-[11px] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-700 shrink-0"></span>
                            {tip.title}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-800 font-bold mt-0.5">
                            {isFr ? 'Économie :' : 'Saving:'} {currency}{tip.annualSavings.toFixed(2)} / {isFr ? 'an' : 'year'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleSaveTip(tip.id)}
                          className="p-1 text-brand-text hover:text-rose-800 transition-colors border border-brand-border hover:bg-rose-50 cursor-pointer"
                          title="Remove from Action Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Render Custom User-authored Tips */}
                    {customTips.map((customText, index) => (
                      <div 
                        key={`custom_${index}`} 
                        className="bg-white border border-brand-border p-2.5 rounded-none flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-brand-text uppercase truncate text-[11px] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-indigo-700 shrink-0"></span>
                            {t('customActionTitle')}
                          </div>
                          <p className="text-[11px] text-brand-text italic mt-0.5 font-serif leading-tight">{customText}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCustomTip(index)}
                          className="p-1 text-brand-text hover:text-rose-800 transition-colors border border-brand-border hover:bg-rose-50 cursor-pointer"
                          title="Delete custom tip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Add Custom User Tip Form */}
              <form onSubmit={handleAddCustomTip} className="pt-3 border-t border-brand-border space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-text opacity-70">
                  {t('writeCustomStrategy')}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTipInput}
                    onChange={e => setCustomTipInput(e.target.value)}
                    placeholder={t('customTipPlaceholder')}
                    className="flex-1 bg-white border border-brand-border rounded-none px-3 py-1.5 text-xs text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-0 font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-brand-dark hover:bg-brand-text hover:text-brand-bg text-brand-darktext font-bold px-3 py-1.5 rounded-none text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-brand-border uppercase font-mono shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('addCustomBtn')}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
