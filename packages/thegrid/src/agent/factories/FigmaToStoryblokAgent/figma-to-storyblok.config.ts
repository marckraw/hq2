import { type AgentMetadata } from "@mrck-labs/grid-core";
import { createAgentConfig } from "../../schemas/agent-config.schemas";
import { systemPrompt } from "./prompts";

// Agent metadata - exported for dynamic discovery
export const figmaToStoryblokAgentMetadata: AgentMetadata = {
  id: "figma-to-storyblok",
  type: "figma-to-storyblok",
  name: "Figma to Storyblok",
  description:
    "Transforms Figma designs into Storyblok components and content structures. Expert at design-to-CMS workflows.",
  capabilities: [
    "figma_integration",
    "storyblok_components",
    "design_analysis",
    "cms_management",
    "content_structure",
    "design_to_code",
    "component_generation",
  ],
  icon: "🎨→📝",
  version: "1.0.0",
  author: "System",
};

// Figma to Storyblok agent configuration
export const figmaToStoryblokAgentConfig = createAgentConfig({
  id: "figma-to-storyblok",
  type: "figma-to-storyblok",
  version: "1.0.0",

  metadata: figmaToStoryblokAgentMetadata,

  prompts: {
    system: systemPrompt,
    fallback: "Failed to transform Figma design to Storyblok",
  },

  behavior: {
    maxRetries: 1, // Single attempt since transformation is deterministic
    responseFormat: "text", // Returns formatted text with transformation results
    validateResponse: false, // No validation needed for tool responses
    emitEvents: [], // Events are emitted manually after successful transformation
  },

  tools: {
    builtin: [],
    custom: [], // Custom tools will be added in beforeAct
    // @ts-ignore TODO: this has to be solved when we start using new createConfigurableAgent. For now this is just configuration, so it will work with both but yeah
    // need to double check later
    mcp: ["figma"], // MCP tools to be loaded
    agents: [], // No delegation needed
  },

  hooks: {
    beforeAct: true, // Initialize MCP tools
    afterResponse: true, // Handle tool calls and special Figma logic
    transformOutput: true, // Apply transformation pipeline
    onError: true,
  },

  orchestration: {
    callable: true, // Can be called by other agents
    canDelegate: false, // Doesn't need to call other agents
    costTier: "high", // Complex transformation pipeline
    estimatedDuration: 10000, // ~10 seconds for full pipeline
  },

  features: {
    supportsBatchProcessing: false, // Single design at a time
    supportsStreaming: false, // Full transformation needed
    supportsInterruption: false,
    supportsFunctionCalling: true, // Uses MCP tools
  },

  customConfig: {
    enableProgressUpdates: true,
    enableTransformationPipeline: true,
    transformerService: "figmaToIRFTransformer",
    irfToStoryblokService: "irfToStoryblok",
    traversingService: "irfTraversingService",
  },
});
