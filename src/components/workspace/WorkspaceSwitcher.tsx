import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check, Plus, Globe, Phone, X, PlusCircle } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface WorkspaceSwitcherProps {
  compact?: boolean;
  onOpenCreateDirectly?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ compact = false }) => {
  const { workspaces, currentWorkspace, setCurrentWorkspaceId, createWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsTimezone, setNewWsTimezone] = useState('Asia/Kolkata');
  const [newWsPhone, setNewWsPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) {
      setError('Clinic / Workspace name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createWorkspace(newWsName.trim(), newWsTimezone, newWsPhone.trim() || undefined);
      setShowCreateModal(false);
      setNewWsName('');
      setNewWsPhone('');
      setIsOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to create workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {compact ? (
        <div className="flex items-center gap-1">
          <button
            id="btn-open-workspace-dropdown-compact"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C2E4C] transition-colors cursor-pointer"
            title="Switch Active Clinic Tenant"
          >
            <Building2 className="w-3.5 h-3.5 text-[#C43D27] dark:text-[#E05A44]" />
            <span className="truncate max-w-[130px] font-bold">{currentWorkspace.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <button
            id="btn-create-workspace-header-compact"
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] text-[#C43D27] dark:text-[#E05A44] hover:bg-[#C43D27] hover:text-white dark:hover:bg-[#C43D27] dark:hover:text-white transition-colors cursor-pointer"
            title="Create New Clinic Tenant"
            aria-label="Create New Clinic Tenant"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Clinic Tenant
            </span>
            <button
              id="btn-create-workspace-sidebar-plus"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold text-[#C43D27] dark:text-[#E05A44] hover:bg-[#C43D27]/10 transition-colors cursor-pointer"
              title="Add New Clinic Tenant"
            >
              <Plus className="w-3 h-3" />
              <span>+ New Clinic</span>
            </button>
          </div>

          <button
            id="btn-open-workspace-dropdown"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] flex items-center justify-between hover:border-[#C43D27]/40 transition-all cursor-pointer text-left shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center shrink-0 font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentWorkspace.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate flex items-center gap-1">
                  <span>{currentWorkspace.timezone}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-[#101F3D] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1C2E4C] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-[#1C2E4C]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Clinic Tenants ({workspaces.length})
            </span>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setIsOpen(false);
              }}
              className="text-[11px] font-bold text-[#C43D27] dark:text-[#E05A44] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>+ Add New</span>
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto px-1.5 py-1 space-y-1">
            {workspaces.map((ws) => {
              const isSelected = ws.id === currentWorkspace.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspaceId(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] font-bold border border-[#F2C4BC] dark:border-[#243B53]'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C2E4C]'
                  }`}
                >
                  <div className="truncate text-left flex items-center gap-2">
                    <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C43D27]' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <div className="truncate font-semibold">{ws.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {ws.timezone} {ws.phone ? `• ${ws.phone}` : ''}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C43D27] dark:text-[#E05A44] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-[#1C2E4C] px-2">
            <button
              id="btn-create-new-workspace"
              onClick={() => {
                setShowCreateModal(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#C43D27] text-white hover:bg-[#B03420] transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create New Clinic Tenant</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2E4C] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Clinic Tenant</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add an isolated clinic or branch workspace</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172B52] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinic / Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Ortho & Dental Care"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinic Timezone
                </label>
                <select
                  value={newWsTimezone}
                  onChange={(e) => setNewWsTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - India)</option>
                  <option value="America/New_York">America/New_York (EST - US East)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST - US West)</option>
                  <option value="Europe/London">Europe/London (GMT/BST - UK)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST - UAE)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinic Contact Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newWsPhone}
                  onChange={(e) => setNewWsPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-new-workspace"
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating Clinic...' : 'Create Clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
