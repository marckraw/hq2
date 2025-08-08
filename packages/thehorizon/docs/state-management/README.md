# State Management Documentation

Complete guide to TheHorizon's state architecture using Jotai with modern hook patterns.

## 📚 Documentation Overview

### 🏗️ [Architecture](./architecture.md)

**Core principles and architectural patterns**

- Private/public atom patterns
- Domain-specific organization
- Hook-based encapsulation
- State relationship diagrams

### 🌐 [Global State](./global-state.md)

**Global vs feature state boundaries**

- Authentication state
- Theme management
- Persistence strategies

### 💬 [Chat State](./chat-state.md)

**Complete chat hooks API reference**

- `useConversationState()` - Messages, loading, timeline
- `useChatUIState()` - Editor, attachments, validation
- `useCurrentSelection()` - Models, agents, capabilities
- `useStreaming()` - Progress, connection, TTS

### 🛠️ [Adding New Atoms](./adding-new-atoms.md)

**Step-by-step developer guide**

- Domain determination (global vs feature)
- Private/public atom patterns
- Custom hook creation
- Component integration
- Best practices and common pitfalls

### 🔄 [Migration Guide](./migration-guide.md)

**Legacy atoms → hooks migration record**

- Step-by-step migration process
- Atom-to-hook mapping table
- Migration templates by component type
- ✅ **Status: COMPLETE** - All components migrated!

## 🎯 Quick Reference

### Most Common Hooks

```typescript
// Conversation data
const { messages, isLoading, timeline } = useConversationState();

// UI state
const { editorContent, attachments, canSubmit } = useChatUIState();

// Model selection
const { selectedModel, currentSelection } = useCurrentSelection();

// Streaming
const { progressMessages, connectionStatus } = useStreaming();
```

### Hook Categories

| Category      | Hooks                              | Purpose                     |
| ------------- | ---------------------------------- | --------------------------- |
| **Core**      | `useConversation*`                 | Messages, timeline, loading |
| **UI**        | `useChatUI*`, `useVoiceRecorder`   | Form state, validation      |
| **Models**    | `useCurrentSelection`, `useAgents` | Model/agent selection       |
| **Streaming** | `useStreaming*`, `useTTS`          | Real-time communication     |

## 🏛️ Architecture Benefits

- **🔒 Encapsulation**: Private atoms, public hooks
- **🎯 Type Safety**: Full TypeScript support
- **🧪 Testability**: Hook-based testing patterns
- **📦 Organization**: Domain-specific state grouping
- **🚀 Performance**: Optimized re-renders
- **🔮 Future-Proof**: Official Jotai patterns

## 🛠️ Development Patterns

### Reading State

```typescript
// ✅ DO: Use state hooks for read-only access
const { messages, isLoading } = useConversationState();

// ❌ DON'T: Use action hooks for read-only
const { messages, addMessage } = useConversation(); // Unused addMessage
```

### Updating State

```typescript
// ✅ DO: Use action hooks for mutations
const { addMessage, setIsLoading } = useConversationActions();

// ✅ DO: Use combined hooks for read+write
const { messages, addMessage } = useConversation();
```

### Multiple Domains

```typescript
// ✅ DO: Combine multiple hooks as needed
const { messages } = useConversationState();
const { attachments } = useChatUIState();
const { selectedModel } = useCurrentSelection();
```

## 📈 Migration Success

**Before**: 241-line monolithic `chatAtoms.ts`
**After**: Organized domain-specific hooks

- **11 files migrated** (6 hooks + 5 components)
- **~30+ atoms** organized into clean hooks
- **Type safety** maintained throughout
- **Zero breaking changes** for end users

---

**Architecture**: Jotai + React Hooks  
**Status**: ✅ Production Ready  
**Last Updated**: June 2024
