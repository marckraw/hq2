# Chat Hooks API Reference

## 🎯 Overview

This document provides a comprehensive reference for all chat state hooks, their usage patterns, and best practices.

## 📚 Hook Categories

### 🔄 Core State Hooks (`useChatCore.ts`)

#### `useConversation()`

**Purpose**: Complete conversation management with both state and actions.

```typescript
import { useConversation } from "@/app/chat/_state/chat";

function ChatComponent() {
  const {
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
  } = useConversation();

  // Use state and actions as needed
}
```

#### `useConversationState()`

**Purpose**: Read-only access to conversation state (performance optimized).

```typescript
import { useConversationState } from "@/app/chat/_state/chat";

function DisplayComponent() {
  const {
    conversationId,
    messages,
    timeline,
    isLoading,
    optimisticMessages,
    displayItems, // Computed: timeline + optimistic messages
    isNewChat, // Computed: no ID and no messages
    messageStats, // Computed: counts, last message, etc.
  } = useConversationState();

  // Only read state, no mutations
}
```

#### `useOptimisticMessages()`

**Purpose**: Manage temporary messages before server confirmation.

```typescript
import { useOptimisticMessages } from "@/app/chat/_state/chat";

function MessageInput() {
  const { optimisticMessages, addOptimisticMessage, clearOptimisticMessages } =
    useOptimisticMessages();

  const handleSubmit = async (message) => {
    // Add optimistic message immediately
    addOptimisticMessage(message);

    try {
      await sendMessage(message);
      clearOptimisticMessages(); // Clear on success
    } catch (error) {
      clearOptimisticMessages(); // Clear on error too
    }
  };
}
```

### 🎨 UI State Hooks (`useChatUI.ts`)

#### `useChatInput()`

**Purpose**: Manage chat input form state.

```typescript
import { useChatInput } from "@/app/chat/_state/chat";

function ChatInput() {
  const {
    editorContent,
    setEditorContent,
    clearEditorContent,
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    resetChatInput, // Clear both content and attachments
  } = useChatInput();
}
```

#### `useVoiceRecorder()`

**Purpose**: Manage voice recording UI state.

```typescript
import { useVoiceRecorder } from "@/app/chat/_state/chat";

function VoiceRecorder() {
  const { showVoiceRecorder, toggleVoiceRecorder, setShowVoiceRecorder } =
    useVoiceRecorder();
}
```

#### `useChatUIState()`

**Purpose**: Complete UI state access (read-only optimized).

```typescript
import { useChatUIState } from "@/app/chat/_state/chat";

function ChatInterface() {
  const {
    editorContent,
    attachments,
    showVoiceRecorder,
    isProgressExpanded,
    isAutonomousMode,
    canSubmit, // Computed validation state
    hasContent, // Computed: has text or attachments
  } = useChatUIState();
}
```

### 🤖 Model Selection Hooks (`useModels.ts`)

#### `useModelSelection()`

**Purpose**: Manage AI model selection.

```typescript
import { useModelSelection } from "@/app/chat/_state/chat";

function ModelSelector() {
  const {
    selectedModel,
    currentSelection, // Current model or agent object
    currentModelPerformance, // Speed, intelligence metrics
    currentCapabilities, // Available capabilities
    setSelectedModel,
  } = useModelSelection();
}
```

#### `useAgents()`

**Purpose**: Manage AI agents.

```typescript
import { useAgents } from "@/app/chat/_state/chat";

function AgentManager() {
  const {
    agents,
    isLoadingAgents,
    agentType,
    setAgents,
    setIsLoadingAgents,
    setAgentType,
  } = useAgents();
}
```

#### `useCurrentSelection()`

**Purpose**: Get current model/agent with convenience properties.

```typescript
import { useCurrentSelection } from "@/app/chat/_state/chat";

function SelectionDisplay() {
  const {
    currentSelection,
    currentModelPerformance,
    currentCapabilities,

    // Convenience properties
    hasSelection,
    isAgent,
    isModel,
    selectionName,
    selectionDescription,

    // Actions
    setSelectedModel,
    setAgentType,
  } = useCurrentSelection();
}
```

