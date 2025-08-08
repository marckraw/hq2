import { mainPrompt } from "./prompts";
import { type AgentMetadata, createAgentConfig } from "@mrck-labs/grid-core";

// Agent metadata - exported for dynamic discovery
export const storyblokEditorAgentMetadata: AgentMetadata = {
  id: "storyblok-editor",
  type: "storyblok-editor",
  name: "Storyblok Editor",
  description: "Agent that can edit Storyblok content by converting to IRF and back",
  capabilities: ["storyblok-editor", "irf-architect", "decision-maker"],
  icon: "📝",
  version: "1.0.0",
  author: "System",
};

// Storyblok Editor agent configuration
export const storyblokEditorAgentConfig = createAgentConfig({
  id: "storyblok-editor",
  type: "storyblok-editor",
  version: "1.0.0",

  metadata: storyblokEditorAgentMetadata,

  prompts: {
    system: mainPrompt,
    errorCorrection: "The previous IRF had validation errors. Please fix them:\n\n{errors}",
    fallback: "Failed to generate valid modified IRF after maximum retries",
  },

  behavior: {
    maxRetries: 3,
    responseFormat: "json", // Critical for IRF parsing
    validateResponse: true,
    emitEvents: [], // Events are emitted manually in transformOutput after validation
  },

  tools: {
    builtin: [],
    custom: [],
    mcp: [],
    agents: [], // No delegation needed
  },

  hooks: {
    transformInput: true, // For Storyblok fetching and conversion
    validateResponse: true,
    transformOutput: true,
    onError: true,
  },

  orchestration: {
    callable: true, // Can be called by other agents
    canDelegate: false, // Doesn't need to call other agents
    costTier: "high", // Complex multi-step processing
    estimatedDuration: 8000, // ~8 seconds for full transformation cycle
  },

  features: {
    supportsBatchProcessing: false, // Single story at a time
    supportsStreaming: false, // JSON response format
    supportsInterruption: false,
    supportsFunctionCalling: false, // No tools needed
  },

  customConfig: {
    enableValidationLoop: true,
    enableIRFEnrichment: true,
    enableStoryblokTransform: true,
    enableAPIFetching: true,
    fallbackToExample: true,
    storyblokService: "storyblok",
    storyblokToIRFService: "storyblokToIRF",
    irfToStoryblokService: "irfToStoryblok",
    traversingService: "irfTraversingService",
  },
});
