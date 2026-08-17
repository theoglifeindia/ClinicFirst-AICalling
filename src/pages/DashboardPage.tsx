import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Mic,
  Bot,
  Phone,
  PhoneCall,
  Activity,
  Users,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { Doctor, AppointmentWithDetails, CallRecord, CallMetrics } from '../types/database';
import { formatDisplayDate } from '../utils/timeUtils';
import { useWorkspace } from '../context/WorkspaceContext';
import { getCallMetrics, getCallRecords } from '../services/callService';

interface DashboardPageProps {
  doctors: Doctor[];
  appointments: AppointmentWithDetails[];
  todayStr: string;
  onOpenBooking: (doctorId?: string, date?: string, slot?: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onNavigateToTab: (tab: 'dashboard' | 'agents' | 'contacts' | 'calls' | 'appointments' | 'doctors' | 'availability' | 'testsuite' | 'schema' | 'receptionist') => void;
  onStartNewCall: () => void;
  onViewCallRecord: (callId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  doctors,
  appointments,
  todayStr,
  onOpenBooking,
  onCancelAppointment,
  onNavigateToTab,
  onStartNewCall,
  onViewCallRecord,
}) => {
  const { workspaces, currentWorkspace, currentWorkspaceId, setCurrentWorkspaceId, createWorkspace } = useWorkspace();
  const [metrics, setMetrics] = useState<CallMetrics>({
    total_calls: 0,
    completed_calls: 0,
    failed_calls: 0,
    active_calls: 0,
    average_duration_seconds: 0,
  });
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [loadingCalls, setLoadingCalls] = useState<boolean>(true);

  // Clinic Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsTimezone, setNewWsTimezone] = useState('Asia/Kolkata');
  const [newWsPhone, setNewWsPhone] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) {
      setCreateError('Clinic / Workspace name is required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setCreateError(null);
      await createWorkspace(newWsName.trim(), newWsTimezone, newWsPhone.trim() || undefined);
      setShowCreateModal(false);
      setNewWsName('');
      setNewWsPhone('');
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create clinic workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadDashboardCalls = useCallback(async () => {
    try {
      setLoadingCalls(true);
      const [callMetrics, callsList] = await Promise.all([
        getCallMetrics(currentWorkspaceId),
        getCallRecords({ workspace_id: currentWorkspaceId }),
      ]);
      setMetrics(callMetrics);
      setRecentCalls(callsList.slice(0, 4));
    } catch (err) {
      console.error('Failed to load call metrics', err);
    } finally {
      setLoadingCalls(false);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    loadDashboardCalls();
  }, [loadDashboardCalls]);

  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const confirmedToday = todayAppointments.filter((a) => a.status === 'confirmed');
  const upcomingAppointments = appointments.filter(
    (a) => a.appointment_date >= todayStr && a.status === 'confirmed'
  );

  const drSharma = doctors.find((d) => d.name.includes('Sharma')) || doctors[0];

  const formatDuration = (secs: number) => {
    if (!secs || secs === 0) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Clinic Tenant Management Strip */}
      <div className="bg-white dark:bg-[#101F3D] rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-[#1C2E4C] shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Active Clinic Tenant:
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {currentWorkspace.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {currentWorkspace.timezone} {currentWorkspace.phone ? `• ${currentWorkspace.phone}` : ''} • Fully Isolated Clinic Environment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 max-w-xs overflow-x-auto">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setCurrentWorkspaceId(ws.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  ws.id === currentWorkspaceId
                    ? 'bg-[#C43D27] text-white font-bold shadow-2xs'
                    : 'bg-[#FAF8F3] dark:bg-[#172B52] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#243B53]'
                }`}
              >
                {ws.name}
              </button>
            ))}
          </div>

          <button
            id="dashboard-btn-create-clinic"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create New Clinic Tenant</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left 2 Cols: Main Banner */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101F3D] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1C2E4C] shadow-xs relative overflow-hidden flex flex-col justify-between transition-colors">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-[#FAF8F3] text-[#C43D27] border border-[#F2C4BC] dark:bg-[#C43D27]/20 dark:text-[#F2C4BC] dark:border-[#C43D27]/40">
                WORKSPACE: {currentWorkspace.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {currentWorkspace.timezone}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Automated AI Voice Calling & Clinic Scheduling
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium mt-1.5 max-w-xl">
              Launch outbound voice bots, manage appointment triage, track call transcripts, and prevent double-bookings with atomic persistence.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                id="hero-start-call-btn"
                onClick={onStartNewCall}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-white/90" />
                <span>Start AI Call</span>
              </button>

              <button
                onClick={() => onNavigateToTab('agents')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#243B53] text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#1C2E4C] transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
                <span>Configure AI Agents</span>
              </button>

              <button
                onClick={() => onNavigateToTab('testsuite')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#243B53] text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#1C2E4C] transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Run Engine Tests</span>
              </button>
            </div>
          </div>

          {/* Quick Engine Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-[#1C2E4C] relative z-10">
            <div className="bg-[#FAF8F3] dark:bg-[#172B52]/50 rounded-2xl p-3 border border-slate-200 dark:border-[#243B53]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                <PhoneCall className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
                <span className="text-xs font-bold font-mono">{metrics.total_calls} Calls</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">Logged in Workspace</p>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#172B52]/50 rounded-2xl p-3 border border-slate-200 dark:border-[#243B53]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold font-mono">{metrics.completed_calls} Success</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">Completed Outbound</p>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#172B52]/50 rounded-2xl p-3 border border-slate-200 dark:border-[#243B53]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                <Clock className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
                <span className="text-xs font-bold font-mono">{metrics.average_duration_seconds}s Avg</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">Call Duration</p>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#172B52]/50 rounded-2xl p-3 border border-slate-200 dark:border-[#243B53]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold font-mono">100% Locked</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">Atomic Concurrency</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Call & Consultation Launcher */}
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Launch Outbound Call
              </h3>
              <span className="text-2xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select verified contact and trigger voice agent
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-[#FAF8F3] dark:bg-[#172B52] rounded-xl border border-slate-200 dark:border-[#243B53] text-xs">
                <span className="text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                  Active Workspace
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{currentWorkspace.name}</span>
              </div>

              <div className="p-3 bg-[#FAF8F3] dark:bg-[#172B52] rounded-xl border border-slate-200 dark:border-[#243B53] text-xs">
                <span className="text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                  Telephony Gateway
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Carrier Simulator Adapter (M3)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#1C2E4C] space-y-2">
            <button
              id="dashboard-start-call-action-btn"
              onClick={onStartNewCall}
              className="w-full py-3 bg-[#C43D27] hover:bg-[#B03420] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Start Outbound Call</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenBooking(drSharma?.id, todayStr)}
              className="w-full py-2 bg-slate-100 dark:bg-[#172B52] hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
            >
              Book OPD Consultation Slot
            </button>
          </div>
        </div>
      </div>

      {/* M3 Call Management Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-[#101F3D] p-4 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
          <span className="text-2xs font-mono uppercase font-bold text-slate-400">Total Calls</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.total_calls}</div>
          <span className="text-[10px] text-slate-400 font-mono">Workspace lifetime</span>
        </div>

        <div className="bg-white dark:bg-[#101F3D] p-4 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
          <span className="text-2xs font-mono uppercase font-bold text-emerald-600">Completed</span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {metrics.completed_calls}
          </div>
          <span className="text-[10px] text-emerald-600 font-mono">Successful sessions</span>
        </div>

        <div className="bg-white dark:bg-[#101F3D] p-4 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
          <span className="text-2xs font-mono uppercase font-bold text-rose-600">Failed / Cancelled</span>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
            {metrics.failed_calls}
          </div>
          <span className="text-[10px] text-rose-500 font-mono">Carrier drops / busy</span>
        </div>

        <div className="bg-white dark:bg-[#101F3D] p-4 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
          <span className="text-2xs font-mono uppercase font-bold text-blue-600">Active Live</span>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {metrics.active_calls}
          </div>
          <span className="text-[10px] text-blue-500 font-mono">In progress</span>
        </div>

        <div className="bg-white dark:bg-[#101F3D] p-4 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs col-span-2 lg:col-span-1">
          <span className="text-2xs font-mono uppercase font-bold text-slate-400">Avg Duration</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatDuration(metrics.average_duration_seconds)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Per completed call</span>
        </div>
      </div>

      {/* Main Split: Recent Call Transcripts & Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Calls Widget */}
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1C2E4C] flex justify-between items-center bg-[#FAF8F3] dark:bg-[#172B52]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Recent Call Sessions</h2>
              </div>
              <button
                onClick={() => onNavigateToTab('calls')}
                className="text-xs font-bold text-[#C43D27] dark:text-[#E05A44] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View All Calls <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4">
              {recentCalls.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <Phone className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-800 dark:text-slate-200">No recent calls in this workspace.</p>
                  <p className="mt-1">Click "Start AI Call" to initiate a session.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div
                      key={call.id}
                      onClick={() => onViewCallRecord(call.id)}
                      className="p-3.5 rounded-2xl bg-[#FAF8F3] dark:bg-[#172B52]/50 border border-slate-200 dark:border-[#243B53] hover:border-[#C43D27]/40 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {call.contact_name || 'Contact'}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-2xs font-mono font-bold ${
                              call.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : call.status === 'FAILED'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            }`}
                          >
                            {call.status}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-mono">
                          Agent: {call.agent_name} • {call.phone_number}
                        </p>
                        {call.summary && (
                          <p className="text-2xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1 italic">
                            "{call.summary}"
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                          {formatDuration(call.duration)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {call.transcript?.length || 0} turns
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#101F3D] border-t border-slate-100 dark:border-[#1C2E4C] flex items-center justify-between">
            <button
              onClick={() => onNavigateToTab('agents')}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#C43D27] cursor-pointer flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-[#C43D27]" />
              <span>Manage Agents</span>
            </button>
            <button
              onClick={() => onNavigateToTab('contacts')}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#C43D27] cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Manage Contacts</span>
            </button>
          </div>
        </div>

        {/* Right Column: Today's Consultation Appointments */}
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1C2E4C] flex justify-between items-center bg-[#FAF8F3] dark:bg-[#172B52]">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Today's Appointments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDisplayDate(todayStr)}</p>
              </div>
              <button
                onClick={() => onNavigateToTab('appointments')}
                className="text-xs font-bold text-[#C43D27] dark:text-[#E05A44] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View All ({appointments.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4">
              {todayAppointments.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <Calendar className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-800 dark:text-slate-200">No appointments scheduled for today.</p>
                  <button
                    onClick={() => onOpenBooking(drSharma?.id, todayStr)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Book for Today</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-[#1C2E4C]">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-[#FAF8F3] dark:hover:bg-[#172B52]/50 p-2.5 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] text-slate-900 dark:text-white flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs font-bold font-mono">{apt.start_time}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                              {apt.patient_name}
                            </h4>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold uppercase ${
                                apt.status === 'confirmed'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {apt.doctor_name} • {apt.patient_phone}
                          </p>
                        </div>
                      </div>

                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => onCancelAppointment(apt.id)}
                          className="px-2 py-1 text-2xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#101F3D] border-t border-slate-100 dark:border-[#1C2E4C] flex items-center justify-between">
            <span className="text-2xs text-slate-500 font-mono">
              Dr. Sharma & Dr. Patel OPD Schedule
            </span>
            <button
              onClick={() => onNavigateToTab('availability')}
              className="text-xs font-bold text-[#C43D27] dark:text-[#E05A44] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Explore Slots</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Clinic Modal */}
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

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateClinic} className="space-y-3.5">
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
                  id="dashboard-submit-new-clinic"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating Clinic...' : 'Create Clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