### 🌊 Streaming Hooks (`useStreaming.ts`)

#### `useStreaming()`

**Purpose**: Complete streaming state access.

```typescript
import { useStreaming } from "@/app/chat/_state/chat";

function StreamingInterface() {
  const {
    progressMessages,
    streamToken,
    connectionStatus,
    streamingResponse,
    isStreamingActive,
    hasProgressMessages,
  } = useStreaming();
}
```

#### `useStreamingActions()`

**Purpose**: Streaming state mutations.

```typescript
import { useStreamingActions } from "@/app/chat/_state/chat";

function StreamingManager() {
  const {
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
  } = useStreamingActions();
}
```

#### `useProgressMessages()`

**Purpose**: Focused progress message management.

```typescript
import { useProgressMessages } from "@/app/chat/_state/chat";

function ProgressDisplay() {
  const {
    progressMessages,
    hasProgressMessages,
    addProgressMessage,
    clearProgressMessages,
  } = useProgressMessages();
}
```

#### `useTTS()`

**Purpose**: Text-to-Speech functionality.

```typescript
import { useTTS } from "@/app/chat/_state/chat";

function TTSControls() {
  const {
    ttsActions,
    setTtsActions,
    isPlaying,
    isLoading,
    currentText,
    speak,
    stop,
  } = useTTS();

  const handleSpeak = async (text: string) => {
    await speak(text);
  };
}
```

## 🎯 Usage Patterns

### Pattern 1: Read-Only Components

```typescript
// Use state-only hooks for display components
import { useConversationState, useChatUIState } from "@/app/chat/_state/chat";

function MessageList() {
  const { displayItems, messageStats } = useConversationState();
  const { isProgressExpanded } = useChatUIState();

  // Only read state, no mutations
}
```

### Pattern 2: Action-Heavy Components

```typescript
// Use action hooks for form components
import { useChatInput, useStreamingActions } from "@/app/chat/_state/chat";

function MessageForm() {
  const { editorContent, setEditorContent, resetChatInput } = useChatInput();
  const { startStreamingSession } = useStreamingActions();

  // Mostly mutations, minimal state reading
}
```

### Pattern 3: Mixed Components

```typescript
// Use full hooks for complex components
import { useConversation, useCurrentSelection } from "@/app/chat/_state/chat";

function ChatInterface() {
  const { messages, addMessage, isLoading } = useConversation();
  const { hasSelection, selectionName } = useCurrentSelection();

  // Both read and write operations
}
```

## ⚡ Performance Tips

1. **Use specific hooks**: Prefer `useConversationState()` over `useConversation()` for read-only components
2. **Destructure selectively**: Only destructure the properties you need
3. **Combine related hooks**: Import multiple hooks from the same domain together
4. **Avoid unnecessary re-renders**: Use state-only hooks when you don't need actions

## 🔄 Migration Examples

### Before (Legacy Atoms)

```typescript
import {
  messagesAtom,
  isLoadingAtom,
  attachmentsAtom,
  canSubmitAtom,
} from "../chatAtoms";

function Component() {
  const [messages] = useAtom(messagesAtom);
  const [isLoading] = useAtom(isLoadingAtom);
  const [attachments] = useAtom(attachmentsAtom);
  const [canSubmit] = useAtom(canSubmitAtom);
}
```

### After (Hook Pattern)

```typescript
import { useConversationState, useChatUIState } from "@/app/chat/_state/chat";

function Component() {
  const { messages, isLoading } = useConversationState();
  const { attachments, canSubmit } = useChatUIState();
}
```

## 🧪 Testing Patterns

```typescript
// Mock hooks instead of atoms
jest.mock("@/app/chat/_state/chat", () => ({
  useConversation: () => ({
    messages: mockMessages,
    isLoading: false,
    addMessage: jest.fn(),
  }),
  useChatUIState: () => ({
    canSubmit: { canSubmit: true, hasContent: true },
  }),
}));
```
