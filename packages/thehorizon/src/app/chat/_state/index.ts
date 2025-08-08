/**
 * Chat State Index
 *
 * Central export point for chat-specific state management.
 * Following official Jotai recommendations for feature-scoped state.
 *
 * Architecture:
 * - Global state: Use '@/_state' (auth, theme, etc.)
 * - Chat state: Feature-specific state with Provider isolation
 *
 * Usage:
 * ```tsx
 * // Global state (available everywhere)
 * import { useAuth, useTheme } from '@/_state'
 *
 * // Chat state (only within ChatProvider)
 * import { useConversation, ChatProvider } from '@/app/chat/_state/chat'
 * ```
 */

// =============================================================================
// CHAT STATE (Feature-scoped)
// =============================================================================
export * from "./chat";

/**
 * MIGRATION GUIDE:
 *
 * ✅ COMPLETED MIGRATIONS:
 * - Global state moved from chat/_state/global/ to src/_state/
 * - Legacy chatAtoms.ts organized into domain-specific atom files
 * - Hook-based API implemented for all state domains
 * - Components updated to use new hooks (in progress)
 *
 * 🔄 MIGRATION PATTERN:
 * Old way:
 * import { useConversationState, useChatUIState } from '@/app/chat/_state/chat'
 * const [messages] = useAtom(messagesAtom)
 *
 * New way:
 * import { useConversation } from '@/app/chat/_state/chat'
 * const { messages, isLoading } = useConversation()
 *
 * 🎯 HOOK MAPPING:
 * - Core state: useConversation(), useConversationState(), useOptimisticMessages()
 * - UI state: useChatInput(), useVoiceRecorder(), useChatUIState()
 * - Models: useModelSelection(), useAgents(), useCurrentSelection()
 * - Streaming: useStreaming(), useProgressMessages(), useTTS()
 *
 * Benefits:
 * - Better encapsulation
 * - Cleaner component code
 * - Easier testing
 * - Future-proof API
 */
