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
**Status:** Complete

**What we built:**
- Complete system for visualizing agent decision-making and execution flow
- Shows the "behind the scenes" of how agents work
- Progressive disclosure approach - simple view with rich details on demand
- **Refined UI:** More compact and condensed design with better alignment
- **Clear Intent Display:** Shows current agent intent at a glance in compact mode

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
- **Compact Design:** Smaller circles (h-5 w-5), reduced font sizes
- **Intent Display:** Shows what agent is doing without expanding details
- **Design System Integration:** Uses centralized tokens for consistency

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

### ✅ Phase 6.8: Design System Implementation
**Status:** Complete

**What we built:**
- Centralized design system with consistent tokens
- Typography scale, component sizes, spacing, and effects
- Applied design system to all workflow components

**Key File:** `design-system.ts`

**Benefits:**
- **Consistency:** Same sizes used everywhere via tokens
- **Maintainability:** Change sizes in one place, updates everywhere  
- **Scalability:** Easy to add new variants
- **Type Safety:** Full TypeScript support

**Refinements Made:**
1. **Sizing Adjustments:**
   - Step circles: Reduced from h-6 w-6 to h-5 w-5
   - Font sizes: Found middle ground (text-sm for body, text-xs for labels)
   - Icons: Standardized at h-3.5 w-3.5 for consistency
   - Badges: h-5 with text-xs for better proportion

2. **Alignment Fixes:**
   - Added mt-0.5 to circles for baseline alignment with text
   - Proper flex alignment throughout components
   - Consistent gap spacing using design tokens

3. **Intent Display:**
   - AgentThinking: Shows current thought in compact mode
   - ToolCall: Displays query/task being performed
   - AgentRouter: Shows routing reason at a glance

---

### ✅ Phase 6.9: Document Attachments & Upload System
**Status:** Complete

**What we built:**
- Complete system for handling document attachments and file uploads
- Support for multiple file types (PDF, images, videos, audio, links)
- Drag-and-drop upload interface with progress tracking
- Attachment management with preview/download capabilities

**Components:** `attachments/`

1. **DocumentAttachment**
   - Display individual attached files/links
   - Type-specific icons (PDF, image, video, etc.)
   - File size formatting
   - Actions: preview, download, remove
   - Compact and full display modes
   - Error and loading states

2. **AttachmentList**
   - Manage multiple attachments
   - Three layout modes: vertical, horizontal, grid
   - Progressive disclosure (show more/less)
   - Animated add/remove with Framer Motion
   - Empty state handling
   - Attachment count display

3. **FileUpload**
   - Drag-and-drop zone
   - Click to browse files
   - File type and size validation
   - Multiple file selection support
   - Real-time file list with remove option
   - Compact mode for inline usage
   - Progress feedback

4. **UploadProgress**
   - Real-time upload progress tracking
   - Multiple concurrent uploads
   - Individual and overall progress bars
   - Upload speed and time remaining
   - Status indicators (preparing, uploading, completed, error)
   - Cancellable uploads
   - Auto-hide completed uploads option

**Key Features:**
- Pure presentational components (no upload logic)
- Comprehensive file type support
- Beautiful animations and transitions
- Responsive and accessible
- Design system integration
- Progressive disclosure patterns
- Null-safe file extension extraction
- Individual Storybook files for each component

**Storybook Stories:**
- `DocumentAttachment.stories.tsx` - Individual file display variations
- `AttachmentList.stories.tsx` - Multiple attachments in different layouts
- `FileUpload.stories.tsx` - Upload interface with drag-and-drop demos
- `UploadProgress.stories.tsx` - Progress tracking visualizations

**Bug Fixes:**
- Fixed "Cannot read properties of undefined (reading 'split')" error by adding null check in `getExtension()` function
- Separated combined stories file into individual story files for better organization

