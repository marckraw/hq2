# TestOpenRouterAgent - Custom Implementation with Delegation Support

This agent demonstrates how to create a custom agent that doesn't use the config pattern but still participates in the agent ecosystem.

## Key Features

1. **Custom LLM Method**: Uses `runOpenRouterLLM()` instead of standard LLM methods
2. **Delegation Support**: Can be called by other agents
3. **Orchestration Metadata**: Provides cost and duration estimates

## How It Works

### Custom Implementation
```typescript
// Uses createBaseAgent directly
const base = createBaseAgent({
  id: "test-openrouter",
  type: "test-openrouter",
  metadata: testOpenRouterAgentMetadata,
});

// Custom act method that calls OpenRouter-specific LLM
act: async (input) => {
  const response = await base.llmService.runOpenRouterLLM({
    messages: input.messages,
    tools: input.tools,
  });
  return response;
}
```

### Delegation Support
```typescript
// Metadata includes orchestration info
getMetadata: () => ({
  ...testOpenRouterAgentMetadata,
  orchestration: {
    callable: true,        // Can be called by other agents
    canDelegate: false,    // Doesn't call other agents
    costTier: "medium",
    estimatedDuration: 3000,
  },
})
```

### Registration
The agent is automatically registered by the initialization system:
```typescript
// In initialize-agents.ts, agents not explicitly listed are registered with generic configs
// The orchestration info comes from the agent's getMetadata() method
```

### Usage in Delegation
Other agents can now call this agent:
```typescript
// In orchestrator agent config
orchestration: {
  canDelegate: true,
  allowedDelegates: ["test-openrouter", "other-agents"],
}

// The orchestrator will receive a tool: delegate_to_test-openrouter
```

## Benefits

1. **Flexibility**: Custom agents can use specialized LLM methods
2. **Integration**: Still participates in agent-to-agent communication
3. **Discovery**: Can be found via capability search
4. **Orchestration**: Can be part of complex agent workflows

This approach shows that the system is flexible enough to support both:
- Config-based agents (for standard patterns)
- Custom agents (for specialized needs)