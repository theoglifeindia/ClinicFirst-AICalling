import React, { useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Bot,
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Volume2,
  Trash2,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { useVoiceReceptionist, SessionState } from '../hooks/useVoiceReceptionist';
import { Doctor } from '../types/database';

interface AIReceptionistPageProps {
  doctors: Doctor[];
  onRefreshData?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AIReceptionistPage: React.FC<AIReceptionistPageProps> = ({
  doctors,
  onRefreshData,
  onNavigateToTab,
}) => {
  const {
    sessionState,
    errorMessage,
    transcripts,
    micVolume,
    aiVolume,
    isSessionActive,
    startSession,
    stopSession,
    clearTranscript,
  } = useVoiceReceptionist(onRefreshData);

  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const testScenarios = [
    {
      label: '1. English Booking',
      text: 'Book Dr Sharma tomorrow at 4 PM.',
      desc: 'Requests specific doctor, tomorrow date, and 4:00 PM slot in English',
    },
    {
      label: '2. Hinglish / Hindi Booking',
      text: 'Dr Sharma se kal 4 baje appointment chahiye.',
      desc: 'Native Indian Hinglish voice request for tomorrow 4:00 PM',
    },
    {
      label: '3. Unavailable Slot Test',
      text: 'Book Dr Sharma tomorrow at 2:00 PM.',
      desc: 'Tests 2:00 PM (outside OPD hours); AI should check real slots and offer alternatives',
    },
    {
      label: '4. Medical Advice Test',
      text: 'What medicine should I take for chest pain and fever?',
      desc: 'Tests medical safety guardrail; AI must decline clinical advice & triage to clinic',
    },
    {
      label: '5. Doctor Inquiry',
      text: 'Which doctors are available at the clinic?',
      desc: 'Calls getDoctors() to list active physicians & pediatricians',
    },
  ];

  const getStatusBadge = (state: SessionState) => {
    switch (state) {
      case 'listening':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            LISTENING
          </span>
        );
      case 'speaking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            AI SPEAKING
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-spin" />
            PROCESSING
          </span>
        );
      case 'ended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            ENDED
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            ERROR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400" />
            READY
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clear Disclaimer & State Indicator */}
      <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1C2E4C] shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="px-3 py-0.5 rounded-full text-2xs font-mono font-bold bg-[#F0F4F8] dark:bg-[#172B52] text-[#0A2540] dark:text-sky-300 border border-[#D9E2EC] dark:border-[#243B53]">
                GEMINI LIVE VOICE ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-amber-600" />
                Browser Voice Test — Not connected to a real phone number
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A2540] dark:text-white">
              AI Voice Receptionist
            </h1>
            <p className="text-xs sm:text-sm text-[#486581] dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time conversational voice receptionist powered by Gemini Live API. Speaks and understands English, Hindi, and Hinglish while executing strict double-booking-protected appointment services.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {isSessionActive ? (
              <button
                id="stop-voice-session-btn"
                onClick={stopSession}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                <MicOff className="w-4 h-4" />
                <span>Stop Voice Session</span>
              </button>
            ) : (
              <button
                id="start-voice-test-btn"
                onClick={startSession}
                className="px-6 py-3.5 bg-[#0A2540] hover:bg-[#103B66] text-white dark:bg-white dark:text-[#0A2540] dark:hover:bg-slate-100 font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                <Mic className="w-4 h-4" />
                <span>Start Voice Test</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Visualizer Stage */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#1C2E4C] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Status & Audio Waveform */}
          <div className="md:col-span-2 bg-[#F0F4F8]/70 dark:bg-[#172B52]/70 rounded-2xl p-4 border border-[#D9E2EC] dark:border-[#243B53] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  sessionState === 'listening'
                    ? 'bg-[#0A2540] text-white dark:bg-white dark:text-[#0A2540] shadow-lg scale-105'
                    : sessionState === 'speaking'
                    ? 'bg-[#103B66] text-white dark:bg-slate-100 dark:text-[#0A2540] shadow-lg scale-105'
                    : sessionState === 'processing'
                    ? 'bg-[#1C2E4C] text-white animate-spin'
                    : 'bg-[#D9E2EC] dark:bg-[#243B53] text-[#486581] dark:text-slate-400'
                }`}
              >
                {sessionState === 'speaking' ? (
                  <Volume2 className="w-6 h-6 animate-pulse" />
                ) : sessionState === 'processing' ? (
                  <Activity className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0A2540] dark:text-white">Call Status:</span>
                  {getStatusBadge(sessionState)}
                </div>
                <div className="text-2xs text-[#627D98] dark:text-slate-400 font-mono mt-1">
                  {sessionState === 'listening'
                    ? 'Speak now in English, Hindi, or Hinglish (e.g. "Dr Sharma se kal 4 baje...")'
                    : sessionState === 'speaking'
                    ? 'AI is speaking. You can speak to naturally interrupt anytime (Barge-in).'
                    : sessionState === 'processing'
                    ? 'Verifying slot availability with Clinic Engine database...'
                    : sessionState === 'ended'
                    ? 'Session ended. Click Start Voice Test to connect again.'
                    : 'Click Start Voice Test to enable microphone and speak.'}
                </div>
              </div>
            </div>

            {/* Dynamic Volume Bars */}
            <div className="hidden sm:flex items-center gap-1 h-8 px-2">
              {[0.2, 0.4, 0.6, 0.8, 1.0, 0.7, 0.5, 0.3].map((heightMultiplier, idx) => {
                const activeVol = sessionState === 'speaking' ? aiVolume : micVolume;
                const barHeight = isSessionActive
                  ? Math.max(4, Math.min(28, (activeVol * 40 + 4) * heightMultiplier))
                  : 4;
                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      sessionState === 'speaking'
                        ? 'bg-[#0A2540] dark:bg-white'
                        : sessionState === 'listening'
                        ? 'bg-[#103B66] dark:bg-slate-200'
                        : 'bg-[#BCCCDC] dark:bg-slate-600'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Quick Engine Telemetry */}
          <div className="bg-[#F0F4F8]/70 dark:bg-[#172B52]/70 rounded-2xl p-4 border border-[#D9E2EC] dark:border-[#243B53] flex items-center justify-between">
            <div className="space-y-1 text-2xs">
              <div className="flex items-center gap-1.5 text-[#627D98] dark:text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0A2540] dark:text-slate-300" />
                <span>Source of Truth:</span>
                <span className="font-bold text-[#0A2540] dark:text-white">Authoritative DB</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#627D98] dark:text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#0A2540] dark:text-slate-300" />
                <span>Timezone:</span>
                <span className="font-bold text-[#0A2540] dark:text-white font-mono">Asia/Kolkata (IST)</span>
              </div>
            </div>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('appointments')}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#101F3D] text-[#0A2540] dark:text-slate-200 text-2xs font-bold border border-[#D9E2EC] dark:border-[#243B53] shadow-2xs hover:bg-[#F0F4F8] transition-colors cursor-pointer"
              >
                View Bookings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Voice Error: </span>
            {errorMessage}
            <div className="mt-1 text-2xs text-rose-700 dark:text-rose-400">
              Ensure microphone permissions are granted in browser and GEMINI_API_KEY is configured in your environment secrets.
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Live Transcript & Test Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Compact Transcript */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101F3D] rounded-3xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col h-[520px]">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#1C2E4C] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0A2540] dark:text-slate-300" />
              <h2 className="text-sm font-bold text-[#0A2540] dark:text-white">
                Live Conversation Transcript
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono text-[#829AB1]">
                {transcripts.length} {transcripts.length === 1 ? 'message' : 'messages'}
              </span>
              {transcripts.length > 0 && (
                <button
                  onClick={clearTranscript}
                  title="Clear Transcript"
                  className="p-1.5 rounded-lg text-[#829AB1] hover:text-[#0A2540] dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172B52] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Transcript Feed */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
            {transcripts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#829AB1] dark:text-slate-500">
                <Bot className="w-10 h-10 mb-2 opacity-40 text-[#829AB1] dark:text-slate-400" />
                <p className="font-semibold text-[#0A2540] dark:text-slate-300">Voice Session Not Started</p>
                <p className="text-2xs max-w-sm mt-1 text-[#627D98] dark:text-slate-400">
                  Click <strong className="text-[#0A2540] dark:text-white">"Start Voice Test"</strong> above and speak naturally through your microphone.
                </p>
              </div>
            ) : (
              transcripts.map((entry) => {
                if (entry.sender === 'user') {
                  return (
                    <div key={entry.id} className="flex justify-end">
                      <div className="max-w-[85%] bg-[#0A2540] text-white dark:bg-slate-100 dark:text-[#0A2540] p-3 rounded-2xl rounded-tr-xs shadow-2xs space-y-1">
                        <div className="flex items-center justify-between gap-4 text-[10px] text-white/70 dark:text-[#627D98]">
                          <span className="font-bold">Staff / Patient</span>
                          <span className="font-mono">{entry.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{entry.text}</p>
                      </div>
                    </div>
                  );
                }

                if (entry.sender === 'ai') {
                  return (
                    <div key={entry.id} className="flex justify-start">
                      <div className="max-w-[85%] bg-[#F0F4F8] dark:bg-[#172B52] text-[#0A2540] dark:text-slate-100 p-3 rounded-2xl rounded-tl-xs border border-[#D9E2EC] dark:border-[#243B53] shadow-2xs space-y-1">
                        <div className="flex items-center justify-between gap-4 text-[10px] text-[#627D98] dark:text-slate-400">
                          <span className="font-bold flex items-center gap-1 text-[#0A2540] dark:text-slate-200">
                            <Bot className="w-3 h-3 text-[#003865] dark:text-sky-400" /> CLINICFIRST AI Receptionist
                          </span>
                          <span className="font-mono">{entry.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{entry.text}</p>
                      </div>
                    </div>
                  );
                }

                if (entry.sender === 'tool') {
                  return (
                    <div key={entry.id} className="flex justify-center my-1">
                      <div className="px-3 py-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-2xs font-mono flex items-center gap-2">
                        <Activity className="w-3 h-3 text-amber-600 animate-pulse" />
                        <span>{entry.text}</span>
                      </div>
                    </div>
                  );
                }

                // System message
                return (
                  <div key={entry.id} className="flex justify-center my-1">
                    <div className="px-3 py-1 rounded-full bg-[#F0F4F8] dark:bg-[#172B52] text-[#486581] dark:text-slate-400 text-2xs font-mono border border-[#D9E2EC] dark:border-[#243B53]">
                      {entry.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={transcriptBottomRef} />
          </div>
        </div>

        {/* Right 1 Col: Test Scenarios & Clinic Doctor Reference */}
        <div className="space-y-6">
          {/* Test Scenarios List */}
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-5 border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
            <h3 className="text-xs font-bold text-[#0A2540] dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#0A2540] dark:text-slate-300" />
              Verified Test Scenarios
            </h3>
            <p className="text-2xs text-[#627D98] dark:text-slate-400 mb-3">
              Speak these phrases to verify the voice acceptance criteria:
            </p>

            <div className="space-y-2">
              {testScenarios.map((sc, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[#F0F4F8]/70 dark:bg-[#172B52]/60 border border-[#D9E2EC] dark:border-[#243B53] space-y-1"
                >
                  <div className="flex items-center justify-between text-2xs">
                    <span className="font-bold text-[#0A2540] dark:text-slate-200">{sc.label}</span>
                    <span className="text-[10px] text-[#829AB1] font-mono">Spoken Input</span>
                  </div>
                  <div className="text-xs font-semibold text-[#0A2540] dark:text-white font-mono bg-white dark:bg-[#101F3D] p-1.5 rounded-lg border border-[#D9E2EC] dark:border-[#243B53]">
                    "{sc.text}"
                  </div>
                  <div className="text-[11px] text-[#486581] dark:text-slate-400 leading-tight">
                    {sc.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Clinic Doctors Reference */}
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-5 border border-slate-200 dark:border-[#1C2E4C] shadow-xs">
            <h3 className="text-xs font-bold text-[#0A2540] dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#0A2540] dark:text-slate-300" />
              Active Clinic Doctors (Database)
            </h3>
            <div className="space-y-2">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-xl bg-[#F0F4F8]/70 dark:bg-[#172B52]/60 border border-[#D9E2EC] dark:border-[#243B53] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#0A2540] dark:text-white">{doc.name}</div>
                    <div className="text-2xs text-[#627D98] dark:text-slate-400">{doc.specialty}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D9E2EC] dark:bg-[#243B53] text-[#0A2540] dark:text-slate-300 border border-[#BCCCDC] dark:border-[#334E68] font-semibold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
