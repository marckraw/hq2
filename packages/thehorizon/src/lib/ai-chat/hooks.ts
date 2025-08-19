import { useState, useEffect, useCallback, useMemo } from "react";
import localStorageService from "./localStorage-service";
import {
  Conversation,
  Message,
  Attachment,
  AgentExecution,
  AgentExecutionStep,
  ConversationWithMessages,
  CreateMessageInput,
  CreateAttachmentInput,
  CreateExecutionInput,
  CreateExecutionStepInput,
  MessageAttachment,
} from "./types";

// ===== CONVERSATIONS HOOK =====
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = () => {
      const data = localStorageService.getConversations();
      setConversations(data);
      setLoading(false);
    };
    loadConversations();
  }, []);

  const createConversation = useCallback((title: string, systemMessage?: string) => {
    const conversation = localStorageService.createConversation({
      title,
      systemMessage,
    });
    setConversations(prev => [conversation, ...prev]);
    return conversation;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    const success = localStorageService.deleteConversation(id);
    if (success) {
      setConversations(prev => prev.filter(c => c.id !== id));
    }
    return success;
  }, []);

  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    const updated = localStorageService.updateConversation(id, updates);
    if (updated) {
      setConversations(prev => prev.map(c => c.id === id ? updated : c));
    }
    return updated;
  }, []);

  return {
    conversations,
    loading,
    createConversation,
    deleteConversation,
    updateConversation,
  };
}

// ===== SINGLE CONVERSATION HOOK =====
export function useConversation(conversationId: string | null) {
  const [conversation, setConversation] = useState<ConversationWithMessages | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversation data
  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setAttachments([]);
      setExecutions([]);
      setLoading(false);
      return;
    }

    const loadConversation = () => {
      const data = localStorageService.getConversationWithMessages(conversationId);
      if (data) {
        setConversation(data);
        setMessages(data.messages);
        setAttachments(data.attachments);
        setExecutions(data.executions || []);
      }
      setLoading(false);
    };
    loadConversation();
  }, [conversationId]);

  const addMessage = useCallback((
    role: Message["role"],
    content: string,
    attachments?: MessageAttachment[]
  ) => {
    if (!conversationId) return null;

    const message = localStorageService.addMessage({
      conversationId,
      role,
      content,
      attachments,
    });
    setMessages(prev => [...prev, message]);
    return message;
  }, [conversationId]);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    const updated = localStorageService.updateMessage(id, updates);
    if (updated) {
      setMessages(prev => prev.map(m => m.id === id ? updated : m));
    }
    return updated;
  }, []);

  const addAttachment = useCallback((input: Omit<CreateAttachmentInput, "conversationId">) => {
    if (!conversationId) return null;

    const attachment = localStorageService.addAttachment({
      ...input,
      conversationId,
    });
    setAttachments(prev => [...prev, attachment]);
    return attachment;
  }, [conversationId]);

  const removeAttachment = useCallback((id: string) => {
    const success = localStorageService.deleteAttachment(id);
    if (success) {
      setAttachments(prev => prev.filter(a => a.id !== id));
    }
    return success;
  }, []);

  const createExecution = useCallback((
    agentType: string,
    triggeringMessageId?: string
  ) => {
    if (!conversationId) return null;

    const execution = localStorageService.createExecution({
      conversationId,
      agentType,
      triggeringMessageId,
    });
    setExecutions(prev => [...prev, execution]);
    return execution;
  }, [conversationId]);

  const updateExecution = useCallback((id: string, updates: Partial<AgentExecution>) => {
    const updated = localStorageService.updateExecution(id, updates);
    if (updated) {
      setExecutions(prev => prev.map(e => e.id === id ? updated : e));
    }
    return updated;
  }, []);

  const addExecutionStep = useCallback((input: CreateExecutionStepInput) => {
    return localStorageService.addExecutionStep(input);
  }, []);

  const updateExecutionStep = useCallback((
    id: string,
    updates: Partial<AgentExecutionStep>
  ) => {
    return localStorageService.updateExecutionStep(id, updates);
  }, []);

  const getExecutionSteps = useCallback((executionId: string) => {
    return localStorageService.getExecutionSteps(executionId);
  }, []);

  return {
    conversation,
    messages,
    attachments,
    executions,
    loading,
    addMessage,
    updateMessage,
    addAttachment,
    removeAttachment,
    createExecution,
    updateExecution,
    addExecutionStep,
    updateExecutionStep,
    getExecutionSteps,
  };
}

// ===== GENERIC LOCAL STORAGE HOOK =====
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// ===== CURRENT CONVERSATION HOOK =====
// Tracks the currently active conversation ID
export function useCurrentConversation() {
  const [currentId, setCurrentId] = useLocalStorage<string | null>(
    "hq_current_conversation",
    null
  );

  const conversation = useConversation(currentId);

  const setCurrentConversation = useCallback((id: string | null) => {
    setCurrentId(id);
  }, [setCurrentId]);

  const createAndSetConversation = useCallback((title: string, systemMessage?: string) => {
    const newConversation = localStorageService.createConversation({
      title,
      systemMessage,
    });
    setCurrentId(newConversation.id);
    return newConversation;
  }, [setCurrentId]);

  return {
    ...conversation,
    currentId,
    setCurrentConversation,
    createAndSetConversation,
  };
}

// ===== DATA MANAGEMENT HOOK =====
export function useDataManagement() {
  const clearAll = useCallback(() => {
    localStorageService.clearAll();
    window.location.reload(); // Refresh to reset all state
  }, []);

  const exportData = useCallback(() => {
    const data = localStorageService.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hq-ai-chat-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const success = localStorageService.importData(text);
        if (success) {
          window.location.reload(); // Refresh to load new data
        }
        resolve(success);
      };
      reader.readAsText(file);
    });
  }, []);

  const stats = useMemo(() => {
    return localStorageService.getStats();
  }, []);

  return {
    clearAll,
    exportData,
    importData,
    stats,
  };
}