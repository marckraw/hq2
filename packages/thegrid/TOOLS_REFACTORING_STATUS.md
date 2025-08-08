# Tools System Refactoring Status

## Overview
This document captures the current state of the tools system after the major simplification effort completed on 2025-08-05. It serves as a reference for the upcoming migration to Vercel AI SDK and @mrck-labs/grid-core library.

## What Was Removed

### 1. Memory System
- **Removed Components:**
  - MemoryService (`/src/domains/core/services/MemoryService`)
  - QdrantService (vector database integration)
  - saveMemory tool (both legacy and unified versions)
  - Memory-related database tables (user_memories, memory_tags, memory_retrievals)
  - All Qdrant configuration and dependencies

### 2. Unified Tools System
- **Removed Components:**
  - Entire unified tools infrastructure (`/src/agent/tools/unified/`)
  - UnifiedToolRunner service
  - UnifiedToolRegistry
  - All unified tool implementations (createImage.unified.ts, etc.)
  - Tool validation and cost estimation features

### 3. Planning Tools
- **Removed Components:**
  - All planning tools except evaluateResponse
  - generatePlan.tool.ts
  - executeStep.tool.ts
  - updatePlan.tool.ts
  - Planning-related types and interfaces

### 4. Orchestration Tools
- **Removed Components:**
  - orchestration-tools.ts with broken tools:
    - execute_agents_parallel
    - execute_agents_pipeline
    - route_to_agent
    - analyze_task
    - get_agent_capabilities
    - synthesize_results
  - OrchestratorAgent and its configuration

### 5. Other Removed Tools
- getWeather tool
- firecrawl/read_url tool and FirecrawlService
- Various unused tool utilities

## Current State

### Core Tools (3 remaining)
Located in `/packages/thegrid/src/agent/tools/`:

1. **createImage.tool.ts**
   - Image generation via OpenAI DALL-E or Leonardo AI
   - Used by agents for visual content creation

2. **analyzeYoutube.tool.ts**
   - YouTube video analysis and transcription
   - Extracts metadata and content from videos

3. **evaluateResponse.tool.ts**
   - Response quality evaluation
   - The only planning tool that was kept

### Tool System Architecture

#### 1. Tool Registry (`toolRunner.service.ts`)
```typescript
// Static registry for core tools
const TOOL_REGISTRY = {
  [createImageToolDefinition.name]: createImage,
  [evaluateResponseToolDefinition.name]: evaluateResponse,
  [analyzeYoutubeToolDefinition.name]: analyzeYoutubeVideo,
} as const;

// Dynamic registry for delegation tools (temporary fix)
const DYNAMIC_TOOL_REGISTRY: Record<string, ToolHandler> = {};
```

#### 2. Tool Execution Flow
```
Agent calls tool → AgentFlowService.callTool()
                    ├─→ MCP tool? → Execute via MCP
                    ├─→ Delegation tool? → Register & execute dynamically
                    └─→ Local tool? → Execute via ToolRunnerService
```

#### 3. Delegation System
- **How it works:** When an agent (e.g., site-builder) needs to delegate to another agent
- **Implementation:** Dynamic tool registration in AgentFlowService
- **Supported delegations:**
  - site-builder → irf-architect
  - site-builder → figma-to-storyblok
  - site-builder → storyblok-editor

#### 4. MCP (Model Context Protocol) Tools
- Dynamically loaded from MCP servers
- Currently supports Figma MCP tools
- Handled separately from local tools

### Type System
Created shared types in `/packages/thegrid/src/agent/tools/tool.types.ts`:
```typescript
export interface ToolContext {
  conversationId: number;
  executionId?: string;
  sessionToken?: string;
  delegation?: {
    depth: number;
    path: string[];
    delegationDepth?: number;
    delegationPath?: string[];
    fromAgent?: string;
    sharedContext?: any;
  };
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string | { code: string; message: string; details?: any };
  metadata?: any;
}

export interface UnifiedTool {
  name: string;
  description: string;
  parameters: any;
  execute: (input: any, context?: ToolContext) => Promise<ToolResult>;
  source: string;
  version?: string;
  sourceMetadata?: any;
  validate?: (input: any) => boolean;
  estimateCost?: (input: any) => number;
}
```

## Key Files and Their Roles

1. **`/src/services/atoms/ToolRunnerService/toolRunner.service.ts`**
   - Executes local tools
   - Manages dynamic tool registry for delegations
   - Provides tool definitions to LLM

2. **`/src/agent/services/AgentFlowService/agent-flow.service.ts`**
   - Routes tool calls to appropriate handlers
   - Handles delegation tool registration
   - Manages MCP tool execution

3. **`/src/agent/tools/agent-tool.factory.ts`**
   - Creates delegation tools for agent-to-agent communication
   - Manages delegation depth and permissions

4. **`/src/agent/factories/configurable-agent.factory.ts`**
   - Builds agent configurations with tools
   - Registers delegation tools based on agent config

## Migration Considerations for Vercel AI SDK

### Current Challenges
1. **Tool Definition Format** - Currently using OpenAI function calling format
2. **Dynamic Tool Registration** - Temporary solution for delegations
3. **Type Safety** - Some areas still use `any` types
4. **Tool Context** - Custom context passing not aligned with Vercel AI SDK

### Opportunities for Improvement
1. **Standardize on Vercel AI SDK tool format**
   - Use their tool definition structure
   - Leverage built-in tool execution handling

2. **Move to @mrck-labs/grid-core**
   - Tool types and interfaces
   - Common tool implementations
   - Standardized tool patterns

3. **Improve Type Safety**
   - Remove remaining `any` types
   - Use Zod schemas for all tool parameters
   - Proper type inference throughout

4. **Simplify Delegation**
   - Move from dynamic registration to static tool definitions
   - Use Vercel AI SDK's built-in tool composition

### Next Steps
1. Audit current tool usage patterns
2. Map current tools to Vercel AI SDK tool format
3. Design migration strategy for:
   - Tool definitions
   - Tool execution
   - Context passing
   - Response handling
4. Implement tools in @mrck-labs/grid-core
5. Gradually migrate agents to use new tool system

## Database Changes
- Migration 0022 created to drop memory tables
- Tables removed: memory_retrievals, memory_tags, user_memories
- No schema changes needed for remaining tools

## Testing Considerations
- All three core tools have been verified to work
- Delegation system tested with site-builder agent
- MCP tools continue to function
- No regression in agent capabilities

## Summary
The tools system has been dramatically simplified from ~20+ tools down to 3 core tools plus delegation and MCP support. The system is now ready for migration to a more standardized architecture using Vercel AI SDK and @mrck-labs/grid-core library.