# AI Chat Component Architecture

## 🎯 Core Philosophy & Rules

### Architectural Principles

1. **Atomic, Presentational Components**
   - All components are **purely presentational** (dumb components)
   - No business logic, API calls, or state management
   - Everything controlled via props - "props in, UI out"
   - Logic will be added in **container components** that use these primitives

2. **Composition Over Complexity**
   - Small, focused components that do one thing well
   - Components compose together to create complex UIs
   - Single responsibility principle

3. **Design Goals**
   - **Classy Future** - Modern, elegant, professional (not cyberpunk/neon)
   - **Progressive Disclosure** - Simple surface, rich details on demand
   - **Organic & Alive** - Subtle animations that make the UI feel responsive
   - **Multi-Agent Ready** - Built for orchestration and collaboration

4. **Technical Standards**
   - TypeScript for type safety
   - Tailwind CSS for styling (utility-first)
   - Framer Motion for animations
   - Shadcn/ui as component foundation
   - Storybook for component development and testing

## 📋 Development Phases

### ✅ Phase 1: Storybook Setup & Configuration
**Status:** Complete

**What we built:**
- Enhanced Storybook configuration with dark/light mode support
- Proper theming with Tailwind CSS integration
- Fixed CSS variables for `.dark` class support

**Key Files:**
- `.storybook/preview.tsx` - Theme configuration
- `.storybook/main.ts` - Storybook config
- `src/app/globals.css` - Added dark mode CSS variables

**Outcome:** Working Storybook environment with theme switching

---

### ✅ Phase 2: ChatMessage Component
**Status:** Complete

**What we built:**
- Core message display component with role-based styling
- Support for user/assistant/system messages
- Timestamp display, status indicators, hover actions
- Completely stateless with all behavior controlled via props

**Component:** `primitives/ChatMessage/`
- Role-based styling (different colors for user/assistant/system)
- Optional avatar with custom images
- Status states (sending/sent/error)
- Highlighting capability
- Action slots for hover buttons
- Message alignment control

**Props Pattern:**
```typescript
<ChatMessage
  role="assistant"
  content="Message content"
  timestamp={Date}
  status="sending"
  actions={<ActionButtons />}
/>
```

---

### ✅ Phase 3: Agent Attribution System
**Status:** Complete

**What we built:**
- AgentAvatar component with status indicators
- Agent badge system
- Enhanced ChatMessage with agent support
- 5 default agents (Chronos, Valkyrie, Odin, Heimdall, Hermes)

**Components:** `ui/AgentAvatar/`
- Agent-specific colors and icons
- Online/active status indicators
- Size variants (xs/sm/md/lg)
- Animated typing dots
- Agent badges with icons

**Agent System:**
```typescript
const agents = {
  chronos: { color: "blue", icon: Clock, description: "Time & scheduling" },
  valkyrie: { color: "purple", icon: Code, description: "Development" },
  odin: { color: "amber", icon: Brain, description: "Architecture" },
  heimdall: { color: "green", icon: Eye, description: "Monitoring" },
  hermes: { color: "cyan", icon: Send, description: "Communication" }
}
```

---

### ✅ Phase 4: ChatInput Component
**Status:** Complete

**What we built:**
- Feature-rich input with auto-resize
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Optional buttons (send, attach, voice)
- Character counting with limits
- Imperative API via ref

**Component:** `primitives/ChatInput/`
- Fully controlled component pattern
- Auto-resizing textarea
- Loading/recording states
- Custom left/right addons
- Keyboard shortcut hints

**Ref API:**
```typescript
ref.current.focus()
ref.current.blur()
ref.current.clear()
ref.current.setValue(text)
```

---

### ✅ Phase 5: Breathing & Animation System
**Status:** Complete

**What we built:**
- Organic animations that make the UI feel alive
- Removed cheesy effects (neon text) in favor of elegant ones

**Components:** `animations/`

1. **BreathingWrapper**
   - Organic pulse animations (scale/opacity/both/pulse)
   - Configurable intensity (subtle/normal/intense)
   - Optional glow effects (fixed to use box-shadow)

2. **AnimatedText**
   - Typewriter effect with cursor
   - Word-by-word reveal
   - Fade-in and slide-up animations
   - StreamingText for real-time feel

3. **StatusIndicator** (replaced NeonText)
   - Elegant status displays with subtle dots
   - Professional color scheme
   - Pulse animations for active states

4. **Effects**
   - GlowEffect (fixed with box-shadow approach)
   - ShimmerEffect for loading states
   - ThinkingDots for processing indication

