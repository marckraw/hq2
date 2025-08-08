import type { ConversationContext } from "@mrck-labs/grid-core";

/**
 * Simple closure-based request context manager
 * Provides global access to conversation context without prop drilling
 */
const createRequestContext = () => {
  let currentContext: ConversationContext | null = null;

  return {
    /**
     * Set the current context
     */
    set: (context: ConversationContext) => {
      currentContext = context;
    },

    /**
     * Get the current context (throws if not set)
     */
    get: (): ConversationContext => {
      if (!currentContext) {
        throw new Error(
          "No request context available! " +
          "Make sure you called RequestContext.set() or are inside RequestContext.run()"
        );
      }
      return currentContext;
    },

    /**
     * Try to get context (returns undefined if not set)
     */
    tryGet: (): ConversationContext | undefined => {
      return currentContext ?? undefined;
    },

    /**
     * Clear the current context
     */
    clear: () => {
      currentContext = null;
    },

    /**
     * Check if context is available
     */
    has: (): boolean => {
      return currentContext !== null;
    },

    /**
     * Run a function with a temporary context
     * Automatically restores previous context when done
     */
    run: async <T>(
      context: ConversationContext,
      fn: () => T | Promise<T>
    ): Promise<T> => {
      const previous = currentContext;
      currentContext = context;
      try {
        return await fn();
      } finally {
        currentContext = previous;
      }
    },

    /**
     * Convenience getters for common properties
     */
    getSessionId: (): string => {
      const ctx = currentContext;
      return ctx?.getSessionId() ?? "unknown-session";
    },

    getConversationId: (): string | undefined => {
      const ctx = currentContext;
      return ctx?.getSnapshot().metadata.conversationId;
    },

    /**
     * Debug helper
     */
    debug: () => ({
      hasContext: currentContext !== null,
      sessionId: currentContext?.getSessionId(),
      conversationId: currentContext?.getSnapshot().metadata.conversationId,
    }),
  };
};

// Create and export singleton instance
export const RequestContext = createRequestContext();