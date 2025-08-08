import { type AgentMetadata } from "@mrck-labs/grid-core";
import { createAgentConfig } from "../../schemas/agent-config.schemas";

// Agent metadata - exported for dynamic discovery
export const generalAgentMetadata: AgentMetadata = {
  id: "general",
  type: "general",
  name: "General Assistant",
  description:
    "A versatile AI assistant with access to all available tools. Best for general tasks, research, and complex multi-step operations.",
  capabilities: ["web_search", "image_generation", "file_analysis", "planning", "memory_search"],
  icon: "🤖",
  version: "1.0.0",
  author: "System",
};

// General agent configuration
export const generalAgentConfig = createAgentConfig({
  id: "general",
  type: "general",
  version: "1.0.0",

  metadata: generalAgentMetadata,

  prompts: {
    system: `You are a versatile AI assistant with access to all available tools. 
You can help with general tasks, research, and complex multi-step operations.
Use the appropriate tools to complete tasks efficiently.`,
    errorCorrection: "If you encounter an error, try alternative approaches or tools to complete the task.",
    fallback: "I apologize, but I'm unable to complete that task with the available tools and information.",
  },

  behavior: {
    maxRetries: 3,
    responseFormat: "structured",
    validateResponse: true,
    emitEvents: ["agent.response", "agent.error"],
  },

  tools: {
    builtin: [
      "create_image",
      "save_memory",
      "analyze_youtube",
      "read_url",
      "compose_plan",
      "read_plan",
      "update_plan",
      "evaluate_response",
    ],
    custom: [],
    // @ts-ignore TODO: this has to be solved when we start using new createConfigurableAgent. For now this is just configuration, so it will work with both but yeah
    // need to double check later
    mcp: ["figma_context"],
    agents: [
      // "rephraser",
      // "scribe",
      // "storyblok-editor",
      // "figma-to-storyblok",
    ], // For now it cant delegate to other agents
  },

  hooks: {
    transformInput: true, // Will handle complex input format
    validateResponse: true,
  },

  orchestration: {
    callable: true, // Can be called by other agents
    canDelegate: true, // Can call other agents
    allowedDelegates: [], // Empty array means can delegate to any agent
    costTier: "high", // Full capability agent
    estimatedDuration: 10000, // ~10 seconds for complex operations
  },

  features: {
    supportsBatchProcessing: true,
    supportsStreaming: true,
    supportsInterruption: true,
    supportsFunctionCalling: true,
  },

  customConfig: {
    acceptComplexInput: true, // Can accept { messages, tools } format
  },
});
