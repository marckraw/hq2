import {
  Conversation,
  Message,
  Attachment,
  AgentExecution,
  AgentExecutionStep,
  LocalStorageData,
  CreateConversationInput,
  CreateMessageInput,
  CreateAttachmentInput,
  CreateExecutionInput,
  CreateExecutionStepInput,
  ConversationWithMessages,
  ExecutionWithSteps,
  MessageRole,
} from "./types";

const STORAGE_KEY = "hq_ai_chat_data";
const STORAGE_VERSION = "1.0.0";

class LocalStorageService {
  private data: LocalStorageData;

  constructor() {
    this.data = this.loadData();
  }

  // ===== STORAGE MANAGEMENT =====
  private loadData(): LocalStorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return this.reviveDates(parsed);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    }

    // Return default structure
    return {
      conversations: [],
      messages: [],
      attachments: [],
      agentExecutions: [],
      agentExecutionSteps: [],
      version: STORAGE_VERSION,
    };
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }

  private reviveDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj;
    if (typeof obj === "string") {
      // Check if it's a date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.reviveDates(item));
    }
    if (typeof obj === "object") {
      const newObj: any = {};
      for (const key in obj) {
        newObj[key] = this.reviveDates(obj[key]);
      }
      return newObj;
    }
    return obj;
  }

  private generateId(): string {
    // Generate a simple unique ID (in production, use uuid)
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===== CONVERSATION OPERATIONS =====
  createConversation(input: CreateConversationInput): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
      title: input.title,
      systemMessage: input.systemMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.data.conversations.push(conversation);
    this.saveData();
    return conversation;
  }

  updateConversation(id: string, updates: Partial<Conversation>): Conversation | null {
    const index = this.data.conversations.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.data.conversations[index] = {
      ...this.data.conversations[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData();
    return this.data.conversations[index];
  }

  deleteConversation(id: string): boolean {
    const index = this.data.conversations.findIndex(c => c.id === id);
    if (index === -1) return false;

    // Delete conversation and all related data
    this.data.conversations.splice(index, 1);
    this.data.messages = this.data.messages.filter(m => m.conversationId !== id);
    this.data.attachments = this.data.attachments.filter(a => a.conversationId !== id);
    this.data.agentExecutions = this.data.agentExecutions.filter(e => e.conversationId !== id);
    
    // Delete execution steps for deleted executions
    const executionIds = this.data.agentExecutions
      .filter(e => e.conversationId === id)
      .map(e => e.id);
    this.data.agentExecutionSteps = this.data.agentExecutionSteps.filter(
      s => !executionIds.includes(s.executionId)
    );

    this.saveData();
    return true;
  }

  getConversation(id: string): Conversation | null {
    return this.data.conversations.find(c => c.id === id) || null;
  }

  getConversations(): Conversation[] {
    // Return sorted by most recent first
    return [...this.data.conversations].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  getConversationWithMessages(id: string): ConversationWithMessages | null {
    const conversation = this.getConversation(id);
    if (!conversation) return null;

    const messages = this.getMessages(id);
    const attachments = this.getAttachments(id);
    const executions = this.getExecutions(id);

    return {
      conversation,
      messages,
      attachments,
      executions,
    };
  }

  // ===== MESSAGE OPERATIONS =====
  addMessage(input: CreateMessageInput): Message {
    const message: Message = {
      id: this.generateId(),
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      tool_call_id: input.tool_call_id,
      attachments: input.attachments,
      createdAt: new Date(),
    };

    this.data.messages.push(message);
    
    // Update conversation's updatedAt
    this.updateConversation(input.conversationId, {});
    
    this.saveData();
    return message;
  }

  getMessages(conversationId: string): Message[] {
    return this.data.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  getMessage(id: string): Message | null {
    return this.data.messages.find(m => m.id === id) || null;
  }

  updateMessage(id: string, updates: Partial<Message>): Message | null {
    const index = this.data.messages.findIndex(m => m.id === id);
    if (index === -1) return null;

    this.data.messages[index] = {
      ...this.data.messages[index],
      ...updates,
    };
    this.saveData();
    return this.data.messages[index];
  }

  deleteMessage(id: string): boolean {
    const index = this.data.messages.findIndex(m => m.id === id);
    if (index === -1) return false;

    this.data.messages.splice(index, 1);
    this.saveData();
    return true;
  }

  // ===== ATTACHMENT OPERATIONS =====
  addAttachment(input: CreateAttachmentInput): Attachment {
    const attachment: Attachment = {
      id: this.generateId(),
      conversationId: input.conversationId,
      name: input.name,
      type: input.type,
      size: input.size,
      dataUrl: input.dataUrl,
      createdAt: new Date(),
    };

    this.data.attachments.push(attachment);
    this.saveData();
    return attachment;
  }

  getAttachments(conversationId: string): Attachment[] {
    return this.data.attachments
      .filter(a => a.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  deleteAttachment(id: string): boolean {
    const index = this.data.attachments.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.data.attachments.splice(index, 1);
    this.saveData();
    return true;
  }

  // ===== AGENT EXECUTION OPERATIONS =====
  createExecution(input: CreateExecutionInput): AgentExecution {
    const execution: AgentExecution = {
      id: this.generateId(),
      conversationId: input.conversationId,
      messageId: input.messageId,
      triggeringMessageId: input.triggeringMessageId,
      agentType: input.agentType,
      status: input.status || "running",
      autonomousMode: input.autonomousMode || false,
      totalSteps: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.data.agentExecutions.push(execution);
    this.saveData();
    return execution;
  }

  updateExecution(id: string, updates: Partial<AgentExecution>): AgentExecution | null {
    const index = this.data.agentExecutions.findIndex(e => e.id === id);
    if (index === -1) return null;

    this.data.agentExecutions[index] = {
      ...this.data.agentExecutions[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData();
    return this.data.agentExecutions[index];
  }

  getExecutions(conversationId: string): AgentExecution[] {
    return this.data.agentExecutions
      .filter(e => e.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  getExecution(id: string): AgentExecution | null {
    return this.data.agentExecutions.find(e => e.id === id) || null;
  }

  getExecutionWithSteps(id: string): ExecutionWithSteps | null {
    const execution = this.getExecution(id);
    if (!execution) return null;

    const steps = this.getExecutionSteps(id);
    return {
      execution,
      steps,
    };
  }

  // ===== AGENT EXECUTION STEP OPERATIONS =====
  addExecutionStep(input: CreateExecutionStepInput): AgentExecutionStep {
    const execution = this.getExecution(input.executionId);
    if (!execution) {
      throw new Error(`Execution ${input.executionId} not found`);
    }

    const stepOrder = this.data.agentExecutionSteps
      .filter(s => s.executionId === input.executionId)
      .length;

    const step: AgentExecutionStep = {
      id: this.generateId(),
      executionId: input.executionId,
      stepType: input.stepType,
      content: input.content,
      metadata: input.metadata,
      stepOrder,
      status: input.status,
      result: input.result,
      createdAt: new Date(),
    };

    this.data.agentExecutionSteps.push(step);
    
    // Update execution's total steps
    this.updateExecution(input.executionId, {
      totalSteps: stepOrder + 1,
    });

    this.saveData();
    return step;
  }

  updateExecutionStep(id: string, updates: Partial<AgentExecutionStep>): AgentExecutionStep | null {
    const index = this.data.agentExecutionSteps.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.agentExecutionSteps[index] = {
      ...this.data.agentExecutionSteps[index],
      ...updates,
    };
    this.saveData();
    return this.data.agentExecutionSteps[index];
  }

  getExecutionSteps(executionId: string): AgentExecutionStep[] {
    return this.data.agentExecutionSteps
      .filter(s => s.executionId === executionId)
      .sort((a, b) => a.stepOrder - b.stepOrder);
  }

  // ===== UTILITY OPERATIONS =====
  clearAll(): void {
    this.data = {
      conversations: [],
      messages: [],
      attachments: [],
      agentExecutions: [],
      agentExecutionSteps: [],
      version: STORAGE_VERSION,
    };
    this.saveData();
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      this.data = this.reviveDates(imported);
      this.saveData();
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  // Get statistics
  getStats() {
    return {
      conversations: this.data.conversations.length,
      messages: this.data.messages.length,
      attachments: this.data.attachments.length,
      executions: this.data.agentExecutions.length,
      steps: this.data.agentExecutionSteps.length,
    };
  }
}

// Create singleton instance
export const localStorageService = new LocalStorageService();

// Export for convenience
export default localStorageService;