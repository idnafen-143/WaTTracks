import React, { useState } from 'react';
import { Project } from '../types';
import { 
  Home, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Settings, 
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface ProjectSelectorProps {
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, clientName?: string, rate?: number, currency?: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onLoadDemo: () => void;
}

export default function ProjectSelector({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onLoadDemo
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for creating
  const [newName, setNewName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newRate, setNewRate] = useState(0.15);
  const [newCurrency, setNewCurrency] = useState('$');

  // Form states for editing
  const currentProject = projects.find(p => p.id === currentProjectId);
  const [editName, setEditName] = useState(currentProject?.name || '');
  const [editClientName, setEditClientName] = useState(currentProject?.clientName || '');
  const [editRate, setEditRate] = useState(currentProject?.ratePerKWh || 0.15);
  const [editCurrency, setEditCurrency] = useState(currentProject?.currency || '$');

  const handleStartEdit = () => {
    if (!currentProject) return;
    setEditName(currentProject.name);
    setEditClientName(currentProject.clientName || '');
    setEditRate(currentProject.ratePerKWh);
    setEditCurrency(currentProject.currency);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    onUpdateProject(currentProjectId, {
      name: editName,
      clientName: editClientName,
      ratePerKWh: Number(editRate),
      currency: editCurrency
    });
    setIsEditing(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProject(newName, newClientName, newRate, newCurrency);
    setNewName('');
    setNewClientName('');
    setIsCreating(false);
  };

  return (
    <div id="project-selector-panel" className="bg-brand-panel border border-brand-border p-4 text-brand-text shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active Project display */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-brand-darktext bg-brand-dark px-2 py-0.5 uppercase font-bold">
              ACTIVE AUDIT REGISTER
            </span>
            <span className="text-brand-text opacity-60 text-xs font-serif italic">Designed by Idnafen</span>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-brand-panel-light p-3 border border-brand-border">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">AUDIT DESIGNATION</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                  placeholder="e.g., Beach House, main residence"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">CLIENT / PROPERTY ID</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={e => setEditClientName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                  placeholder="e.g., Smith Residence"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="w-20">
                  <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">TARIFF (kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editRate}
                    onChange={e => setEditRate(Number(e.target.value))}
                    className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                  />
                </div>
                <div className="w-16">
                  <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">CURR</label>
                  <select
                    value={editCurrency}
                    onChange={e => setEditCurrency(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                  >
                    <option value="$">$</option>
                    <option value="€">€</option>
                    <option value="£">£</option>
                    <option value="¥">¥</option>
                    <option value="₪">₪</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveEdit}
                  className="bg-brand-dark hover:bg-brand-text hover:text-brand-bg text-brand-darktext p-2 rounded-none transition-colors cursor-pointer border border-brand-border"
                  title="Save changes"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-white hover:bg-brand-panel-light text-brand-text p-2 rounded-none transition-colors cursor-pointer border border-brand-border"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-brand-border text-brand-text shrink-0">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-brand-text flex items-center gap-2">
                  {currentProject?.name}
                  <button
                    onClick={handleStartEdit}
                    className="text-brand-text opacity-60 hover:opacity-100 p-0.5 transition-opacity cursor-pointer"
                    title="Edit project setup"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </h1>
                <p className="text-brand-text opacity-80 text-xs font-mono uppercase tracking-tight">
                  {currentProject?.clientName ? `CLIENT: ${currentProject.clientName}` : 'AUDIT TYPE: SELF-AUDIT'}
                  <span className="mx-2 text-brand-border opacity-30">|</span>
                  RATE: <span className="font-bold text-brand-text">{currentProject?.currency}{currentProject?.ratePerKWh.toFixed(2)} / KWH</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Project controls & list */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={currentProjectId}
              onChange={e => onSelectProject(e.target.value)}
              className="bg-white border border-brand-border rounded-none px-3 py-2 text-xs font-mono text-brand-text focus:outline-none cursor-pointer pr-8"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  AUDIT: {p.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="bg-brand-dark hover:bg-[#2A2A2A] text-brand-darktext border border-brand-border px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer rounded-none"
          >
            <Plus className="w-3.5 h-3.5" /> NEW AUDIT
          </button>

          {projects.length > 1 && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete the audit "${currentProject?.name}"?`)) {
                  onDeleteProject(currentProjectId);
                }
              }}
              className="bg-white border border-brand-border hover:bg-red-100 hover:text-red-700 text-brand-text p-2 rounded-none transition-colors cursor-pointer"
              title="Delete active audit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {projects.length === 1 && currentProject?.devices.length === 0 && (
            <button
              onClick={onLoadDemo}
              className="bg-[#141414] text-white hover:bg-neutral-800 border border-brand-border px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> LOAD SAMPLE AUDIT
            </button>
          )}
        </div>
      </div>

      {/* CREATE NEW PROJECT MODAL OVERLAY */}
      {isCreating && (
        <div className="fixed inset-0 bg-[#141414]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-panel border-2 border-brand-border rounded-none p-5 w-full max-w-md shadow-none relative">
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 text-brand-text hover:bg-white/50 p-1 rounded-none border border-transparent hover:border-brand-border transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-wider text-brand-text">REGISTER NEW HOME ENERGY AUDIT</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">
                  AUDIT DESIGNATION *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-none px-3 py-2 text-xs font-mono text-brand-text focus:outline-none"
                  placeholder="Beach House, Client Unit #2B..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">
                  CLIENT / PROPERTY OWNER (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-none px-3 py-2 text-xs font-mono text-brand-text focus:outline-none"
                  placeholder="e.g., Anderson Family"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">
                    ELECTRICITY RATE
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newRate}
                    onChange={e => setNewRate(Number(e.target.value))}
                    className="w-full bg-white border border-brand-border rounded-none px-3 py-2 text-xs font-mono text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">
                    CURRENCY INDEX
                  </label>
                  <select
                    value={newCurrency}
                    onChange={e => setNewCurrency(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-none px-3 py-2 text-xs font-mono text-brand-text focus:outline-none"
                  >
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="¥">JPY (¥)</option>
                    <option value="₪">ILS (₪)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-white hover:bg-brand-panel-light text-brand-text font-bold py-2 rounded-none transition-colors text-xs border border-brand-border cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-dark hover:bg-neutral-800 text-brand-darktext font-bold py-2 rounded-none transition-colors text-xs border border-brand-border cursor-pointer"
                >
                  INITIALIZE AUDIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
