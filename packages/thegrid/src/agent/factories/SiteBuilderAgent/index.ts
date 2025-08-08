import { logger, userLogger } from "@/utils/logger";
import { Agent } from "../agents.factory.types";
import { createConfigurableAgent, CustomHandlers } from "../configurable-agent.factory";
import { siteBuilderAgentConfig, siteBuilderAgentMetadata } from "./site-builder.config";

// Re-export metadata for backward compatibility
export { siteBuilderAgentMetadata };

// Keywords for routing decisions
const ROUTING_KEYWORDS = {
  IRF_ARCHITECT: [
    "layout",
    "section",
    "component",
    "structure",
    "design",
    "create",
    "build",
    "hero",
    "card",
    "grid",
    "column",
    "row",
    "container",
    "page",
    "template",
    "heading",
    "headline",
    "text",
    "button",
    "image",
    "editorial",
  ],
  FIGMA_TO_STORYBLOK: [
    "figma",
    "convert",
    "transform",
    "import",
    "file key",
    "design file",
    "figma url",
    "figma link",
    "figma design",
    "figma to",
    "from figma",
  ],
  STORYBLOK_EDITOR: [
    "edit",
    "update",
    "modify",
    "change",
    "storyblok",
    "story",
    "content",
    "existing",
    "current",
    "published",
    "draft",
    "cms",
    "editor",
  ],
};

/**
 * Analyze user request to determine which agent to delegate to
 */
const analyzeRequest = (content: string): string | null => {
  const lowerContent = content.toLowerCase();

  // Check for Figma-specific patterns (highest priority)
  if (ROUTING_KEYWORDS.FIGMA_TO_STORYBLOK.some((keyword) => lowerContent.includes(keyword))) {
    logger.info("Request contains Figma keywords, routing to figma-to-storyblok");
    return "figma-to-storyblok";
  }

  // Check for editing patterns
  if (ROUTING_KEYWORDS.STORYBLOK_EDITOR.some((keyword) => lowerContent.includes(keyword))) {
    logger.info("Request contains editing keywords, routing to storyblok-editor");
    return "storyblok-editor";
  }

  // Check for layout creation patterns
  if (ROUTING_KEYWORDS.IRF_ARCHITECT.some((keyword) => lowerContent.includes(keyword))) {
    logger.info("Request contains layout keywords, routing to irf-architect");
    return "irf-architect";
  }

  // Default to IRF Architect for general creation requests
  if (lowerContent.includes("create") || lowerContent.includes("make") || lowerContent.includes("generate")) {
    logger.info("General creation request, defaulting to irf-architect");
    return "irf-architect";
  }

  logger.warn("Could not determine appropriate agent from request");
  return null;
};

/**
 * Custom handlers for the Site Builder Agent
 * Handles request analysis and delegation formatting
 */
const createSiteBuilderHandlers = (): CustomHandlers => {
  let selectedAgent: string | null = null;

  return {
    // Ensure tools are available before acting
    beforeAct: async (input, _config, _trace, sendUpdate) => {
      userLogger.info("[SiteBuilderAgent] beforeAct - checking tools availability");

      await sendUpdate({
        type: "unknown",
        content: "Hello from beforeAct",
      });

      // The tools should already be added by configurable-agent.factory
      // Just log what we have
      if (input.tools) {
        logger.info(`[SiteBuilderAgent] Tools available: ${input.tools.length}`);
      }

      return input;
    },

    // Analyze the request and prepare for delegation
    transformInput: async (input, _trace, sendUpdate) => {
      await sendUpdate({
        type: "unknown",
        content: "Working..",
      });

      const userMessage = input.messages.find((m: any) => m.role === "user");
      if (!userMessage) {
        logger.error("No user message found in input");
        return input;
      }

      // Just log what we think, but don't interfere with the LLM's decision
      selectedAgent = analyzeRequest(userMessage.content);
      if (selectedAgent) {
        logger.info(`Analysis suggests agent: ${selectedAgent}, but letting LLM decide`);
      }

      // Return input unchanged - let the LLM use its tools
      return input;
    },

    // Format the delegation results
    transformOutput: async (response) => {
      // If the response contains delegation results, format them nicely
      if (response.content && selectedAgent) {
        // Parse the response to see if it's JSON from a delegation
        try {
          const parsed = JSON.parse(response.content);
          if (parsed.success !== undefined) {
            // This looks like a structured response from an agent
            logger.info(`Delegation to ${selectedAgent} completed`);

            // Format based on which agent was used
            let formattedContent = `✅ **Task completed by ${selectedAgent}**\n\n`;

            if (selectedAgent === "irf-architect" && parsed.irf) {
              formattedContent += `**Generated Layout:**\n- Components: ${parsed.irf.content?.length || 0}\n`;
              formattedContent += `- Layout Name: ${parsed.irf.name || "Untitled"}\n\n`;
              formattedContent += `The layout has been created and is ready for use.`;
            } else if (selectedAgent === "figma-to-storyblok" && parsed.pipeline) {
              formattedContent += `**Transformation Pipeline Results:**\n`;
              formattedContent += `- Figma → IRF: ${parsed.figmaToIrf?.metadata?.componentCount || 0} components\n`;
              formattedContent += `- IRF → Storyblok: ${parsed.irfToStoryblok?.metadata?.totalComponents || 0} components\n`;
              formattedContent += `- Story: ${parsed.irfToStoryblok?.story?.name || "Unknown"}\n\n`;
              formattedContent += `${parsed.message || "Transformation complete!"}`;
            } else if (selectedAgent === "storyblok-editor" && parsed.editedStoryblok) {
              formattedContent += `**Editing Results:**\n`;
              formattedContent += `- Story Updated: ${parsed.editedStoryblok.name || "Unknown"}\n`;
              formattedContent += `- Components Modified: ${parsed.metadata?.finalComponentCount || 0}\n\n`;
              formattedContent += `The content has been successfully edited.`;
            }

            return {
              ...response,
              content: formattedContent,
            };
          }
        } catch (e) {
          // Not JSON or not a structured response, return as-is
          logger.debug("Response is not structured JSON, returning as-is");
        }
      }

      return response;
    },

    // Handle errors
    onError: async (error, attempt) => {
      logger.error(`Site Builder error on attempt ${attempt}:`, error);

      return {
        error: error.message || String(error),
        selectedAgent,
        attempt,
      };
    },
  };
};

/**
 * Create Site Builder Agent using the config-driven approach
 * This agent orchestrates other agents for site building tasks
 */
export const createSiteBuilderAgent = async (): Promise<Agent> => {
  const customHandlers = createSiteBuilderHandlers();

  return createConfigurableAgent({
    config: siteBuilderAgentConfig,
    customHandlers,
  });
};
