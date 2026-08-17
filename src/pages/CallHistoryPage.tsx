import React, { useState, useEffect, useCallback } from 'react';
import {
  PhoneCall,
  Search,
  Filter,
  Bot,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  FileText,
  Sparkles,
  Phone,
  ArrowUpRight,
  RotateCcw,
  Calendar,
  Building2,
} from 'lucide-react';
import { CallRecord, CallStatus, CallFilter } from '../types/database';
import { useWorkspace } from '../context/WorkspaceContext';
import { getCallRecords, getCallById, getCallMetrics } from '../services/callService';

interface CallHistoryPageProps {
  onRedialCall: (agentId: string, contactId: string) => void;
  selectedCallIdToView?: string | null;
  onClearSelectedCallId?: () => void;
}

export const CallHistoryPage: React.FC<CallHistoryPageProps> = ({
  onRedialCall,
  selectedCallIdToView,
  onClearSelectedCallId,
}) => {
  const { currentWorkspace, currentWorkspaceId } = useWorkspace();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'ALL'>('ALL');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const loadCallsList = useCallback(async () => {
    try {
      setLoading(true);
      const filter: CallFilter = {
        workspace_id: currentWorkspaceId,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
      };
      const list = await getCallRecords(filter);
      setCalls(list);

      // If requested to open a specific call
      if (selectedCallIdToView) {
        const target = list.find((c) => c.id === selectedCallIdToView);
        if (target) setSelectedCall(target);
      }
    } catch (err) {
      console.error('Failed to load calls', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId, statusFilter, searchQuery, selectedCallIdToView]);

  useEffect(() => {
    loadCallsList();
  }, [loadCallsList]);

  const formatDuration = (secs: number) => {
    if (!secs || secs === 0) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            CONNECTED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            COMPLETED
          </span>
        );
      case 'RINGING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            RINGING
          </span>
        );
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            QUEUED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            FAILED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200">
            CANCELLED
          </span>
        );
      default:
        return <span className="text-2xs font-mono">{status}</span>;
    }
  };

  const completedCount = calls.filter((c) => c.status === 'COMPLETED').length;
  const failedCount = calls.filter((c) => c.status === 'FAILED' || c.status === 'CANCELLED').length;
  const activeCount = calls.filter((c) => c.status === 'QUEUED' || c.status === 'RINGING' || c.status === 'CONNECTED').length;

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
              {calls.length} Call Log{calls.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Call Logs & Transcripts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Audit outbound telephony sessions, clinical transcripts, conversational summaries, duration metrics, and telephony carrier error logs.
          </p>
        </div>

        <button
          onClick={loadCallsList}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#172B52] hover:bg-slate-200 dark:hover:bg-[#1C2E4C] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
          <span className="text-2xs font-mono uppercase font-bold text-slate-400">Total Calls</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{calls.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
          <span className="text-2xs font-mono uppercase font-bold text-emerald-600">Completed</span>
          <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{completedCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
          <span className="text-2xs font-mono uppercase font-bold text-rose-600">Failed / Cancelled</span>
          <div className="text-xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">{failedCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
          <span className="text-2xs font-mono uppercase font-bold text-blue-600">Active / Live</span>
          <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">{activeCount}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by contact, phone, agent, ID, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'COMPLETED', 'FAILED', 'CONNECTED', 'RINGING', 'QUEUED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-2xs font-mono font-bold transition-colors shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#C43D27] text-white shadow-xs'
                  : 'bg-white dark:bg-[#101F3D] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1C2E4C] hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Calls Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">
          <div className="w-7 h-7 border-2 border-[#C43D27] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading call logs...
        </div>
      ) : calls.length === 0 ? (
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-12 text-center border border-slate-200 dark:border-[#1C2E4C] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center mx-auto">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No call records found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Initiate outbound calls from the AI Agents or Contacts page to track live sessions, summaries, and transcripts here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F3] dark:bg-[#172B52] border-b border-slate-200 dark:border-[#243B53] text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4">Recipient Contact</th>
                  <th className="py-3 px-4">AI Agent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Started At</th>
                  <th className="py-3 px-4">Summary Preview</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1C2E4C]">
                {calls.map((call) => (
                  <tr
                    key={call.id}
                    id={`call-row-${call.id}`}
                    className="hover:bg-slate-50 dark:hover:bg-[#1C2E4C]/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div>
                        <div>{call.contact_name || 'Contact'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{call.phone_number}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Bot className="w-3.5 h-3.5 text-[#C43D27] dark:text-[#E05A44]" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {call.agent_name || 'AI Assistant'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(call.status)}</td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatDuration(call.duration)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-2xs">
                      {formatDateTime(call.started_at)}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {call.summary ? (
                        <p className="text-2xs text-slate-600 dark:text-slate-300 truncate">
                          {call.summary}
                        </p>
                      ) : call.failure_reason ? (
                        <p className="text-2xs text-rose-600 dark:text-rose-400 truncate">
                          {call.failure_reason}
                        </p>
                      ) : (
                        <span className="text-slate-400 text-2xs italic">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCall(call)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#172B52] hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-2xs font-bold transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => onRedialCall(call.agent_id, call.contact_id)}
                          className="p-1.5 text-[#C43D27] dark:text-[#E05A44] hover:bg-[#FAF8F3] dark:hover:bg-[#172B52] rounded-lg transition-colors cursor-pointer"
                          title="Redial / Call Again"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Call Details Drawer / Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-[#FAF8F3] dark:bg-[#172B52] border-b border-slate-200 dark:border-[#243B53] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Call Record Details
                    </h3>
                    {getStatusBadge(selectedCall.status)}
                  </div>
                  <span className="text-2xs text-slate-400 font-mono">
                    Call ID: {selectedCall.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCall(null);
                  onClearSelectedCallId?.();
                }}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#101F3D] border-b border-slate-200 dark:border-[#1C2E4C] text-xs">
              <div>
                <span className="text-2xs text-slate-400 font-mono block">Recipient</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedCall.contact_name}</span>
                <span className="text-2xs text-slate-500 font-mono block">{selectedCall.phone_number}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 font-mono block">AI Agent</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedCall.agent_name}</span>
                <span className="text-2xs text-slate-500 font-mono block">Voice: {selectedCall.agent_voice}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 font-mono block">Duration</span>
                <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                  {formatDuration(selectedCall.duration)}
                </span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 font-mono block">Started At</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-2xs block">
                  {formatDateTime(selectedCall.started_at)}
                </span>
              </div>
            </div>

            {/* Failure Reason Callout */}
            {selectedCall.failure_reason && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Failure Diagnostic Reason</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{selectedCall.failure_reason}</p>
                </div>
              </div>
            )}

            {/* AI Summary Section */}
            {selectedCall.summary && (
              <div className="p-4 bg-[#FAF8F3] dark:bg-[#172B52]/50 border-b border-slate-200 dark:border-[#243B53] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Consultation Summary</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {selectedCall.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Transcript Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-white dark:bg-[#101F3D] min-h-[200px]">
              <div className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider pb-1 border-b border-slate-100 dark:border-[#1C2E4C]">
                Full Session Transcript ({selectedCall.transcript?.length || 0} Utterances)
              </div>

              {(!selectedCall.transcript || selectedCall.transcript.length === 0) && (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  No speech utterances recorded for this call.
                </div>
              )}

              {selectedCall.transcript?.map((item, idx) => {
                const isUser = item.speaker === 'user';
                const isSystem = item.speaker === 'system';

                if (isSystem) {
                  return (
                    <div key={idx} className="text-center py-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-[#172B52] text-slate-500 dark:text-slate-400 text-2xs font-mono">
                        {item.text} • {item.timestamp}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold text-xs shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#C43D27] text-white rounded-tr-xs'
                          : 'bg-[#FAF8F3] dark:bg-[#172B52] text-slate-900 dark:text-white border border-slate-200 dark:border-[#243B53] rounded-tl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1 font-mono">
                        <span className="font-bold">{isUser ? selectedCall.contact_name || 'User' : selectedCall.agent_name}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p>{item.text}</p>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-[#101F3D] border-t border-slate-200 dark:border-[#1C2E4C] flex items-center justify-between">
              <div className="text-2xs text-slate-400 font-mono">
                Provider ID: {selectedCall.provider_call_id}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const agentId = selectedCall.agent_id;
                    const contactId = selectedCall.contact_id;
                    setSelectedCall(null);
                    onClearSelectedCallId?.();
                    onRedialCall(agentId, contactId);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Again</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCall(null);
                    onClearSelectedCallId?.();
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-[#172B52] hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
