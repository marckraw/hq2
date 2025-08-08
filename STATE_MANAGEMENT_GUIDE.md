# State Management Decision Guide

## Overview

This guide helps you decide when to use **local React state**, **prop passing**, or **Jotai atoms** in our React applications. The key is choosing the right tool for the right job to maintain clean, performant, and maintainable code.

## The State Management Spectrum

### 1. Local React State (`useState`, `useReducer`)

**✅ Use when:**

- State is only needed by ONE component and its direct children
- State is ephemeral/temporary (form inputs, toggles, loading states for single operations)
- State doesn't need to persist across component unmounts
- Performance is critical and you want to avoid unnecessary re-renders
- High-frequency updates (like keystroke input)

**Examples:**

```typescript
// ✅ Perfect for local state
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [inputFocused, setInputFocused] = useState(false);
const [tempFormData, setTempFormData] = useState({});
const [isHovered, setIsHovered] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);
const [animationState, setAnimationState] = useState("idle");
const [validationErrors, setValidationErrors] = useState({});
```

### 2. Prop Passing

**✅ Use when:**

- State needs to be shared between 2-3 components in a direct parent-child relationship
- The component tree is shallow (1-2 levels deep)
- You want explicit data flow that's easy to trace
- The props are stable and don't change frequently
- Configuration or event handlers

**Examples:**

```typescript
// ✅ Good for prop passing
<ChatMessage
  message={message}
  onEdit={handleEdit}
  isSelected={selectedId === message.id}
/>

<InputField
  value={inputValue}
  onChange={setInputValue}
  disabled={isSubmitting}
/>

<Button onClick={handleSubmit} disabled={!canSubmit} />

<MessageBubble
  variant="user"
  showTimestamp={true}
  allowEdit={!isReadOnly}
/>
```

### 3. Jotai Atoms (Global State)

**✅ Use when:**

- State needs to be accessed by multiple components across different parts of the tree
- State should persist across component unmounts/remounts
- You have complex derived state that multiple components need
- You want to avoid prop drilling through 3+ levels
- State changes should trigger updates in distant components
- You need a single source of truth for application-wide data

**Examples:**

```typescript
// ✅ Perfect for Jotai atoms
const selectedModelAtom = atom("gpt-4");
const attachmentsAtom = atom([]);
const userPreferencesAtom = atom({});
const connectionStatusAtom = atom("connected");
const messagesAtom = atom([]);

// ✅ Derived atoms for computed state
const currentSelectionAtom = atom((get) => {
  const model = get(selectedModelAtom);
  const agentType = get(agentTypeAtom);
  return { model, agentType };
});

const canSubmitAtom = atom((get) => {
  const content = get(editorContentAtom);
  const isLoading = get(isLoadingAtom);
  return content.trim().length > 0 && !isLoading;
});
```

## Decision Framework

### Ask These Questions:

#### 1. **"How many components need this state?"**

- **1 component** → Local state
- **2-3 related components** → Props or local state with lifting
- **3+ or distant components** → Jotai

#### 2. **"Does this state survive component unmounting?"**

- **Yes** → Jotai (like selected model persisting during navigation)
- **No** → Local state (like dropdown open state)

#### 3. **"Is this state derived from other state?"**

- **Yes + used by multiple components** → Jotai derived atom
- **Yes + used by one component** → Local useMemo
- **No** → Depends on scope

#### 4. **"How often does this state change?"**

- **Very frequently** (every keystroke) → Consider local state first
- **Occasionally** → Jotai is fine
- **Rarely** → Either works

#### 5. **"Is this UI interaction state or business logic state?"**

- **UI interaction** (hover, focus, animations) → Local state
- **Business logic** (user data, app state) → Jotai

## State Categories & Recommendations

### ✅ Perfect for Local State:

```typescript
// UI Interaction State
const [isHovered, setIsHovered] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);
const [isDragging, setIsDragging] = useState(false);
const [showMobileMenu, setShowMobileMenu] = useState(false);

// Temporary Form State
const [tempInput, setTempInput] = useState("");
const [validationErrors, setValidationErrors] = useState({});

// Component-Specific Loading
const [isUploading, setIsUploading] = useState(false);
const [isValidating, setIsValidating] = useState(false);

// Animation States
const [animationPhase, setAnimationPhase] = useState("idle");
```

