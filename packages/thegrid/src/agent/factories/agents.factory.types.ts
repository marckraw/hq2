// Import from our new schema system - using direct imports to avoid circular dependency issues
import { validateChatMessage } from "../../schemas";
import type { ChatMessage, ProgressMessage } from "../../schemas";

import {
  AgentType,
  AgentCapability,
  AgentInput,
  AgentResponse,
  AgentMetadata,
  BaseAgentConfig,
  validateAgentActResponse,
  validateAgentInput,
  validateAgentMetadata,
} from "../../schemas/agent.schemas";

// Re-export types for backward compatibility
export type { ChatMessage, AgentType, AgentCapability, AgentInput, AgentResponse, AgentMetadata, BaseAgentConfig };

// Re-export validation helpers
export { validateAgentActResponse, validateAgentInput, validateAgentMetadata, validateChatMessage };

// Core agent interface that all agents must implement
export interface Agent {
  // Required properties
  readonly id: string;
  readonly type: AgentType;
  readonly availableTools: any[];

  // Required methods
  act: (input: AgentInput) => Promise<AgentResponse>;

  setSendUpdate?: (sendUpdate: (data: ProgressMessage) => Promise<void>) => void;
  sendUpdate: (data: ProgressMessage) => Promise<void>;

  // Optional methods for enhanced functionality
  getMetadata: () => AgentMetadata;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
  validateInput?: (input: AgentInput) => boolean;

  // Health check method
  isHealthy?: () => Promise<boolean>;
}

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
