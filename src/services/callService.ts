import {
  CallRecord,
  CallStatus,
  CallFilter,
  CallMetrics,
  TranscriptMessage,
  AIAgent,
  Contact,
} from '../types/database';
import { StorageAdapter } from './storageAdapter';
import { getAgentById } from './agentService';
import { getContactById, validatePhoneNumber } from './contactService';
import { getTelephonyProvider, TelephonyProvider } from './telephonyProvider';

export interface StartCallInput {
  workspaceId: string;
  agentId: string;
  contactId: string;
  customPhoneNumber?: string;
  forceFailMode?: boolean;
  failReason?: string;
  providerType?: 'mock' | 'real';
  onStatusChange?: (status: CallStatus, failureReason?: string) => void;
  onTranscriptMessage?: (msg: TranscriptMessage) => void;
  onCallEnded?: (call: CallRecord) => void;
}

export interface ActiveCallHandle {
  callId: string;
  providerCallId: string;
  endCall: () => Promise<boolean>;
  cancelCall: () => Promise<boolean>;
}

// Active in-memory provider handles map
const runningCallHandles = new Map<
  string,
  {
    provider: TelephonyProvider;
    providerCallId: string;
  }
>();

export async function startCall(input: StartCallInput): Promise<{ call: CallRecord; handle: ActiveCallHandle }> {
  // 1. Validate Workspace
  if (!input.workspaceId) {
    throw new Error('MISSING_WORKSPACE: Active workspace is required to initiate a call.');
  }

  // 2. Validate Agent
  const agent = await getAgentById(input.agentId, input.workspaceId);
  if (!agent) {
    throw new Error('MISSING_AGENT: Selected AI agent was not found.');
  }
  if (!agent.active) {
    throw new Error(`INACTIVE_AGENT: Agent "${agent.name}" is currently inactive. Please activate the agent before starting calls.`);
  }

  // 3. Validate Contact
  const contact = await getContactById(input.contactId, input.workspaceId);
  if (!contact) {
    throw new Error('MISSING_CONTACT: Selected contact was not found in this workspace.');
  }

  const targetPhone = input.customPhoneNumber || contact.phone;
  const phoneCheck = validatePhoneNumber(targetPhone);
  if (!phoneCheck.valid) {
    throw new Error(`INVALID_PHONE: ${phoneCheck.error}`);
  }

  // 4. Create initial Call Record in QUEUED status
  const now = new Date().toISOString();
  const initialCall = await StorageAdapter.createCallRecord({
    workspace_id: input.workspaceId,
    agent_id: agent.id,
    contact_id: contact.id,
    phone_number: phoneCheck.cleanPhone!,
    status: 'QUEUED',
    started_at: now,
    duration: 0,
    provider_call_id: `pending-${Date.now()}`,
    transcript: [],
  });

  const provider = getTelephonyProvider(input.providerType || 'mock');

  // 5. Trigger Telephony Provider Layer
  try {
    const { providerCallId } = await provider.initiateCall({
      callId: initialCall.id,
      workspaceId: input.workspaceId,
      agent,
      contact,
      phoneNumber: phoneCheck.cleanPhone!,
      forceFailMode: input.forceFailMode,
      failReason: input.failReason,
      onStatusChange: async (status: CallStatus, failureReason?: string) => {
        const updates: Partial<CallRecord> = { status };
        if (status === 'CONNECTED') {
          updates.connected_at = new Date().toISOString();
        }
        if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
          updates.ended_at = new Date().toISOString();
        }
        if (failureReason) {
          updates.failure_reason = failureReason;
        }

        await StorageAdapter.updateCallRecord(initialCall.id, updates);
        input.onStatusChange?.(status, failureReason);
      },
      onTranscriptMessage: async (msg: TranscriptMessage) => {
        const currentCall = await StorageAdapter.getCallById(initialCall.id);
        const updatedTranscript = [...(currentCall?.transcript || []), msg];
        await StorageAdapter.updateCallRecord(initialCall.id, { transcript: updatedTranscript });
        input.onTranscriptMessage?.(msg);
      },
      onCallEnded: async ({ duration, transcript, summary, failureReason }) => {
        runningCallHandles.delete(initialCall.id);
        const finalCall = await StorageAdapter.updateCallRecord(initialCall.id, {
          duration,
          transcript,
          summary,
          failure_reason: failureReason,
          ended_at: new Date().toISOString(),
        });
        input.onCallEnded?.(finalCall);
      },
    });

    // Update with real provider ID
    await StorageAdapter.updateCallRecord(initialCall.id, { provider_call_id: providerCallId });

    const handle: ActiveCallHandle = {
      callId: initialCall.id,
      providerCallId,
      endCall: async () => {
        const res = await provider.endCall(providerCallId);
        runningCallHandles.delete(initialCall.id);
        return res;
      },
      cancelCall: async () => {
        const res = await provider.cancelCall(providerCallId);
        runningCallHandles.delete(initialCall.id);
        return res;
      },
    };

    runningCallHandles.set(initialCall.id, { provider, providerCallId });

    return { call: initialCall, handle };
  } catch (err: any) {
    // If telephony provider fails immediately
    const failedCall = await StorageAdapter.updateCallRecord(initialCall.id, {
      status: 'FAILED',
      failure_reason: err?.message || 'Telephony provider gateway rejected call request.',
      ended_at: new Date().toISOString(),
    });
    throw new Error(`TELEPHONY_ERROR: ${failedCall.failure_reason}`);
  }
}

export async function endActiveCall(callId: string): Promise<boolean> {
  const active = runningCallHandles.get(callId);
  if (active) {
    return active.provider.endCall(active.providerCallId);
  }
  // If not in memory, just update DB status
  await StorageAdapter.updateCallRecord(callId, {
    status: 'COMPLETED',
    ended_at: new Date().toISOString(),
  });
  return true;
}

export async function cancelActiveCall(callId: string): Promise<boolean> {
  const active = runningCallHandles.get(callId);
  if (active) {
    return active.provider.cancelCall(active.providerCallId);
  }
  await StorageAdapter.updateCallRecord(callId, {
    status: 'CANCELLED',
    failure_reason: 'Call cancelled before connection.',
    ended_at: new Date().toISOString(),
  });
  return true;
}

export async function getCallRecords(filter?: CallFilter): Promise<CallRecord[]> {
  return StorageAdapter.getCalls(filter);
}

export async function getCallById(callId: string, expectedWorkspaceId?: string): Promise<CallRecord | null> {
  const call = await StorageAdapter.getCallById(callId);
  if (!call) return null;

  if (expectedWorkspaceId && call.workspace_id !== expectedWorkspaceId) {
    throw new Error(`UNAUTHORIZED_ACCESS: Call record does not belong to the active workspace (${expectedWorkspaceId}).`);
  }

  return call;
}

export async function getCallMetrics(workspaceId?: string): Promise<CallMetrics> {
  return StorageAdapter.getCallMetrics(workspaceId);
}
