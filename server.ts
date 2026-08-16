import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// Server-side health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CLINICFIRST Reception Engine',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
    timezone: 'Asia/Kolkata',
  });
});

// Ephemeral Voice Session Token Generation
// Generates a short-lived token ticket for browser voice session authentication
app.post('/api/voice/session-token', (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please add it to your environment secrets.',
      code: 'MISSING_API_KEY',
    });
  }

  const sessionTicket = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return res.json({
    token: sessionTicket,
    expiresIn: 3600,
    model: 'gemini-3.1-flash-live-preview',
    sampleRateIn: 16000,
    sampleRateOut: 24000,
    voice: 'Zephyr',
  });
});

async function startServer() {
  const server = http.createServer(app);

  // WebSocket Server for Live Voice Stream
  const wss = new WebSocketServer({ server, path: '/api/live-ws' });

  wss.on('connection', async (clientWs: WebSocket, req) => {
    console.log('[LiveWS] Client connected to Voice AI Receptionist');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          error: 'GEMINI_API_KEY is missing on the server. Please configure it in your Settings > Secrets.',
        })
      );
      clientWs.close();
      return;
    }

    let session: any = null;

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Get current date context in IST
      const nowIST = new Date();
      const istDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(nowIST);

      const systemInstruction = `You are CLINICFIRST's AI Receptionist for Indian clinics and OPD practices.
You help patients and clinic staff schedule, check availability for, and book doctor appointments through natural voice conversation.
The clinic is located in India (Timezone: Asia/Kolkata, IST).
Today's Date in IST is: ${istDateStr}.

LANGUAGE UNDERSTANDING & COMMUNICATION:
- You natively understand and communicate in English, Hindi, and Hinglish (e.g. "Dr Sharma se kal 4 baje appointment chahiye", "Dr Sharma ka appointment book karna hai", "Is Dr. Priya available tomorrow at 10 AM?").
- Respond concisely, warmly, and clearly in the language or mix of English/Hindi matching the caller.
- Keep responses compact (1-2 sentences) because this is a real-time voice call.

CRITICAL OPERATIONAL RULES:
1. The database is the ONLY source of truth.
2. NEVER invent doctors, operating hours, or slot availability.
3. Always use getDoctors() to know the valid doctors in the clinic.
4. When a caller requests an appointment with a doctor for a specific date or time:
   - FIRST call getAvailableSlots(doctorId, date) to fetch verified real slots.
   - If the requested time is available, state: "[Doctor Name] is available [Date/Tomorrow] at [Time]. Would you like me to book it?"
   - If the requested time is unavailable or outside shift hours, state that the time is not available and offer 2-3 genuinely available slots from getAvailableSlots.
5. NEVER book an appointment without explicit confirmation from the caller ("Yes", "Sure", "Haan book kar do", "Confirm").
6. When the caller confirms:
   - Ask for the patient's name and phone number if not already provided.
   - Once name and phone are given, immediately call createAppointment(doctorId, patientName, patientPhone, date, startTime).
   - ONLY confirm the booking to the caller after createAppointment returns success: true.
7. If createAppointment fails (e.g., slot was taken or validation error), inform the caller clearly and offer another open slot.
8. MEDICAL ADVICE RESTRICTION:
   - Do NOT provide medical diagnosis, treatment advice, or prescriptions.
   - If asked a medical or clinical health question, politely state: "CLINICFIRST handles appointment scheduling and clinic reception. For medical advice or diagnosis, please consult the doctor directly during your appointment."
`;

      session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction,
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'getDoctors',
                  description: 'Fetch the list of active doctors, their IDs, specialties, and clinic details.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {},
                  },
                },
                {
                  name: 'getAvailableSlots',
                  description: 'Fetch all genuine available and booked time slots for a specific doctor on a given date (YYYY-MM-DD).',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      doctorId: {
                        type: Type.STRING,
                        description: 'The unique doctor ID (e.g. "doc-sharma-001" or "doc-patel-002")',
                      },
                      date: {
                        type: Type.STRING,
                        description: 'The target date in YYYY-MM-DD format (e.g. "2026-08-17")',
                      },
                    },
                    required: ['doctorId', 'date'],
                  },
                },
                {
                  name: 'createAppointment',
                  description: 'Create and confirm a new appointment in the clinic system after explicit patient confirmation. Returns confirmation details.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      doctorId: {
                        type: Type.STRING,
                        description: 'The doctor ID',
                      },
                      patientName: {
                        type: Type.STRING,
                        description: 'Full name of the patient',
                      },
                      patientPhone: {
                        type: Type.STRING,
                        description: 'Patient 10-digit mobile number or international phone string',
                      },
                      date: {
                        type: Type.STRING,
                        description: 'Appointment date in YYYY-MM-DD format',
                      },
                      startTime: {
                        type: Type.STRING,
                        description: 'Start time of the appointment slot (e.g. "16:00" or "4:00 PM")',
                      },
                    },
                    required: ['doctorId', 'patientName', 'patientPhone', 'date', 'startTime'],
                  },
                },
                {
                  name: 'cancelAppointment',
                  description: 'Cancel an existing appointment by ID and immediately release its slot.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      appointmentId: {
                        type: Type.STRING,
                        description: 'The appointment ID to cancel',
                      },
                    },
                    required: ['appointmentId'],
                  },
                },
              ],
            },
          ],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onmessage: async (message: LiveServerMessage) => {
            try {
              // 1. Audio stream chunk from model
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts && parts.length > 0) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'audio',
                        audio: part.inlineData.data,
                      })
                    );
                  }
                  if (part.text) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'model_transcript',
                        text: part.text,
                      })
                    );
                  }
                }
              }

              // 2. Interruption signal (Barge-in detected)
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: 'interrupted' }));
              }

              // 3. User Speech Transcription
              const userTurn = (message.serverContent as any)?.userTurn;
              if (userTurn?.parts) {
                for (const p of userTurn.parts) {
                  if (p.text) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'user_transcript',
                        text: p.text,
                      })
                    );
                  }
                }
              }

              // 4. Tool Calls requested by Gemini Live
              if (message.toolCall?.functionCalls && message.toolCall.functionCalls.length > 0) {
                clientWs.send(
                  JSON.stringify({
                    type: 'status',
                    status: 'processing',
                  })
                );

                for (const call of message.toolCall.functionCalls) {
                  console.log('[LiveWS] Tool Call received:', call.name, call.args);

                  // Forward tool call request to client to execute against authoritative storage
                  clientWs.send(
                    JSON.stringify({
                      type: 'tool_call',
                      callId: call.id,
                      name: call.name,
                      args: call.args,
                    })
                  );
                }
              }
            } catch (err) {
              console.error('[LiveWS] Error in onmessage callback:', err);
            }
          },
          onclose: () => {
            console.log('[LiveWS] Gemini Live session closed');
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'session_ended' }));
            }
          },
          onerror: (err: any) => {
            console.error('[LiveWS] Gemini Live session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  error: err?.message || 'Gemini Live encountered an error',
                })
              );
            }
          },
        },
      });

      console.log('[LiveWS] Gemini Live session successfully established');
      clientWs.send(JSON.stringify({ type: 'session_started' }));

      // Handle messages from client
      clientWs.on('message', async (data: Buffer | string) => {
        try {
          const parsed = JSON.parse(data.toString());

          // A. Audio chunk from user microphone (16kHz PCM Int16 base64)
          if (parsed.type === 'audio' && parsed.audio && session) {
            session.sendRealtimeInput({
              audio: {
                data: parsed.audio,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          }

          // B. Tool response from client after executing localDb / Supabase
          if (parsed.type === 'tool_response' && session) {
            console.log('[LiveWS] Sending tool response back to Gemini Live:', parsed.name);
            session.sendToolResponse({
              functionResponses: [
                {
                  id: parsed.callId,
                  name: parsed.name,
                  response: { output: parsed.response },
                },
              ],
            });
          }

          // C. Text message injection (optional / fallback)
          if (parsed.type === 'text' && parsed.text && session) {
            session.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (err) {
          console.error('[LiveWS] Error parsing client message:', err);
        }
      });

      clientWs.on('close', () => {
        console.log('[LiveWS] Client disconnected');
        if (session) {
          try {
            session.close();
          } catch {}
        }
      });
    } catch (err: any) {
      console.error('[LiveWS] Failed to connect to Gemini Live:', err);
      clientWs.send(
        JSON.stringify({
          type: 'error',
          error: err?.message || 'Failed to establish Gemini Live connection',
        })
      );
      clientWs.close();
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] CLINICFIRST backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
