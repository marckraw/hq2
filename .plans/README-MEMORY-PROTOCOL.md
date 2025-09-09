# 🧠 MEMORY PROTOCOL - How to Document Our Journey

## ⚡ ATTENTION AI: READ THIS FIRST!
**If you're starting a new session and the user mentions this file, follow these rules to understand and continue the work.**

---

## 📋 Purpose of `.plans/` Folder

This folder is our **persistent memory bank** across AI sessions. When context is lost, this is where we store everything needed to continue seamlessly.

---

## 🗂️ Folder Structure

```
.plans/
├── README-MEMORY-PROTOCOL.md          # THIS FILE - The rules
├── [date]-refactor-plan.md           # Detailed refactor plans
├── session-[date]-summary.md         # Daily session summaries
├── component-inventory.md            # What components exist where
└── context-[date]-snapshot.md        # Full context snapshots
```

---

## 📝 What to Document (ALWAYS)

### 1. Session Summary (End of Each Session)
**File**: `session-[YYYY-MM-DD]-summary.md`

Must include:
- **Date & Time**
- **What We Accomplished** - Bullet list with file paths
- **Current Status** - What's done, what's in progress
- **Key Decisions** - Why we chose certain approaches
- **Problems Solved** - Especially tricky ones (like that 200ms animation bug!)
- **Next Steps** - Exactly what to do next
- **Commands** - Any useful commands to run

### 2. Refactor Plans (When Making Big Changes)
**File**: `[topic]-refactor-plan.md`

Must include:
- **Goal** - What we're trying to achieve
- **Current State** - What exists now (with file paths)
- **Target State** - What it should look like
- **Step-by-Step Plan** - Numbered, actionable steps
- **Code Examples** - Actual code snippets
- **Migration Checklist** - [ ] checkboxes to track
- **File Locations** - Full paths to everything

### 3. Component Inventory (When Creating Components)
**File**: `component-inventory.md`

Track:
- **Component Name**
- **Location** (full path)
- **Type** (presentational/container/mixed)
- **Status** (done/in-progress/planned)
- **Dependencies**
- **Used In** (where it's imported)
- **Storybook Story** (if exists)

### 4. Context Snapshots (When Context Getting Full)
**File**: `context-[YYYY-MM-DD]-snapshot.md`

Include:
- **Project Structure** - Current folder layout
- **Active Files** - What we're working on
- **Decisions Made** - Design patterns chosen
- **Problems Encountered** - And their solutions
- **User Preferences** - (like "we don't care about breaking changes")
- **Tech Stack** - Key libraries and versions

---

## 💾 When & How to Save Your Work (BEFORE Context Ends)

### Signs Your Context is Getting Full:
- User mentions "context window is ending"
- You've been working for 2+ hours
- Conversation is getting very long
- You start forgetting earlier decisions
- User says "let's save this"

### IMMEDIATE SAVE PROTOCOL:

1. **Create Session Summary** (5 minutes before context limit)
   ```bash
   # File: session-YYYY-MM-DD-summary.md
   ```
   Include:
   - Everything accomplished (with file paths)
   - Current working state
   - Any half-finished work
   - Exact next steps
   - Any important context/decisions

2. **Update or Create Refactor Plan** (if doing major work)
   ```bash
   # File: [current-work]-refactor-plan.md
   ```
   - Mark completed items with ✅
   - Update TODO items
   - Add any new discoveries
   - Include code snippets of partial work

3. **Create Context Snapshot** (if major session)
   ```bash
   # File: context-YYYY-MM-DD-snapshot.md
   ```
   - Current file being edited
   - Last command run
   - Any error states
   - User's last request
   - Your current understanding

4. **Quick Save Command List**
   ```bash
   # If user says "save your work quickly":
   echo "Current task: [what you're doing]" >> .plans/quick-save.md
   echo "Next step: [exact next action]" >> .plans/quick-save.md
   echo "Files touched: [list files]" >> .plans/quick-save.md
   ```

### The 90% Rule:
**When context is ~90% full, STOP coding and START documenting!**

### Proactive Saving Triggers:
Save your work when:
- ✅ Completing a major component
- 🔄 Switching to different task
- 🐛 After solving a tricky bug
- 💡 After making important design decision
- ⏰ Every hour of active work
- 🚫 Before any large deletion/refactor

### Emergency Save Template:
```markdown
# QUICK CONTEXT SAVE - [DATE TIME]

## What I Was Doing:
[One sentence]

## Last Completed:
[File path and what was done]

## Currently Working On:
[File path and current task]

## Next Step:
[Exact action to take]

## Important Context:
[Any crucial info that would be lost]
```

---

## 🔄 How to Resume Work (AI Instructions)

When starting a new session:

1. **Check Latest Session Summary**
   ```bash
   ls -lt .plans/session-*.md | head -1
   ```

2. **Read the Most Recent Plan**
   ```bash
   ls -lt .plans/*-plan.md | head -1
   ```

3. **Check Component Inventory** (if exists)
   ```bash
   cat .plans/component-inventory.md
   ```

4. **Look for TODOs**
   - Check "Next Steps" in session summary
   - Check unchecked boxes in refactor plans

5. **Understand Context**
   - User is building HQ system
   - Monorepo with packages/thegrid (backend) and packages/thehorizon (frontend)
   - Focus on clean component architecture
   - User values: Clean code, good UX, ADHD-friendly design

---

## 💬 Key Phrases to Remember

When the user says:
- **"We're in development mode"** = Breaking changes are OK
- **"Make it presentational"** = No business logic, pure components
- **"ADHD-friendly"** = Slower, calmer animations (3s+ cycles)
- **"Full refactor"** = Complete restructure is acceptable
- **"Check the plans"** = Read `.plans/` folder first

---

## 🎯 Documentation Standards

### File Naming
- Session summaries: `session-YYYY-MM-DD-summary.md`
- Refactor plans: `[topic]-refactor-plan.md`
- Context snapshots: `context-YYYY-MM-DD-snapshot.md`

### Markdown Format
- Use emoji headers for quick scanning
- Include code blocks with language tags
- Use tables for comparisons
- Add checkboxes for todo items
- Include file paths as inline code

### Code Examples
Always include:
- File path comment at top
- Brief explanation
- Actual working code (not pseudo-code)

```tsx
// File: /exact/path/to/file.tsx
// Purpose: Brief description

import { Something } from "@/exact/import/path";

// Actual code here
```

---

## 🚀 Quick Recovery Commands

```bash
# See what we were working on
ls -la .plans/

# Get latest status
cat .plans/session-*-summary.md | tail -1

# Check current refactor
grep -h "TODO\|Next Steps" .plans/*.md

# Find component locations
grep -h "Location:" .plans/*.md
```

---

## 🎨 Current Project Context (Update This!)

**Project**: HQ - Life Control System
**Current Focus**: AI Chat UI Components
**Architecture Pattern**: Presentational/Container separation
**Design System**: Tailwind + Radix UI + Framer Motion
**Key Achievement**: Created presentational component library
**Next Goal**: Refactor AI page to use new components

**User Preferences**:
- Clean, reusable components
- ADHD-friendly UX (calm animations)
- Clear separation of concerns
- TypeScript everything
- Storybook for all components

---

## 📌 REMEMBER

> "This folder is our memory. Document like you're leaving notes for yourself after amnesia. Be specific, include paths, show code, explain why."

**When in doubt**: Over-document rather than under-document.

---

**Created**: 2025-08-19
**Purpose**: Ensure seamless continuation across AI sessions
**Update**: This file whenever documentation patterns change