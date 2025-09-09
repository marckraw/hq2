# AI Chat Components Refactor Plan

## 📅 Created: 2025-08-19
## 👤 Context: Full refactor of AI chat page to presentational/container pattern

---

## ✅ What We've Accomplished

### Created Presentational Components
Location: `/packages/thehorizon/src/components/ai-chat/presentational/`

1. **WelcomePrompt** ✨
   - Pure presentational welcome/empty state
   - Variants: `welcome`, `empty`, `error`, `loading`
   - Props: `title`, `subtitle`, `suggestions`, `onSuggestionClick`, `variant`, `icon`, `compact`
   - Replaces: Old `EmptyState` component

2. **ChatHeader** ✨
   - Pure header component (no router dependency)
   - Variants: `default`, `minimal`, `detailed`
   - Props: `title`, `subtitle`, `icon`, `onBack`, `actions`, `status`, `badge`
   - Replaces: Old `ChatHeader` with router

3. **KeyboardHint** ✨
   - Displays keyboard shortcuts
   - Variants: `inline`, `card`, `minimal`
   - Props: `shortcuts`, `platform`, `compact`, `showIcon`

4. **SidebarHintPill** ✨
   - Expandable sidebar indicator
   - Props: `count`, `label`, `icon`, `isActive`, `isHovered`, `onClick`
   - Extracted from: `ConversationSidebarWithHint`

5. **ConversationItem** ✨
   - Single conversation display
   - Variants: `default`, `compact`, `detailed`
   - Props: `title`, `preview`, `timestamp`, `isActive`, `isUnread`, `isPinned`

6. **ConversationList** ✨
   - List of conversations with grouping
   - Features: Search, grouping by date/pinned
   - Props: `conversations`, `activeId`, `onSelect`, `groupBy`, `showSearch`

7. **ExecutionStep** ✨
   - Single execution/thinking step display
   - Types: `thinking`, `search`, `fetch`, `analyze`, `tool_execution`, etc.
   - Props: `type`, `content`, `status`, `duration`, `result`, `expanded`

8. **ResponseMetrics** ✨
   - Metrics display (time, tokens, confidence)
   - Variants: `inline`, `card`, `detailed`
   - Props: `stepCount`, `duration`, `sources`, `confidence`, `tokens`

### Created Additional Components

9. **ApprovalCard System** ✨
   - Location: `/packages/thehorizon/src/components/ai-chat/approval/`
   - Complete approval flow with iterative disclosure
   - Breathing animation (3s cycle, customized for ADHD-friendly experience)
   - Components: ApprovalCard, ApprovalHeader, ApprovalPreview, ApprovalDetails, ApprovalActions, ApprovalMetadata

### Existing Reusable Components
- `ChatMessage` (primitives) - Already good
- `ChatInput` (primitives) - Already good
- `AgentAvatar` (ui) - Already good
- `AttachmentList` (attachments) - Already good
- `AgentThinking`, `ToolCall` (workflow) - For execution display
- Various animation components - Already good

---

## 📊 Current State Analysis

### Old Components Still in Use
Location: `/packages/thehorizon/src/app/ai/components/`

| Component | Issues | Replacement |
|-----------|---------|------------|
| `ChatHeader.tsx` | Has router dependency, mixed concerns | Use presentational `ChatHeader` |
| `EmptyState.tsx` | Ref manipulation, not pure | Use `WelcomePrompt` |
| `ConversationSidebarWithHint.tsx` | Monolithic, 320 lines, complex state | Split into containers + presentational |
| `MessageList.tsx` | Complex state management, 280 lines | Create container using presentational components |

### Components to Keep As-Is
- `StreamingMessage.tsx` ✅ - Already presentational
- `ResearchProgress.tsx` ✅ - Already presentational
- `AttachmentsSection.tsx` ✅ - Already presentational

---

## 🏗️ Refactor Plan

### New Architecture

```
packages/thehorizon/src/
├── components/ai-chat/
│   ├── presentational/        # ✅ DONE - Pure components
│   ├── containers/            # 🔄 TODO - Stateful wrappers
│   ├── primitives/            # ✅ Existing
│   ├── workflow/              # ✅ Existing
│   ├── approval/              # ✅ DONE
│   └── ...
│
└── app/ai/
    ├── containers/            # 🔄 TODO - Page-specific containers
    │   ├── ConversationSidebarContainer.tsx
    │   ├── MessageListContainer.tsx
    │   └── ChatContainer.tsx
    ├── components/            # Keep minimal page-specific
    │   ├── StreamingMessage.tsx
    │   ├── ResearchProgress.tsx
    │   └── AttachmentsSection.tsx
    └── page.tsx              # Simplified main page
```

---

## 📝 Implementation Steps

### Step 1: Create ConversationSidebarContainer
```tsx
// File: /app/ai/containers/ConversationSidebarContainer.tsx

import { useState, useEffect, useRef } from "react";
import { 
  SidebarHintPill, 
  ConversationList, 
  KeyboardHint 
} from "@/components/ai-chat/presentational";

export function ConversationSidebarContainer({ 
  conversations, 
  currentId, 
  onSelect, 
  onDelete,
  onNew 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Handle hover intent logic
  // Handle keyboard shortcuts
  // Handle pinning persistence
  
  return (
    <>
      <SidebarHintPill 
        count={conversations.length}
        isHovered={isHovering}
        onClick={() => setIsOpen(true)}
      />
      
      {isOpen && (
        <div className="sidebar-panel">
          <ConversationList 
            conversations={conversations}
            activeId={currentId}
            onSelect={onSelect}
          />
          <KeyboardHint variant="minimal" />
        </div>
      )}
    </>
  );
}
```

