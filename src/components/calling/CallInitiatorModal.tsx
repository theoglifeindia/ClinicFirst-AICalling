import React, { useState, useEffect } from 'react';
import {
  Phone,
  Bot,
  User,
  X,
  AlertCircle,
  Sparkles,
  Layers,
  Settings2,
  AlertTriangle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { AIAgent, Contact } from '../../types/database';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getAgents } from '../../services/agentService';
import { getContacts, validatePhoneNumber } from '../../services/contactService';

interface CallInitiatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAgentId?: string;
  preselectedContactId?: string;
  onStartCall: (params: {
    agentId: string;
    contactId: string;
    customPhone?: string;
    forceFailMode: boolean;
    failReason?: string;
  }) => Promise<void>;
}

export const CallInitiatorModal: React.FC<CallInitiatorModalProps> = ({
  isOpen,
  onClose,
  preselectedAgentId,
  preselectedContactId,
  onStartCall,
}) => {
  const { currentWorkspace, currentWorkspaceId } = useWorkspace();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [useCustomPhone, setUseCustomPhone] = useState<boolean>(false);
  const [customPhone, setCustomPhone] = useState<string>('+91 ');
  const [customContactName, setCustomContactName] = useState<string>('');

  // Failure Simulation Mode
  const [forceFailMode, setForceFailMode] = useState<boolean>(false);
  const [failReason, setFailReason] = useState<string>('Destination line busy / Network unreachable');

  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [agentsList, contactsList] = await Promise.all([
          getAgents(currentWorkspaceId),
          getContacts(currentWorkspaceId),
        ]);
        setAgents(agentsList);
        setContacts(contactsList);

        // Preselection logic
        if (preselectedAgentId && agentsList.some((a) => a.id === preselectedAgentId)) {
          setSelectedAgentId(preselectedAgentId);
        } else {
          const firstActive = agentsList.find((a) => a.active);
          setSelectedAgentId(firstActive ? firstActive.id : agentsList[0]?.id || '');
        }

        if (preselectedContactId && contactsList.some((c) => c.id === preselectedContactId)) {
          setSelectedContactId(preselectedContactId);
        } else {
          setSelectedContactId(contactsList[0]?.id || '');
        }
      } catch (err) {
        console.error('Failed to load call modal resources', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, currentWorkspaceId, preselectedAgentId, preselectedContactId]);

  if (!isOpen) return null;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAgentId) {
      setError('Please select an AI Voice Agent.');
      return;
    }
    if (selectedAgent && !selectedAgent.active) {
      setError(`Cannot start call: "${selectedAgent.name}" is inactive. Please activate it first or choose another agent.`);
      return;
    }

    let contactIdToUse = selectedContactId;
    let phoneToUse = selectedContact?.phone;

    if (useCustomPhone) {
      const phoneCheck = validatePhoneNumber(customPhone);
      if (!phoneCheck.valid) {
        setError(phoneCheck.error || 'Invalid custom phone number.');
        return;
      }
      phoneToUse = phoneCheck.cleanPhone;

      // If user typed a custom contact without selecting one from list
      if (!selectedContactId && contacts.length > 0) {
        contactIdToUse = contacts[0].id;
      }
    }

    if (!contactIdToUse && contacts.length === 0) {
      setError('No contact available. Please add a contact to this workspace first.');
      return;
    }

    try {
      setStarting(true);
      await onStartCall({
        agentId: selectedAgentId,
        contactId: contactIdToUse,
        customPhone: useCustomPhone ? phoneToUse : undefined,
        forceFailMode,
        failReason: forceFailMode ? failReason : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate call.');
      setStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2E4C] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Start Outbound AI Call
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Workspace: <strong className="text-slate-800 dark:text-slate-200">{currentWorkspace.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172B52] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-[#C43D27] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading agents and contacts...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Agent Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                <span>1. Select AI Agent *</span>
                {selectedAgent && (
                  <span
                    className={`text-[10px] font-mono font-bold uppercase ${
                      selectedAgent.active ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {selectedAgent.active ? '● Active' : '✕ Inactive'}
                  </span>
                )}
              </label>
              {agents.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-900">
                  No AI agents configured in this workspace. Please create an agent first.
                </div>
              ) : (
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.voice} • {agent.language}) {agent.active ? '' : '— [INACTIVE]'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2: Contact Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  2. Select Recipient Contact *
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomPhone(!useCustomPhone)}
                  className="text-2xs font-bold text-[#C43D27] dark:text-[#E05A44] hover:underline cursor-pointer"
                >
                  {useCustomPhone ? 'Choose from directory' : '+ Enter custom phone'}
                </button>
              </div>

              {useCustomPhone ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="+91 9820123456"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] font-mono text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                  />
                  <p className="text-[10px] text-slate-400 font-mono">
                    Format: +91 9820123456 or +1 555-123-4567
                  </p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-900">
                  No contacts found. Please add a contact to this workspace or enter a custom phone number above.
                </div>
              ) : (
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                >
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.phone})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Test Simulation Controls */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1C2E4C] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-2xs font-bold text-slate-700 dark:text-slate-300">
                    Telephony Provider:
                  </span>
                </div>
                <span className="text-2xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Carrier Simulator Adapter (M3 Ready)
                </span>
              </div>

              {/* Force Failure Toggle for Verification */}
              <div className="p-3 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-2xs font-bold text-slate-800 dark:text-slate-200">
                      Simulate Carrier Failure (Error Testing)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={forceFailMode}
                    onChange={(e) => setForceFailMode(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C43D27] focus:ring-[#C43D27] cursor-pointer"
                  />
                </div>

                {forceFailMode && (
                  <select
                    value={failReason}
                    onChange={(e) => setFailReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#243B53] bg-white dark:bg-[#101F3D] text-2xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="Destination line busy / Network unreachable">
                      Destination line busy / Network unreachable
                    </option>
                    <option value="Recipient rejected / Disconnected by carrier">
                      Recipient rejected / Disconnected by carrier
                    </option>
                    <option value="Invalid telephony routing gateway / SIP timeout">
                      Invalid telephony routing gateway / SIP timeout
                    </option>
                  </select>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2.5 border-t border-slate-100 dark:border-[#1C2E4C]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={starting || agents.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{starting ? 'Initiating Call...' : 'Start Call Now'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
