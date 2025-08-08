import { type Agent, createConfigurableAgent } from "@mrck-labs/grid-core";
import { createStoryblokEditorHandlers } from "./handlers";
import { storyblokEditorAgentConfig } from "./config";

/**
 * Create Storyblok Editor Agent using the config-driven approach
 * Preserves all custom logic while leveraging the new architecture
 */
export const createStoryblokEditorAgent = async (): Promise<Agent> => {
  const { onError, transformInput, validateResponse, transformOutput, beforeAct, afterResponse } =
    createStoryblokEditorHandlers();

  return createConfigurableAgent({
    config: storyblokEditorAgentConfig,
    customHandlers: {
      beforeAct,
      afterResponse,
      onError,
      transformInput,
      validateResponse,
      transformOutput,
    },
  });
};
