# Migration Guide: Legacy Atoms → Hook Pattern

## 🎯 Overview

This guide provides step-by-step instructions for migrating components from the legacy `chatAtoms.ts` pattern to the new hook-based architecture.

## 📋 Migration Checklist

### ✅ Completed

- [x] Global state moved from `chat/_state/global/` to `src/_state/`
- [x] Legacy atoms organized into domain-specific files
- [x] Hook-based API implemented
- [x] Core components migrated (SubmitStatus, LoadingIndicator, etc.)
- [x] **ALL remaining components migrated (11 files)**
- [x] **Legacy `chatAtoms.ts` removed (241 lines deleted)**
- [x] **Hook files migration completed**
- [x] **Component files migration completed**
- [x] **Documentation updated**

### 🎉 Migration Complete!

**Status**: ✅ **FULLY MIGRATED** - All components now use the new hook-based architecture!

## 🔄 Step-by-Step Migration Process

### Step 1: Identify Component Dependencies

Before migrating a component, identify which atoms it uses:

```bash
# Find all atom imports in a component
grep -n "from.*chatAtoms" src/app/chat/_components/YourComponent.tsx
```

### Step 2: Map Atoms to Hooks

Use this mapping table to convert atom imports to hook usage:

| Legacy Atom              | New Hook                 | Hook Method          |
| ------------------------ | ------------------------ | -------------------- |
| `messagesAtom`           | `useConversationState()` | `messages`           |
| `isLoadingAtom`          | `useConversationState()` | `isLoading`          |
| `conversationIdAtom`     | `useConversationState()` | `conversationId`     |
| `timelineAtom`           | `useConversationState()` | `timeline`           |
| `displayItemsAtom`       | `useConversationState()` | `displayItems`       |
| `isNewChatAtom`          | `useConversationState()` | `isNewChat`          |
| `messageStatsAtom`       | `useConversationState()` | `messageStats`       |
| `editorContentAtom`      | `useChatUIState()`       | `editorContent`      |
| `attachmentsAtom`        | `useChatUIState()`       | `attachments`        |
| `showVoiceRecorderAtom`  | `useChatUIState()`       | `showVoiceRecorder`  |
| `isProgressExpandedAtom` | `useChatUIState()`       | `isProgressExpanded` |
| `isAutonomousModeAtom`   | `useChatUIState()`       | `isAutonomousMode`   |
| `canSubmitAtom`          | `useChatUIState()`       | `canSubmit`          |
| `selectedModelAtom`      | `useCurrentSelection()`  | `selectedModel`      |
| `currentSelectionAtom`   | `useCurrentSelection()`  | `currentSelection`   |
| `agentsAtom`             | `useAgents()`            | `agents`             |
| `isLoadingAgentsAtom`    | `useAgents()`            | `isLoadingAgents`    |
| `agentTypeAtom`          | `useAgents()`            | `agentType`          |
| `progressMessagesAtom`   | `useStreaming()`         | `progressMessages`   |
| `connectionStatusAtom`   | `useStreaming()`         | `connectionStatus`   |
| `streamingResponseAtom`  | `useStreaming()`         | `streamingResponse`  |
| `ttsActionsAtom`         | `useTTS()`               | `ttsActions`         |

### Step 3: Migration Templates

#### Template 1: Simple Read-Only Component

**Before:**

```typescript
import { useAtom } from "jotai";
import { messagesAtom, isLoadingAtom } from "../../_state/chatAtoms";

export const MessageList = () => {
  const [messages] = useAtom(messagesAtom);
  const [isLoading] = useAtom(isLoadingAtom);

  // Component logic...
};
```

**After:**

```typescript
import { useConversationState } from "../../_state/chat";

export const MessageList = () => {
  const { messages, isLoading } = useConversationState();

  // Component logic...
};
```

#### Template 2: UI State Component

**Before:**

```typescript
import { useAtom } from "jotai";
import {
  attachmentsAtom,
  editorContentAtom,
  canSubmitAtom,
} from "../../_state/chatAtoms";

export const ChatInput = () => {
  const [attachments] = useAtom(attachmentsAtom);
  const [editorContent] = useAtom(editorContentAtom);
  const [canSubmit] = useAtom(canSubmitAtom);

  // Component logic...
};
```

**After:**

```typescript
import { useChatUIState } from "../../_state/chat";

export const ChatInput = () => {
  const { attachments, editorContent, canSubmit } = useChatUIState();

  // Component logic...
};
```

#### Template 3: Component with Actions

**Before:**

```typescript
import { useAtom, useSetAtom } from "jotai";
import {
  messagesAtom,
  addMessageAtom,
  isLoadingAtom,
  setIsLoadingAtom,
} from "../../_state/chatAtoms";

export const MessageForm = () => {
  const [messages] = useAtom(messagesAtom);
  const [isLoading] = useAtom(isLoadingAtom);
  const addMessage = useSetAtom(addMessageAtom);
  const setIsLoading = useSetAtom(setIsLoadingAtom);

  // Component logic...
};
```

**After:**

```typescript
import { useConversation } from "../../_state/chat";

export const MessageForm = () => {
  const { messages, isLoading, addMessage, setIsLoading } = useConversation();

  // Component logic...
};
```

#### Template 4: Mixed Domain Component

**Before:**

