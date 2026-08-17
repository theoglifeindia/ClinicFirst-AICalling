import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Plus,
  Phone,
  Power,
  Edit2,
  Trash2,
  Mic,
  Languages,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Play,
  FileText,
  Search,
} from 'lucide-react';
import { AIAgent } from '../types/database';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  getAgents,
  createAgent,
  updateAgent,
  toggleAgentStatus,
  deleteAgent,
} from '../services/agentService';

const AVAILABLE_VOICES = [
  { id: 'Zephyr', name: 'Zephyr (Warm & Professional - Female/Neutral)' },
  { id: 'Aoede', name: 'Aoede (Reassuring & Smooth - Female)' },
  { id: 'Puck', name: 'Puck (Clear & Friendly - Male)' },
  { id: 'Fenrir', name: 'Fenrir (Deep & Resonant - Male)' },
  { id: 'Charon', name: 'Charon (Calm & Clinical - Male)' },
  { id: 'Kore', name: 'Kore (Gentle & Caring - Female)' },
];

const AVAILABLE_LANGUAGES = [
  'English (India)',
  'English (US)',
  'Hindi',
  'Hinglish (Hindi + English)',
  'Spanish',
  'French',
  'Arabic',
];

interface AgentsPageProps {
  onStartCallWithAgent: (agentId: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ onStartCallWithAgent }) => {
  const { currentWorkspace, currentWorkspaceId } = useWorkspace();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<AIAgent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<AIAgent | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    greeting_message: '',
    voice: 'Zephyr',
    language: 'English (India)',
    active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const loadAgentsList = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getAgents(currentWorkspaceId);
      setAgents(list);
    } catch (err) {
      console.error('Failed to load agents', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    loadAgentsList();
  }, [loadAgentsList]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      system_prompt:
        'You are CLINICFIRST AI Assistant. You handle appointment booking, scheduling, and patient inquiries with clinical precision and polite empathy.',
      greeting_message:
        'Hello! This is CLINICFIRST AI voice assistant. How can I assist you with your appointment today?',
      voice: 'Zephyr',
      language: 'English (India)',
      active: true,
    });
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (agent: AIAgent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description || '',
      system_prompt: agent.system_prompt,
      greeting_message: agent.greeting_message,
      voice: agent.voice,
      language: agent.language,
      active: agent.active,
    });
    setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Agent Name is required.');
      return;
    }
    if (!formData.system_prompt.trim()) {
      setFormError('System Prompt Instructions are required.');
      return;
    }
    if (!formData.greeting_message.trim()) {
      setFormError('Greeting Message is required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      if (editingAgent) {
        await updateAgent(
          editingAgent.id,
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            system_prompt: formData.system_prompt.trim(),
            greeting_message: formData.greeting_message.trim(),
            voice: formData.voice,
            language: formData.language,
            active: formData.active,
          },
          currentWorkspaceId
        );
        setEditingAgent(null);
      } else {
        await createAgent({
          workspace_id: currentWorkspaceId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          system_prompt: formData.system_prompt.trim(),
          greeting_message: formData.greeting_message.trim(),
          voice: formData.voice,
          language: formData.language,
          active: formData.active,
        });
        setShowCreateModal(false);
      }

      await loadAgentsList();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save agent.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (agent: AIAgent) => {
    try {
      await toggleAgentStatus(agent.id, currentWorkspaceId);
      await loadAgentsList();
    } catch (err) {
      console.error('Failed to toggle agent status', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAgent) return;
    try {
      await deleteAgent(deletingAgent.id, currentWorkspaceId);
      setDeletingAgent(null);
      await loadAgentsList();
    } catch (err) {
      console.error('Failed to delete agent', err);
    }
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-[#FAF8F3] text-[#C43D27] border border-[#F2C4BC] dark:bg-[#C43D27]/20 dark:text-[#F2C4BC] dark:border-[#C43D27]/40">
              WORKSPACE: {currentWorkspace.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {agents.length} Agent{agents.length !== 1 ? 's' : ''} Configured
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            AI Calling Agents
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Configure conversational voice bots, system prompts, voices, languages, and custom greetings for automated patient calls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="create-new-agent-btn"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create AI Agent</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agents by name, language, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
          />
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">
          <div className="w-7 h-7 border-2 border-[#C43D27] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading workspace agents...
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-12 text-center border border-slate-200 dark:border-[#1C2E4C] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center mx-auto">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No AI Agents in this workspace</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Create your first AI voice calling agent to automate appointment reminders, clinical follow-ups, and receptionist triage.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C43D27] text-white rounded-xl text-xs font-bold hover:bg-[#B03420] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Agent</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => {
            return (
              <div
                key={agent.id}
                id={`agent-card-${agent.id}`}
                className={`bg-white dark:bg-[#101F3D] rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                  agent.active
                    ? 'border-slate-200 dark:border-[#1C2E4C] hover:border-[#C43D27]/40'
                    : 'border-slate-200 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-900/30'
                }`}
              >
                <div>
                  {/* Top Bar with Status & Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold font-mono ${
                          agent.active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            agent.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        {agent.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        title={agent.active ? 'Deactivate Agent' : 'Activate Agent'}
                        onClick={() => handleToggleStatus(agent)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          agent.active
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Edit Agent"
                        onClick={() => handleOpenEdit(agent)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172B52] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Agent"
                        onClick={() => setDeletingAgent(agent)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Agent Info */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {agent.description || 'No description specified.'}
                  </p>

                  {/* Voice & Language Badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-2xs font-semibold border border-slate-200 dark:border-[#243B53]">
                      <Mic className="w-3 h-3 text-[#C43D27] dark:text-[#E05A44]" />
                      <span>{agent.voice}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-2xs font-semibold border border-slate-200 dark:border-[#243B53]">
                      <Languages className="w-3 h-3 text-slate-400" />
                      <span>{agent.language}</span>
                    </div>
                  </div>

                  {/* Greeting Snippet Box */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-[#FAF8F3] dark:bg-[#172B52]/50 border border-slate-200 dark:border-[#243B53] text-2xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                    "{agent.greeting_message}"
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1C2E4C] flex items-center gap-2">
                  <button
                    onClick={() => setViewingAgent(agent)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-[#1C2E4C] transition-colors cursor-pointer text-center"
                  >
                    View Details
                  </button>
                  <button
                    disabled={!agent.active}
                    onClick={() => onStartCallWithAgent(agent.id)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={!agent.active ? 'Agent is inactive' : 'Launch Outbound Call'}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Start Call</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Agent Modal */}
      {(showCreateModal || editingAgent) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2E4C] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingAgent ? 'Edit AI Calling Agent' : 'Create AI Calling Agent'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Workspace: <strong className="text-slate-800 dark:text-slate-200">{currentWorkspace.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAgent(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172B52] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agent Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sharma OPD Voice Assistant"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handles patient inquiries, triage, and scheduling"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Voice Persona
                  </label>
                  <select
                    value={formData.voice}
                    onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                  >
                    {AVAILABLE_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                  >
                    {AVAILABLE_LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Greeting Message *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Spoken immediately when call connects..."
                  value={formData.greeting_message}
                  onChange={(e) => setFormData({ ...formData, greeting_message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  System Instructions & Prompt *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Define behavior, clinical guidelines, conversational guardrails, and knowledge boundaries..."
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agent-active-checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C43D27] focus:ring-[#C43D27]"
                />
                <label
                  htmlFor="agent-active-checkbox"
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Agent is Active (Ready to initiate and receive calls)
                </label>
              </div>

              <div className="pt-3 flex items-center gap-2.5 border-t border-slate-100 dark:border-[#1C2E4C]">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAgent(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving Agent...' : editingAgent ? 'Update Agent' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Agent Modal / Drawer */}
      {viewingAgent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2E4C] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingAgent.name}</h3>
                  <span
                    className={`inline-block text-[10px] font-mono font-bold uppercase ${
                      viewingAgent.active ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {viewingAgent.active ? '● Active Agent' : '○ Inactive Agent'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingAgent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#FAF8F3] dark:bg-[#172B52] rounded-xl border border-slate-200 dark:border-[#243B53]">
                  <span className="text-2xs text-slate-400 font-mono block">Voice</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingAgent.voice}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] dark:bg-[#172B52] rounded-xl border border-slate-200 dark:border-[#243B53]">
                  <span className="text-2xs text-slate-400 font-mono block">Language</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingAgent.language}</span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F3] dark:bg-[#172B52] rounded-xl border border-slate-200 dark:border-[#243B53]">
                <span className="text-2xs text-slate-400 font-mono uppercase font-bold block mb-1">
                  Initial Greeting
                </span>
                <p className="text-slate-700 dark:text-slate-300 italic">"{viewingAgent.greeting_message}"</p>
              </div>

              <div className="p-3 bg-[#FAF8F3] dark:bg-[#172B52] rounded-xl border border-slate-200 dark:border-[#243B53]">
                <span className="text-2xs text-slate-400 font-mono uppercase font-bold block mb-1">
                  System Instructions
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-mono text-2xs whitespace-pre-wrap leading-relaxed">
                  {viewingAgent.system_prompt}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#1C2E4C] flex items-center gap-2">
              <button
                onClick={() => {
                  const agentToEdit = viewingAgent;
                  setViewingAgent(null);
                  handleOpenEdit(agentToEdit);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Edit Configuration
              </button>
              <button
                disabled={!viewingAgent.active}
                onClick={() => {
                  const agentId = viewingAgent.id;
                  setViewingAgent(null);
                  onStartCallWithAgent(agentId);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Launch Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAgent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete AI Agent?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong>{deletingAgent.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setDeletingAgent(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Delete Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
