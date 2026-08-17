import { AIAgent, Contact, CallStatus, TranscriptMessage } from '../types/database';

export interface InitiateCallParams {
  callId: string;
  workspaceId: string;
  agent: AIAgent;
  contact: Contact;
  phoneNumber: string;
  forceFailMode?: boolean;
  failReason?: string;
  onStatusChange: (status: CallStatus, failureReason?: string) => void;
  onTranscriptMessage: (msg: TranscriptMessage) => void;
  onCallEnded: (result: {
    duration: number;
    transcript: TranscriptMessage[];
    summary: string;
    failureReason?: string;
  }) => void;
}

export interface TelephonyProvider {
  id: string;
  name: string;
  isMock: boolean;
  initiateCall(params: InitiateCallParams): Promise<{ providerCallId: string }>;
  endCall(providerCallId: string): Promise<boolean>;
  cancelCall(providerCallId: string): Promise<boolean>;
}

/**
 * Mock Telephony Provider
 * Simulates realistic carrier events, audio ringing, conversational turns, and call wrap-up
 */
export class MockTelephonyProvider implements TelephonyProvider {
  id = 'mock-telephony-adapter';
  name = 'Simulated Carrier Telephony Network';
  isMock = true;

  private activeSessions = new Map<
    string,
    {
      params: InitiateCallParams;
      timerIds: NodeJS.Timeout[];
      intervalId?: NodeJS.Timeout;
      startTime: number;
      connectTime?: number;
      transcript: TranscriptMessage[];
      ended: boolean;
    }
  >();

