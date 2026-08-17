import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Bot,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Send,
  Sparkles,
  Radio,
  X,
  Volume2,
} from 'lucide-react';
import { CallRecord, CallStatus, TranscriptMessage } from '../../types/database';
import { endActiveCall, cancelActiveCall, getCallById } from '../../services/callService';

interface ActiveCallModalProps {
  callId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewRecordDetails?: (callId: string) => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  callId,
  isOpen,
  onClose,
  onViewRecordDetails,
}) => {
  const [call, setCall] = useState<CallRecord | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [userReplyText, setUserReplyText] = useState<string>('');
  const [isEnding, setIsEnding] = useState<boolean>(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Poll / refresh call state from Storage
  useEffect(() => {
    if (!isOpen || !callId) return;

    const fetchCall = async () => {
      const record = await getCallById(callId);
      if (record) {
        setCall(record);
      }
    };

    fetchCall();
    const interval = setInterval(fetchCall, 600);
    return () => clearInterval(interval);
  }, [isOpen, callId]);

  // Duration Timer when CONNECTED
  useEffect(() => {
    if (call?.status === 'CONNECTED') {
      const startTime = call.connected_at ? new Date(call.connected_at).getTime() : Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
      }, 1000);
    } else if (call?.status === 'COMPLETED') {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedSeconds(call.duration || 0);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [call?.status, call?.connected_at, call?.duration]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [call?.transcript]);

  if (!isOpen || !call) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleHangUp = async () => {
    try {
      setIsEnding(true);
      await endActiveCall(call.id);
      const updated = await getCallById(call.id);
      if (updated) setCall(updated);
    } catch (err) {
      console.error('Failed to end call', err);
    } finally {
      setIsEnding(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsEnding(true);
      await cancelActiveCall(call.id);
      const updated = await getCallById(call.id);
      if (updated) setCall(updated);
    } catch (err) {
      console.error('Failed to cancel call', err);
    } finally {
      setIsEnding(false);
    }
  };

  const handleSendCustomUserUtterance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReplyText.trim() || call.status !== 'CONNECTED') return;

    const newMsg: TranscriptMessage = {
      speaker: 'user',
      text: userReplyText.trim(),
      timestamp: formatDuration(elapsedSeconds),
    };

    const currentTranscript = call.transcript || [];
    const updated = [...currentTranscript, newMsg];

    // In local state
    setCall({ ...call, transcript: updated });
    setUserReplyText('');
  };

  const isLive = call.status === 'QUEUED' || call.status === 'RINGING' || call.status === 'CONNECTED';
  const isFinished = call.status === 'COMPLETED' || call.status === 'FAILED' || call.status === 'CANCELLED';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#101F3D] rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header with Status HUD */}
        <div className="p-5 sm:p-6 bg-[#FAF8F3] dark:bg-[#172B52] border-b border-slate-200 dark:border-[#243B53] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                call.status === 'CONNECTED'
                  ? 'bg-emerald-600 animate-pulse'
                  : call.status === 'RINGING'
                  ? 'bg-blue-600'
                  : call.status === 'QUEUED'
                  ? 'bg-amber-500'
                  : call.status === 'FAILED'
                  ? 'bg-rose-600'
                  : 'bg-slate-700'
              }`}
            >
              {call.status === 'CONNECTED' ? (
                <Radio className="w-6 h-6 animate-spin" />
              ) : call.status === 'RINGING' ? (
                <PhoneCall className="w-6 h-6 animate-bounce" />
              ) : call.status === 'FAILED' ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold tracking-wider uppercase border ${
                    call.status === 'CONNECTED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : call.status === 'RINGING'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      : call.status === 'QUEUED'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : call.status === 'COMPLETED'
                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      call.status === 'CONNECTED'
                        ? 'bg-emerald-500 animate-ping'
                        : call.status === 'RINGING'
                        ? 'bg-blue-500 animate-pulse'
                        : call.status === 'QUEUED'
                        ? 'bg-amber-500'
                        : call.status === 'COMPLETED'
                        ? 'bg-slate-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  {call.status}
                </span>

                <span className="text-2xs text-slate-400 font-mono">
                  ID: {call.id.slice(0, 15)}...
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Calling {call.contact_name || 'Contact'} ({call.phone_number})
              </h2>
            </div>
          </div>

          {/* Duration Counter Clock */}
          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono uppercase font-bold">Duration</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatDuration(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Call Participants Bar */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-[#101F3D] border-b border-slate-200 dark:border-[#1C2E4C] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
            <span className="text-slate-500 dark:text-slate-400">Agent:</span>
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{call.agent_name}</strong>
            <span className="text-2xs text-slate-400 font-mono">({call.agent_voice || 'Zephyr'})</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Recipient:</span>
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{call.contact_name}</strong>
          </div>
        </div>

        {/* Live Audio Wave Graphic (When Connected) */}
        {call.status === 'CONNECTED' && (
          <div className="py-2.5 px-6 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Voice Channel Active • 24kHz HD PCM Audio
              </span>
            </div>
            {/* Animated Audio Bars */}
            <div className="flex items-center gap-1">
              {[40, 75, 50, 90, 60, 85, 45, 95, 65, 30].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${h * 0.22}px`,
                    animationDelay: `${i * 120}ms`,
                    animationDuration: '600ms',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Failure Callout Banner (If Failed) */}
        {call.status === 'FAILED' && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-200">Call Failed</h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                {call.failure_reason || 'Carrier returned error: Line busy or destination unreachable.'}
              </p>
            </div>
          </div>
        )}

        {/* Summary Card (If Completed) */}
        {call.status === 'COMPLETED' && call.summary && (
          <div className="p-4 bg-[#FAF8F3] dark:bg-[#172B52]/60 border-b border-slate-200 dark:border-[#243B53] flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Call Summary</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                {call.summary}
              </p>
            </div>
          </div>
        )}

        {/* Live Streaming Transcript Container */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-white dark:bg-[#101F3D] min-h-[220px] max-h-[360px]">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#1C2E4C]">
            <span>Live Call Transcript</span>
            <span>{call.transcript?.length || 0} Utterances</span>
          </div>

          {(!call.transcript || call.transcript.length === 0) && (
            <div className="py-10 text-center text-xs text-slate-400 italic">
              {call.status === 'QUEUED'
                ? 'Routing to carrier network gateway...'
                : call.status === 'RINGING'
                ? 'Waiting for recipient to answer...'
                : 'Waiting for initial voice turn...'}
            </div>
          )}

          {call.transcript?.map((item, index) => {
            const isAgent = item.speaker === 'agent';
            const isUser = item.speaker === 'user';
            const isSystem = item.speaker === 'system';

            if (isSystem) {
              return (
                <div key={index} className="text-center py-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-[#172B52] text-slate-500 dark:text-slate-400 text-2xs font-mono">
                    {item.text} • {item.timestamp}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={index}
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
                    <span className="font-bold">{isUser ? call.contact_name || 'User' : call.agent_name}</span>
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
          <div ref={transcriptEndRef} />
        </div>

        {/* Live User Utterance Box (When Connected) */}
        {call.status === 'CONNECTED' && (
          <form
            onSubmit={handleSendCustomUserUtterance}
            className="p-3 bg-[#FAF8F3] dark:bg-[#172B52] border-t border-slate-200 dark:border-[#243B53] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Inject custom speech response for testing..."
              value={userReplyText}
              onChange={(e) => setUserReplyText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#243B53] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
            />
            <button
              type="submit"
              disabled={!userReplyText.trim()}
              className="px-3 py-2 bg-[#C43D27] text-white rounded-xl text-xs font-bold hover:bg-[#B03420] transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        )}

        {/* Bottom Control Bar */}
        <div className="p-4 bg-slate-50 dark:bg-[#101F3D] border-t border-slate-200 dark:border-[#1C2E4C] flex items-center justify-between gap-3">
          <div className="text-2xs text-slate-400 font-mono">
            Provider: <span className="font-semibold text-slate-600 dark:text-slate-300">{call.provider_call_id}</span>
          </div>

          <div className="flex items-center gap-2">
            {isLive ? (
              <>
                {call.status === 'QUEUED' || call.status === 'RINGING' ? (
                  <button
                    onClick={handleCancel}
                    disabled={isEnding}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel Call
                  </button>
                ) : (
                  <button
                    onClick={handleHangUp}
                    disabled={isEnding}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>{isEnding ? 'Hanging up...' : 'End Call'}</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {onViewRecordDetails && (
                  <button
                    onClick={() => {
                      onViewRecordDetails(call.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-200 dark:bg-[#172B52] hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Call Details</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
