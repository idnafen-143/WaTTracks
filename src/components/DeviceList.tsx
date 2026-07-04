import React from 'react';
import { Device, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { useLanguage } from '../context/LanguageContext';
import { 
  Trash2, 
  ThermometerSnowflake, 
  ChefHat, 
  Lightbulb, 
  Tv, 
  Laptop, 
  WashingMachine, 
  Plug,
  AlertTriangle,
  Minus,
  Plus
} from 'lucide-react';

interface DeviceListProps {
  devices: Device[];
  ratePerKWh: number;
  currency: string;
  onUpdateDevice: (id: string, updates: Partial<Device>) => void;
  onDeleteDevice: (id: string) => void;
}

const CATEGORY_ICONS: Record<CategoryId, any> = {
  heating_cooling: ThermometerSnowflake,
  kitchen: ChefHat,
  lighting: Lightbulb,
  entertainment: Tv,
  office_tech: Laptop,
  laundry_utility: WashingMachine,
  other: Plug
};

export default function DeviceList({
  devices,
  ratePerKWh,
  currency,
  onUpdateDevice,
  onDeleteDevice
}: DeviceListProps) {
  const { t } = useLanguage();

  if (devices.length === 0) {
    return (
      <div id="device-list-empty" className="bg-brand-panel border border-brand-border p-6 text-center text-brand-text rounded-none">
        <p className="text-xs font-mono font-black uppercase">{t('emptyListHeader')}</p>
        <p className="text-xs font-serif italic mt-1">{t('emptyListSub')}</p>
      </div>
    );
  }

  return (
    <div id="device-list-container" className="bg-brand-panel border border-brand-border rounded-none overflow-hidden shadow-none">
      <div className="px-4 py-3 bg-brand-header border-b border-brand-border flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-brand-text font-black">
          {t('auditedDeviceRegister', { count: devices.length })}
        </h3>
        <span className="text-[10px] text-brand-text font-mono opacity-60">
          {t('scrollEnabled')}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-tablehead border-b border-brand-border text-brand-text font-mono text-[10px] tracking-wider uppercase font-black">
              <th className="py-2.5 px-4 border-r border-brand-border">{t('colDesignation')}</th>
              <th className="py-2.5 px-3 border-r border-brand-border">{t('colCategory')}</th>
              <th className="py-2.5 px-3 text-right border-r border-brand-border">{t('colPower')}</th>
              <th className="py-2.5 px-3 text-center border-r border-brand-border">{t('colDailyHrs')}</th>
              <th className="py-2.5 px-3 text-center border-r border-brand-border">{t('colQty')}</th>
              <th className="py-2.5 px-3 text-right border-r border-brand-border">{t('colDailyKwh')}</th>
              <th className="py-2.5 px-3 text-right border-r border-brand-border">{t('colAnnualCost')}</th>
              <th className="py-2.5 px-4 text-center">{t('colAction')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border bg-white">
            {devices.map((device) => {
              const cat = CATEGORIES.find(c => c.id === device.category);
              const Icon = CATEGORY_ICONS[device.category] || Plug;
              
              // Energy math
              const dailyKWh = (device.watts * device.hoursPerDay * device.quantity) / 1000;
              const annualCost = dailyKWh * 365 * ratePerKWh;
              
              // Energy hog warning
              const isHog = (device.watts >= 1500 && device.hoursPerDay >= 2) || (device.category === 'lighting' && device.watts >= 40);

              return (
                <tr key={device.id} className="hover:bg-brand-panel-light transition-colors group">
                  <td className="py-2 px-4 font-mono text-brand-text max-w-[200px] border-r border-brand-border">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold uppercase truncate" title={device.name}>{device.name}</span>
                      {isHog && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-red-700 font-bold bg-red-100 border border-red-700 px-1 py-0.5 rounded-none w-max">
                          <AlertTriangle className="w-3 h-3 text-red-700" /> {t('consumptionHog')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-brand-text border-r border-brand-border">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] font-mono uppercase border border-brand-border bg-brand-panel text-brand-text">
                      <Icon className="w-3 h-3" />
                      {cat ? t(cat.id).toUpperCase() : device.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-brand-text border-r border-brand-border">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min="1"
                        value={device.watts}
                        onChange={e => onUpdateDevice(device.id, { watts: Math.max(1, Number(e.target.value) || 0) })}
                        className="w-16 bg-brand-panel-light border border-brand-border rounded-none px-1 py-0.5 text-right text-xs focus:outline-none font-mono text-brand-text"
                      />
                      <span className="text-brand-text opacity-50 text-[9px]">W</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center border-r border-brand-border">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onUpdateDevice(device.id, { hoursPerDay: Math.max(0, Number((device.hoursPerDay - 0.5).toFixed(1))) })}
                        className="p-0.5 bg-brand-panel border border-brand-border hover:bg-brand-border hover:text-white rounded-none text-brand-text transition-colors cursor-pointer"
                        title="Decrease hours by 0.5"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.1"
                        value={device.hoursPerDay}
                        onChange={e => onUpdateDevice(device.id, { hoursPerDay: Math.min(24, Math.max(0, Number(e.target.value) || 0)) })}
                        className="w-10 bg-brand-panel-light border border-brand-border rounded-none py-0.5 text-center text-xs focus:outline-none font-mono text-brand-text"
                      />
                      <button
                        onClick={() => onUpdateDevice(device.id, { hoursPerDay: Math.min(24, Number((device.hoursPerDay + 0.5).toFixed(1))) })}
                        className="p-0.5 bg-brand-panel border border-brand-border hover:bg-brand-border hover:text-white rounded-none text-brand-text transition-colors cursor-pointer"
                        title="Increase hours by 0.5"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center border-r border-brand-border">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onUpdateDevice(device.id, { quantity: Math.max(1, device.quantity - 1) })}
                        className="p-0.5 bg-brand-panel border border-brand-border hover:bg-brand-border hover:text-white rounded-none text-brand-text transition-colors cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono text-brand-text font-bold w-5 text-center text-xs">{device.quantity}</span>
                      <button
                        onClick={() => onUpdateDevice(device.id, { quantity: device.quantity + 1 })}
                        className="p-0.5 bg-brand-panel border border-brand-border hover:bg-brand-border hover:text-white rounded-none text-brand-text transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-brand-text border-r border-brand-border">
                    {dailyKWh.toFixed(2)} <span className="text-[9px] text-brand-text opacity-50 font-normal">KWH</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-black text-brand-text border-r border-brand-border bg-brand-panel-light">
                    {currency}{annualCost.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => onDeleteDevice(device.id)}
                      className="text-brand-text opacity-60 hover:opacity-100 hover:text-red-700 p-1 border border-transparent hover:border-brand-border transition-all cursor-pointer"
                      title={`Remove ${device.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
