import { Agent } from "../agents.factory.types";
import { createConfigurableAgent } from "../configurable-agent.factory";
import { figmaToStoryblokAgentConfig, figmaToStoryblokAgentMetadata } from "./figma-to-storyblok.config";
import { createFigmaToStoryblokHandlers } from "./handlers";

// Re-export metadata for backward compatibility
export { figmaToStoryblokAgentMetadata };

/**
 * Create Figma to Storyblok Agent using the config-driven approach
 * Preserves all custom logic while leveraging the new architecture
 */
export const createFigmaToStoryblokAgent = async (): Promise<Agent> => {
  const customHandlers = createFigmaToStoryblokHandlers();

  return createConfigurableAgent({
    // @ts-ignore TODO: this has to be solved when we start using new createConfigurableAgent. For now this is just configuration, so it will work with both but yeah
    // need to double check later
    config: figmaToStoryblokAgentConfig,
    customHandlers,
  });
};
