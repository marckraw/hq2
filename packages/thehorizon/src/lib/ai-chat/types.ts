// AI Chat types based on the current implementation

export interface Conversation {
  id: string;
  title?: string;
  preview?: string;
  createdAt: string;
  updatedAt?: string;
  messageCount?: number;
  isPinned?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  updatedAt?: string;
  conversationId?: string;
  error?: string;
  isStreaming?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video';
  size?: number;
  url?: string;
  dataUrl?: string;
}

export interface ExecutionTimeline {
  id: string;
  messageId: string;
  type: 'thinking' | 'search' | 'fetch' | 'analyze' | 'tool_execution' | 'complete';
  content?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  metadata?: {
    tokens?: number;
    confidence?: number;
    source?: string;
  };
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  parameters?: any;
  result?: any;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

export interface Timeline {
  conversationId: string;
  messages: Message[];
  executions?: ExecutionTimeline[];
}