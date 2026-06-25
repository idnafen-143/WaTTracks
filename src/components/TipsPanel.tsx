import React, { useState } from 'react';
import { Project, Device, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { 
  Lightbulb, 
  HelpCircle, 
  Leaf, 
  TrendingDown, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  ToggleLeft
} from 'lucide-react';

interface TipsPanelProps {
  project: Project;
}

export default function TipsPanel({ project }: TipsPanelProps) {
  // Simulation states
  const [simulateLed, setSimulateLed] = useState(false);
  const [simulateSmartHVAC, setSimulateSmartHVAC] = useState(false);
  const [simulateVampireKill, setSimulateVampireKill] = useState(false);

  // Parse inventory for smart highlights
  const devices = project.devices;

  // 1. Audit high wattage lights (incandescents)
  const incandescentLights = devices.filter(
    d => d.category === 'lighting' && d.watts >= 40
  );
  const totalIncandescentQty = incandescentLights.reduce((sum, d) => sum + d.quantity, 0);
  const lightingDailyKWh = incandescentLights.reduce((sum, d) => sum + ((d.watts * d.hoursPerDay * d.quantity) / 1000), 0);
  // LED equivalent is typically 9W instead of e.g. 60W (85% reduction)
  const potentialLightingAnnualSaving = totalIncandescentQty > 0
    ? (lightingDailyKWh * 0.85) * 365 * project.ratePerKWh
    : 0;

  // 2. Audit high HVAC load
  const hvacDevices = devices.filter(d => d.category === 'heating_cooling');
  const hvacDailyKWh = hvacDevices.reduce((sum, d) => sum + ((d.watts * d.hoursPerDay * d.quantity) / 1000), 0);
  // Smart thermostat saves ~12% on HVAC bills
  const potentialHvacAnnualSaving = hvacDailyKWh > 0
    ? (hvacDailyKWh * 0.12) * 365 * project.ratePerKWh
    : 0;

  // 3. Audit standby loads (vampire load - e.g. entertainment or office tech running long hours > 8 h but not 24h fridge)
  const potentialStandbyDevices = devices.filter(
    d => (d.category === 'entertainment' || d.category === 'office_tech' || d.category === 'other') && 
         d.hoursPerDay >= 12 && 
         d.watts > 20
  );
  // Eliminating standby/unused hours down to e.g. active 4 hours (saving 8 hours of idle draw, e.g. 10W per device)
  const standbyCount = potentialStandbyDevices.reduce((sum, d) => sum + d.quantity, 0);
  const potentialStandbyAnnualSaving = standbyCount * 0.015 * 20 * 365 * project.ratePerKWh; // approx standby leak

  // Total possible simulated savings
  let simulatedSavings = 0;
  if (simulateLed) simulatedSavings += potentialLightingAnnualSaving;
  if (simulateSmartHVAC) simulatedSavings += potentialHvacAnnualSaving;
  if (simulateVampireKill) simulatedSavings += potentialStandbyAnnualSaving;

  return (
    <div id="efficiency-tips-panel" className="bg-brand-panel border border-brand-border rounded-none p-5 shadow-none text-brand-text">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xs font-mono font-black uppercase tracking-wider text-brand-text flex items-center gap-1.5">
            <span className="p-1 bg-brand-dark text-brand-darktext border border-brand-border rounded-none">
              <Leaf className="w-4 h-4" />
            </span>
            DIAGNOSTIC RECOMMENDATIONS & ENERGY METRICS
          </h2>
          <p className="text-brand-text opacity-70 text-xs font-serif italic mt-0.5">
            Dynamic load diagnostics analyzing your {devices.length} registered hardware units.
          </p>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="bg-white border border-brand-border p-5 rounded-none text-center text-brand-text opacity-70 text-xs font-mono uppercase">
          REGISTER INSTALLED DEVICES TO CALCULATE SAVINGS
        </div>
      ) : (
        <div className="space-y-4">
          {/* Diagnostic Warnings */}
          <div className="space-y-3">
            {totalIncandescentQty > 0 && (
              <div className="bg-white border border-brand-border p-3.5 rounded-none flex items-start gap-3">
                <div className="p-1 bg-brand-panel border border-brand-border text-brand-text shrink-0 mt-0.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-mono font-black text-brand-text uppercase">Inefficient Lighting Detected</h4>
                  <p className="text-brand-text mt-1">
                    You have <span className="font-bold font-mono">{totalIncandescentQty} incandescent bulbs / high-wattage sources</span> logged. Retrofitting these with high-efficiency LEDs (typically 9W) reduces consumption by 85%.
                  </p>
                  <p className="text-brand-text font-mono font-black mt-1.5 flex items-center gap-1 text-[10px] uppercase">
                    <ArrowRight className="w-3 h-3" /> Potential Annual Savings: {project.currency}{potentialLightingAnnualSaving.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {hvacDailyKWh > 12 && (
              <div className="bg-white border border-brand-border p-3.5 rounded-none flex items-start gap-3">
                <div className="p-1 bg-brand-panel border border-brand-border text-brand-text shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-mono font-black text-brand-text uppercase">Heavy Climate Control Load</h4>
                  <p className="text-brand-text mt-1">
                    Heating and Cooling draws <span className="font-bold font-mono">{hvacDailyKWh.toFixed(1)} kWh/day</span>. 
                    Deploying a programmable smart thermostat will optimize target temperatures during off-peak or sleep hours, yielding a 12% baseline reduction.
                  </p>
                  <p className="text-brand-text font-mono font-black mt-1.5 flex items-center gap-1 text-[10px] uppercase">
                    <ArrowRight className="w-3 h-3" /> Potential Annual Savings: {project.currency}{potentialHvacAnnualSaving.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {standbyCount > 0 && (
              <div className="bg-white border border-brand-border p-3.5 rounded-none flex items-start gap-3">
                <div className="p-1 bg-brand-panel border border-brand-border text-brand-text shrink-0 mt-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-mono font-black text-brand-text uppercase">Standby Vampire Leaks</h4>
                  <p className="text-brand-text mt-1">
                    Detected <span className="font-bold font-mono">{standbyCount} consumer electronics / tech items</span> running ≥ 12 hrs/day. 
                    Implementing smart, load-sensing power strips will terminate residual idle currents.
                  </p>
                  <p className="text-brand-text font-mono font-black mt-1.5 flex items-center gap-1 text-[10px] uppercase">
                    <ArrowRight className="w-3 h-3" /> Potential Annual Savings: {project.currency}{potentialStandbyAnnualSaving.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {totalIncandescentQty === 0 && hvacDailyKWh <= 12 && standbyCount === 0 && (
              <div className="bg-white border border-brand-border p-3.5 rounded-none flex items-start gap-3">
                <div className="p-1 bg-brand-panel border border-brand-border text-brand-text shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-mono font-black text-brand-text uppercase">Optimal Baseload Metrics</h4>
                  <p className="text-brand-text font-serif italic mt-0.5">
                    No significant lighting overhead, excessive heating, or idle vampire loads found. Your setup demonstrates high energy efficiency.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Simulation Panel */}
          <div className="bg-white border border-brand-border p-4 rounded-none space-y-3">
            <div>
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-brand-text flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-brand-dark" />
                RETROFIT & UPGRADE SIMULATION MODEL
              </h3>
              <p className="text-brand-text opacity-70 text-[10px] font-serif italic mt-0.5">
                Toggle theoretical upgrades to instantly visualize the reduction in your total annual cost.
              </p>
            </div>

            <div className="space-y-2">
              {potentialLightingAnnualSaving > 0 && (
                <label className="flex items-center justify-between p-2 rounded-none bg-brand-panel hover:bg-brand-panel-light border border-brand-border cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs">
                    <input
                      type="checkbox"
                      checked={simulateLed}
                      onChange={e => setSimulateLed(e.target.checked)}
                      className="rounded-none border-brand-border bg-white text-brand-dark focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-neutral-800"
                    />
                    <div>
                      <span className="font-mono font-bold uppercase text-brand-text text-[11px]">RETROFIT {totalIncandescentQty} LIGHT BULB(S) TO LED</span>
                      <span className="text-[10px] text-brand-text opacity-60 block">Reduces bulb power draw by 85%</span>
                    </div>
                  </div>
                  <span className="font-mono text-brand-text text-xs font-black shrink-0">
                    -{project.currency}{potentialLightingAnnualSaving.toFixed(2)}/yr
                  </span>
                </label>
              )}

              {potentialHvacAnnualSaving > 0 && (
                <label className="flex items-center justify-between p-2 rounded-none bg-brand-panel hover:bg-brand-panel-light border border-brand-border cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs">
                    <input
                      type="checkbox"
                      checked={simulateSmartHVAC}
                      onChange={e => setSimulateSmartHVAC(e.target.checked)}
                      className="rounded-none border-brand-border bg-white text-brand-dark focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-neutral-800"
                    />
                    <div>
                      <span className="font-mono font-bold uppercase text-brand-text text-[11px]">INSTALL DIGITAL SMART THERMOSTAT</span>
                      <span className="text-[10px] text-brand-text opacity-60 block">Saves 12% on active climate overhead</span>
                    </div>
                  </div>
                  <span className="font-mono text-brand-text text-xs font-black shrink-0">
                    -{project.currency}{potentialHvacAnnualSaving.toFixed(2)}/yr
                  </span>
                </label>
              )}

              {potentialStandbyAnnualSaving > 0 && (
                <label className="flex items-center justify-between p-2 rounded-none bg-brand-panel hover:bg-brand-panel-light border border-brand-border cursor-pointer">
                  <div className="flex items-center gap-2.5 text-xs">
                    <input
                      type="checkbox"
                      checked={simulateVampireKill}
                      onChange={e => setSimulateVampireKill(e.target.checked)}
                      className="rounded-none border-brand-border bg-white text-brand-dark focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-neutral-800"
                    />
                    <div>
                      <span className="font-mono font-bold uppercase text-brand-text text-[11px]">TERMINATE IDLE STANDBY LOADS</span>
                      <span className="text-[10px] text-brand-text opacity-60 block">Stops parasitic baseline leakage</span>
                    </div>
                  </div>
                  <span className="font-mono text-brand-text text-xs font-black shrink-0">
                    -{project.currency}{potentialStandbyAnnualSaving.toFixed(2)}/yr
                  </span>
                </label>
              )}

              {simulatedSavings > 0 ? (
                <div className="p-2.5 bg-brand-dark text-brand-darktext border border-brand-border rounded-none flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase">
                    SIMULATED TOTAL REDUCTION:
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black">
                      -{project.currency}{simulatedSavings.toFixed(2)} <span className="text-[9px] font-normal opacity-70">/ YEAR</span>
                    </span>
                    <span className="text-[8px] font-mono opacity-70 block uppercase">
                      ~{((simulatedSavings / (project.ratePerKWh || 0.15)) / 365).toFixed(1)} KWH SAVED DAILY
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-brand-text opacity-50 text-center py-2 italic font-serif">
                  Select variables above to compute simulated upgrades.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
