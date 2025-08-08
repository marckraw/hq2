/**
 * Chat Streaming Atoms
 *
 * State management for real-time streaming functionality including:
 * - Progress messages during AI processing
 * - Streaming response content
 * - Connection status for streaming
 * - TTS (Text-to-Speech) integration
 */

import { atom } from "jotai";
import type { ProgressMessage } from "@/schemas/stream.schemas";

// =============================================================================
// PRIVATE BASE ATOMS
// =============================================================================

const _progressMessagesAtom = atom<ProgressMessage[]>([]);
const _streamTokenAtom = atom<string | null>(null);
const _connectionStatusAtom = atom<
  "disconnected" | "connecting" | "connected" | "error"
>("disconnected");
const _streamingResponseAtom = atom<{
  content: string;
  isActive: boolean;
} | null>(null);

// TTS state
const _ttsActionsAtom = atom<{
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  currentText: string | null;
} | null>(null);

// =============================================================================
// PUBLIC READ-ONLY ATOMS
// =============================================================================

export const progressMessagesAtom = atom((get) => get(_progressMessagesAtom));
export const streamTokenAtom = atom((get) => get(_streamTokenAtom));
export const connectionStatusAtom = atom((get) => get(_connectionStatusAtom));
export const streamingResponseAtom = atom((get) => get(_streamingResponseAtom));
export const ttsActionsAtom = atom((get) => get(_ttsActionsAtom));

// =============================================================================
// DERIVED ATOMS
// =============================================================================

export const isStreamingActiveAtom = atom((get) => {
  const streamingResponse = get(_streamingResponseAtom);
  return streamingResponse?.isActive ?? false;
});

export const hasProgressMessagesAtom = atom((get) => {
  const messages = get(_progressMessagesAtom);
  return messages.length > 0;
});

// =============================================================================
// ACTION ATOMS
// =============================================================================

export const addProgressMessageAtom = atom(
  null,
  (get, set, message: ProgressMessage) => {
    const current = get(_progressMessagesAtom);
    set(_progressMessagesAtom, [...current, message]);
  }
);

export const setProgressMessagesAtom = atom(
  null,
  (_get, set, messages: ProgressMessage[]) => {
    set(_progressMessagesAtom, messages);
  }
);

export const clearProgressMessagesAtom = atom(null, (_get, set) => {
  set(_progressMessagesAtom, []);
});

export const setStreamTokenAtom = atom(
  null,
  (_get, set, token: string | null) => {
    set(_streamTokenAtom, token);
  }
);

export const setConnectionStatusAtom = atom(
  null,
  (
    _get,
    set,
    status: "disconnected" | "connecting" | "connected" | "error"
  ) => {
    set(_connectionStatusAtom, status);
  }
);

export const setStreamingResponseAtom = atom(
  null,
  (_get, set, response: { content: string; isActive: boolean } | null) => {
    set(_streamingResponseAtom, response);
  }
);

export const updateStreamingContentAtom = atom(
  null,
  (get, set, content: string) => {
    const current = get(_streamingResponseAtom);
    if (current) {
      set(_streamingResponseAtom, { ...current, content });
    } else {
      set(_streamingResponseAtom, { content, isActive: true });
    }
  }
);

export const stopStreamingAtom = atom(null, (get, set) => {
  const current = get(_streamingResponseAtom);
  if (current) {
    set(_streamingResponseAtom, { ...current, isActive: false });
  }
});

export const setTtsActionsAtom = atom(
  null,
  (
    _get,
    set,
    actions: {
      speak: (text: string) => Promise<void>;
      stop: () => void;
      isPlaying: boolean;
      isLoading: boolean;
      currentText: string | null;
    } | null
  ) => {
    set(_ttsActionsAtom, actions);
  }
);

// =============================================================================
// COMPLEX STREAMING ACTIONS
// =============================================================================

export const startStreamingSessionAtom = atom(null, (_get, set) => {
  set(_connectionStatusAtom, "connecting");
  set(_progressMessagesAtom, []);
  set(_streamingResponseAtom, null);
});

export const endStreamingSessionAtom = atom(null, (_get, set) => {
  set(_connectionStatusAtom, "disconnected");
  set(_streamingResponseAtom, null);
  set(_streamTokenAtom, null);
});
