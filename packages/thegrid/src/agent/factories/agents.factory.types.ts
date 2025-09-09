import { type AgentType, type AgentMetadata, type Agent, type AgentResponse } from "@mrck-labs/grid-core";

// Define AgentCapability locally since it's not exported from grid-core
export type AgentCapability = string;

import { validateAgentActResponse, validateAgentInput, validateAgentMetadata } from "../../schemas/agent.schemas";
import { validateChatMessage } from "../../schemas";

// Core agent interface that all agents must implement

// Factory interface for creating agents
export interface AgentFactory {
  createAgent: (type: AgentType) => Promise<Agent>;
  getSupportedTypes: () => AgentType[];
  getAgentMetadata: (type: AgentType) => AgentMetadata | null;
  getAllAgentMetadata: () => AgentMetadata[];
}

// Error types for better error handling
export class AgentError extends Error {
  constructor(
    message: string,
    public agentType: AgentType,
    public agentId: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "AgentError";
  }
}

export class AgentInitializationError extends AgentError {
  constructor(agentType: AgentType, agentId: string, originalError?: Error) {
    super(`Failed to initialize agent ${agentType}:${agentId}`, agentType, agentId, originalError);
    this.name = "AgentInitializationError";
  }
}

export class AgentExecutionError extends AgentError {
  constructor(agentType: AgentType, agentId: string, originalError?: Error) {
    super(`Agent execution failed for ${agentType}:${agentId}`, agentType, agentId, originalError);
    this.name = "AgentExecutionError";
  }
}

// Re-export core types from grid-core
export type { Agent, AgentType, AgentMetadata, AgentResponse };

// Re-export validation helpers

export { validateAgentActResponse, validateAgentInput, validateAgentMetadata, validateChatMessage };
