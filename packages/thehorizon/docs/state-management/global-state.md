# Global State Architecture

## 🌍 Overview

This document explains the global state management architecture that serves the entire application, separate from feature-specific state like chat.

## 📁 Directory Structure

```
src/_state/                  # Global app state (truly global)
├── atoms/                  # Private atoms organized by domain
│   ├── auth.ts            # Authentication state
│   └── theme.ts           # Theme & UI preferences
├── hooks/                 # Public hook API
│   ├── useAuth.ts         # Authentication hooks
│   └── useTheme.ts        # Theme & UI hooks
└── index.ts              # Public API exports
```

## 🎯 Global vs Feature State

### Global State (src/\_state/)

**Used for**: App-wide concerns that affect multiple features

- ✅ User authentication
- ✅ Theme preferences (light/dark)
- ✅ Sidebar state
- ✅ App-level settings

### Feature State (src/app/[feature]/\_state/)

**Used for**: Feature-specific concerns

- ✅ Chat messages and conversation state
- ✅ Chat UI state (input, attachments)
- ✅ Chat-specific model selection
- ✅ Chat streaming and connection state

## 🔗 State Domains

### 🔐 Authentication (`auth.ts`)

**Atoms:**

```typescript
// Private base atoms
const _currentUserAtom = atom<User | null>(null);

// Public read-only atoms
export const currentUserAtom = atom((get) => get(_currentUserAtom));
export const isAuthenticatedAtom = atom(
  (get) => get(_currentUserAtom) !== null
);

// Action atoms
export const setCurrentUserAtom = atom(null, (_get, set, user: User | null) => {
  set(_currentUserAtom, user);
});
export const logoutAtom = atom(null, (_get, set) => {
  set(_currentUserAtom, null);
});
```

**Hooks:**

```typescript
// Complete auth management
const { currentUser, isAuthenticated, setCurrentUser, logout } = useAuth();

// Read-only auth state
const { currentUser, isAuthenticated } = useAuthState();

// Auth actions only
const { setCurrentUser, logout } = useAuthActions();
```

### 🎨 Theme & UI (`theme.ts`)

**Theme Management:**
Theme is now handled by the unified `ThemeProvider` using `next-themes` pattern with database persistence.

**UI Preference Atoms:**

```typescript
// Private base atoms
const _sidebarOpenAtom = atom(true);

// Public read-only atoms
export const sidebarOpenAtom = atom((get) => get(_sidebarOpenAtom));

// Action atoms
export const setSidebarOpenAtom = atom(null, (_get, set, open: boolean) => {
  set(_sidebarOpenAtom, open);
});
export const toggleSidebarAtom = atom(null, (get, set) => {
  const current = get(_sidebarOpenAtom);
  set(_sidebarOpenAtom, !current);
});
```

**Hooks:**

```typescript
// Theme management (from ThemeProvider)
const { theme, setTheme, toggleDarkMode, setColorVariation } = useTheme();

// Sidebar management (from Jotai atoms)
const { sidebarOpen, setSidebarOpen, toggleSidebar } = useSidebar();
```

### 🌐 Connection Status

**Note**: Connection status is handled at the feature level, not globally. Chat connection status is managed in the chat state (`src/app/chat/_state/`) using `useStreaming()` hooks.

## 🎯 Usage Patterns

### Pattern 1: App Layout Components

```typescript
import { useTheme, useAuth } from "@/_state";

function AppLayout() {
  const { theme, toggleDarkMode, setColorVariation } = useTheme();
  const { currentUser, isAuthenticated } = useAuth();

  // Theme has multiple variations: light, dark, light-sage, dark-sage, light-pink, dark-pink
  // Use global state for app-wide UI
}
```

### Pattern 2: Navigation Components

```typescript
import { useSidebar, useAuth } from "@/_state";

function Navigation() {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { currentUser, logout } = useAuth();

  // Use global state for navigation
}
```

````

### Pattern 3: Feature Components

```typescript
import { useAuth } from "@/_state";
import { useConversation } from "@/app/chat/_state/chat";

function ChatInterface() {
  const { isAuthenticated } = useAuth(); // Global state
  const { messages } = useConversation(); // Feature state

  // Combine global and feature state
}
````

## 🔄 State Persistence

Global state persistence is handled differently for each domain:

### Theme Persistence

```typescript
// Theme is automatically persisted by ThemeProvider:
// 1. Primary: Database storage via API
// 2. Fallback: localStorage
// 3. Final fallback: System preference
const { theme } = useTheme(); // Automatically loads from database
```

### Auth Persistence

```typescript
// Example: Persist auth token (if needed)
const persistedAuthAtom = atomWithStorage("authToken", null);
```

### UI Preferences

```typescript
// Sidebar state can be persisted if needed
import { atomWithStorage } from "jotai/utils";
const persistedSidebarAtom = atomWithStorage("sidebar", true);
```

## 🧪 Testing Global State

```typescript
// Mock global hooks in tests
jest.mock("@/_state", () => ({
  useAuth: () => ({
    currentUser: mockUser,
    isAuthenticated: true,
    logout: jest.fn(),
  }),
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
    toggleDarkMode: jest.fn(),
    setColorVariation: jest.fn(),
  }),
  useSidebar: () => ({
    sidebarOpen: true,
    setSidebarOpen: jest.fn(),
    toggleSidebar: jest.fn(),
  }),
}));

// For components using ThemeProvider directly
jest.mock("@/providers/theme-provider", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
    toggleDarkMode: jest.fn(),
    setColorVariation: jest.fn(),
  }),
}));
```

## 🎨 Benefits of Global State Separation

1. **Clear Boundaries**: Easy to understand what affects the whole app vs specific features
2. **Reusability**: Global state can be used by any feature
3. **Performance**: Global state changes don't trigger unnecessary re-renders in features
4. **Maintainability**: Easy to find and modify app-wide concerns
5. **Testing**: Can mock global state independently of feature state

## 📋 Global State Checklist

When deciding if state should be global:

- [ ] Does it affect multiple features?
- [ ] Is it needed across different routes?
- [ ] Does it persist across user sessions?
- [ ] Is it related to app-wide UI/UX?
- [ ] Would features break without it?

If yes to most questions → Global state
If no to most questions → Feature state

## 🔗 Integration with Feature State

Global state and feature state work together seamlessly:

```typescript
// Feature component using both
import { useAuth } from "@/_state"; // Global
import { useConversation } from "@/app/chat/_state/chat"; // Feature

function ChatMessage({ message }) {
  const { currentUser } = useAuth(); // Global user
  const { addMessage } = useConversation(); // Feature action

  const isOwnMessage = message.userId === currentUser?.id;

  // Component logic combining global and feature state
}
```

This architecture ensures clean separation while maintaining flexibility for components that need both global and feature-specific state.