### Step 2: Create MessageListContainer
```tsx
// File: /app/ai/containers/MessageListContainer.tsx

import { useState } from "react";
import { ChatMessage } from "@/components/ai-chat/primitives/ChatMessage";
import { ExecutionStep, ResponseMetrics } from "@/components/ai-chat/presentational";
import { AgentThinking, ToolCall } from "@/components/ai-chat/workflow";

export function MessageListContainer({ messages, timeline }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  
  // Handle expansion toggles
  // Handle copy functionality
  // Map executions to messages
  
  return messages.map(message => (
    <div key={message.id}>
      <ChatMessage {...message} />
      
      {/* Show execution steps if available */}
      {message.execution && (
        <>
          <ExecutionStep />
          <ResponseMetrics />
        </>
      )}
    </div>
  ));
}
```

### Step 3: Update page.tsx
```tsx
// Simplified page.tsx
import { ConversationSidebarContainer } from "./containers/ConversationSidebarContainer";
import { MessageListContainer } from "./containers/MessageListContainer";
import { ChatHeader, WelcomePrompt } from "@/components/ai-chat/presentational";

export default function AIPage() {
  // Keep only page-level state and API hooks
  
  return (
    <div className="flex h-full">
      <ConversationSidebarContainer {...sidebarProps} />
      
      <div className="flex-1">
        <ChatHeader 
          onBack={() => router.back()}
          title="AI Assistant"
        />
        
        {messages.length === 0 ? (
          <WelcomePrompt 
            onSuggestionClick={handleSuggestion}
          />
        ) : (
          <MessageListContainer 
            messages={messages}
            timeline={timeline}
          />
        )}
        
        <ChatInput />
      </div>
    </div>
  );
}
```

---

## 🔄 Migration Checklist

- [ ] Create `/app/ai/containers/` folder
- [ ] Implement `ConversationSidebarContainer`
- [ ] Implement `MessageListContainer`
- [ ] Update `page.tsx` to use new containers
- [ ] Replace `ChatHeader` import to use presentational version
- [ ] Replace `EmptyState` with `WelcomePrompt`
- [ ] Remove old components:
  - [ ] `/app/ai/components/ChatHeader.tsx`
  - [ ] `/app/ai/components/EmptyState.tsx`
  - [ ] `/app/ai/components/ConversationSidebarWithHint.tsx`
  - [ ] `/app/ai/components/MessageList.tsx`
- [ ] Test all functionality
- [ ] Update imports throughout

---

## 🎯 Benefits After Refactor

1. **Clear Separation of Concerns**
   - Presentational: Just display, no logic
   - Containers: State management and business logic
   - Page: Orchestration only

2. **Reusability**
   - All presentational components can be used anywhere
   - Easy to create different layouts with same components

3. **Testing**
   - Presentational: Simple snapshot/visual tests
   - Containers: Logic tests in isolation
   - Better test coverage

4. **Performance**
   - Better memoization opportunities
   - Smaller bundle sizes (code splitting)
   - Faster re-renders

5. **Developer Experience**
   - Clear file structure
   - Easy to find components
   - Self-documenting architecture

---

## 📚 Component Usage Guide

### Using Presentational Components
```tsx
// ✅ Good - Pure presentational
<WelcomePrompt 
  title="Welcome!"
  suggestions={suggestions}
  onSuggestionClick={handleClick}
/>

// ❌ Bad - Don't put logic in presentational
<WelcomePrompt 
  onSuggestionClick={() => {
    // Complex logic here - NO!
    fetchData();
    updateState();
  }}
/>
```

### Using Container Components
```tsx
// Container handles all logic
function MessageListContainer() {
  // ✅ State management here
  const [expanded, setExpanded] = useState();
  
  // ✅ Business logic here
  const processMessages = () => {...};
  
  // ✅ Pass simple props to presentational
  return <MessageList messages={processed} />;
}
```

---

## 🚀 Next Steps

1. Start with containers implementation
2. Wire up to existing page
3. Test each component swap
4. Remove old components
5. Optimize performance (memoization)
6. Add error boundaries
7. Implement loading states

---

## 📌 Notes

- All components support dark/light theme
- All components have Framer Motion animations (optional)
- TypeScript fully typed
- Storybook stories available at: "AI Chat/Presentational/All Components"
- Breathing animation on approvals: 3s cycle (ADHD-friendly)

---

## 🔗 Related Files

- Presentational Components: `/packages/thehorizon/src/components/ai-chat/presentational/`
- Storybook Stories: `Presentational.stories.tsx`
- Approval System: `/packages/thehorizon/src/components/ai-chat/approval/`
- Workflow Components: `/packages/thehorizon/src/components/ai-chat/workflow/`

---

**Last Updated**: 2025-08-19
**Status**: Ready for implementation
**Context Window Note**: This document preserves all planning and implementation details for future sessions.