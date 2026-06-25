import { CategoryId, CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'heating_cooling',
    label: 'Heating & Cooling',
    icon: 'ThermometerSnowflake',
    color: 'text-rose-500 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/30',
    borderClass: 'border-rose-100 dark:border-rose-900/40',
    typicalWatts: '1000W - 3500W',
    energyTips: [
      'Set thermostats to 68°F (20°C) in winter and 78°F (25°C) in summer to optimize performance.',
      'Use smart programmable thermostats to scale down heating/cooling when you are away.',
      'Clean or replace air filters monthly to improve air flow and efficiency by 5% to 15%.',
      'Seal air leaks around windows and doors to keep tempered air from escaping.'
    ]
  },
  {
    id: 'kitchen',
    label: 'Kitchen Appliances',
    icon: 'ChefHat',
    color: 'text-amber-500 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-100 dark:border-amber-900/40',
    typicalWatts: '150W - 2000W',
    energyTips: [
      'Keep refrigerator coils clean and vacuumed; set fridge temperature to 37-40°F and freezer to 0°F.',
      'A full refrigerator acts as an insulator, reducing temperature fluctuations.',
      'Prefer microwave or air-fryer over conventional ovens for small, quick meals.',
      'Ensure dishwasher is fully loaded before running, and select air-dry mode.'
    ]
  },
  {
    id: 'lighting',
    label: 'Lighting',
    icon: 'Lightbulb',
    color: 'text-yellow-500 dark:text-yellow-400',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderClass: 'border-yellow-100 dark:border-yellow-900/40',
    typicalWatts: '5W - 100W',
    energyTips: [
      'Immediately replace remaining incandescent bulbs (60W) with LED bulbs (6W-9W) to save up to 85% energy per socket.',
      'Install motion sensors or timers for outdoor and hallway lights so they stay off when not needed.',
      'Leverage natural day-lighting whenever possible and design task-focused lighting areas.'
    ]
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: 'Tv',
    color: 'text-indigo-500 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderClass: 'border-indigo-100 dark:border-indigo-900/40',
    typicalWatts: '15W - 400W',
    energyTips: [
      'Televisions, consoles, and soundbars draw "phantom power" (standby load) even when switched off. Use a smart power strip.',
      'Lower screen brightness settings on televisions to comfortable levels; this can cut power by 20%.',
      'Configure consoles to auto-shutdown after 20 minutes of inactivity.'
    ]
  },
  {
    id: 'office_tech',
    label: 'Office & Tech',
    icon: 'Laptop',
    color: 'text-cyan-500 dark:text-cyan-400',
    bgClass: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderClass: 'border-cyan-100 dark:border-cyan-900/40',
    typicalWatts: '10W - 500W',
    energyTips: [
      'Laptops consume up to 80% less energy than high-power desktop workstations.',
      'Turn off peripheral equipment like printers, extra monitors, and scanners when not in use.',
      'Activate sleep mode settings on computers to engage after 10-15 minutes.'
    ]
  },
  {
    id: 'laundry_utility',
    label: 'Laundry & Utility',
    icon: 'WashingMachine',
    color: 'text-emerald-500 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-100 dark:border-emerald-900/40',
    typicalWatts: '500W - 4000W',
    energyTips: [
      'Wash laundry in cold water. About 75-90% of a washing machine\'s energy goes toward heating water.',
      'Clean the dryer lint filter before every cycle to maintain optimal airflow and decrease drying times.',
      'Air-dry clothes on a rack or outdoor line whenever weather permits.',
      'Check water heater temperature; lowering it to 120°F (49°C) is safe, prevents scalding, and saves energy.'
    ]
  },
  {
    id: 'other',
    label: 'Other Devices',
    icon: 'Plug',
    color: 'text-slate-500 dark:text-slate-400',
    bgClass: 'bg-slate-50 dark:bg-slate-900/30',
    borderClass: 'border-slate-100 dark:border-slate-800/40',
    typicalWatts: '10W - 1500W',
    energyTips: [
      'Check older devices with a plug-in wattmeter (like a Kill-A-Watt) to discover high baseline consumers.',
      'Consider replacing outdated appliances (10+ years old) with ENERGY STAR certified alternatives.'
    ]
  }
];

