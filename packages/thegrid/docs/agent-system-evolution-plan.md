# Agent System Evolution Plan

This document outlines the complete plan for evolving the agent system from individual implementations to a config-driven, orchestratable architecture with agent-to-agent communication.

## Overview

Transform the agent system to support:
- Config-driven agent creation
- Agent-to-agent communication
- Orchestration patterns
- Dynamic discovery and capabilities

## Phase 1: Config-Driven Agent Foundation ✅

### 1.1 Create Agent Configuration Schema ✅
**File**: `/packages/thegrid/src/agent/schemas/agent-config.schemas.ts`
- [x] Define `AgentConfigSchema` with all configuration options
- [x] Include orchestration capabilities for future use
- [x] Export types and validation helpers

### 1.2 Build Configurable Agent Factory ✅
**File**: `/packages/thegrid/src/agent/factories/configurable-agent.factory.ts`
- [x] Implement `createConfigurableAgent` function
- [x] Support config-only, config+custom, and hooks system
- [x] Handle retry logic, validation, and event emission

### 1.3 Create Agent Registry Service ✅
**File**: `/packages/thegrid/src/agent/services/AgentRegistryService/agent-registry.service.ts`
- [x] Track all agents and their capabilities
- [x] Support agent discovery by capability
- [x] Prepare for agent-to-agent communication
- [x] Generate communication graphs

### 1.4 Migrate Simple Agents to Config ✅
- [x] **Rephraser Agent** - Pure config example
- [x] **Scribe Agent** - Config + custom handlers example
- [x] Keep complex agents (IRF Architect, Storyblok Editor) as-is for now

## Phase 2: Unified Tool System ✅

### 2.1 Create Unified Tool Interface ✅
**File**: `/packages/thegrid/src/agent/tools/unified-tool.types.ts`
- [x] Define `UnifiedTool` interface
- [x] Support local, MCP, agent, and external tool sources
- [x] Include `ToolContext` with delegation support

### 2.2 Refactor Tool Runner Service ✅
**Update**: `/packages/thegrid/src/services/atoms/ToolRunnerService/toolRunner.service.ts`
- [x] Support the new unified tool interface
- [x] Add tool source routing logic
- [x] Prepare for agent-as-tool execution
- [x] Created `unified-tool-runner.service.ts` with enhanced capabilities
- [x] Created adapters for legacy tools
- [x] Implemented unified tool registry

### 2.3 Create Agent Tool Wrapper ✅
**File**: `/packages/thegrid/src/agent/tools/agent-tool.factory.ts`
- [x] Implement `createAgentTool` function
- [x] Handle delegation context and depth limits
- [x] Track execution paths for debugging
- [x] Added `createAllAgentTools` and `getAgentToolsFor` helpers

### 2.4 Additional Implementations (Phase 2 Extras) ✅
- [x] Created `local-tool.adapter.ts` for adapting legacy tools
- [x] Created unified implementations for `saveMemory` and `createImage` tools
- [x] Created `unified-tools.registry.ts` to manage all unified tools
- [x] Created `initialize-unified-tools.ts` for startup initialization
- [x] Updated legacy tool runner to use unified tools when available

## Phase 3: Agent-to-Agent Communication ✅

### 3.1 Implement Orchestrator Agent ✅
**File**: `/packages/thegrid/src/agent/factories/OrchestratorAgent/index.ts`
- [x] Create orchestrator with dynamic tool loading
- [x] Implement task analysis and delegation logic
- [x] Add execution planning capabilities

### 3.2 Add Orchestration Tools ✅
**File**: `/packages/thegrid/src/agent/tools/orchestration/orchestration-tools.ts`
- [x] `analyze_task` - Analyze tasks and determine strategy
- [x] `get_agent_capabilities` - Discover available agents
- [x] `execute_agents_parallel` - Run multiple agents concurrently
- [x] `execute_agents_pipeline` - Sequential agent execution
- [x] `route_to_agent` - Conditional routing based on analysis
- [x] `synthesize_results` - Combine results from multiple agents

### 3.3 Update Agent Flow Service ✅
**Update**: `/packages/thegrid/src/agent/services/AgentFlowService/agent-flow.service.ts`
- [x] Add delegation context handling
- [x] Track execution paths across agent calls
- [x] Implement security controls (max depth, permissions)
- [x] Added DelegationContext to AgentFlowContext schema
- [x] Enhanced executeToolForAgent to pass delegation context

## Phase 4: Testing & Migration

### 4.1 Create Test Utilities
**File**: `/packages/thegrid/src/agent/testing/agent-test-utils.ts`
- [ ] Config builders for testing
- [ ] Mock agent registry
- [ ] Execution path validators

### 4.2 Gradual Migration Strategy
- [ ] Document migration guide for existing agents
- [ ] Create examples of each pattern
- [ ] Update developer documentation

## Phase 5: Advanced Features (Future)

### 5.1 Agent Discovery UI
- [ ] Show available agents and their capabilities
- [ ] Visualize agent communication graph
- [ ] Debug execution paths

### 5.2 Dynamic Agent Loading
- [ ] Load agent configs from database
- [ ] Hot-reload agent configurations
- [ ] A/B test different agent configs

### 5.3 Advanced Orchestration Patterns
- [ ] Map-reduce pattern for data processing
- [ ] Consensus pattern for multi-agent decisions
- [ ] Fallback chains for reliability

## Key Concepts

### Agent Patterns

1. **Pure Config Agent**
   ```typescript
   // Just configuration, no custom code
   const config = {
     id: "translator",
     prompts: { system: "Translate text..." },
     behavior: { responseFormat: "text" }
   };
   ```

2. **Config + Custom Agent**
   ```typescript
   // Configuration with custom handlers
   const agent = createConfigurableAgent({
     config: agentConfig,
     customHandlers: {
       validateResponse: async (response) => {...},
       transformOutput: async (output) => {...}
     }
   });
   ```

3. **Fully Custom Agent**
   ```typescript
   // Traditional approach, still supported
   const agent = {
     act: async (input) => {
       // Complex custom logic
     }
   };
   ```

### Orchestration Patterns

1. **Direct Delegation**
   - One agent calls another agent directly
   - Parent tracks child execution

2. **Parallel Execution**
   - Multiple agents work simultaneously
   - Results aggregated by orchestrator

3. **Pipeline Execution**
   - Sequential processing through agents
   - Each agent transforms the result

4. **Conditional Routing**
   - Route to different agents based on conditions
   - Dynamic workflow execution

## Success Metrics

- [ ] New agents can be created in < 5 minutes with config
- [ ] Agent discovery works by capability
- [ ] Orchestrator can coordinate 3+ agents
- [ ] Execution paths are fully traceable
- [ ] No breaking changes to existing agents

## Notes & Decisions

1. **Closure Pattern**: All new code follows functional programming with closures
2. **Backward Compatibility**: Existing agents continue to work unchanged
3. **Type Safety**: Full TypeScript and Zod validation throughout
4. **Progressive Enhancement**: Each phase adds value independently
5. **No Classes**: Following project guidelines, no classes used

## Resources

- [Agent Config Schema](../src/agent/schemas/agent-config.schemas.ts)
- [Configurable Agent Factory](../src/agent/factories/configurable-agent.factory.ts)
- [Agent Registry Service](../src/agent/services/AgentRegistryService/agent-registry.service.ts)
- [Example: Rephraser Config](../src/agent/factories/RephraserAgent/rephraser.config.ts)
- [Example: Scribe Config](../src/agent/factories/ScribeAgent/scribe.config.ts)