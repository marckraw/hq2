import type { ProgressMessage } from "@/schemas/stream.schemas";

// Message handler function type
export type MessageHandler = (payload: ProgressMessage) => void;

// Context for message handlers
interface MessageHandlerContext {
  setMessages: (
    updater: (prev: ProgressMessage[]) => ProgressMessage[]
  ) => void;
  setIsLoading: (loading: boolean) => void;
  closeEventSource: () => void;
  onMessageReceived?: (message: ProgressMessage) => void;
  onStreamFinished?: (finalMessage?: ProgressMessage) => void;
  onError?: (error: ProgressMessage) => void;
}

const createMessageHandlers = () => {
  /**
   * Create a message handler registry with context
   */
  const createHandlerRegistry = (context: MessageHandlerContext) => {
    // Handler implementations
    const handlers: Record<string, MessageHandler> = {
      finished: (payload: ProgressMessage) => {
        context.closeEventSource();
        context.setIsLoading(false);
        context.onStreamFinished?.(payload);
      },

      error: (payload: ProgressMessage) => {
        context.setIsLoading(false);

        // Check if it's a retry error or final error
        const isRetrying = payload.metadata?.retryAttempt;
        const maxRetriesReached = payload.metadata?.maxRetriesReached;

        if (maxRetriesReached) {
          context.closeEventSource();
          context.onError?.(payload);
        } else if (!isRetrying) {
          // Non-retry error, close stream
          context.closeEventSource();
          context.onError?.(payload);
        }
        // For retry errors, keep the stream open and let recovery handle it
      },

      llm_response: (payload: ProgressMessage) => {
        // Handle streaming text response
        context.onMessageReceived?.(payload);
      },

      thinking: (payload: ProgressMessage) => {
        // Show thinking indicator
        context.onMessageReceived?.(payload);
      },

      tool_execution: (payload: ProgressMessage) => {
        // Show tool execution progress
        context.onMessageReceived?.(payload);
      },

      tool_response: (payload: ProgressMessage) => {
        // Show tool response
        context.onMessageReceived?.(payload);
      },

      user_message: (payload: ProgressMessage) => {
        // Handle user message echo
        context.onMessageReceived?.(payload);
      },

      memory_saved: (payload: ProgressMessage) => {
        // Handle memory save notifications
        context.onMessageReceived?.(payload);
      },
    };

    // Main message processor
    const processMessage = (event: MessageEvent) => {
      try {
        const payload: ProgressMessage = JSON.parse(event.data);

        // Always add to messages array
        context.setMessages((prev) => [...prev, payload]);

        // Execute specific handler if available
        const handler = handlers[payload.type];
        if (handler) {
          handler(payload);
        } else {
          // Fallback for unknown message types
          console.warn(`Unknown message type: ${payload.type}`, payload);
          context.onMessageReceived?.(payload);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
        context.onError?.({
          type: "error",
          content: "Failed to parse server message",
          metadata: { error: true, parseError: true },
        });
      }
    };

    // Register a custom handler
    const addHandler = (messageType: string, handler: MessageHandler) => {
      handlers[messageType] = handler;
    };

    // Remove a handler
    const removeHandler = (messageType: string) => {
      delete handlers[messageType];
    };

    // Get all registered handlers
    const getHandlers = () => ({ ...handlers });

    return {
      processMessage,
      addHandler,
      removeHandler,
      getHandlers,
    };
  };

  /**
   * Create a simple event source wrapper with recovery
   */
  const createEventSourceManager = (
    streamUrl: string,
    context: MessageHandlerContext,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      onRetry?: (attempt: number) => void;
    } = {}
  ) => {
    const { maxRetries = 3, retryDelay = 2000, onRetry } = options;
    let eventSource: EventSource | null = null;
    let retryAttempts = 0;
    let isManuallyClosing = false;

    const handlers = createHandlerRegistry(context);

    const connect = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = handlers.processMessage;

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);

        if (!isManuallyClosing && retryAttempts < maxRetries) {
          retryAttempts++;
          onRetry?.(retryAttempts);

          context.setMessages((prev) => [
            ...prev,
            {
              type: "error",
              content: `Connection lost. Retrying... (${retryAttempts}/${maxRetries})`,
              metadata: {
                error: true,
                retryAttempt: retryAttempts,
                maxRetries,
              },
            },
          ]);

          setTimeout(() => {
            if (!isManuallyClosing) {
              connect();
            }
          }, retryDelay);
        } else {
          context.setIsLoading(false);
          if (!isManuallyClosing) {
            context.onError?.({
              type: "error",
              content: "Connection failed after multiple attempts",
              metadata: { error: true, maxRetriesReached: true },
            });
          }
        }
      };

      eventSource.onopen = () => {
        retryAttempts = 0; // Reset retry counter on successful connection
      };
    };

    const close = () => {
      isManuallyClosing = true;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };

    const getReadyState = () => eventSource?.readyState;

    const getRetryAttempts = () => retryAttempts;

    // Enhanced context with close function
    const enhancedContext = {
      ...context,
      closeEventSource: close,
    };

    // Update handlers with enhanced context
    const enhancedHandlers = createHandlerRegistry(enhancedContext);

    // Update event source to use enhanced handlers
    const reconnect = () => {
      if (eventSource) {
        eventSource.onmessage = enhancedHandlers.processMessage;
      }
    };

    return {
      connect,
      close,
      getReadyState,
      getRetryAttempts,
      addHandler: enhancedHandlers.addHandler,
      removeHandler: enhancedHandlers.removeHandler,
      getHandlers: enhancedHandlers.getHandlers,
    };
  };

  /**
   * Utility to create typed message validators
   */
  const createMessageValidators = () => {
    const isFinishedMessage = (msg: ProgressMessage): boolean =>
      msg.type === "finished";
    const isErrorMessage = (msg: ProgressMessage): boolean =>
      msg.type === "error";
    const isLLMResponse = (msg: ProgressMessage): boolean =>
      msg.type === "llm_response";
    const isToolExecution = (msg: ProgressMessage): boolean =>
      msg.type === "tool_execution";
    const isThinking = (msg: ProgressMessage): boolean =>
      msg.type === "thinking";
    const isMemorySaved = (msg: ProgressMessage): boolean =>
      msg.type === "memory_saved";

    return {
      isFinishedMessage,
      isErrorMessage,
      isLLMResponse,
      isToolExecution,
      isThinking,
      isMemorySaved,
    };
  };

  return {
    createHandlerRegistry,
    createEventSourceManager,
    createMessageValidators,
  };
};

export const messageHandlers = createMessageHandlers();
