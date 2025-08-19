# Context Snapshot - 2025-08-19

## 🗂️ Project Structure

```
hq2/ (monorepo)
├── packages/
│   ├── thegrid/          # Backend (Hono, PostgreSQL, Drizzle)
│   ├── thehorizon/       # Frontend (Next.js 14, React, Tailwind)
│   └── thecore/          # Shared types and utilities
```

## 📂 Active Files (Last Worked On)

1. `/packages/thehorizon/src/app/ai/containers/MessageListContainer.tsx`
   - Smart container handling message display logic
   - MessageActions integration with hover states
   
2. `/packages/thehorizon/src/app/ai/components/ConversationSidebarWithHint.tsx`
   - Original restored (was perfect already)
   - Progressive disclosure with hint pill
   
3. `/packages/thehorizon/src/app/ai/page.tsx`
   - Main AI chat page
   - Clean orchestration using containers and presentational components

## 🎨 Design Patterns Chosen

### Component Architecture
- **Presentational/Container Pattern**: Clear separation of UI and logic
- **Progressive Disclosure**: Information revealed on demand
- **Hover Intent**: Delays for better UX (300ms open, 500ms close)

### State Management
- **Jotai**: For global state (conversation ID, streaming state)
- **React State**: For local UI state (hover, expanded sections)
- **localStorage**: For persistent preferences (sidebar pin state)

## 🐛 Problems Encountered & Solutions

### Problem 1: UI Too Bulky
- **Issue**: New components were too large and wrongly positioned
- **Solution**: Restored original ConversationSidebarWithHint, used MessageActions from disclosure

### Problem 2: Button Positioning
- **Issue**: Copy button always on left, too big
- **Solution**: MessageActions with role-based positioning (left for user, right for assistant)

### Problem 3: Lost Features
- **Issue**: Lost keyboard shortcuts and pin functionality
- **Solution**: Kept original sidebar component which had all features

## 👤 User Preferences

- **Development Mode**: Breaking changes are acceptable
- **ADHD-Friendly**: Slow animations (3s breathing), calm transitions
- **Compact UI**: Prefer dense, professional interfaces
- **Progressive Disclosure**: Show minimal info, expand on demand
- **Clean Code**: TypeScript strict, proper separation of concerns

## 🛠️ Tech Stack

### Frontend (The Horizon)
- Next.js 14 (App Router)
- React 18
- TypeScript 5.x
- Tailwind CSS
- Radix UI (primitives)
- Framer Motion (animations)
- Jotai (state management)
- TanStack Query (data fetching)

### Component Libraries
- Custom presentational components in `/components/ai-chat/presentational/`
- Disclosure components for hover/reveal interactions
- Workflow components for execution display

## 🔧 Current Configuration

### Keyboard Shortcuts
- `⌘B` / `Ctrl+B`: Toggle sidebar
- `⌃⇧B` / `Ctrl+Shift+B`: Pin/unpin sidebar
- `ESC`: Close unpinned sidebar

### Animation Timings
- Breathing: 3s cycle (ADHD-friendly)
- Hover intent: 300ms to open
- Leave delay: 500ms to close
- Message actions: slide animation

## 📌 Important Notes

1. **Don't Convert**: Original components that work well should be kept
2. **MessageActions**: Always use from disclosure, not custom buttons
3. **Positioning**: User messages have actions on left, assistant on right
4. **Type Safety**: Use the types from `/lib/ai-chat/types.ts`

## 🚦 Current State

- ✅ Refactor complete
- ✅ UI fixed and compact
- ✅ All features working
- ⚠️ Some TypeScript warnings remain (non-critical)
- 🔄 Ready for optimization phase

## 💭 Understanding for Next Session

The AI Chat page is now properly architected with:
1. **Presentational components** for pure UI (in `/components/ai-chat/presentational/`)
2. **Container components** for logic (in `/app/ai/containers/`)
3. **Original sidebar** preserved for its perfect progressive disclosure
4. **Professional message actions** that appear on hover

The user values clean, compact UI with smooth interactions. The refactor successfully separated concerns while maintaining all original functionality.

---

**Snapshot Created**: 2025-08-19
**Context Usage**: ~70%
**Ready for**: Performance optimization, testing, error boundaries