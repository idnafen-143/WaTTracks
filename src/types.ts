export type CategoryId = 
  | 'heating_cooling'
  | 'kitchen'
  | 'lighting'
  | 'entertainment'
  | 'office_tech'
  | 'laundry_utility'
  | 'other';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  icon: string; // Lucide icon name or emoji
  color: string; // Tailwind color class
  bgClass: string; // Tailwind bg class
  borderClass: string; // Tailwind border class
  typicalWatts: string;
  energyTips: string[];
}

export interface Device {
  id: string;
  name: string;
  category: CategoryId;
  watts: number;
  hoursPerDay: number;
  quantity: number;
}

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  auditorName?: string;
  createdAt: string;
  devices: Device[];
  ratePerKWh: number; // Cost in local currency per kWh (e.g. 0.15)
  currency: string; // e.g. "$", "€", "£"
  savedTipIds?: string[]; // IDs of personalized tips saved to Action Plan
  customTips?: string[];  // Custom user-authored tips
}

export interface AuditSummary {
  totalDailyKWh: number;
  totalMonthlyKWh: number;
  totalAnnualKWh: number;
  totalDailyCost: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  totalDevicesCount: number;
}
