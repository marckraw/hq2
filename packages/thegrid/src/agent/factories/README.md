# Agent Factory System

A type-safe, standardized system for creating and managing AI agents with consistent interfaces and proper error handling.

## 🎯 **Key Benefits**

- **Type Safety**: TypeScript compiler ensures all required methods are implemented
- **Standardized Interface**: All agents follow the same input/output format
- **Metadata Management**: Centralized agent discovery and configuration
- **Error Handling**: Proper error types and handling
- **Extensibility**: Easy to add new agents with compile-time validation

## 📋 **Quick Start: Adding a New Agent**

### 1. **Add Agent Type**

```typescript
// In agents.factory.types.ts
export type AgentType =
  | "general"
  | "your-new-agent" // Add this line
  | "scribe";
// ... other types
```

### 2. **Add Agent Metadata**

```typescript
// In agents.factory.ts - AGENT_METADATA object
"your-new-agent": {
  id: "your-new-agent",
  type: "your-new-agent",
  name: "Your New Agent",
  description: "Description of what your agent does",
  capabilities: [
    AgentCapability.YOUR_CAPABILITY,
    // Add relevant capabilities
  ],
  icon: "🚀",
  version: "1.0.0",
  author: "Your Name",
},
```

### 3. **Create Agent Implementation**

```typescript
// In YourNewAgent/index.ts
import { createBaseAgent } from "../BaseAgent";
import { Agent, AgentInput, AgentResponse } from "../agents.factory.types";

export const createYourNewAgent = (): Agent => {
  const base = createBaseAgent({
    id: "your-new-agent",
    type: "your-new-agent",
    availableTools: [], // Add your tools here
  });

  return {
    ...base,
    act: async (input: AgentInput | string): Promise<AgentResponse> => {
      // Handle standardized input format
      if (typeof input === "object" && input.messages) {
        const response = await base.llmService.runCleanLLM({
          messages: [
            {
              role: "system",
              content: "Your agent's system prompt",
            },
            ...input.messages,
          ],
          tools: input.tools || [],
        });
        return response;
      }

      // Handle string input (backward compatibility)
      const response = await base.llmService.runCleanLLM({
        messages: [
          { role: "system", content: "Your agent's system prompt" },
          { role: "user", content: input },
        ],
        tools: [],
      });
      return response;
    },
  };
};
```

### 4. **Register in Factory**

```typescript
// In agents.factory.ts - createAgent switch statement
case "your-new-agent":
  return createYourNewAgent();
```

### 5. **Update Frontend Types**

```typescript
// In packages/thehorizon/src/components/Agent/Agent.tsx
interface FormInputs {
  agentType:
    | "general"
    | "your-new-agent" // Add this line
    | "scribe";
  // ... other types
}
```

## 🏗️ **Architecture Overview**

### **Core Interfaces**

```typescript
// Standardized input format
interface AgentInput {
  messages: ChatMessage[];
  tools?: any[];
}

// Standardized output format
interface AgentResponse {
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}

// Main agent interface
interface Agent {
  readonly id: string;
  readonly type: AgentType;
  readonly availableTools: any[];

  // Required methods
  act: (input: AgentInput | string) => Promise<AgentResponse>;

  // Optional methods
  getMetadata?: () => AgentMetadata;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
  validateInput?: (input: AgentInput | string) => boolean;
  isHealthy?: () => Promise<boolean>;
}
```

### **Agent Capabilities**

Use the `AgentCapability` enum for type-safe capability definitions:

```typescript
export enum AgentCapability {
  WEB_SEARCH = "web_search",
  IMAGE_GENERATION = "image_generation",
  FILE_ANALYSIS = "file_analysis",
  WRITING = "writing",
  DESIGN_ANALYSIS = "design_analysis",
  // ... more capabilities
}
```

### **Error Handling**

The system provides specialized error types:

```typescript
// Base agent error
class AgentError extends Error {
  constructor(message: string, agentType: AgentType, agentId: string, originalError?: Error)
}

// Initialization errors
class AgentInitializationError extends AgentError

// Execution errors
class AgentExecutionError extends AgentError
```

## 🔧 **Advanced Features**

### **Custom Initialization**

```typescript
initialize: async (): Promise<void> => {
  // Setup API connections, warm caches, etc.
  await setupExternalConnections();
  base.log("Agent initialized successfully");
},
```

### **Health Checks**

```typescript
isHealthy: async (): Promise<boolean> => {
  try {
    // Check external dependencies
    await checkDatabaseConnection();
    await checkAPIEndpoints();
    return true;
  } catch (error) {
    return false;
  }
},
```

### **Input Validation**

```typescript
validateInput: (input: AgentInput | string): boolean => {
  if (!base.validateInput?.(input)) return false;

  // Custom validation logic
  if (typeof input === "string") {
    return input.length >= 10; // Example: minimum length
  }

  return true;
},
```

## 📊 **Factory Methods**

The factory provides several utility methods:

```typescript
const factory = createAgentFactory();

// Create an agent instance
const agent = await factory.createAgent("general");

// Get supported agent types
const types = factory.getSupportedTypes();

// Get metadata for a specific agent
const metadata = factory.getAgentMetadata("scribe");

// Get all agent metadata (used by API)
const allMetadata = factory.getAllAgentMetadata();
```

## 🧪 **Testing Your Agent**

1. **Compile-time checks**: TypeScript will catch missing implementations
2. **Runtime validation**: Use the `validateInput` method
3. **Health checks**: Implement `isHealthy` for monitoring
4. **Error handling**: Wrap operations in try-catch with proper error types

## 📝 **Best Practices**

1. **Always implement the `act` method** - it's the core functionality
2. **Use AgentCapability enum** for type-safe capability definitions
3. **Provide meaningful metadata** for better UX
4. **Handle both input formats** for backward compatibility
5. **Use proper error types** for better debugging
6. **Add logging** using `base.log()` for debugging
7. **Validate inputs** to prevent runtime errors

## 🔄 **Migration Guide**

If you have existing agents, here's how to migrate:

1. Update the `act` method signature to accept `AgentInput | string`
2. Add proper return type annotations
3. Implement input validation
4. Add metadata to the factory registry
5. Update frontend types if needed

The TypeScript compiler will guide you through any missing implementations!

## 🚀 **Example: Complete Agent Implementation**

See `ExampleAgent/index.ts` for a complete, documented example that demonstrates all features and best practices.
