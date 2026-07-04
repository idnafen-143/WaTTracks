import React, { useState } from 'react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
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
  onCreateProject: (name: string, clientName?: string, rate?: number, currency?: string, auditorName?: string) => void;
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
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for creating
  const [newName, setNewName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newAuditorName, setNewAuditorName] = useState('');
  const [newRate, setNewRate] = useState(0.15);
  const [newCurrency, setNewCurrency] = useState('$');

  // Form states for editing
  const currentProject = projects.find(p => p.id === currentProjectId);
  const [editName, setEditName] = useState(currentProject?.name || '');
  const [editClientName, setEditClientName] = useState(currentProject?.clientName || '');
  const [editAuditorName, setEditAuditorName] = useState(currentProject?.auditorName || '');
  const [editRate, setEditRate] = useState(currentProject?.ratePerKWh || 0.15);
  const [editCurrency, setEditCurrency] = useState(currentProject?.currency || '$');

  const handleStartEdit = () => {
    if (!currentProject) return;
    setEditName(currentProject.name);
    setEditClientName(currentProject.clientName || '');
    setEditAuditorName(currentProject.auditorName || '');
    setEditRate(currentProject.ratePerKWh);
    setEditCurrency(currentProject.currency);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    if (!editAuditorName.trim()) return;
    onUpdateProject(currentProjectId, {
      name: editName,
      clientName: editClientName,
      auditorName: editAuditorName,
      ratePerKWh: Number(editRate),
      currency: editCurrency || '$'
    });
    setIsEditing(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (!newAuditorName.trim()) return;
    onCreateProject(newName, newClientName, newRate, newCurrency || '$', newAuditorName);
    setNewName('');
    setNewClientName('');
    setNewAuditorName('');
    setIsCreating(false);
  };

  return (
    <div id="project-selector-panel" className="bg-brand-panel border border-brand-border p-4 text-brand-text shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active Project display */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-brand-darktext bg-brand-dark px-2 py-0.5 uppercase font-bold">
              {t('activeAuditRegister')}
            </span>
            <span className="text-brand-text opacity-60 text-xs font-serif italic">{t('designedByText')}</span>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-brand-panel-light p-3 border border-brand-border">
              <div>
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">{t('auditDesignation')}</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                  placeholder={t('placeholderDesignation')}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">{t('auditorName')}</label>
                <input
                  type="text"
                  required
                  value={editAuditorName}
                  onChange={e => setEditAuditorName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                  placeholder={t('placeholderAuditor')}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">{t('clientPropertyId')}</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={e => setEditClientName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                  placeholder={t('placeholderClient')}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">{t('tariffKwh')}</label>
                  <input
                     type="number"
                    step="0.01"
                    value={editRate}
                    onChange={e => setEditRate(Number(e.target.value))}
                    className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">{t('currencyLabel')}</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={editCurrency}
                    onChange={e => setEditCurrency(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-none px-2 py-1 text-xs text-brand-text font-mono focus:outline-none"
                    placeholder="e.g. $, €, £"
                  />
                </div>
              </div>
              <div className="flex gap-2 items-end justify-end">
                <button
                  onClick={handleSaveEdit}
                  className="bg-brand-dark hover:bg-brand-text hover:text-brand-bg text-brand-darktext p-2 rounded-none transition-colors cursor-pointer border border-brand-border h-[26px] flex items-center justify-center"
                  title="Save changes"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-white hover:bg-brand-panel-light text-brand-text p-2 rounded-none transition-colors cursor-pointer border border-brand-border h-[26px] flex items-center justify-center"
                  title="Cancel"
                >
                  <X className="w-4 h-4 text-brand-text" />
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
                <p className="text-brand-text opacity-80 text-xs font-mono uppercase tracking-tight flex items-center gap-2 flex-wrap">
                  {currentProject?.clientName ? (
                    <>
                      <span>{t('clientLabel')}: {currentProject.clientName}</span>
                      <span className="text-brand-border opacity-30">|</span>
                    </>
                  ) : null}
                  <span>{t('auditorLabel')}: {currentProject?.auditorName || 'IDNAFEN'}</span>
                  <span className="text-brand-border opacity-30">|</span>
                  {t('rateLabel')}: <span className="font-bold text-brand-text">{currentProject?.currency}{currentProject?.ratePerKWh.toFixed(2)} / KWH</span>
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
                  {t('auditLabel')}: {p.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="bg-brand-dark hover:bg-[#2A2A2A] text-brand-darktext border border-brand-border px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer rounded-none"
          >
            <Plus className="w-3.5 h-3.5" /> {t('newAuditBtn')}
          </button>

          {projects.length > 1 && (
            <button
              onClick={() => {
                if (confirm(t('deleteConfirm', { name: currentProject?.name || '' }))) {
                  onDeleteProject(currentProjectId);
                }
              }}
              className="bg-white border border-brand-border hover:bg-red-100 hover:text-red-700 text-brand-text p-2 rounded-none transition-colors cursor-pointer"
              title={t('deleteAuditTitle')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {projects.length === 1 && currentProject?.devices.length === 0 && (
            <button
              onClick={onLoadDemo}
              className="bg-[#141414] text-white hover:bg-neutral-800 border border-brand-border px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> {t('loadSampleAuditBtn')}
            </button>
          )}
        </div>
      </div>

      {/* CREATE NEW PROJECT MODAL OVERLAY */}
      {isCreating && (
        <div className="fixed inset-0 bg-[#141414]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-brand-panel border-2 border-brand-border rounded-none p-5 w-full max-w-md shadow-none relative text-brand-text">
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 text-brand-text hover:bg-white/50 p-1 rounded-none border border-transparent hover:border-brand-border transition-all cursor-pointer"
            >
              <X className="w-4 h-4 text-brand-text" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet className="w-5 h-5 text-brand-text" />
              <h2 className="text-sm font-black uppercase tracking-wider text-brand-text">{t('registerNewAuditHeader')}</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">
                  {t('auditDesignation')}
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
                  {t('auditorName')}
                </label>
                <input
                  type="text"
                  required
                  value={newAuditorName}
                  onChange={e => setNewAuditorName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-none px-3 py-2 text-xs font-mono text-brand-text focus:outline-none"
                  placeholder="e.g., Idnafen"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-brand-text font-bold mb-1">
                  {t('clientOwnerOptional') || t('clientPropertyId')}
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
                    {t('electricityRate')}
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
                    {t('currencyIndex') || t('currencyLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={newCurrency}
                    onChange={e => setNewCurrency(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-none px-3 py-2 text-xs font-mono text-brand-text focus:outline-none"
                    placeholder="e.g., $, €, £, CHF"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-white hover:bg-brand-panel-light text-brand-text font-bold py-2 rounded-none transition-colors text-xs border border-brand-border cursor-pointer"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-dark hover:bg-neutral-800 text-brand-darktext font-bold py-2 rounded-none transition-colors text-xs border border-brand-border cursor-pointer"
                >
                  {t('initializeAuditBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
