import { type AgentMetadata } from "@mrck-labs/grid-core";
import { createAgentConfig } from "../../schemas/agent-config.schemas";
import { mainPrompt } from "./prompts";

// Agent metadata - exported for dynamic discovery
export const irfArchitectAgentMetadata: AgentMetadata = {
  id: "irf-architect",
  type: "irf-architect",
  name: "IRF Architect",
  description: "Agent that can architect IRF (Intermediate Response Format)",
  capabilities: ["architecture_planning", "layout_design", "irf_transformation"],
  icon: "🏗️",
  version: "1.0.0",
  author: "System",
};

// IRF Architect agent configuration
export const irfArchitectAgentConfig = createAgentConfig({
  id: "irf-architect",
  type: "irf-architect",
  version: "1.0.0",

  metadata: irfArchitectAgentMetadata,

  prompts: {
    system: mainPrompt({}),
    errorCorrection: "The previous response had validation errors. Please fix them:\n\n{errors}",
    fallback: "Failed to generate valid IRF after maximum retries",
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
    agents: [], // No delegation for this specialized agent
  },

  hooks: {
    beforeAct: true,
    validateResponse: true,
    transformOutput: true,
    onError: true,
    afterResponse: true,
  },

  orchestration: {
    callable: true, // Can be called by other agents
    canDelegate: false, // Doesn't need to call other agents
    costTier: "high", // Complex processing
    estimatedDuration: 5000, // ~5 seconds for generation + validation
  },

  features: {
    supportsBatchProcessing: false, // Single IRF at a time
    supportsStreaming: false, // JSON response format
    supportsInterruption: false,
    supportsFunctionCalling: false, // No tools needed
  },

  customConfig: {
    enableValidationLoop: true,
    enableIRFEnrichment: true,
    enableStoryblokTransform: true,
    validationService: "irfValidationService",
    traversingService: "irfTraversingService",
    transformService: "irfToStoryblok",
  },
});
