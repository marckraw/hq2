import { type AgentMetadata } from "@mrck-labs/grid-core";
import { createAgentConfig } from "../../schemas/agent-config.schemas";
import { createConfigurableAgent } from "../configurable-agent.factory";

// Agent metadata - exported for dynamic discovery
export const rephraserAgentMetadata: AgentMetadata = {
  id: "rephraser",
  type: "rephraser",
  name: "Rephraser",
  description:
    "Expert at rephrasing and making content more human-readable. Ideal for improving clarity and readability.",
  capabilities: ["text_rephrasing", "clarity_improvement"],
  icon: "🔄",
  version: "1.0.0",
  author: "System",
};

// Rephraser agent configuration - pure config, no custom handlers needed
export const rephraserAgentConfig = createAgentConfig({
  id: "rephraser",
  type: "rephraser",
  version: "1.0.0",

  metadata: rephraserAgentMetadata,

  prompts: {
    system:
      "You are a rephraser. You are given a text or json and you need to rephrase it to be more human readable and clear.",
    fallback: "Please rephrase the following content to be more clear and human-readable.",
  },

  behavior: {
    maxRetries: 1, // Simple agent, rarely needs retries
    responseFormat: "text",
    validateResponse: false,
  },

  // @ts-ignore TODO: this has to be solved when we start using new createConfigurableAgent. For now this is just configuration, so it will work with both but yeah
  // need to double check later
  tools: {
    builtin: [], // No tools needed for rephrasing
  },

  orchestration: {
    callable: true, // Can be called by other agents
    canDelegate: false, // Doesn't need to call other agents
    costTier: "low", // Simple LLM call
    estimatedDuration: 2000, // ~2 seconds
  },

  features: {
    supportsBatchProcessing: true,
    supportsStreaming: true,
  },
});

/**
 * Create rephraser agent using the config-driven approach
 * This demonstrates a pure config agent with no custom logic
 */
export const createConfigBasedRephraserAgent = () => {
  return createConfigurableAgent({
    // @ts-ignore TODO: this has to be solved when we start using new createConfigurableAgent. For now this is just configuration, so it will work with both but yeah
    // need to double check later
    config: rephraserAgentConfig,
    // No custom handlers needed - pure config agent
  });
};
