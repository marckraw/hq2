/**
 * Chat UI Hooks
 *
 * Custom hooks for chat UI state management following official Jotai pattern.
 * These hooks provide clean interfaces for UI components.
 */

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  // Read-only atoms
  editorContentAtom,
  attachmentsAtom,
  showVoiceRecorderAtom,
  isProgressExpandedAtom,
  isAutonomousModeAtom,
  canSubmitAtom,

  // Action atoms
  setEditorContentAtom,
  clearEditorContentAtom,
  addAttachmentAtom,
  removeAttachmentAtom,
  clearAttachmentsAtom,
  toggleVoiceRecorderAtom,
  setShowVoiceRecorderAtom,
  toggleProgressExpandedAtom,
  toggleAutonomousModeAtom,
  setAutonomousModeAtom,
  resetChatInputAtom,
  prepareForNewMessageAtom,
} from "../atoms/ui";

/**
 * Hook for managing chat input state (editor + attachments)
 */
export function useChatInput() {
  const editorContent = useAtomValue(editorContentAtom);
  const attachments = useAtomValue(attachmentsAtom);

  const setEditorContent = useSetAtom(setEditorContentAtom);
  const clearEditorContent = useSetAtom(clearEditorContentAtom);
  const addAttachment = useSetAtom(addAttachmentAtom);
  const removeAttachment = useSetAtom(removeAttachmentAtom);
  const clearAttachments = useSetAtom(clearAttachmentsAtom);
  const resetChatInput = useSetAtom(resetChatInputAtom);
  const prepareForNewMessage = useSetAtom(prepareForNewMessageAtom);

  return {
    // State
    editorContent,
    attachments,
    hasContent: editorContent.trim().length > 0 || attachments.length > 0,

    // Actions
    setEditorContent,
    clearEditorContent,
    addAttachment,
    removeAttachment,
    clearAttachments,
    resetChatInput,
    prepareForNewMessage,
  };
}

/**
 * Hook for managing voice recorder state
 */
export function useVoiceRecorder() {
  const showVoiceRecorder = useAtomValue(showVoiceRecorderAtom);
  const toggleVoiceRecorder = useSetAtom(toggleVoiceRecorderAtom);
  const setShowVoiceRecorder = useSetAtom(setShowVoiceRecorderAtom);

  return {
    showVoiceRecorder,
    toggleVoiceRecorder,
    setShowVoiceRecorder,
  };
}

/**
 * Hook for managing progress expansion state
 */
export function useProgressExpansion() {
  const isProgressExpanded = useAtomValue(isProgressExpandedAtom);
  const toggleProgressExpanded = useSetAtom(toggleProgressExpandedAtom);

  return {
    isProgressExpanded,
    toggleProgressExpanded,
  };
}

/**
 * Hook for managing autonomous mode
 */
export function useAutonomousMode() {
  const isAutonomousMode = useAtomValue(isAutonomousModeAtom);
  const toggleAutonomousMode = useSetAtom(toggleAutonomousModeAtom);
  const setAutonomousMode = useSetAtom(setAutonomousModeAtom);

  return {
    isAutonomousMode,
    toggleAutonomousMode,
    setAutonomousMode,
  };
}

/**
 * Hook for read-only access to all UI state
 */
export function useChatUIState() {
  const editorContent = useAtomValue(editorContentAtom);
  const attachments = useAtomValue(attachmentsAtom);
  const showVoiceRecorder = useAtomValue(showVoiceRecorderAtom);
  const isProgressExpanded = useAtomValue(isProgressExpandedAtom);
  const isAutonomousMode = useAtomValue(isAutonomousModeAtom);
  const canSubmit = useAtomValue(canSubmitAtom);

  return {
    editorContent,
    attachments,
    showVoiceRecorder,
    isProgressExpanded,
    isAutonomousMode,
    canSubmit,
    hasContent: editorContent.trim().length > 0 || attachments.length > 0,
  };
}