export interface AppliancePreset {
  name: string;
  category: CategoryId;
  defaultWatts: number;
  defaultHours: number;
}

export const APPLIANCE_PRESETS: AppliancePreset[] = [
  // Heating / Cooling
  { name: 'Central Air Conditioner', category: 'heating_cooling', defaultWatts: 3500, defaultHours: 6 },
  { name: 'Window AC Unit', category: 'heating_cooling', defaultWatts: 1200, defaultHours: 5 },
  { name: 'Space Heater', category: 'heating_cooling', defaultWatts: 1500, defaultHours: 4 },
  { name: 'Ceiling Fan', category: 'heating_cooling', defaultWatts: 75, defaultHours: 10 },
  { name: 'Dehumidifier', category: 'heating_cooling', defaultWatts: 280, defaultHours: 8 },

  // Kitchen
  { name: 'Refrigerator & Freezer', category: 'kitchen', defaultWatts: 180, defaultHours: 24 },
  { name: 'Microwave Oven', category: 'kitchen', defaultWatts: 1200, defaultHours: 0.5 },
  { name: 'Dishwasher (Normal Cycle)', category: 'kitchen', defaultWatts: 1500, defaultHours: 1 },
  { name: 'Electric Oven', category: 'kitchen', defaultWatts: 2400, defaultHours: 1 },
  { name: 'Coffee Maker', category: 'kitchen', defaultWatts: 900, defaultHours: 0.5 },
  { name: 'Electric Kettle', category: 'kitchen', defaultWatts: 1500, defaultHours: 0.25 },

  // Lighting
  { name: 'LED Light Bulb', category: 'lighting', defaultWatts: 9, defaultHours: 5 },
  { name: 'Incandescent Bulb (Old)', category: 'lighting', defaultWatts: 60, defaultHours: 5 },
  { name: 'Halogen Floodlight', category: 'lighting', defaultWatts: 150, defaultHours: 3 },
  { name: 'Fluorescent Tube', category: 'lighting', defaultWatts: 40, defaultHours: 6 },

  // Entertainment
  { name: 'Smart LED TV', category: 'entertainment', defaultWatts: 120, defaultHours: 4 },
  { name: 'Gaming Console (PS5/Xbox)', category: 'entertainment', defaultWatts: 200, defaultHours: 3 },
  { name: 'Home Theater Receiver', category: 'entertainment', defaultWatts: 150, defaultHours: 3 },
  { name: 'Wi-Fi Router & Modem', category: 'entertainment', defaultWatts: 15, defaultHours: 24 },

  // Office
  { name: 'Desktop Workstation', category: 'office_tech', defaultWatts: 250, defaultHours: 6 },
  { name: 'Gaming Desktop PC', category: 'office_tech', defaultWatts: 450, defaultHours: 4 },
  { name: 'Office Laptop', category: 'office_tech', defaultWatts: 50, defaultHours: 8 },
  { name: 'Dual Office Monitors', category: 'office_tech', defaultWatts: 60, defaultHours: 8 },
  { name: 'Laser Printer (Standby/Active)', category: 'office_tech', defaultWatts: 120, defaultHours: 1 },

  // Laundry / Utility
  { name: 'Clothes Dryer (Electric)', category: 'laundry_utility', defaultWatts: 3000, defaultHours: 1 },
  { name: 'Washing Machine', category: 'laundry_utility', defaultWatts: 500, defaultHours: 1 },
  { name: 'Electric Water Heater', category: 'laundry_utility', defaultWatts: 4000, defaultHours: 3 },
  { name: 'Vacuum Cleaner', category: 'laundry_utility', defaultWatts: 1200, defaultHours: 0.5 },
  { name: 'Water Sump Pump', category: 'laundry_utility', defaultWatts: 800, defaultHours: 2 }
];