```typescript
import { useAtom } from "jotai";
import {
  messagesAtom,
  attachmentsAtom,
  currentSelectionAtom,
  connectionStatusAtom,
} from "../../_state/chatAtoms";

export const ChatInterface = () => {
  const [messages] = useAtom(messagesAtom);
  const [attachments] = useAtom(attachmentsAtom);
  const [currentSelection] = useAtom(currentSelectionAtom);
  const [connectionStatus] = useAtom(connectionStatusAtom);

  // Component logic...
};
```

**After:**

```typescript
import {
  useConversationState,
  useChatUIState,
  useCurrentSelection,
  useStreaming,
} from "../../_state/chat";

export const ChatInterface = () => {
  const { messages } = useConversationState();
  const { attachments } = useChatUIState();
  const { currentSelection } = useCurrentSelection();
  const { connectionStatus } = useStreaming();

  // Component logic...
};
```

## 🎯 Migration Strategy by Component Type

### Display Components (Read-Only)

- Use `useConversationState()` for message data
- Use `useChatUIState()` for UI state
- Use `useCurrentSelection()` for model info
- Use `useStreaming()` for connection status

### Form Components (Actions)

- Use `useConversation()` for message actions
- Use `useChatInput()` for input actions
- Use `useStreamingActions()` for streaming control

### Complex Components (Mixed)

- Combine multiple hooks as needed
- Prefer specific hooks over general ones
- Group related imports together

## ✅ Successfully Migrated Components

All components have been successfully migrated from legacy atoms to the new hook architecture:

### Hook Files (6 files)

1. **`useAgentManagement.ts`** ✅ - Now uses `useAgents()` + `useAutonomousMode()`
2. **`useVoiceRecording.ts`** ✅ - Now uses `useVoiceRecorder()`
3. **`useChatAreaLogic.ts`** ✅ - Now uses `useCurrentSelection()` + `useProgressExpansion()`
4. **`useFileUpload.ts`** ✅ - Now uses `useChatInput()`
5. **`useChatStreaming.ts`** ✅ - Now uses multiple streaming hooks
6. **`useGetAgents.ts`** ✅ - Now uses `useAgents()`

### Component Files (5 files)

7. **`ChatArea.tsx`** ✅ - Now uses multiple domain hooks with proper TTS handling
8. **`ChatInput.tsx`** ✅ - Now uses `useConversationState()` + `useChatUIState()`
9. **`ChatStats.tsx`** ✅ - Now uses multiple domain hooks for comprehensive state access
10. **`ModelSelector.tsx`** ✅ - Now uses `useCurrentSelection()` + `useAgents()`
11. **`ModelStatusDisplay.tsx`** ✅ - Now uses `useCurrentSelection()` + other domain hooks

### Legacy Cleanup

- **`chatAtoms.ts`** ✅ - **DELETED** (241 lines removed)
- **Documentation** ✅ - Updated to reflect new architecture

## ⚠️ Common Migration Pitfalls

### 1. Over-importing

```typescript
// ❌ DON'T: Import everything
const everything = useConversation();

// ✅ DO: Import only what you need
const { messages, isLoading } = useConversationState();
```

### 2. Wrong Hook Choice

```typescript
// ❌ DON'T: Use action hook for read-only
const { messages, addMessage } = useConversation(); // Unused addMessage

// ✅ DO: Use state hook for read-only
const { messages } = useConversationState();
```

### 3. Missing Hook Updates

```typescript
// ❌ DON'T: Mix old and new patterns
const [messages] = useAtom(messagesAtom); // Old
const { isLoading } = useConversationState(); // New

// ✅ DO: Use consistent new pattern
const { messages, isLoading } = useConversationState();
```

## 🧪 Testing Migration

After migrating a component:

1. **Verify imports**: No more `chatAtoms` imports
2. **Check functionality**: All features work as before
3. **Test performance**: No unnecessary re-renders
4. **Validate types**: TypeScript compiles without errors

## 📝 Migration Checklist Template

For each component:

- [ ] Identify all atom dependencies
- [ ] Map atoms to appropriate hooks
- [ ] Update imports
- [ ] Update component logic
- [ ] Remove unused imports
- [ ] Test functionality
- [ ] Verify TypeScript compilation
- [ ] Check for performance regressions

## 🎉 Post-Migration Summary

**Migration Status**: ✅ **COMPLETE**

### What Was Accomplished

1. **✅ Legacy file removed**: `chatAtoms.ts` deleted (241 lines)
2. **✅ Exports updated**: All legacy exports removed from index files
3. **✅ Imports cleaned**: No dangling imports remain
4. **✅ Documentation updated**: Migration guide reflects completion
5. **✅ Architecture modernized**: Full hook-based state management implemented

### Migration Statistics

- **Files Migrated**: 11 total (6 hooks + 5 components)
- **Legacy Atoms Removed**: ~30+ individual atoms
- **Code Reduction**: 241-line monolithic file → organized domain files
- **Hook Categories**: 4 domains (Core, UI, Models, Streaming)
- **Type Safety**: ✅ Maintained throughout migration

### Benefits Achieved

- **Better Encapsulation**: Private atoms, public hooks
- **Cleaner Components**: No direct atom imports
- **Type Safety**: Comprehensive TypeScript support
- **Easier Testing**: Hook-based testing patterns
- **Future-Proof**: Official Jotai recommended patterns
- **Better DX**: IntelliSense and discoverability

### 🚀 **CELEBRATION TIME!**

You've successfully modernized the entire state architecture! The chat application now follows modern React patterns with clean, maintainable, and type-safe state management. 🎊
