import { AIAgent } from '../types/database';
import { StorageAdapter } from './storageAdapter';

export async function getAgents(workspaceId?: string): Promise<AIAgent[]> {
  return StorageAdapter.getAgents(workspaceId);
}

export async function getAgentById(agentId: string, expectedWorkspaceId?: string): Promise<AIAgent | null> {
  const agent = await StorageAdapter.getAgentById(agentId);
  if (!agent) return null;

  if (expectedWorkspaceId && agent.workspace_id !== expectedWorkspaceId) {
    throw new Error(`UNAUTHORIZED_ACCESS: Agent does not belong to the active workspace (${expectedWorkspaceId}).`);
  }

  return agent;
}

export async function createAgent(
  agentData: Omit<AIAgent, 'id' | 'created_at' | 'updated_at'>
): Promise<AIAgent> {
  if (!agentData.workspace_id) {
    throw new Error('MISSING_WORKSPACE: Cannot create agent without an active workspace ID.');
  }
  if (!agentData.name?.trim()) {
    throw new Error('VALIDATION_ERROR: Agent name is required.');
  }
  if (!agentData.system_prompt?.trim()) {
    throw new Error('VALIDATION_ERROR: System prompt / instructions are required.');
  }
  if (!agentData.greeting_message?.trim()) {
    throw new Error('VALIDATION_ERROR: Initial greeting message is required.');
  }

  return StorageAdapter.createAgent(agentData);
}

export async function updateAgent(
  agentId: string,
  updates: Partial<Omit<AIAgent, 'id' | 'workspace_id' | 'created_at'>>,
  expectedWorkspaceId?: string
): Promise<AIAgent> {
  const agent = await StorageAdapter.getAgentById(agentId);
  if (!agent) {
    throw new Error(`AGENT_NOT_FOUND: Agent with ID ${agentId} not found.`);
  }

  if (expectedWorkspaceId && agent.workspace_id !== expectedWorkspaceId) {
    throw new Error(`UNAUTHORIZED_ACCESS: Agent does not belong to the active workspace (${expectedWorkspaceId}).`);
  }

  return StorageAdapter.updateAgent(agentId, updates);
}

export async function toggleAgentStatus(agentId: string, expectedWorkspaceId?: string): Promise<AIAgent> {
  const agent = await getAgentById(agentId, expectedWorkspaceId);
  if (!agent) {
    throw new Error(`AGENT_NOT_FOUND: Agent with ID ${agentId} not found.`);
  }

  return StorageAdapter.updateAgent(agentId, { active: !agent.active });
}

export async function deleteAgent(agentId: string, expectedWorkspaceId?: string): Promise<boolean> {
  const agent = await getAgentById(agentId, expectedWorkspaceId);
  if (!agent) {
    throw new Error(`AGENT_NOT_FOUND: Agent with ID ${agentId} not found.`);
  }

  return StorageAdapter.deleteAgent(agentId);
}
