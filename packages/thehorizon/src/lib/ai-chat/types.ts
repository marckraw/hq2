// Type definitions that mirror the backend database schema
// for local JSON storage during prototyping

// ===== CONVERSATION TYPES =====
export interface Conversation {
  id: string; // Using string for easier generation (uuid-like)
  title: string;
  systemMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== MESSAGE TYPES =====
export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  tool_call_id?: string;
  attachments?: MessageAttachment[];
  createdAt: Date;
}

// Assistant message with tool calls
export interface AssistantMessage extends Message {
  role: "assistant";
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

// ===== ATTACHMENT TYPES =====
export interface Attachment {
  id: string;
  conversationId: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  dataUrl: string; // Base64 or URL
  createdAt: Date;
}

// Simplified attachment for messages
export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

// ===== AGENT EXECUTION TYPES =====
export type ExecutionStatus = "running" | "completed" | "failed";

export interface AgentExecution {
  id: string;
  conversationId: string;
  messageId?: string; // Links to final assistant response
  triggeringMessageId?: string; // Links to user message that triggered execution
  agentType: string;
  status: ExecutionStatus;
  autonomousMode?: boolean;
  totalSteps: number;
  streamToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== AGENT EXECUTION STEP TYPES =====
export type StepType = 
  | "user_message" 
  | "thinking" 
  | "llm_response" 
  | "tool_execution" 
  | "tool_response" 
  | "finished" 
  | "error" 
  | "memory_saved"
  | "search"
  | "fetch"
  | "analyze";

export interface AgentExecutionStep {
  id: string;
  executionId: string;
  stepType: StepType;
  content: string;
  metadata?: Record<string, any>; // Additional data like tool parameters
  stepOrder: number;
  status?: "pending" | "active" | "complete";
  result?: string;
  startTime?: number;
  endTime?: number;
  createdAt: Date;
}

// ===== COMPOSITE TYPES =====
export interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
  attachments: Attachment[];
  executions?: AgentExecution[];
}

export interface ExecutionWithSteps {
  execution: AgentExecution;
  steps: AgentExecutionStep[];
}

// ===== STORAGE TYPES =====
export interface LocalStorageData {
  conversations: Conversation[];
  messages: Message[];
  attachments: Attachment[];
  agentExecutions: AgentExecution[];
  agentExecutionSteps: AgentExecutionStep[];
  version: string; // For future migrations
}

// ===== UTILITY TYPES =====
export interface CreateConversationInput {
  title: string;
  systemMessage?: string;
}

export interface CreateMessageInput {
  conversationId: string;
  role: MessageRole;
  content: string;
  tool_call_id?: string;
  attachments?: MessageAttachment[];
}

export interface CreateAttachmentInput {
  conversationId: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface CreateExecutionInput {
  conversationId: string;
  messageId?: string;
  triggeringMessageId?: string;
  agentType: string;
  status?: ExecutionStatus;
  autonomousMode?: boolean;
}

export interface CreateExecutionStepInput {
  executionId: string;
  stepType: StepType;
  content: string;
  metadata?: Record<string, any>;
  status?: "pending" | "active" | "complete";
  result?: string;
}