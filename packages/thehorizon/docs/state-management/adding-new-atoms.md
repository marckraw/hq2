# Adding New Atoms: Developer Guide

## 🎯 Overview

This guide provides step-by-step instructions for adding new atoms to TheHorizon's state management system, following our established best practices and architectural patterns.

## 📋 Quick Checklist

Before you start, ask yourself:

- [ ] Is this truly new state, or can I use existing hooks?
- [ ] Does this belong in global state or feature-specific state?
- [ ] What domain does this state belong to?
- [ ] Do I need read-only access, actions, or both?

## 🗂️ Step 1: Determine the Domain

### Global State (`src/_state/`)

**Use when your state is:**

- ✅ App-wide concerns (authentication, theme, settings)
- ✅ Used across multiple features/routes
- ✅ Persists across navigation
- ✅ Shared by unrelated components

**Examples**: User profile, app settings, global notifications, theme preferences

### Feature State (`src/app/[feature]/_state/`)

**Use when your state is:**

- ✅ Feature-specific concerns
- ✅ Only used within one feature
- ✅ Tied to specific routes/pages
- ✅ Independent from other features

**Examples**: Chat messages, form state, feature-specific UI state

## 📁 Step 2: Choose the Right Domain File

### For Chat State (`src/app/chat/_state/chat/atoms/`)

| File           | Purpose                               | Examples                                    |
| -------------- | ------------------------------------- | ------------------------------------------- |
| `core.ts`      | Conversation data, messages, timeline | Messages, conversation ID, loading states   |
| `ui.ts`        | Form state, attachments, validation   | Editor content, attachments, voice recorder |
| `models.ts`    | Model/agent selection                 | Selected model, agent type, capabilities    |
| `streaming.ts` | Real-time updates, progress, TTS      | Connection status, progress messages, TTS   |

### For Global State (`src/_state/atoms/`)

| File          | Purpose           | Examples                                          |
| ------------- | ----------------- | ------------------------------------------------- |
| `auth.ts`     | Authentication    | User profile, login state, permissions            |
| `theme.ts`    | Theme preferences | Dark/light mode, sidebar state                    |
| **New files** | Create as needed  | `notifications.ts`, `settings.ts`, `workspace.ts` |

## 🔧 Step 3: Create Atoms with Private/Public Pattern

### Template Structure

```typescript
// File: src/_state/atoms/notifications.ts (example)

import { atom } from "jotai";

// =============================================================================
// TYPES (define your interfaces first)
// =============================================================================

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}

// =============================================================================
// PRIVATE BASE ATOMS (never export these directly!)
// =============================================================================

const _notificationsAtom = atom<Notification[]>([]);
const _unreadCountAtom = atom(0);

// =============================================================================
// PUBLIC READ-ONLY ATOMS
// =============================================================================

export const notificationsAtom = atom((get) => get(_notificationsAtom));
export const unreadCountAtom = atom((get) => get(_unreadCountAtom));

// =============================================================================
// DERIVED ATOMS (computed state)
// =============================================================================

export const hasUnreadNotificationsAtom = atom((get) => {
  return get(_unreadCountAtom) > 0;
});

export const recentNotificationsAtom = atom((get) => {
  const notifications = get(_notificationsAtom);
  return notifications.slice(0, 5); // Last 5 notifications
});

export const notificationsByTypeAtom = atom((get) => {
  const notifications = get(_notificationsAtom);
  return {
    info: notifications.filter((n) => n.type === "info"),
    success: notifications.filter((n) => n.type === "success"),
    warning: notifications.filter((n) => n.type === "warning"),
    error: notifications.filter((n) => n.type === "error"),
  };
});

// =============================================================================
// ACTION ATOMS (for mutations)
// =============================================================================

export const addNotificationAtom = atom(
  null,
  (get, set, notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    const current = get(_notificationsAtom);
    set(_notificationsAtom, [...current, newNotification]);

    if (!newNotification.read) {
      set(_unreadCountAtom, get(_unreadCountAtom) + 1);
    }
  }
);

export const markAsReadAtom = atom(null, (get, set, id: string) => {
  const current = get(_notificationsAtom);
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  set(_notificationsAtom, updated);

  // Recalculate unread count
  const unreadCount = updated.filter((n) => !n.read).length;
  set(_unreadCountAtom, unreadCount);
});

export const markAllAsReadAtom = atom(null, (get, set) => {
  const current = get(_notificationsAtom);
  const updated = current.map((n) => ({ ...n, read: true }));
  set(_notificationsAtom, updated);
  set(_unreadCountAtom, 0);
});

export const removeNotificationAtom = atom(null, (get, set, id: string) => {
  const current = get(_notificationsAtom);
  const notification = current.find((n) => n.id === id);
  const updated = current.filter((n) => n.id !== id);

  set(_notificationsAtom, updated);

  // Decrease unread count if notification was unread
  if (notification && !notification.read) {
    set(_unreadCountAtom, Math.max(0, get(_unreadCountAtom) - 1));
  }
});

export const clearAllNotificationsAtom = atom(null, (get, set) => {
  set(_notificationsAtom, []);
  set(_unreadCountAtom, 0);
});
```

