import React, { useState, useEffect } from 'react';
import { Device, CategoryId } from '../types';
import { CATEGORIES, APPLIANCE_PRESETS } from '../data/categories';
import { 
  Sparkles, 
  Lightbulb, 
  Tv, 
  ThermometerSnowflake, 
  Laptop, 
  ChefHat, 
  WashingMachine, 
  Plug,
  Plus
} from 'lucide-react';

interface DeviceFormProps {
  onAddDevice: (device: Omit<Device, 'id'>) => void;
  currency: string;
}

// Map of category ID to Lucide icon
const CATEGORY_ICONS: Record<CategoryId, any> = {
  heating_cooling: ThermometerSnowflake,
  kitchen: ChefHat,
  lighting: Lightbulb,
  entertainment: Tv,
  office_tech: Laptop,
  laundry_utility: WashingMachine,
  other: Plug
};

export default function DeviceForm({ onAddDevice, currency }: DeviceFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('lighting');
  const [watts, setWatts] = useState<string>('');
  const [hoursPerDay, setHoursPerDay] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Filter presets based on the selected category
  const categoryPresets = APPLIANCE_PRESETS.filter(p => p.category === category);

  // Apply a preset
  const handleApplyPreset = (presetName: string, pWatts: number, pHours: number) => {
    setName(presetName);
    setWatts(pWatts.toString());
    setHoursPerDay(pHours.toString());
    setActivePreset(presetName);
  };

  // Reset active preset border if user manually overrides values
  useEffect(() => {
    if (activePreset) {
      const matched = categoryPresets.find(p => p.name === activePreset);
      if (matched) {
        if (watts !== matched.defaultWatts.toString() || hoursPerDay !== matched.defaultHours.toString() || name !== matched.name) {
          setActivePreset(null);
        }
      }
    }
  }, [name, watts, hoursPerDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wNum = Number(watts);
    const hNum = Number(hoursPerDay);
    
    if (!name.trim()) return;
    if (isNaN(wNum) || wNum <= 0) return;
    if (isNaN(hNum) || hNum < 0 || hNum > 24) return;
    if (quantity <= 0) return;

    onAddDevice({
      name: name.trim(),
      category,
      watts: wNum,
      hoursPerDay: hNum,
      quantity
    });

    // Reset Form
    setName('');
    setWatts('');
    setHoursPerDay('');
    setQuantity(1);
    setActivePreset(null);
  };

  return (
    <div id="device-input-form-container" className="bg-brand-panel border border-brand-border p-4 shadow-none text-brand-text grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-none">
      {/* LEFT COLUMN: Add Device Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-3">
        <div>
          <h2 className="text-sm font-black text-brand-text uppercase flex items-center gap-2 tracking-tight">
            <span className="p-1 bg-brand-dark text-brand-darktext">
              <Plus className="w-4 h-4" />
            </span>
            ADD APPLIANCE OR DEVICE
          </h2>
          <p className="text-brand-text opacity-70 text-xs font-serif italic mt-0.5">
            Input custom parameters or select a preset from the register on the right.
          </p>
        </div>

        {/* Category Icons Selector */}
        <div>
          <label className="block text-[10px] font-mono text-brand-text font-bold mb-1.5 uppercase tracking-wider">
            DEVICE CATEGORY REGISTRY
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
            {CATEGORIES.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.id];
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    setName('');
                    setWatts('');
                    setHoursPerDay('');
                    setActivePreset(null);
                  }}
                  className={`flex flex-col items-center justify-center p-1.5 border text-center transition-colors cursor-pointer rounded-none ${
                    isSelected
                      ? 'bg-brand-dark border-brand-border text-brand-darktext font-bold'
                      : 'bg-white border-brand-border text-brand-text hover:bg-brand-panel-light'
                  }`}
                  title={cat.label}
                >
                  <IconComponent className="w-3.5 h-3.5 mb-1" />
                  <span className="text-[8px] uppercase tracking-tighter truncate w-full px-0.5 leading-none">{cat.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-brand-text font-bold mb-1 uppercase tracking-wider">
              DEVICE NAME OR MAKE *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-none px-2 py-1.5 text-xs text-brand-text font-mono focus:outline-none"
              placeholder="e.g., TV, Refrigerator"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-brand-text font-bold mb-1 uppercase tracking-wider">
              QUANTITY *
            </label>
            <div className="flex items-center bg-white border border-brand-border rounded-none">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-2.5 py-1 text-brand-text hover:bg-brand-panel-light font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-transparent text-center py-1 text-xs text-brand-text font-bold font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="px-2.5 py-1 text-brand-text hover:bg-brand-panel-light font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-brand-text font-bold mb-1 uppercase tracking-wider">
              POWER (WATTS) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0.1"
                step="any"
                value={watts}
                onChange={e => setWatts(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-none pl-2 pr-6 py-1.5 text-xs text-brand-text font-mono focus:outline-none"
                placeholder="e.g., 150"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-brand-text opacity-50">
                W
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-brand-text font-bold mb-1 uppercase tracking-wider">
              DAILY HOURS *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                max="24"
                step="any"
                value={hoursPerDay}
                onChange={e => setHoursPerDay(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-none pl-2 pr-10 py-1.5 text-xs text-brand-text font-mono focus:outline-none"
                placeholder="0 - 24"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-brand-text opacity-50">
                HRS/DAY
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-dark hover:bg-neutral-800 text-brand-darktext border border-brand-border font-bold py-2 rounded-none transition-colors text-xs cursor-pointer uppercase tracking-wider"
        >
          Add Appliance to Audit
        </button>
      </form>

      {/* RIGHT COLUMN: Presets List */}
      <div className="lg:col-span-5 flex flex-col h-full justify-between bg-brand-panel-light border border-brand-border p-3 rounded-none">
        <div>
          <div className="flex items-center gap-1.5 text-brand-text mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <h3 className="text-[10px] font-mono uppercase tracking-wider font-bold">
              PRESETS: {CATEGORIES.find(c => c.id === category)?.label.toUpperCase()}
            </h3>
          </div>

          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
            {categoryPresets.map((preset) => {
              const isSelected = activePreset === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset.name, preset.defaultWatts, preset.defaultHours)}
                  className={`w-full text-left p-2 rounded-none border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-brand-dark border-brand-border text-brand-darktext'
                      : 'bg-white border-brand-border text-brand-text hover:bg-brand-panel-light'
                  }`}
                >
                  <div className="font-bold truncate pr-2 uppercase text-[10px]">
                    {preset.name}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-brand-text shrink-0 text-[9px]">
                    <span className="bg-brand-panel border border-brand-border px-1 py-0.5 text-brand-text font-bold">
                      {preset.defaultWatts}W
                    </span>
                    <span className="bg-brand-panel border border-brand-border px-1 py-0.5 text-brand-text font-bold">
                      {preset.defaultHours}H/D
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-brand-border text-[9px] text-brand-text font-mono uppercase leading-relaxed">
          <span className="font-bold block text-brand-dark">FORMULA:</span>
          WH/D = WATTS × HOURS × QTY. KWH = WH ÷ 1000.
        </div>
      </div>
    </div>
  );
}
