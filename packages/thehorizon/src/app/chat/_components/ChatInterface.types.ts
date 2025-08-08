export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "tool";
  timestamp: string;
  metadata?: Record<string, any>;
}

// Timeline types for agentic execution
export interface TimelineMessage {
  type: "message";
  data: Message;
  timestamp: string;
}

export interface TimelineExecutionStep {
  type: "execution_step";
  data: {
    id: number;
    executionId: number;
    stepType: string;
    content: string;
    metadata: any;
    stepOrder: number;
    createdAt: string;
    execution: {
      id: number;
      agentType: string;
      autonomousMode: boolean;
      messageId: number | null;
      triggeringMessageId: number | null;
    };
  };
  timestamp: string;
}

export type TimelineItem = TimelineMessage | TimelineExecutionStep;

export interface ConversationTimeline {
  messages: Message[];
  executions: any[];
  timeline: TimelineItem[];
}