---

### ✅ Phase 6: Progressive Disclosure Components
**Status:** Complete

**What we built:**
- Hover and click reveal system for layered information display

**Components:** `disclosure/`

1. **HoverCard**
   - Smart positioning (top/bottom/left/right)
   - Configurable delays
   - Rich content support
   - Arrow indicators pointing to trigger

2. **RevealPanel & RevealDrawer**
   - Slide-out panels from either side
   - Multiple sizes (sm/md/lg/xl/full)
   - RevealDrawer can minimize
   - Optional overlay with backdrop blur

3. **MessageActions**
   - Hover-triggered action buttons
   - Animations (fade/slide/scale)
   - Predefined actions (copy/retry/feedback/etc)
   - QuickActions bar variant

4. **CollapsibleSection**
   - Smooth expand/collapse
   - AccordionGroup for single selection
   - ExpandButton for show more/less
   - Badge support

---

### ✅ Phase 6.5: Viewport Boundary Detection (Positioning Fix)
**Status:** Complete

**What we built:**
- Enhanced HoverCard with intelligent viewport boundary detection
- Automatic position flipping when cards would overflow viewport
- Smart alignment adjustments to keep content visible
- Configurable viewport padding to maintain distance from edges

**Key Features:**
- **Auto-Flip:** Cards automatically flip to opposite side when near edges
- **Smart Alignment:** Tries different alignments to find best fit
- **Fallback Logic:** Multi-step positioning strategy:
  1. Try preferred position
  2. Try opposite side if doesn't fit
  3. Try different alignments on preferred side
  4. Try opposite side with different alignments
  5. Last resort: adjust position to stay within viewport
- **Arrow Tracking:** Arrow position updates to match actual card position

**New Props:**
```typescript
viewportPadding?: number  // Distance from viewport edges (default: 8px)
autoFlip?: boolean        // Enable smart repositioning (default: true)
```

**Outcome:** HoverCards no longer get cut off at viewport boundaries, providing a much better user experience

---

### ✅ Phase 6.7: Agent Workflow Visualization
**Status:** Complete (pending refinement)

**What we built:**
- Complete system for visualizing agent decision-making and execution flow
- Shows the "behind the scenes" of how agents work
- Progressive disclosure approach - simple view with rich details on demand

**Components:** `workflow/`

1. **AgentThinking**
   - Compact: Simple "thinking..." with animated dots
   - Expanded: Step-by-step thought process
   - Duration tracking, timestamps
   - Status indicators (thinking/complete/error)

2. **ToolCall**
   - Visualizes tool usage (search, code, database, web, etc.)
   - Input/output display with smart formatting
   - Status states (pending/running/success/error)
   - Duration and error tracking
   - Icon selection based on tool type

3. **AgentRouter**
   - Shows routing/handoff decisions between agents
   - Types: handoff, delegation, escalation
   - Confidence scores
   - Alternative agents considered
   - Integrates with AgentAvatar system

4. **WorkflowStep**
   - Container for timeline visualization
   - Sequential and parallel execution support
   - Step numbering and status indicators
   - Connector lines between steps
   - Animated entrance effects

5. **AgentWorkflow**
   - Complete orchestration container
   - Timeline view of entire process
   - Compact/detailed view modes
   - Real-time update support
   - Parallel execution visualization
   - Auto-expand active steps

**Key Features:**
- Pure presentational components (all props, no logic)
- Reuses existing components (CollapsibleSection, Badge, StatusIndicator)
- Beautiful Framer Motion animations
- Progressive disclosure at every level
- Support for real-time streaming updates

**Usage Example:**
```typescript
<AgentWorkflow
  items={[
    { id: "1", type: "thinking", data: {...} },
    { id: "2", type: "tool", data: {...}, parallel: true },
    { id: "3", type: "tool", data: {...}, parallel: true },
    { id: "4", type: "routing", data: {...} }
  ]}
  currentStep={2}
  isRunning={true}
/>
```

---

## 🚀 Upcoming Phases

### Phase 7: Streaming & Real-time Components
**Status:** Planned

**What to build:**
- StreamingMessage with character-by-character reveal
- Enhanced TypingIndicator with multiple styles
- ProcessingIndicator for AI thinking states
- ProgressTracker for multi-step operations
- Real-time status updates

---

### Phase 8: Agent Intelligence Display
**Status:** Planned

**What to build:**
- ThinkingPanel showing agent reasoning
- ToolUsageCard displaying tools being used
- MemoryReference showing recalled context
- ConfidenceIndicator for certainty levels
- DecisionTree visualization

