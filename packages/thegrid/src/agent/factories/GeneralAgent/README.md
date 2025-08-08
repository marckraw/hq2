# GeneralAgent - Config-Driven Implementation

The GeneralAgent has been refactored to use the new config-driven architecture, providing enhanced capabilities and better integration with the agent ecosystem.

## 🚀 Key Features

- **Config-driven architecture**: Defined entirely through configuration
- **Agent-to-agent communication**: Can delegate to other agents
- **Unified tool system**: Integrates local, MCP, and agent tools
- **Backward compatibility**: Maintains support for legacy input formats

## 📋 Configuration

The agent is configured in `general.config.ts`:

```typescript
export const generalAgentConfig = createAgentConfig({
  id: "general",
  type: "general",
  version: "1.0.0",
  
  metadata: {
    name: "General Assistant",
    description: "A versatile AI assistant with access to all available tools",
    capabilities: ["web_search", "image_generation", "file_analysis", "planning", "memory_search"],
    icon: "🤖"
  },
  
  tools: {
    builtin: ["createImage", "saveMemory", "analyzeYoutube", ...],
    mcp: ["figma_context"],
    agents: ["rephraser", "scribe", "storyblok-editor", "figma-to-storyblok"]
  },
  
  orchestration: {
    callable: true,
    canDelegate: true,
    allowedDelegates: [], // Empty = can delegate to any agent
    costTier: "high"
  }
});
```

## 🔧 Usage

### Basic Usage

```typescript
import { createGeneralAgent } from "@/agent/factories/GeneralAgent";

const agent = await createGeneralAgent();

// Simple string input
const response = await agent.act("Help me understand quantum computing");

// Complex input with messages
const response = await agent.act({
  messages: [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Create an image of a sunset" }
  ],
  tools: ["createImage"] // Optional - agent uses configured tools
});
```

### Through Agent Registry

```typescript
import { agentRegistryService } from "@/agent/services/AgentRegistryService";

const generalAgent = await agentRegistryService.getAgent("general");
const response = await generalAgent.act("Your request here");
```

### Agent-to-Agent Communication

The GeneralAgent can now delegate to other agents:

```typescript
// This will automatically use the research and rephraser agents
const response = await agent.act(
  "Research climate change and summarize it in simple terms"
);
```

## 🛠️ Custom Handlers

The GeneralAgent uses custom handlers for:

1. **Input Transformation**: Handles both simple strings and complex message formats
2. **Response Validation**: Ensures responses have the required structure

```typescript
const customHandlers = {
  transformInput: async (input) => {
    // Converts various input formats to the expected message format
    if (typeof input === "object" && input.messages) {
      return { messages: input.messages };
    }
    if (typeof input === "string") {
      return { messages: [{ role: "user", content: input }] };
    }
    return input;
  },
  
  validateResponse: async (response) => {
    // Validates response structure
    if (!response || typeof response !== "object") {
      return { isValid: false, errors: ["Invalid response"] };
    }
    return { isValid: true };
  }
};
```

## 🔄 Migration from Legacy

The refactored GeneralAgent maintains backward compatibility:

- ✅ Same `createGeneralAgent()` function signature
- ✅ Same metadata export for compatibility
- ✅ Supports legacy input format `{ messages, tools }`
- ✅ Works with existing agent factory

## 🎯 Benefits

1. **Configuration-based**: Easy to modify without code changes
2. **Discoverable**: Other agents can find and use it
3. **Composable**: Can be part of complex multi-agent workflows
4. **Observable**: All interactions are tracked
5. **Safe**: Built-in delegation controls and loop prevention

## 📊 Available Tools

- **Built-in**: Image creation, memory, YouTube analysis, planning tools
- **MCP**: Figma context integration
- **Agent Tools**: Can call rephraser, scribe, and other agents
- **Extensible**: Easy to add new tools through configuration