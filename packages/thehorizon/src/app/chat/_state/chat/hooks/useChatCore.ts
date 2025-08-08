/**
 * Chat Core Hooks
 *
 * Following official Jotai "Custom useAtom Hooks" pattern.
 * This is the OFFICIAL RECOMMENDED APPROACH by Jotai creator (dai-shi).
 *
 * Reference: https://jotai.org/docs/recipes/custom-useatom-hooks
 *
 * Benefits:
 * - Clean API boundaries - components don't import raw atoms
 * - Better encapsulation - internal atom structure can change
 * - Easier testing - mock the hooks instead of atoms
 * - Type safety - hooks provide better TypeScript experience
 */

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  // Read-only atoms
  conversationIdAtom,
  messagesAtom,
  timelineAtom,
  localOptimisticMessagesAtom,
  isLoadingAtom,
  displayItemsAtom,
  isNewChatAtom,
  messageStatsAtom,

  // Action atoms
  setConversationIdAtom,
  setMessagesAtom,
  addMessageAtom,
  setTimelineAtom,
  setIsLoadingAtom,
  addOptimisticMessageAtom,
  clearOptimisticMessagesAtom,
  startNewConversationAtom,
  setConversationDataAtom,
} from "../atoms/core";

import type {
  Message,
  ConversationTimeline,
} from "@/app/chat/_components/ChatInterface.types";

// =============================================================================
// CUSTOM HOOKS - This is the official Jotai pattern!
// =============================================================================

/**
 * Hook for managing conversation state
 * Provides read access to conversation data and actions to modify it
 */
export function useConversation() {
  const conversationId = useAtomValue(conversationIdAtom);
  const messages = useAtomValue(messagesAtom);
  const timeline = useAtomValue(timelineAtom);
  const isLoading = useAtomValue(isLoadingAtom);

  const setConversationId = useSetAtom(setConversationIdAtom);
  const setMessages = useSetAtom(setMessagesAtom);
  const addMessage = useSetAtom(addMessageAtom);
  const setTimeline = useSetAtom(setTimelineAtom);
  const setIsLoading = useSetAtom(setIsLoadingAtom);
  const startNewConversation = useSetAtom(startNewConversationAtom);
  const setConversationData = useSetAtom(setConversationDataAtom);

  return {
    // State
    conversationId,
    messages,
    timeline,
    isLoading,

    // Actions
    setConversationId,
    setMessages,
    addMessage,
    setTimeline,
    setIsLoading,
    startNewConversation,
    setConversationData,
  };
}

/**
 * Hook for managing optimistic message updates
 * Used for showing messages immediately before server confirmation
 */
export function useOptimisticMessages() {
  const optimisticMessages = useAtomValue(localOptimisticMessagesAtom);
  const addOptimisticMessage = useSetAtom(addOptimisticMessageAtom);
  const clearOptimisticMessages = useSetAtom(clearOptimisticMessagesAtom);

  return {
    optimisticMessages,
    addOptimisticMessage,
    clearOptimisticMessages,
  };
}

/**
 * Hook for read-only access to conversation state
 * Use this when you only need to read data, not modify it
 */
export function useConversationState() {
  const conversationId = useAtomValue(conversationIdAtom);
  const messages = useAtomValue(messagesAtom);
  const timeline = useAtomValue(timelineAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const optimisticMessages = useAtomValue(localOptimisticMessagesAtom);
  const displayItems = useAtomValue(displayItemsAtom);
  const isNewChat = useAtomValue(isNewChatAtom);
  const messageStats = useAtomValue(messageStatsAtom);

  return {
    conversationId,
    messages,
    timeline,
    isLoading,
    optimisticMessages,
    displayItems,
    isNewChat,
    messageStats,
  };
}

/**
 * Hook for conversation actions only
 * Use this when you only need to modify state, not read it
 */
export function useConversationActions() {
  const setConversationId = useSetAtom(setConversationIdAtom);
  const setMessages = useSetAtom(setMessagesAtom);
  const addMessage = useSetAtom(addMessageAtom);
  const setTimeline = useSetAtom(setTimelineAtom);
  const setIsLoading = useSetAtom(setIsLoadingAtom);
  const startNewConversation = useSetAtom(startNewConversationAtom);
  const setConversationData = useSetAtom(setConversationDataAtom);

  return {
    setConversationId,
    setMessages,
    addMessage,
    setTimeline,
    setIsLoading,
    startNewConversation,
    setConversationData,
  };
}