## 🎣 Step 4: Create Custom Hooks

### Hook Template

```typescript
// File: src/_state/hooks/useNotifications.ts

/**
 * Notification Hooks
 *
 * Custom hooks for notification management following official Jotai pattern.
 * Provides clean interfaces for components to interact with notification state.
 */

import { useAtomValue, useSetAtom } from "jotai";
import {
  // Read-only atoms
  notificationsAtom,
  unreadCountAtom,
  hasUnreadNotificationsAtom,
  recentNotificationsAtom,
  notificationsByTypeAtom,

  // Action atoms
  addNotificationAtom,
  markAsReadAtom,
  markAllAsReadAtom,
  removeNotificationAtom,
  clearAllNotificationsAtom,
} from "../atoms/notifications";

// =============================================================================
// NOTIFICATION STATE HOOKS
// =============================================================================

/**
 * Hook for read-only access to notification state
 */
export function useNotificationState() {
  const notifications = useAtomValue(notificationsAtom);
  const unreadCount = useAtomValue(unreadCountAtom);
  const hasUnread = useAtomValue(hasUnreadNotificationsAtom);
  const recent = useAtomValue(recentNotificationsAtom);
  const byType = useAtomValue(notificationsByTypeAtom);

  return {
    notifications,
    unreadCount,
    hasUnread,
    recent,
    byType,
  };
}

/**
 * Hook for notification actions
 */
export function useNotificationActions() {
  const addNotification = useSetAtom(addNotificationAtom);
  const markAsRead = useSetAtom(markAsReadAtom);
  const markAllAsRead = useSetAtom(markAllAsReadAtom);
  const removeNotification = useSetAtom(removeNotificationAtom);
  const clearAll = useSetAtom(clearAllNotificationsAtom);

  return {
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

/**
 * Hook for combined notification state and actions
 */
export function useNotifications() {
  const state = useNotificationState();
  const actions = useNotificationActions();

  return {
    ...state,
    ...actions,
  };
}
```

## 📤 Step 5: Export from Index

### Global State Export

```typescript
// File: src/_state/index.ts

// Add to existing exports:
export {
  useNotifications,
  useNotificationState,
  useNotificationActions,
} from "./hooks/useNotifications";
```

### Chat State Export

```typescript
// File: src/app/chat/_state/chat/index.ts

// Add to existing exports:
export {
  useYourNewHook,
  useYourNewHookState,
  useYourNewHookActions,
} from "./hooks/useYourNewHook";
```

## ⚛️ Step 6: Use in Components

### Basic Usage

```typescript
// Read-only component
import { useNotificationState } from "@/_state";

function NotificationBadge() {
  const { unreadCount, hasUnread } = useNotificationState();

  if (!hasUnread) return null;

  return <Badge>{unreadCount}</Badge>;
}
```

### Interactive Component

```typescript
// Component with actions
import { useNotifications } from "@/_state";

function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  return (
    <div>
      <div className="header">
        <h3>Notifications ({unreadCount})</h3>
        <button onClick={markAllAsRead}>Mark All Read</button>
      </div>

      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={notification.read ? "read" : "unread"}
        >
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>Mark Read</button>
          <button onClick={() => removeNotification(notification.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Advanced Usage with Multiple Hooks

```typescript
// Complex component using multiple domains
import { useNotifications } from "@/_state";
import { useConversationState } from "@/app/chat/_state/chat";

