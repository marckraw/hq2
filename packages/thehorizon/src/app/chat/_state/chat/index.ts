/**
 * Chat State - Public API
 *
 * This is the ONLY file that should be imported by components.
 * Following official Jotai recommendation to expose custom hooks, not raw atoms.
 *
 * Reference: https://jotai.org/docs/recipes/custom-useatom-hooks
 *
 * ✅ DO: import { useConversation } from '@/app/chat/_state/chat'
 * ❌ DON'T: import { messagesAtom } from '@/app/chat/_state/chat/atoms/core'
 *
 * This approach provides:
 * - Clean API boundaries
 * - Better encapsulation
 * - Easier refactoring
 * - Type safety
 */

// =============================================================================
// PROVIDER (Required for scope isolation)
// =============================================================================
export { ChatProvider, TestChatProvider } from "./providers/ChatProvider";

// =============================================================================
// CORE CHAT HOOKS
// =============================================================================
export {
  useConversation,
  useOptimisticMessages,
  useConversationState,
  useConversationActions,
} from "./hooks/useChatCore";

// =============================================================================
// UI HOOKS
// =============================================================================
export {
  useChatInput,
  useVoiceRecorder,
  useProgressExpansion,
  useAutonomousMode,
  useChatUIState,
} from "./hooks/useChatUI";

// =============================================================================
// STREAMING HOOKS
// =============================================================================
export {
  useStreaming,
  useStreamingActions,
  useProgressMessages,
  useTTS,
} from "./hooks/useStreaming";

// =============================================================================
// MODEL HOOKS
// =============================================================================
export {
  useModelSelection,
  useAgents,
  useCurrentSelection,
} from "./hooks/useModels";

/**
 * IMPORTANT: Raw atoms are NOT exported from this index.
 * Components should only use the custom hooks above.
 *
 * This follows the official Jotai pattern and provides:
 * - Better encapsulation
 * - Cleaner component code
 * - Easier testing
 * - Future-proof API
 */
