import { type AgentMetadata } from "@mrck-labs/grid-core";
import { createAgentConfig } from "../../schemas/agent-config.schemas";
import { createConfigurableAgent, CustomHandlers } from "../configurable-agent.factory";
import { logger } from "@/utils/logger";

// Agent metadata - exported for dynamic discovery
export const scribeAgentMetadata: AgentMetadata = {
  id: "scribe",
  type: "scribe",
  name: "Scribe",
  description:
    "A specialized writing assistant focused on creating, editing, and improving written content. Excellent at documentation, reports, and text refinement.",
  capabilities: ["writing", "summarizing", "content_creation", "text_refinement"],
  icon: "✍️",
  version: "1.0.0",
  author: "System",
};

// Scribe agent configuration
export const scribeAgentConfig = createAgentConfig({
  id: "scribe",
  type: "scribe",
  version: "1.0.0",

  metadata: scribeAgentMetadata,

  prompts: {
    system:
      "You are a specialized writing assistant focused on creating, editing, and improving written content. You excel at documentation, reports, and text refinement.",
    errorCorrection: "Please revise your response addressing these issues: {errors}",
  },

  behavior: {
    maxRetries: 2,
    responseFormat: "text",
    validateResponse: true, // Scribe validates output quality
    emitEvents: ["content.created", "content.refined"],
  },

  tools: {
    builtin: ["memory_search", "web_search"], // Can search for context
    // @ts-ignore TODO: this has to be solved when we start using new createConfigurableAgent. For now this is just configuration, so it will work with both but yeah
    // need to double check later
    custom: ["grammar_check", "style_guide"], // Custom writing tools
  },

  hooks: {
    validateResponse: true,
    transformOutput: true,
  },

  orchestration: {
    callable: true,
    canDelegate: true, // Can delegate to rephraser for refinement
    allowedDelegates: ["rephraser"],
    costTier: "medium",
    estimatedDuration: 5000, // ~5 seconds
  },

  features: {
    supportsTemplates: true,
    supportsOutlineGeneration: true,
    supportsMultipleFormats: true,
  },

  customConfig: {
    outputFormats: ["markdown", "html", "plain", "latex"],
    toneOptions: ["formal", "casual", "technical", "creative"],
  },
});

// Custom handlers for Scribe agent
const scribeCustomHandlers: CustomHandlers = {
  // Validate that the response meets quality standards
  validateResponse: async (response) => {
    const content = response.content || "";
    const errors = [];

    // Check minimum length
    if (content.length < 50) {
      errors.push("Response is too short. Please provide more detail.");
    }

    // Check for placeholder text
    const placeholders = ["[INSERT", "[TODO", "[PLACEHOLDER", "Lorem ipsum"];
    if (placeholders.some((p) => content.includes(p))) {
      errors.push("Response contains placeholder text. Please complete all sections.");
    }

    // Check structure for longer content
    if (content.length > 500 && !content.includes("\n")) {
      errors.push("Long response lacks structure. Please add paragraphs or sections.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Transform output to add metadata
  transformOutput: async (response) => {
    const content = response.content || "";

    // Add metadata about the content
    const metadata = {
      wordCount: content.split(/\s+/).length,
      characterCount: content.length,
      paragraphCount: content.split(/\n\n+/).length,
      estimatedReadingTime: Math.ceil(content.split(/\s+/).length / 200), // minutes
    };

    logger.debug("Scribe output metadata", metadata);

    // Return enhanced response
    return {
      ...response,
      metadata,
    };
  },
};

/**
 * Create scribe agent using the config-driven approach
 * This demonstrates a config + custom handlers pattern
 */
export const createConfigBasedScribeAgent = () => {
  return createConfigurableAgent({
    // @ts-ignore TODO: this has to be solved when we start using new createConfigurableAgent. For now this is just configuration, so it will work with both but yeah
    // need to double check later
    config: scribeAgentConfig,
    customHandlers: scribeCustomHandlers,
    // Could add custom writing tools here
    additionalTools: {
      local: [
        // Example: grammar checking tool
        // Example: style guide tool
      ],
    },
  });
};