function AppHeader() {
  const { unreadCount } = useNotifications();
  const { isLoading } = useConversationState();

  return (
    <header>
      <Logo />
      {isLoading && <LoadingSpinner />}
      <NotificationBell count={unreadCount} />
    </header>
  );
}
```

## 📚 Step 7: Update Documentation

### Add to Appropriate Docs

**For Global State**: Update `docs/state-management/global-state.md`

````markdown
### 🔔 Notifications (`notifications.ts`)

**Purpose**: App-wide notification system

**Hooks:**

- `useNotifications()` - Complete notification management
- `useNotificationState()` - Read-only notification state
- `useNotificationActions()` - Notification actions only

**Usage:**

```typescript
const { notifications, unreadCount, addNotification } = useNotifications();
```
````

````

**For Chat State**: Update `docs/state-management/chat-state.md`

## 🎯 Best Practices Checklist

### ✅ Atom Design
- [ ] Private base atoms (prefixed with `_`)
- [ ] Public read-only atoms for state access
- [ ] Derived atoms for computed state
- [ ] Action atoms for each mutation
- [ ] Proper TypeScript interfaces

### ✅ Hook Design
- [ ] State hook for read-only access
- [ ] Actions hook for mutations only
- [ ] Combined hook for convenience
- [ ] Clear JSDoc comments
- [ ] Consistent naming patterns

### ✅ Organization
- [ ] Correct domain file placement
- [ ] Exported from appropriate index
- [ ] Documentation updated
- [ ] Examples provided

### ✅ Component Usage
- [ ] Import hooks, not atoms
- [ ] Use appropriate hook type (state vs actions vs combined)
- [ ] Follow React hooks rules
- [ ] Handle loading/error states

## ⚠️ Common Pitfalls

### ❌ Don't Export Base Atoms

```typescript
// ❌ DON'T: Direct atom export
export const messagesAtom = atom<Message[]>([]);

// ✅ DO: Private atom with public derived atom
const _messagesAtom = atom<Message[]>([]);
export const messagesAtom = atom((get) => get(_messagesAtom));
````

### ❌ Don't Import Atoms in Components

```typescript
// ❌ DON'T: Direct atom import
import { messagesAtom } from "../atoms/core";
const [messages] = useAtom(messagesAtom);

// ✅ DO: Use custom hooks
import { useConversationState } from "../_state/chat";
const { messages } = useConversationState();
```

### ❌ Don't Mix Domains

```typescript
// ❌ DON'T: Put chat state in global atoms
// File: src/_state/atoms/theme.ts
const chatMessagesAtom = atom([]); // Wrong place!

// ✅ DO: Keep domains separate
// File: src/app/chat/_state/chat/atoms/core.ts
const _messagesAtom = atom([]); // Correct place!
```

## 🚀 Advanced Patterns

### Async Actions

```typescript
export const fetchNotificationsAtom = atom(null, async (get, set) => {
  set(isLoadingNotificationsAtom, true);
  try {
    const notifications = await api.getNotifications();
    set(_notificationsAtom, notifications);
  } catch (error) {
    set(notificationErrorAtom, error.message);
  } finally {
    set(isLoadingNotificationsAtom, false);
  }
});
```

### Persistence

```typescript
import { atomWithStorage } from "jotai/utils";

const _settingsAtom = atomWithStorage("app-settings", defaultSettings);
```

### Atom Families

```typescript
import { atomFamily } from "jotai/utils";

const userAtomFamily = atomFamily((userId: string) => atom<User | null>(null));
```

## 🎉 You're Ready!

Following this guide ensures your new atoms will:

- ✅ Follow established architectural patterns
- ✅ Integrate seamlessly with existing code
- ✅ Provide excellent developer experience
- ✅ Be maintainable and scalable
- ✅ Have proper TypeScript support

Happy coding! 🚀

---

**Need Help?** Check the existing atoms in `src/app/chat/_state/chat/atoms/` for real-world examples, or refer to our [Architecture Guide](./architecture.md) for deeper understanding.