**Usage Example:**
```typescript
// Attachment display
<AttachmentList
  attachments={[
    { id: "1", name: "document.pdf", type: "pdf", size: 3200000 },
    { id: "2", name: "image.jpg", type: "image", thumbnail: "..." }
  ]}
  direction="horizontal"
  onRemove={handleRemove}
  onPreview={handlePreview}
/>

// File upload
<FileUpload
  accept="image/*,application/pdf"
  maxSize={5 * 1024 * 1024}
  onFilesSelected={handleFiles}
  dragDropEnabled
/>

// Upload progress
<UploadProgress
  uploads={[
    { id: "1", name: "file.pdf", progress: 45, status: "uploading" }
  ]}
  showOverallProgress
  onCancel={handleCancel}
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
├── attachments/         # Document attachments & uploads
│   ├── DocumentAttachment.tsx
│   ├── AttachmentList.tsx
│   ├── FileUpload.tsx
│   └── UploadProgress.tsx
└── containers/          # Smart components (Phase 10)
    └── [future]         # Where logic will live

```

## 🎨 Design System

### Design Tokens (`design-system.ts`)
We use a centralized design system for consistent styling across all components:

#### Typography Scale
```typescript
fontSize = {
  "2xs": "text-[10px]",   // Timestamps, minor labels
  xs: "text-xs",           // Secondary text, labels (12px)
  sm: "text-sm",           // Default body text (14px)
  base: "text-base",       // Larger body text (16px)
  
  // Semantic sizes
  label: "text-xs",        // Form labels, meta info
  body: "text-sm",         // Main content
  caption: "text-[10px]",  // Captions, timestamps
  mono: "text-xs font-mono", // Code, technical content
}
```

#### Component Sizes
```typescript
componentSize = {
  icon: { xs: "h-3 w-3", sm: "h-3.5 w-3.5", md: "h-4 w-4" },
  badge: { sm: "h-4", md: "h-5", lg: "h-6" },
  button: { xs: "h-6", sm: "h-7", md: "h-8" },
  circle: { xs: "h-4 w-4", sm: "h-5 w-5", md: "h-6 w-6" },
}
```

#### Spacing & Effects
```typescript
spacing = {
  padding: { xs: "p-1", sm: "p-2", md: "p-3" },
  gap: { xs: "gap-1", sm: "gap-2", md: "gap-3" },
}

effects = {
  background: { subtle: "bg-muted/20", light: "bg-muted/30" },
  hover: { subtle: "hover:bg-muted/30", medium: "hover:bg-muted/50" },
  status: {
    active: "text-primary",
    success: "text-green-500",
    error: "text-destructive",
    muted: "text-muted-foreground",
  },
}
```

### Usage in Components
```typescript
import { fontSize, componentSize, spacing, effects } from "../design-system";

// Use in component
<div className={cn(fontSize.body, spacing.padding.sm)}>
  <Icon className={componentSize.icon.sm} />
</div>
```

### Colors
- **Primary:** Brand color (blue by default)
- **Status Colors:**
  - Online/Success: Green
  - Processing/Active: Primary (blue)
  - Error: Destructive (red)
  - Warning: Amber
  - Idle/Muted: Gray

### Animation Timings
- **Hover delays:** 200ms open, 100ms close
- **Transitions:** 200-300ms with ease-in-out
- **Typewriter:** 20-30ms per character
- **Breathing:** 2-3s cycles

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
6. **Design System Tokens** - Centralized sizing for consistency across all components
7. **Compact UI Design** - Condensed layout that shows intent without overwhelming
8. **Middle-Ground Font Sizes** - text-sm for body, text-xs for secondary content
9. **Individual Story Files** - Separate story files per component for better organization and maintainability

## 🎯 Next Steps

1. Complete remaining presentation phases (7-9)
2. Build smart container components (Phase 10)
3. Integrate with backend API
4. Add real-time streaming support
5. Implement state management solution

---

*This document serves as the source of truth for the AI Chat component architecture. Update it as new phases are completed or decisions are made.*