---

### Phase 9: Orchestration Visualization
**Status:** Planned

**What to build:**
- AgentHandoff showing transitions between agents
- OrchestrationTimeline for visual flow
- ParallelExecution display for multiple agents
- CollaborationGraph showing agent interactions
- PlanExecutor for step-by-step execution

---

### Phase 10: Smart Containers
**Status:** Planned

**What to build:**
- ChatSession - Complete chat with all features
- AgentWorkspace - Multi-panel layout
- ConversationManager - Handle multiple chats
- IntegrationProvider - Connect to backend

**This is where logic meets presentation:**
- API integration
- State management
- WebSocket/SSE connections
- Error handling
- Data persistence

---

## 🏗️ Component Structure

```
src/components/ai-chat/
├── primitives/          # Base building blocks (pure presentation)
│   ├── ChatMessage/     # Message display
│   ├── ChatInput/       # Input interface
│   └── ...
├── ui/                  # UI enhancements
│   ├── AgentAvatar/     # Agent identities
│   └── ...
├── animations/          # Animation wrappers
│   ├── BreathingWrapper.tsx
│   ├── AnimatedText.tsx
│   └── GlowEffect.tsx
├── disclosure/          # Progressive disclosure
│   ├── HoverCard.tsx
│   ├── RevealPanel.tsx
│   ├── MessageActions.tsx
│   └── CollapsibleSection.tsx
├── workflow/            # Agent workflow visualization
│   ├── AgentThinking.tsx
│   ├── ToolCall.tsx
│   ├── AgentRouter.tsx
│   ├── WorkflowStep.tsx
│   └── AgentWorkflow.tsx
└── containers/          # Smart components (Phase 10)
    └── [future]         # Where logic will live

```

## 🎨 Design System

### Colors
- **Primary:** Brand color (blue by default)
- **Status Colors:**
  - Online: Green
  - Processing: Amber
  - Error: Red
  - Active: Primary
  - Idle: Muted gray

### Animation Timings
- **Hover delays:** 200ms open, 100ms close
- **Transitions:** 200-300ms with ease-in-out
- **Typewriter:** 20-30ms per character
- **Breathing:** 2-3s cycles

### Sizing Scale
- **Components:** xs, sm, md, lg, xl
- **Spacing:** Using Tailwind's spacing scale
- **Border radius:** Using CSS variables for consistency

## 💡 Usage Patterns

### Presentational Component Pattern
```tsx
// Pure presentation - no logic
<ChatMessage 
  role="assistant"
  content={content}
  agent={agent}
  onAction={handleAction}  // Parent handles logic
/>
```

### Container Component Pattern (Future)
```tsx
// Smart container with logic
function ChatContainer() {
  const [messages, setMessages] = useState([])
  const { sendMessage } = useAPI()
  
  return (
    <ChatSession>
      {messages.map(msg => 
        <ChatMessage {...msg} />  // Presentational child
      )}
    </ChatSession>
  )
}
```

### Composition Pattern
```tsx
// Combining atomic components
<BreathingWrapper>
  <HoverCard content={<AgentDetails />}>
    <ChatMessage>
      <AnimatedText text={content} />
    </ChatMessage>
  </HoverCard>
</BreathingWrapper>
```

## 🔧 Development Workflow

1. **Component Development**
   - Create in appropriate directory (primitives/ui/animations/etc)
   - Build as pure presentational component
   - Add comprehensive TypeScript types
   - Create Storybook stories

2. **Testing in Storybook**
   - Create all state variations
   - Test dark/light modes
   - Verify animations
   - Check responsive behavior

3. **Integration**
   - Compose with other components
   - Will be wrapped by smart containers
   - Connected to backend in Phase 10

## 📚 Key Decisions Made

1. **No Neon/Cyberpunk** - Opted for elegant, professional aesthetics
2. **Box-shadow for Glows** - Fixed overflow issues with cleaner approach
3. **Framer Motion** - Chosen for smooth, performant animations
4. **Progressive Disclosure** - Core UX pattern for complexity management
5. **Agent-First Design** - Built for multi-agent interactions from the start

## 🎯 Next Steps

1. Complete remaining presentation phases (7-9)
2. Build smart container components (Phase 10)
3. Integrate with backend API
4. Add real-time streaming support
5. Implement state management solution

---

*This document serves as the source of truth for the AI Chat component architecture. Update it as new phases are completed or decisions are made.*