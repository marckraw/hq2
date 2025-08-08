/**
 * Chat Core Atoms
 *
 * Following official Jotai "action atoms" pattern recommended by creator (dai-shi).
 * Base atoms are private (prefixed with _), public interface is through derived atoms and actions.
 *
 * Reference: https://jotai.org/docs/guides/composing-atoms
 * Pattern: "This is more atomic and looks like a Jotai way" - dai-shi
 *
 * Benefits:
 * - Code splitting / lazy loading friendly
 * - Clear separation between state and actions
 * - Atomic approach allows fine-grained updates
 */

import { atom } from "jotai";
import type {
  Message,
  ConversationTimeline,
  TimelineItem,
} from "@/app/chat/_components/ChatInterface.types";

// =============================================================================
// PRIVATE BASE ATOMS (Internal state - don't export these)
// =============================================================================
// Following official pattern: keep base atoms private, expose through derived atoms

const _conversationIdAtom = atom<number | null>(null);
const _messagesAtom = atom<Message[]>([]);
const _timelineAtom = atom<ConversationTimeline | null>(null);
const _localOptimisticMessagesAtom = atom<Message[]>([]);
const _isLoadingAtom = atom(false);

// =============================================================================
// PUBLIC READ-ONLY ATOMS (Derived state)
// =============================================================================
// These provide read access to the private state

export const conversationIdAtom = atom((get) => get(_conversationIdAtom));
export const messagesAtom = atom((get) => get(_messagesAtom));
export const timelineAtom = atom((get) => get(_timelineAtom));
export const localOptimisticMessagesAtom = atom((get) =>
  get(_localOptimisticMessagesAtom)
);
export const isLoadingAtom = atom((get) => get(_isLoadingAtom));

// =============================================================================
// ACTION ATOMS (Write-only atoms for state mutations)
// =============================================================================
// Following official Jotai pattern: separate action atoms for each operation

export const setConversationIdAtom = atom(
  null,
  (_get, set, id: number | null) => {
    set(_conversationIdAtom, id);
  }
);

export const setMessagesAtom = atom(null, (_get, set, messages: Message[]) => {
  set(_messagesAtom, messages);
});

export const addMessageAtom = atom(null, (get, set, message: Message) => {
  const currentMessages = get(_messagesAtom);
  set(_messagesAtom, [...currentMessages, message]);
});

export const setTimelineAtom = atom(
  null,
  (_get, set, timeline: ConversationTimeline | null) => {
    set(_timelineAtom, timeline);
  }
);

export const setIsLoadingAtom = atom(null, (_get, set, loading: boolean) => {
  set(_isLoadingAtom, loading);
});

export const addOptimisticMessageAtom = atom(
  null,
  (get, set, message: Message) => {
    const current = get(_localOptimisticMessagesAtom);
    set(_localOptimisticMessagesAtom, [...current, message]);
  }
);

export const clearOptimisticMessagesAtom = atom(null, (_get, set) => {
  set(_localOptimisticMessagesAtom, []);
});

// =============================================================================
// COMPLEX ACTION ATOMS (Compound operations)
// =============================================================================
// Actions that update multiple pieces of state atomically

export const startNewConversationAtom = atom(null, (_get, set) => {
  set(_conversationIdAtom, null);
  set(_messagesAtom, []);
  set(_timelineAtom, null);
  set(_localOptimisticMessagesAtom, []);
  set(_isLoadingAtom, false);
});

export const setConversationDataAtom = atom(
  null,
  (
    _get,
    set,
    data: {
      conversationId: number | null;
      messages: Message[];
      timeline?: ConversationTimeline | null;
    }
  ) => {
    set(_conversationIdAtom, data.conversationId);
    set(_messagesAtom, data.messages);
    set(_timelineAtom, data.timeline || null);
    set(_localOptimisticMessagesAtom, []);
  }
);

// =============================================================================
// DERIVED ATOMS (Complex computed state)
// =============================================================================

// Display items atom - combines timeline and optimistic messages
export const displayItemsAtom = atom((get) => {
  const timeline = get(_timelineAtom);
  const messages = get(_messagesAtom);
  const localOptimisticMessages = get(_localOptimisticMessagesAtom);

  let baseItems: TimelineItem[] = timeline?.timeline
    ? [...timeline.timeline]
    : [];

  if (!timeline?.timeline && messages) {
    baseItems = messages.map(
      (msg) =>
        ({
          type: "message",
          data: msg,
          timestamp: msg.timestamp,
        } as TimelineItem)
    );
  }

  const optimisticItems = localOptimisticMessages.map(
    (msg) =>
      ({
        type: "message",
        data: msg,
        timestamp: msg.timestamp,
      } as TimelineItem)
  );

  return [...baseItems, ...optimisticItems];
});

// Is new chat atom - computed from conversationId and displayItems
export const isNewChatAtom = atom((get) => {
  const conversationId = get(_conversationIdAtom);
  const displayItems = get(displayItemsAtom);

  return !conversationId && displayItems.length === 0;
});

// Message statistics
export const messageStatsAtom = atom((get) => {
  const messages = get(_messagesAtom);
  const optimisticMessages = get(_localOptimisticMessagesAtom);

  const allMessages = [...messages, ...optimisticMessages];

  return {
    total: allMessages.length,
    user: allMessages.filter((m) => m.role === "user").length,
    assistant: allMessages.filter((m) => m.role === "assistant").length,
    hasMessages: allMessages.length > 0,
    lastMessage: allMessages[allMessages.length - 1] || null,
  };
});
