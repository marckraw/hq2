/**
 * Chat Streaming Hooks
 *
 * Custom hooks for streaming functionality following official Jotai patterns.
 * Provides clean API for components to interact with streaming state.
 */

import { useAtomValue, useSetAtom } from "jotai";
import type { ProgressMessage } from "@/schemas/stream.schemas";
import {
  // Read-only atoms
  progressMessagesAtom,
  streamTokenAtom,
  connectionStatusAtom,
  streamingResponseAtom,
  ttsActionsAtom,
  isStreamingActiveAtom,
  hasProgressMessagesAtom,

  // Action atoms
  addProgressMessageAtom,
  setProgressMessagesAtom,
  clearProgressMessagesAtom,
  setStreamTokenAtom,
  setConnectionStatusAtom,
  setStreamingResponseAtom,
  updateStreamingContentAtom,
  stopStreamingAtom,
  setTtsActionsAtom,
  startStreamingSessionAtom,
  endStreamingSessionAtom,
} from "../atoms/streaming";

// =============================================================================
// STREAMING STATE HOOKS
// =============================================================================

export function useStreaming() {
  const progressMessages = useAtomValue(progressMessagesAtom);
  const streamToken = useAtomValue(streamTokenAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const streamingResponse = useAtomValue(streamingResponseAtom);
  const isStreamingActive = useAtomValue(isStreamingActiveAtom);
  const hasProgressMessages = useAtomValue(hasProgressMessagesAtom);

  return {
    progressMessages,
    streamToken,
    connectionStatus,
    streamingResponse,
    isStreamingActive,
    hasProgressMessages,
  };
}

export function useStreamingActions() {
  const addProgressMessage = useSetAtom(addProgressMessageAtom);
  const setProgressMessages = useSetAtom(setProgressMessagesAtom);
  const clearProgressMessages = useSetAtom(clearProgressMessagesAtom);
  const setStreamToken = useSetAtom(setStreamTokenAtom);
  const setConnectionStatus = useSetAtom(setConnectionStatusAtom);
  const setStreamingResponse = useSetAtom(setStreamingResponseAtom);
  const updateStreamingContent = useSetAtom(updateStreamingContentAtom);
  const stopStreaming = useSetAtom(stopStreamingAtom);
  const startStreamingSession = useSetAtom(startStreamingSessionAtom);
  const endStreamingSession = useSetAtom(endStreamingSessionAtom);

  return {
    addProgressMessage,
    setProgressMessages,
    clearProgressMessages,
    setStreamToken,
    setConnectionStatus,
    setStreamingResponse,
    updateStreamingContent,
    stopStreaming,
    startStreamingSession,
    endStreamingSession,
  };
}

// =============================================================================
// PROGRESS MESSAGES HOOKS
// =============================================================================

export function useProgressMessages() {
  const progressMessages = useAtomValue(progressMessagesAtom);
  const hasProgressMessages = useAtomValue(hasProgressMessagesAtom);
  const addProgressMessage = useSetAtom(addProgressMessageAtom);
  const clearProgressMessages = useSetAtom(clearProgressMessagesAtom);

  return {
    progressMessages,
    hasProgressMessages,
    addProgressMessage,
    clearProgressMessages,
  };
}

// =============================================================================
// TTS HOOKS
// =============================================================================

export function useTTS() {
  const ttsActions = useAtomValue(ttsActionsAtom);
  const setTtsActions = useSetAtom(setTtsActionsAtom);

  return {
    ttsActions,
    setTtsActions,
    isPlaying: ttsActions?.isPlaying ?? false,
    isLoading: ttsActions?.isLoading ?? false,
    currentText: ttsActions?.currentText ?? null,
    speak: ttsActions?.speak ?? (async () => {}),
    stop: ttsActions?.stop ?? (() => {}),
  };
}