### ✅ Perfect for Jotai Atoms:

```typescript
// Application State
const selectedModelAtom = atom("gpt-4");
const userSessionAtom = atom(null);
const appConfigAtom = atom({});

// Shared Data
const messagesAtom = atom([]);
const attachmentsAtom = atom([]);
const chatHistoryAtom = atom([]);

// Global UI State
const sidebarOpenAtom = atom(false);
const themeAtom = atom("light");
const notificationsAtom = atom([]);

// Derived/Computed State
const messageStatsAtom = atom((get) => {
  const messages = get(messagesAtom);
  return {
    total: messages.length,
    unread: messages.filter((m) => !m.read).length,
  };
});
```

### ✅ Good for Prop Passing:

```typescript
// Configuration Props
<Component variant="primary" size="large" disabled={false} />

// Event Handlers
<Button onClick={handleClick} onHover={handleHover} />

// Stable Data
<UserProfile user={currentUser} showActions={true} />

// Parent-Child Communication
<Modal isOpen={isModalOpen} onClose={closeModal}>
  <ModalContent data={modalData} />
</Modal>
```

## Performance Considerations

### Jotai Advantages:

- ✅ Automatic dependency tracking
- ✅ Only re-renders components that use changed atoms
- ✅ Great for derived state
- ✅ Prevents unnecessary prop drilling
- ✅ Built-in memoization

### Local State Advantages:

- ✅ Faster updates (no atom subscription overhead)
- ✅ Easier to reason about in isolation
- ✅ Better for high-frequency updates
- ✅ Simpler debugging
- ✅ No global state pollution

### Prop Passing Advantages:

- ✅ Explicit data flow
- ✅ Easy to trace and debug
- ✅ Type-safe by default
- ✅ No hidden dependencies

## Migration Patterns

### When to Refactor FROM Local State TO Jotai:

```typescript
// 🚨 Signs you need to move to Jotai:
// 1. Prop drilling through 3+ levels
<GrandParent>
  <Parent someState={state} setSomeState={setState}>
    <Child someState={state} setSomeState={setState}>
      <GrandChild someState={state} setSomeState={setState} />
    </Child>
  </Parent>
</GrandParent>

// 2. State synchronization issues
// Multiple components managing the same logical state separately

// 3. Complex derived state calculations repeated across components
```

### When to Refactor FROM Jotai TO Local State:

```typescript
// 🚨 Signs you should move to local state:
// 1. Only one component uses the atom
const onlyUsedHereAtom = atom(false); // Move to useState

// 2. Very high-frequency updates causing performance issues
const keystrokeAtom = atom(""); // Consider local state + debounced sync

// 3. Temporary UI state that doesn't need persistence
const tooltipVisibleAtom = atom(false); // Move to useState
```

## General Philosophy

### The Progressive Enhancement Approach:

1. **Start with local state** - it's simpler and more explicit
2. **Move to props** when you need to share between parent/child
3. **Move to Jotai** when you hit prop drilling pain or need global access
4. **Use derived atoms** for expensive calculations used by multiple components

### Golden Rules:

- **Don't over-engineer early** - start simple, refactor when you feel pain
- **Don't be afraid to refactor** - moving between state types is usually straightforward
- **Prefer explicit over implicit** - make data flow obvious when possible
- **Optimize for maintainability** - choose the approach that makes the code easier to understand and modify

### Red Flags:

- ❌ Passing the same props through 3+ component levels
- ❌ Multiple components maintaining separate copies of the same logical state
- ❌ Complex useEffect chains trying to sync state between components
- ❌ Global atoms for purely local UI interactions
- ❌ Local state for data that needs to persist across navigation

## Quick Reference Checklist

Before choosing your state management approach, ask:

- [ ] How many components need this state?
- [ ] Does this state need to persist across unmounts?
- [ ] Is this derived from other state?
- [ ] How frequently does this change?
- [ ] Is this UI interaction or business logic?
- [ ] Will this cause prop drilling?
- [ ] Do I need this state to be debuggable globally?

**When in doubt, start local and refactor when you feel the pain.**
