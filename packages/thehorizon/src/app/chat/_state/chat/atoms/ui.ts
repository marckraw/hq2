/**
 * Chat UI Atoms
 *
 * UI-specific state for the chat feature. Following the same private/public pattern
 * as core atoms for consistency.
 *
 * These atoms handle:
 * - Input state (editor content, attachments)
 * - UI toggles (voice recorder, progress expansion)
 * - Autonomous mode settings
 */

import { atom } from "jotai";

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
  dataUrl?: string;
}

// =============================================================================
// PRIVATE BASE ATOMS (Internal UI state)
// =============================================================================

const _editorContentAtom = atom<string>("");
const _attachmentsAtom = atom<FileAttachment[]>([]);
const _showVoiceRecorderAtom = atom(false);
const _isProgressExpandedAtom = atom(true);
const _isAutonomousModeAtom = atom(true);

// =============================================================================
// PUBLIC READ-ONLY ATOMS
// =============================================================================

export const editorContentAtom = atom((get) => get(_editorContentAtom));
export const attachmentsAtom = atom((get) => get(_attachmentsAtom));
export const showVoiceRecorderAtom = atom((get) => get(_showVoiceRecorderAtom));
export const isProgressExpandedAtom = atom((get) =>
  get(_isProgressExpandedAtom)
);
export const isAutonomousModeAtom = atom((get) => get(_isAutonomousModeAtom));

// =============================================================================
// ACTION ATOMS
// =============================================================================

export const setEditorContentAtom = atom(null, (_get, set, content: string) => {
  set(_editorContentAtom, content);
});

export const clearEditorContentAtom = atom(null, (_get, set) => {
  set(_editorContentAtom, "");
});

export const addAttachmentAtom = atom(
  null,
  (get, set, attachment: FileAttachment) => {
    const current = get(_attachmentsAtom);
    set(_attachmentsAtom, [...current, attachment]);
  }
);

export const removeAttachmentAtom = atom(null, (get, set, id: string) => {
  const current = get(_attachmentsAtom);
  set(
    _attachmentsAtom,
    current.filter((a) => a.id !== id)
  );
});

export const clearAttachmentsAtom = atom(null, (_get, set) => {
  set(_attachmentsAtom, []);
});

export const toggleVoiceRecorderAtom = atom(null, (get, set) => {
  const current = get(_showVoiceRecorderAtom);
  set(_showVoiceRecorderAtom, !current);
});

export const setShowVoiceRecorderAtom = atom(
  null,
  (_get, set, show: boolean) => {
    set(_showVoiceRecorderAtom, show);
  }
);

export const toggleProgressExpandedAtom = atom(null, (get, set) => {
  const current = get(_isProgressExpandedAtom);
  set(_isProgressExpandedAtom, !current);
});

export const toggleAutonomousModeAtom = atom(null, (get, set) => {
  const current = get(_isAutonomousModeAtom);
  set(_isAutonomousModeAtom, !current);
});

export const setAutonomousModeAtom = atom(null, (_get, set, mode: boolean) => {
  set(_isAutonomousModeAtom, mode);
});

// =============================================================================
// COMPLEX UI ACTIONS
// =============================================================================

export const resetChatInputAtom = atom(null, (_get, set) => {
  set(_editorContentAtom, "");
  set(_attachmentsAtom, []);
  set(_showVoiceRecorderAtom, false);
});

export const prepareForNewMessageAtom = atom(null, (_get, set) => {
  set(_editorContentAtom, "");
  set(_isProgressExpandedAtom, true);
});

// =============================================================================
// VALIDATION ATOMS (Cross-domain derived state)
// =============================================================================

// Import atoms from other domains for validation
import { isLoadingAtom } from "./core";
import { currentSelectionAtom } from "./models";

// Validation atom - can we submit?
export const canSubmitAtom = atom((get) => {
  const isLoading = get(isLoadingAtom);
  const attachments = get(_attachmentsAtom);
  const editorContent = get(_editorContentAtom);
  const currentSelection = get(currentSelectionAtom);

  return {
    canSubmit:
      !isLoading &&
      currentSelection !== null &&
      (editorContent.trim().length > 0 || attachments.length > 0),
    hasModel: currentSelection !== null,
    hasAttachments: attachments.length > 0,
    hasContent: editorContent.trim().length > 0,
    isLoading,
  };
});
