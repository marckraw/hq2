import { type AgentMetadata } from "@mrck-labs/grid-core";
import { createAgentConfig } from "../../schemas/agent-config.schemas";

// Agent metadata - exported for dynamic discovery
export const siteBuilderAgentMetadata: AgentMetadata = {
  id: "site-builder",
  type: "site-builder" as any, // Will need to add to AgentType enum
  name: "Site Builder",
  description:
    "Orchestrates site building tasks by delegating to specialized agents: IRF Architect for layouts, Figma to Storyblok for designs, and Storyblok Editor for content editing.",
  capabilities: [
    "workflow_routing",
    "task_analysis",
    "agent_coordination",
    "layout_design",
    "design_to_code",
    "content_structure",
  ],
  icon: "🏗️",
  version: "1.0.0",
  author: "System",
};

// Site Builder agent configuration
export const siteBuilderAgentConfig = createAgentConfig({
  id: "site-builder",
  type: "site-builder" as any,
  version: "1.0.0",

  metadata: siteBuilderAgentMetadata,

  prompts: {
    system: `You are an AI assistant that routes requests to specialized agents. You must analyze the user's request and use ONE of your available tools.

Your available tools are:
- delegate_to_irf-architect: For creating layouts and page structures
- delegate_to_figma-to-storyblok: For converting Figma designs
- delegate_to_storyblok-editor: For editing existing content

CRITICAL: You must respond ONLY by calling a tool. Do not provide any text response.

When calling a tool, pass the user's original message like this:
{"messages": [{"role": "user", "content": "original user request here"}]}`,
    fallback:
      "I couldn't determine which agent to use for your request. Please be more specific about whether you want to create a layout, convert a Figma design, or edit existing content.",
  },

  behavior: {
    maxRetries: 1, // No retries needed for delegation
    responseFormat: "structured", // Required for tool calling
    validateResponse: false,
    emitEvents: [],
  },

  tools: {
    builtin: [],
    custom: [],
    mcp: [],
    agents: ["irf-architect", "figma-to-storyblok", "storyblok-editor"], // Agents this can delegate to
  },

  hooks: {
    beforeAct: true, // Check tools availability
    transformInput: true, // Analyze request and prepare for delegation
    transformOutput: true, // Format delegation results
    onError: true,
  },

  orchestration: {
    callable: true,
    canDelegate: true, // This agent can delegate to others
    allowedDelegates: ["irf-architect", "figma-to-storyblok", "storyblok-editor"],
    costTier: "low", // Just routing, no heavy processing
    estimatedDuration: 1000, // Quick decision making
  },

  features: {
    supportsBatchProcessing: false,
    supportsStreaming: false,
    supportsInterruption: false,
    supportsFunctionCalling: true, // Uses delegation tools
  },

  customConfig: {
    routingStrategy: "keyword-based", // Can be extended to ML-based later
    enableContextEnrichment: true,
    forceToolUse: true, // Force the LLM to use tools
  },
});