  async initiateCall(params: InitiateCallParams): Promise<{ providerCallId: string }> {
    const providerCallId = `prov-sim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timerIds: NodeJS.Timeout[] = [];
    const transcript: TranscriptMessage[] = [];
    const startTime = Date.now();

    const session = {
      params,
      timerIds,
      intervalId: undefined as NodeJS.Timeout | undefined,
      startTime,
      connectTime: undefined as number | undefined,
      transcript,
      ended: false,
    };

    this.activeSessions.set(providerCallId, session);

    // Initial status: QUEUED
    params.onStatusChange('QUEUED');
    transcript.push({
      speaker: 'system',
      text: `Call queued on provider gateway for ${params.phoneNumber} with ${params.agent.name}`,
      timestamp: '00:00',
    });
    params.onTranscriptMessage(transcript[0]);

    // Handle Forced Failure Simulation
    if (params.forceFailMode) {
      const failTimer = setTimeout(() => {
        if (session.ended) return;
        session.ended = true;
        const reason = params.failReason || 'Destination line busy / Network unreachable';
        params.onStatusChange('FAILED', reason);
        transcript.push({
          speaker: 'system',
          text: `Carrier error: ${reason}`,
          timestamp: '00:04',
        });
        params.onCallEnded({
          duration: 0,
          transcript,
          summary: `Call attempt failed due to carrier error: ${reason}.`,
          failureReason: reason,
        });
        this.activeSessions.delete(providerCallId);
      }, 1800);
      timerIds.push(failTimer);
      return { providerCallId };
    }

    // Step 1: Transition to RINGING after 800ms
    const ringTimer = setTimeout(() => {
      if (session.ended) return;
      params.onStatusChange('RINGING');
      transcript.push({
        speaker: 'system',
        text: `Ringing destination carrier (+91 / International PBX)...`,
        timestamp: '00:02',
      });
      params.onTranscriptMessage(transcript[transcript.length - 1]);
    }, 800);
    timerIds.push(ringTimer);

    // Step 2: Transition to CONNECTED after 2400ms
    const connectTimer = setTimeout(() => {
      if (session.ended) return;
      session.connectTime = Date.now();
      params.onStatusChange('CONNECTED');

      // First Agent Message (Greeting)
      const greetingMsg: TranscriptMessage = {
        speaker: 'agent',
        text: params.agent.greeting_message || `Hello, this is ${params.agent.name}. How can I help you today?`,
        timestamp: '00:03',
      };
      transcript.push(greetingMsg);
      params.onTranscriptMessage(greetingMsg);

      // Generate dynamic simulated dialogue based on agent context
      this.startSimulatedConversation(providerCallId);
    }, 2400);
    timerIds.push(connectTimer);

    return { providerCallId };
  }

  private startSimulatedConversation(providerCallId: string) {
    const session = this.activeSessions.get(providerCallId);
    if (!session || session.ended) return;

    const { params, transcript, timerIds } = session;
    const contactName = params.contact.name || 'Patient';

    // Dialogue script based on agent persona
    const dialogueTurns: Array<{ delay: number; speaker: 'agent' | 'user'; text: string; timeOffset: string }> = [
      {
        delay: 3500,
        speaker: 'user',
        text: `Hi! Yes, I am ${contactName}. I received a reminder about my upcoming clinic schedule.`,
        timeOffset: '00:08',
      },
      {
        delay: 7000,
        speaker: 'agent',
        text: `Wonderful to speak with you, ${contactName}. I can verify your time slot, help reschedule if needed, or answer questions about your visit.`,
        timeOffset: '00:14',
      },
      {
        delay: 11000,
        speaker: 'user',
        text: `That is great. The current time works well for me. Do I need to bring any previous test reports?`,
        timeOffset: '00:20',
      },
      {
        delay: 15500,
        speaker: 'agent',
        text: `Yes, please bring any previous prescription slips or lab reports. We have marked your appointment as verified. Have a healthy day!`,
        timeOffset: '00:27',
      },
      {
        delay: 18500,
        speaker: 'user',
        text: `Thank you so much. Goodbye!`,
        timeOffset: '00:32',
      },
    ];

    dialogueTurns.forEach((turn) => {
      const t = setTimeout(() => {
        if (session.ended) return;
        const msg: TranscriptMessage = {
          speaker: turn.speaker,
          text: turn.text,
          timestamp: turn.timeOffset,
        };
        transcript.push(msg);
        params.onTranscriptMessage(msg);
      }, turn.delay);
      timerIds.push(t);
    });

    // Auto-complete simulation after full conversation (21 seconds)
    const completionTimer = setTimeout(() => {
      if (session.ended) return;
      this.completeCall(providerCallId);
    }, 21500);
    timerIds.push(completionTimer);
  }

  private completeCall(providerCallId: string) {
    const session = this.activeSessions.get(providerCallId);
    if (!session || session.ended) return;
    session.ended = true;

    // Clear timers
    session.timerIds.forEach((t) => clearTimeout(t));

    const duration = session.connectTime ? Math.max(1, Math.round((Date.now() - session.connectTime) / 1000)) : 22;

    session.params.onStatusChange('COMPLETED');

    const summary = `Call successfully conducted by ${session.params.agent.name} with ${session.params.contact.name}. Patient confirmed scheduled appointment, requested information regarding previous lab reports, and received clear instructions. Overall sentiment: Positive.`;

    session.params.onCallEnded({
      duration,
      transcript: session.transcript,
      summary,
    });

    this.activeSessions.delete(providerCallId);
  }

  async endCall(providerCallId: string): Promise<boolean> {
    const session = this.activeSessions.get(providerCallId);
    if (!session) return false;

    session.timerIds.forEach((t) => clearTimeout(t));
    session.ended = true;

    const duration = session.connectTime ? Math.max(1, Math.round((Date.now() - session.connectTime) / 1000)) : 5;

    session.params.onStatusChange('COMPLETED');
    const summary = `Call ended by user. Duration: ${duration}s. Session completed with ${session.params.contact.name}.`;

    session.params.onCallEnded({
      duration,
      transcript: session.transcript,
      summary,
    });

    this.activeSessions.delete(providerCallId);
    return true;
  }

  async cancelCall(providerCallId: string): Promise<boolean> {
    const session = this.activeSessions.get(providerCallId);
    if (!session) return false;

    session.timerIds.forEach((t) => clearTimeout(t));
    session.ended = true;

    session.params.onStatusChange('CANCELLED', 'Call cancelled by user before connection.');
    session.params.onCallEnded({
      duration: 0,
      transcript: session.transcript,
      summary: 'Call was cancelled before connection.',
      failureReason: 'User cancelled call in queue.',
    });

    this.activeSessions.delete(providerCallId);
    return true;
  }
}

/**
 * Real Telephony Provider (Placeholder / WebSocket Integration Layer)
 * For production Twilio, Telnyx, or direct WebRTC browser-SIP gateways
 */
export class RealTelephonyProvider implements TelephonyProvider {
  id = 'real-telephony-webrtc';
  name = 'Production Voice Gateway (WebRTC / Gemini Live)';
  isMock = false;

  async initiateCall(params: InitiateCallParams): Promise<{ providerCallId: string }> {
    // For live browser testing, forward to mock engine or live voice session
    const mock = new MockTelephonyProvider();
    return mock.initiateCall(params);
  }

  async endCall(providerCallId: string): Promise<boolean> {
    return true;
  }

  async cancelCall(providerCallId: string): Promise<boolean> {
    return true;
  }
}

export const defaultMockProvider = new MockTelephonyProvider();
export const defaultRealProvider = new RealTelephonyProvider();

export function getTelephonyProvider(type: 'mock' | 'real' = 'mock'): TelephonyProvider {
  return type === 'mock' ? defaultMockProvider : defaultRealProvider;
}
