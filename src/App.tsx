import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Project, Device, AuditSummary } from './types';
import ProjectSelector from './components/ProjectSelector';
import DeviceForm from './components/DeviceForm';
import DeviceList from './components/DeviceList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TipsPanel from './components/TipsPanel';
import { useLanguage } from './context/LanguageContext';
import { 
  Zap, 
  BarChart3, 
  Sparkles, 
  Activity,
  CheckCircle,
  HelpCircle,
  BookmarkCheck,
  X,
  Upload,
  Download
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'wattrack_projects_db';
const ACTIVE_ID_KEY = 'wattrack_active_id';

// High-fidelity sample audit to populate on request
const SAMPLE_AUDIT: Project = {
  id: 'suburban_villa_demo',
  name: 'Modern Suburban Villa',
  clientName: 'The Miller Household',
  auditorName: 'IDNAFEN',
  createdAt: new Date().toISOString(),
  ratePerKWh: 0.16,
  currency: '$',
  devices: [
    { id: '1', name: 'Central Air Conditioner', category: 'heating_cooling', watts: 3200, hoursPerDay: 6, quantity: 1 },
    { id: '2', name: 'Kitchen Refrigerator & Freezer', category: 'kitchen', watts: 150, hoursPerDay: 24, quantity: 1 },
    { id: '3', name: 'Old Incandescent Hallway Bulbs', category: 'lighting', watts: 60, hoursPerDay: 5, quantity: 8 },
    { id: '4', name: 'Modern LED Kitchen Recessed Lights', category: 'lighting', watts: 9, hoursPerDay: 6, quantity: 12 },
    { id: '5', name: 'Living Room Smart TV', category: 'entertainment', watts: 120, hoursPerDay: 5, quantity: 1 },
    { id: '6', name: 'High-Power Gaming Desktop PC', category: 'office_tech', watts: 450, hoursPerDay: 4, quantity: 1 },
    { id: '7', name: 'Electric Clothes Dryer', category: 'laundry_utility', watts: 3000, hoursPerDay: 1, quantity: 1 },
    { id: '8', name: 'High-Efficiency Washing Machine', category: 'laundry_utility', watts: 450, hoursPerDay: 1, quantity: 1 },
    { id: '9', name: 'Family Room Space Heater (Winter)', category: 'heating_cooling', watts: 1500, hoursPerDay: 3, quantity: 1 },
    { id: '10', name: 'Microwave Oven (Quick Meals)', category: 'kitchen', watts: 1200, hoursPerDay: 0.5, quantity: 1 }
  ]
};

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initial Mount: Load from localStorage or seed first project ---
  useEffect(() => {
    const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedActiveId = localStorage.getItem(ACTIVE_ID_KEY);

    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects) as Project[];
        if (parsed.length > 0) {
          setProjects(parsed);
          const hasActive = parsed.some(p => p.id === savedActiveId);
          setCurrentProjectId(hasActive ? savedActiveId! : parsed[0].id);
          return;
        }
      } catch (err) {
        console.error('Failed to parse localStorage projects', err);
      }
    }

    // Default project seed if nothing exists
    const defaultProject: Project = {
      id: 'default_audit',
      name: 'Primary Residence',
      clientName: '',
      auditorName: 'IDNAFEN',
      createdAt: new Date().toISOString(),
      devices: [],
      ratePerKWh: 0.15,
      currency: '$'
    };
    setProjects([defaultProject]);
    setCurrentProjectId(defaultProject.id);
  }, []);

  // --- Sync State to LocalStorage ---
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem(ACTIVE_ID_KEY, currentProjectId);
    }
  }, [currentProjectId]);

  // --- Toast Manager ---
  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Export and Import JSON Functions ---
  const handleExportJSON = () => {
    if (projects.length === 0) {
      triggerToast(t('toastNoAuditsExport'), 'info');
      return;
    }
    try {
      const dataStr = JSON.stringify(projects, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wattrack_audits_export_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      triggerToast(t('toastExportSuccess'), 'success');
    } catch (err) {
      console.error(err);
      triggerToast(t('toastExportFail'), 'info');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') {
          triggerToast(t('toastReadFail'), 'info');
          return;
        }

        const parsed = JSON.parse(text);
        let rawProjects: any[] = [];

        if (Array.isArray(parsed)) {
          rawProjects = parsed;
        } else if (parsed && typeof parsed === 'object') {
          rawProjects = [parsed];
        } else {
          triggerToast(t('toastInvalidFile'), 'info');
          return;
        }

        // Convert and sanitize each object into a proper Project object
        const sanitizedProjects: Project[] = [];
        rawProjects.forEach((item, index) => {
          if (item && typeof item === 'object') {
            const name = item.name || item.projectName || `Imported Audit ${index + 1}`;
            // If the item doesn't have an ID, we generate a fresh one
            const id = item.id || `proj_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`;
            const devices = Array.isArray(item.devices) 
              ? item.devices.map((d: any, dIdx: number) => ({
                  id: d.id || `dev_${Date.now()}_${dIdx}_${Math.floor(Math.random() * 1000)}`,
                  name: d.name || 'Unnamed Device',
                  category: d.category || 'other',
                  watts: typeof d.watts === 'number' ? d.watts : 100,
                  hoursPerDay: typeof d.hoursPerDay === 'number' ? d.hoursPerDay : 1,
                  quantity: typeof d.quantity === 'number' ? d.quantity : 1,
                }))
              : [];
            
            const clientName = item.clientName || '';
            const auditorName = item.auditorName || 'IDNAFEN';
            const ratePerKWh = typeof item.ratePerKWh === 'number' ? item.ratePerKWh : 0.15;
            const currency = item.currency || '$';
            const savedTipIds = Array.isArray(item.savedTipIds) ? item.savedTipIds : [];
            const customTips = Array.isArray(item.customTips) ? item.customTips : [];
            const createdAt = item.createdAt || new Date().toISOString();

            sanitizedProjects.push({
              id,
              name,
              clientName,
              auditorName,
              createdAt,
              devices,
              ratePerKWh,
              currency,
              savedTipIds,
              customTips
            });
          }
        });

        if (sanitizedProjects.length === 0) {
          triggerToast(t('toastNoValidAudits'), 'info');
          return;
        }

        setProjects(prev => {
          const merged = [...prev];
          sanitizedProjects.forEach(ip => {
            const existingIndex = merged.findIndex(p => p.id === ip.id);
            if (existingIndex >= 0) {
              merged[existingIndex] = ip; // Overwrite existing if matching ID
            } else {
              merged.push(ip); // Append as new
            }
          });

          // Set the first imported project as active
          setCurrentProjectId(sanitizedProjects[0].id);
          return merged;
        });

        triggerToast(t('toastImportSuccess', { count: sanitizedProjects.length }), 'success');
      } catch (err) {
        console.error(err);
        triggerToast(t('toastParseFail') + ': ' + (err instanceof Error ? err.message : 'Unknown error'), 'info');
      }
    };
    reader.onerror = () => {
      triggerToast(t('toastReadFail'), 'info');
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input element
  };

  // --- Computed Stats for Active Project ---
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === currentProjectId) || null;
  }, [projects, currentProjectId]);

  const summaryStats = useMemo((): AuditSummary => {
    if (!activeProject) {
      return {
        totalDailyKWh: 0,
        totalMonthlyKWh: 0,
        totalAnnualKWh: 0,
        totalDailyCost: 0,
        totalMonthlyCost: 0,
        totalAnnualCost: 0,
        totalDevicesCount: 0
      };
    }

    const totalDailyKWh = activeProject.devices.reduce((sum, d) => {
      const kwh = (d.watts * d.hoursPerDay * d.quantity) / 1000;
      return sum + kwh;
    }, 0);

    const totalDevicesCount = activeProject.devices.reduce((sum, d) => sum + d.quantity, 0);
    const rate = activeProject.ratePerKWh;

    const totalDailyCost = totalDailyKWh * rate;
    const totalMonthlyKWh = totalDailyKWh * 30.42; // average days in month
    const totalMonthlyCost = totalDailyCost * 30.42;
    const totalAnnualKWh = totalDailyKWh * 365;
    const totalAnnualCost = totalDailyCost * 365;

    return {
      totalDailyKWh,
      totalMonthlyKWh,
      totalAnnualKWh,
      totalDailyCost,
      totalMonthlyCost,
      totalAnnualCost,
      totalDevicesCount
    };
  }, [activeProject]);

  // --- Handlers ---
  const handleSelectProject = (id: string) => {
    setCurrentProjectId(id);
    triggerToast(t('toastSwitchProfile'), 'info');
  };

  const handleCreateProject = (name: string, clientName?: string, rate?: number, currency?: string, auditorName?: string) => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name,
      clientName: clientName || '',
      auditorName: auditorName || '',
      createdAt: new Date().toISOString(),
      devices: [],
      ratePerKWh: rate !== undefined ? rate : 0.15,
      currency: currency || '$'
    };
    setProjects(prev => [...prev, newProj]);
    setCurrentProjectId(newProj.id);
    triggerToast(t('toastCreateSuccess', { name }));
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    triggerToast(t('toastUpdateSuccess'));
  };

  const handleDeleteProject = (id: string) => {
    const remaining = projects.filter(p => p.id !== id);
    if (remaining.length > 0) {
      setProjects(remaining);
      setCurrentProjectId(remaining[0].id);
      triggerToast(t('toastDeleteSuccess'), 'info');
    }
  };

  const handleLoadDemo = () => {
    // Check if the suburban_villa_demo already exists
    const exists = projects.some(p => p.id === 'suburban_villa_demo');
    if (exists) {
      setCurrentProjectId('suburban_villa_demo');
      triggerToast(t('toastDemoAlreadyLoaded'), 'info');
      return;
    }

    setProjects(prev => [SAMPLE_AUDIT, ...prev.filter(p => p.id !== 'default_audit' || p.devices.length > 0)]);
    setCurrentProjectId(SAMPLE_AUDIT.id);
    triggerToast(t('toastDemoLoaded'));
  };

  const handleAddDevice = (newDevice: Omit<Device, 'id'>) => {
    if (!activeProject) return;
    const deviceWithId: Device = {
      ...newDevice,
      id: `dev_${Date.now()}`
    };
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          devices: [...p.devices, deviceWithId]
        };
      }
      return p;
    }));
    triggerToast(t('toastAddDevice', { name: newDevice.name }));
  };

  const handleUpdateDevice = (deviceId: string, updates: Partial<Device>) => {
    if (!activeProject) return;
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          devices: p.devices.map(d => d.id === deviceId ? { ...d, ...updates } : d)
        };
      }
      return p;
    }));
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (!activeProject) return;
    const itemToDelete = activeProject.devices.find(d => d.id === deviceId);
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          devices: p.devices.filter(d => d.id !== deviceId)
        };
      }
      return p;
    }));
    if (itemToDelete) {
      triggerToast(t('toastRemoveDevice', { name: itemToDelete.name }), 'info');
    }
  };

  return (
    <div id="wattrack-app-root" className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-brand-border bg-brand-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-dark border border-brand-border flex flex-col items-center justify-center shrink-0 relative overflow-hidden font-mono select-none">
              {/* Engineering grid style lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:4px_4px] opacity-40"></div>
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-2 h-[1px] bg-emerald-400"></div>
              <div className="absolute top-0 left-0 w-[1px] h-2 bg-emerald-400"></div>
              {/* WT Text */}
              <span className="font-black text-xs tracking-wider text-emerald-400 z-10 leading-none">W</span>
              <span className="font-black text-[9px] tracking-wider text-brand-darktext z-10 leading-none -mt-0.5">T</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter text-brand-dark uppercase">
                WaTTrack
              </span>
              <div className="h-5 w-px bg-brand-dark opacity-20 hidden sm:block"></div>
              <span className="hidden sm:inline-block text-brand-text text-sm font-serif italic">
                {t('auditLabel')}: <span className="font-sans font-bold not-italic">{activeProject?.name || 'Untitled_Project'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold">
            <div className="hidden md:flex items-center gap-2">
              <span className="opacity-40">{t('designer')}:</span>
              <span>IDNAFEN</span>
            </div>

            {/* Language Selection Button */}
            <button
              id="language-toggle-btn"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-dark text-brand-darktext border border-brand-border hover:bg-brand-text hover:text-brand-bg transition-colors cursor-pointer text-[10px] font-black"
              title="Switch language / Changer de langue"
            >
              <span className="font-mono">{language === 'en' ? 'FR' : 'EN'}</span>
            </button>

            {/* Export JSON Button */}
            <button
              id="export-json-btn"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-dark text-brand-darktext border border-brand-border hover:bg-brand-text hover:text-brand-bg transition-colors cursor-pointer text-[10px] font-black"
              title="Export all audits to a JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('exportJson')}</span>
              <span className="inline sm:hidden">{t('exportBrief')}</span>
            </button>

            {/* Import JSON Button */}
            <button
              id="import-json-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-dark text-brand-darktext border border-brand-border hover:bg-brand-text hover:text-brand-bg transition-colors cursor-pointer text-[10px] font-black"
              title="Import audits from a JSON file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('importJson')}</span>
              <span className="inline sm:hidden">{t('importBrief')}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />

            {activeProject && activeProject.devices.length === 0 && (
              <button
                onClick={handleLoadDemo}
                className="px-3 py-1.5 border border-brand-border hover:bg-brand-dark hover:text-brand-darktext transition-colors cursor-pointer text-[10px] font-bold"
              >
                {t('sampleAuditBtn')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Primary Layout Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Project Audit Profile Manager Card */}
        <ProjectSelector
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onLoadDemo={handleLoadDemo}
        />

        {activeProject && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT HAND GRID COLUMN: Device Creation & Inventory Management */}
            <div className="lg:col-span-7 space-y-6">
              {/* Device Input Form Component */}
              <DeviceForm 
                onAddDevice={handleAddDevice} 
                currency={activeProject.currency} 
              />

              {/* Device Inventory List Table Component */}
              <DeviceList
                devices={activeProject.devices}
                ratePerKWh={activeProject.ratePerKWh}
                currency={activeProject.currency}
                onUpdateDevice={handleUpdateDevice}
                onDeleteDevice={handleDeleteDevice}
              />
            </div>

            {/* RIGHT HAND GRID COLUMN: Analytics, Custom Visualizations, and Smart Tips */}
            <div className="lg:col-span-5 space-y-6">
              {/* Analytics Dashboard Visualizer Component */}
              <AnalyticsDashboard 
                project={activeProject} 
                summary={summaryStats} 
              />

              {/* Dynamic Energy Tips Panel Component */}
              <TipsPanel 
                project={activeProject} 
                onUpdateProject={handleUpdateProject} 
              />
            </div>

          </div>
        )}
      </main>

      {/* 3. Global Footer (High Density styling with metadata counters) */}
      <footer className="h-10 border-t border-brand-border px-6 flex items-center justify-between bg-brand-dark text-brand-darktext text-[9px] font-mono uppercase tracking-widest">
        <div className="truncate pr-4">
          {t('designedBy')}
        </div>
        <div className="flex gap-4 shrink-0">
          <span className="hidden md:inline">{t('auditsCount')}: {projects.length}</span>
          <span>{t('stableVersion')}</span>
        </div>
      </footer>

      {/* 4. Dynamic Interactive Toast Notification */}
      {toast && (
        <div className="fixed bottom-12 right-6 z-50 bg-brand-dark border-2 border-brand-border text-brand-darktext shadow-none px-4 py-3 flex items-center gap-3 rounded-none">
          <div className="w-2 h-2 bg-emerald-500 animate-ping"></div>
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase">
              {t('notificationLabel')}: {toast.message.toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
