import React, { useState, useEffect, useMemo } from 'react';
import { Project, Device, AuditSummary } from './types';
import ProjectSelector from './components/ProjectSelector';
import DeviceForm from './components/DeviceForm';
import DeviceList from './components/DeviceList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TipsPanel from './components/TipsPanel';
import { 
  Zap, 
  BarChart3, 
  Sparkles, 
  Activity,
  CheckCircle,
  HelpCircle,
  BookmarkCheck,
  Smartphone,
  X
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'wattrack_projects_db';
const ACTIVE_ID_KEY = 'wattrack_active_id';

// High-fidelity sample audit to populate on request
const SAMPLE_AUDIT: Project = {
  id: 'suburban_villa_demo',
  name: 'Modern Suburban Villa',
  clientName: 'The Miller Household',
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);

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

  // --- Computed Stats for Active Project ---
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === currentProjectId) || null;
  }, [projects, currentProjectId]);

  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://heartfelt-frangollo-7d9b54.netlify.app')}`;
  }, []);

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
    triggerToast(`Switched active audit profile`, 'info');
  };

  const handleCreateProject = (name: string, clientName?: string, rate?: number, currency?: string) => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name,
      clientName: clientName || '',
      createdAt: new Date().toISOString(),
      devices: [],
      ratePerKWh: rate !== undefined ? rate : 0.15,
      currency: currency || '$'
    };
    setProjects(prev => [...prev, newProj]);
    setCurrentProjectId(newProj.id);
    triggerToast(`Created new audit "${name}"!`);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    triggerToast(`Audit configuration updated`);
  };

  const handleDeleteProject = (id: string) => {
    const remaining = projects.filter(p => p.id !== id);
    if (remaining.length > 0) {
      setProjects(remaining);
      setCurrentProjectId(remaining[0].id);
      triggerToast(`Audit profile deleted`, 'info');
    }
  };

  const handleLoadDemo = () => {
    // Check if the suburban_villa_demo already exists
    const exists = projects.some(p => p.id === 'suburban_villa_demo');
    if (exists) {
      setCurrentProjectId('suburban_villa_demo');
      triggerToast(`Sample Villa audit already loaded!`, 'info');
      return;
    }

    setProjects(prev => [SAMPLE_AUDIT, ...prev.filter(p => p.id !== 'default_audit' || p.devices.length > 0)]);
    setCurrentProjectId(SAMPLE_AUDIT.id);
    triggerToast(`Successfully loaded Suburban Villa template!`);
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
    triggerToast(`Added ${newDevice.name} to inventory!`);
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
      triggerToast(`Removed ${itemToDelete.name}`, 'info');
    }
  };

  return (
    <div id="wattrack-app-root" className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-brand-border bg-brand-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-dark flex items-center justify-center shrink-0">
              <div className="w-4 h-4 border-2 border-brand-bg rotate-45"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter text-brand-dark uppercase">
                WaTTrack
              </span>
              <div className="h-5 w-px bg-brand-dark opacity-20 hidden sm:block"></div>
              <span className="hidden sm:inline-block text-brand-text text-sm font-serif italic">
                Audit: <span className="font-sans font-bold not-italic">{activeProject?.name || 'Untitled_Project'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold">
            <div className="hidden md:flex items-center gap-2">
              <span className="opacity-40">DESIGNER:</span>
              <span>IDNAFEN</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="opacity-40">SESSION:</span>
              <span className="text-emerald-800 font-bold">ACTIVE</span>
            </div>
            
            <button
              onClick={() => setShowMobileModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-dark text-brand-darktext border border-brand-border hover:bg-brand-text hover:text-brand-bg transition-colors cursor-pointer text-[10px] font-black"
              title="Connect via mobile instantly"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>MOBILE ACCESS</span>
            </button>

            {activeProject && activeProject.devices.length === 0 && (
              <button
                onClick={handleLoadDemo}
                className="px-3 py-1 border border-brand-border hover:bg-brand-dark hover:text-brand-darktext transition-colors cursor-pointer text-[10px] font-bold"
              >
                Sample Audit
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
              <TipsPanel project={activeProject} />
            </div>

          </div>
        )}
      </main>

      {/* 3. Global Footer (High Density styling with metadata counters) */}
      <footer className="h-10 border-t border-brand-border px-6 flex items-center justify-between bg-brand-dark text-brand-darktext text-[9px] font-mono uppercase tracking-widest">
        <div className="truncate pr-4">
          SYSTEM STATE: SYNCHRONIZED <span className="opacity-30">|</span> DESIGNED BY IDNAFEN
        </div>
        <div className="flex gap-4 shrink-0">
          <span className="hidden md:inline">AUDITS: {projects.length}</span>
          <span>STORAGE: LOCALSTORAGE</span>
          <span>v1.0.4-STABLE</span>
        </div>
      </footer>

      {/* 4. Dynamic Interactive Toast Notification */}
      {toast && (
        <div className="fixed bottom-12 right-6 z-50 bg-brand-dark border-2 border-brand-border text-brand-darktext shadow-none px-4 py-3 flex items-center gap-3 rounded-none">
          <div className="w-2 h-2 bg-emerald-500 animate-ping"></div>
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase">
              NOTIF: {toast.message.toUpperCase()}
            </p>
          </div>
        </div>
      )}

      {/* 5. Mobile Sync Modal */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/75 backdrop-blur-sm">
          <div className="bg-brand-panel border-2 border-brand-border max-w-sm w-full p-5 relative shadow-none rounded-none text-brand-text">
            <button 
              onClick={() => setShowMobileModal(false)}
              className="absolute top-3 right-3 p-1 hover:bg-brand-dark hover:text-brand-darktext border border-transparent hover:border-brand-border transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-4">
              <div className="border-b border-brand-border pb-2">
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-brand-text flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  INSTANT MOBILE ACCESS
                </h3>
                <p className="text-[10px] text-brand-text opacity-70 font-serif italic mt-0.5">
                  Zero downloads, zero friction. Fluid and direct access.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-4 bg-white border border-brand-border">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Scan QR Code" 
                    className="w-40 h-40 border border-brand-border p-1"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-[9px] font-mono text-brand-text opacity-50 uppercase">
                    GENERATING...
                  </div>
                )}
                <div className="mt-2.5 text-[9px] font-mono font-bold tracking-wider text-brand-text text-center uppercase bg-brand-panel border border-brand-border px-2.5 py-0.5">
                  SCAN TO LAUNCH
                </div>
                <a 
                  href="https://heartfelt-frangollo-7d9b54.netlify.app" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-2 text-[10px] font-mono text-emerald-800 hover:underline font-bold text-center"
                >
                  heartfelt-frangollo-7d9b54.netlify.app
                </a>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex gap-1.5">
                  <div className="font-mono font-black text-brand-darktext shrink-0 bg-brand-dark w-4 h-4 flex items-center justify-center text-[9px]">1</div>
                  <p className="leading-snug">
                    Scan this QR code with your mobile camera to instantly load the production application.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <div className="font-mono font-black text-brand-darktext shrink-0 bg-brand-dark w-4 h-4 flex items-center justify-center text-[9px]">2</div>
                  <p className="leading-snug">
                    Your audits and modifications are persistent locally on your device via standard browser storage.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <div className="font-mono font-black text-brand-darktext shrink-0 bg-brand-dark w-4 h-4 flex items-center justify-center text-[9px]">3</div>
                  <p className="leading-snug">
                    <strong>Tip:</strong> Tap <span className="font-bold">Share &gt; Add to Home Screen</span> on your browser to install it as a native app!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowMobileModal(false)}
                  className="w-full py-1.5 bg-brand-dark text-brand-darktext font-mono font-bold text-[10px] uppercase hover:bg-brand-text hover:text-brand-bg transition-colors cursor-pointer border border-brand-border"
                >
                  CLOSE ACCESS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
