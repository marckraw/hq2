/**
 * Chat Provider
 *
 * Following official Jotai Provider pattern for scope isolation.
 * This creates a separate "store" for all chat-related atoms.
 *
 * Reference: https://jotai.org/docs/core/provider
 *
 * Benefits:
 * - Scope isolation: Chat state is contained within this provider
 * - Multiple instances: Could have multiple chat sessions
 * - Testing: Easy to provide clean state for tests
 * - Performance: Only chat components re-render on chat state changes
 *
 * Usage:
 * ```tsx
 * <ChatProvider>
 *   <ChatArea />
 * </ChatProvider>
 * ```
 */

"use client";

import React from "react";
import { Provider } from "jotai";

interface ChatProviderProps {
  children: React.ReactNode;
  /**
   * Optional scope for multiple chat instances
   * Use this if you need multiple independent chat sessions
   */
  scope?: string;
}

/**
 * ChatProvider creates an isolated scope for all chat-related atoms.
 *
 * This means:
 * - Chat state is only accessible within this provider tree
 * - Multiple ChatProviders create completely separate chat states
 * - Perfect for testing - each test gets a clean chat state
 * - Performance optimization - only chat components re-render
 */
export function ChatProvider({ children, scope }: ChatProviderProps) {
  return <Provider key={scope}>{children}</Provider>;
}

/**
 * Convenience component for testing
 * Provides a clean chat state for each test
 */
export function TestChatProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
