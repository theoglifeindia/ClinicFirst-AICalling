import { useState, useRef, useCallback, useEffect } from 'react';
import {
  float32ToInt16Pcm,
  arrayBufferToBase64,
  base64ToFloat32Pcm,
  calculateRmsVolume,
} from '../utils/audioUtils';
import { getDoctors } from '../services/doctorService';
import {
  getAvailableSlots,
  createAppointment,
  cancelAppointment,
} from '../services/appointmentService';

export type SessionState = 'idle' | 'listening' | 'speaking' | 'processing' | 'ended' | 'error';

export interface TranscriptEntry {
  id: string;
  sender: 'user' | 'ai' | 'system' | 'tool';
  text: string;
  timestamp: string;
  details?: any;
}

export interface UseVoiceReceptionistReturn {
  sessionState: SessionState;
  errorMessage: string | null;
  transcripts: TranscriptEntry[];
  micVolume: number;
  aiVolume: number;
  isSessionActive: boolean;
  startSession: () => Promise<void>;
  stopSession: () => void;
  clearTranscript: () => void;
  sendTextMessage: (text: string) => void;
}

export function useVoiceReceptionist(onAppointmentCreated?: () => void): UseVoiceReceptionistReturn {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [aiVolume, setAiVolume] = useState<number>(0);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const currentAiTranscriptIdRef = useRef<string | null>(null);
  const currentUserTranscriptIdRef = useRef<string | null>(null);
  const isSessionActiveRef = useRef<boolean>(false);

  const isSessionActive = sessionState === 'listening' || sessionState === 'speaking' || sessionState === 'processing';

  // Stop playback instantly (used on interruption / stop)
  const stopAllPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setAiVolume(0);
  }, []);

  // Append or update transcript helper
  const appendTranscript = useCallback(
    (sender: TranscriptEntry['sender'], text: string, details?: any) => {
      const now = new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const entry: TranscriptEntry = {
        id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender,
        text,
        timestamp: now,
        details,
      };

      setTranscripts((prev) => [...prev, entry]);
      return entry.id;
    },
    []
  );

  // Stop Session & cleanup hardware
  const stopSession = useCallback(() => {
    isSessionActiveRef.current = false;

    // 1. Stop mic streams
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // 2. Disconnect audio nodes
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }

    // 3. Close Audio Contexts
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    stopAllPlayback();

    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }

    // 4. Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    setMicVolume(0);
    setAiVolume(0);
    setSessionState('ended');
    appendTranscript('system', 'Voice session disconnected.');
  }, [stopAllPlayback, appendTranscript]);

  // Execute tool called by Gemini Live
  const handleToolCall = useCallback(
    async (callId: string, name: string, args: any) => {
      setSessionState('processing');
      console.log('[VoiceHook] Executing tool:', name, args);

      try {
        let result: any = null;

        if (name === 'getDoctors') {
          appendTranscript('tool', 'Checking active doctors in clinic...');
          const doctors = await getDoctors();
          result = {
            doctors: doctors.map((d) => ({
              id: d.id,
              name: d.name,
              specialty: d.specialty,
              clinic_id: d.clinic_id,
            })),
          };
        } else if (name === 'getAvailableSlots') {
          const { doctorId, date } = args;
          appendTranscript(
            'tool',
            `Checking slot availability for doctor ID (${doctorId}) on date (${date})...`
          );
          const availability = await getAvailableSlots(doctorId, date);
          result = {
            doctor: availability.doctor,
            doctor_id: availability.doctor_id,
            date: availability.date,
            available_slots: availability.available_slots,
            booked_slots: availability.booked_slots,
            total_slots: availability.total_slots,
          };
        } else if (name === 'createAppointment') {
          const { doctorId, patientName, patientPhone, date, startTime } = args;
          appendTranscript(
            'tool',
            `Creating appointment for ${patientName} (${patientPhone}) on ${date} at ${startTime}...`
          );

          const bookingRes = await createAppointment({
            doctor_id: doctorId,
            patient_name: patientName,
            patient_phone: patientPhone,
            appointment_date: date,
            start_time: startTime,
            source: 'ai_call',
          });

          result = bookingRes;

          if (bookingRes.success && bookingRes.appointment) {
            appendTranscript(
              'system',
              `Appointment Confirmed: ${bookingRes.appointment.patient_name} with ${bookingRes.appointment.doctor_name} on ${bookingRes.appointment.appointment_date} at ${bookingRes.appointment.start_time}`
            );
            if (onAppointmentCreated) {
              onAppointmentCreated();
            }
          } else {
            appendTranscript(
              'system',
              `Booking Failed: ${bookingRes.error || 'Slot unavailable'}`
            );
          }
        } else if (name === 'cancelAppointment') {
          const { appointmentId } = args;
          appendTranscript('tool', `Cancelling appointment ID: ${appointmentId}...`);
          const cancelled = await cancelAppointment(appointmentId);
          result = { success: true, appointment: cancelled };
          appendTranscript('system', `Appointment ${appointmentId} cancelled.`);
          if (onAppointmentCreated) {
            onAppointmentCreated();
          }
        } else {
          result = { error: `Tool ${name} is not recognized` };
        }

        // Send tool response back to server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'tool_response',
              callId,
              name,
              response: result,
            })
          );
        }
      } catch (err: any) {
        console.error('[VoiceHook] Error executing tool:', err);
        appendTranscript('system', `Tool execution error: ${err.message || 'Unknown error'}`);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'tool_response',
              callId,
              name,
              response: { error: err.message || 'Internal tool failure' },
            })
          );
        }
      }
    },
    [appendTranscript, onAppointmentCreated]
  );

  // Start Voice Session
  const startSession = useCallback(async () => {
    try {
      setErrorMessage(null);
      setSessionState('listening');
      isSessionActiveRef.current = true;
      appendTranscript('system', 'Starting browser voice session with AI Receptionist...');

      // 1. Request ephemeral session token from server
      const tokenRes = await fetch('/api/voice/session-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!tokenRes.ok) {
        const errJson = await tokenRes.json().catch(() => ({}));
        throw new Error(
          errJson.error || 'Failed to authenticate voice session. Is GEMINI_API_KEY set?'
        );
      }

      // 2. Request user microphone
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
      } catch (micErr: any) {
        throw new Error(`Microphone access denied: ${micErr.message || 'Please allow microphone permissions'}`);
      }

      // 3. Audio Contexts Setup (Input: 16kHz, Output: 24kHz for Gemini Live)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }

      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      outputAudioCtxRef.current = outputCtx;
      if (outputCtx.state === 'suspended') {
        await outputCtx.resume();
      }
      nextStartTimeRef.current = outputCtx.currentTime;

      // 4. WebSocket setup
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[VoiceHook] WebSocket opened to Live API backend');
        appendTranscript('system', 'Connected to Gemini Live. Microphone listening...');
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          // A. Audio chunk from AI model (24kHz PCM)
          if (data.type === 'audio' && data.audio) {
            setSessionState('speaking');
            const float32Samples = base64ToFloat32Pcm(data.audio);
            const volume = calculateRmsVolume(float32Samples);
            setAiVolume(volume);

            if (outputCtx && outputCtx.state !== 'closed') {
              const audioBuffer = outputCtx.createBuffer(1, float32Samples.length, 24000);
              audioBuffer.copyToChannel(float32Samples, 0);

              const sourceNode = outputCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outputCtx.destination);

              // Precise scheduling to prevent overlap or jitter
              const currentTime = outputCtx.currentTime;
              const startTime = Math.max(currentTime, nextStartTimeRef.current);
              sourceNode.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;

              activeSourcesRef.current.push(sourceNode);

              sourceNode.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== sourceNode);
                if (activeSourcesRef.current.length === 0) {
                  setAiVolume(0);
                  if (isSessionActiveRef.current) {
                    setSessionState('listening');
                  }
                }
              };
            }
          }

          // B. Interruption (User interrupted AI speech)
          if (data.type === 'interrupted') {
            console.log('[VoiceHook] User interrupted AI, stopping active playback');
            stopAllPlayback();
            setSessionState('listening');
            appendTranscript('system', '[Barge-in: AI interrupted by user speaking]');
          }

          // C. Transcripts
          if (data.type === 'model_transcript' && data.text) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'ai' && last.id === currentAiTranscriptIdRef.current) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + data.text },
                ];
              } else {
                const now = new Date().toLocaleTimeString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                });
                const newId = `tr-ai-${Date.now()}`;
                currentAiTranscriptIdRef.current = newId;
                return [
                  ...prev,
                  { id: newId, sender: 'ai', text: data.text, timestamp: now },
                ];
              }
            });
          }

          if (data.type === 'user_transcript' && data.text) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'user' && last.id === currentUserTranscriptIdRef.current) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + ' ' + data.text },
                ];
              } else {
                const now = new Date().toLocaleTimeString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                });
                const newId = `tr-usr-${Date.now()}`;
                currentUserTranscriptIdRef.current = newId;
                return [
                  ...prev,
                  { id: newId, sender: 'user', text: data.text, timestamp: now },
                ];
              }
            });
          }

          // D. Status Update
          if (data.type === 'status') {
            setSessionState(data.status);
          }

          // E. Tool Call
          if (data.type === 'tool_call') {
            currentAiTranscriptIdRef.current = null;
            currentUserTranscriptIdRef.current = null;
            await handleToolCall(data.callId, data.name, data.args);
          }

          // F. Session Ended
          if (data.type === 'session_ended') {
            stopSession();
          }

          // G. Error
          if (data.type === 'error') {
            setErrorMessage(data.error || 'Voice session error');
            setSessionState('error');
            appendTranscript('system', `Error: ${data.error}`);
          }
        } catch (msgErr) {
          console.error('[VoiceHook] Message parsing error:', msgErr);
        }
      };

      ws.onerror = (e) => {
        console.error('[VoiceHook] WebSocket error:', e);
        setErrorMessage('Failed to connect to Live Voice Server');
        setSessionState('error');
      };

      ws.onclose = () => {
        console.log('[VoiceHook] WebSocket closed');
        if (isSessionActiveRef.current) {
          stopSession();
        }
      };

      // 5. Connect microphone stream to ScriptProcessor for continuous 16kHz PCM streaming
      const source = inputCtx.createMediaStreamSource(stream);
      const scriptNode = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptNode;

      source.connect(scriptNode);
      scriptNode.connect(inputCtx.destination);

      scriptNode.onaudioprocess = (e) => {
        if (!isSessionActiveRef.current || ws.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputChannelData = e.inputBuffer.getChannelData(0);
        const volume = calculateRmsVolume(inputChannelData);
        setMicVolume(volume);

        // Convert Float32 [-1, 1] to Int16 PCM array buffer and base64
        const int16Buffer = float32ToInt16Pcm(inputChannelData);
        const base64Audio = arrayBufferToBase64(int16Buffer);

        ws.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Audio,
          })
        );
      };
    } catch (err: any) {
      console.error('[VoiceHook] startSession error:', err);
      setErrorMessage(err.message || 'Failed to start voice session');
      setSessionState('error');
      stopSession();
    }
  }, [appendTranscript, handleToolCall, stopAllPlayback, stopSession]);

  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    appendTranscript('user', text);
    wsRef.current.send(JSON.stringify({ type: 'text', text }));
  }, [appendTranscript]);

  const clearTranscript = useCallback(() => {
    setTranscripts([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    sessionState,
    errorMessage,
    transcripts,
    micVolume,
    aiVolume,
    isSessionActive,
    startSession,
    stopSession,
    clearTranscript,
    sendTextMessage,
  };
}
