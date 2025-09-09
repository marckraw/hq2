import { createConfigurableAgent, type CustomHandlers, type Agent, baseLLMService } from "@mrck-labs/grid-core";
import { generalAgentConfig, generalAgentMetadata } from "./general.config";

// Re-export metadata for backward compatibility
export { generalAgentMetadata };

/**
 * Custom handlers for the General Agent
 * Handles the special input format and tool loading
 */
const createGeneralAgentHandlers = async (): Promise<CustomHandlers> => {
  return {
    // Transform complex input format to standard format
    transformInput: async ({ input, sendUpdate }) => {
      console.log("[custom transformInput for general agent]");
      console.log(input);
      await new Promise((resolve) => setTimeout(resolve, 6000));
      await sendUpdate({
        type: "thinking",
        content: "Custom transformInput for general agent",
      });
      await new Promise((resolve) => setTimeout(resolve, 6000));

      // Pass through other formats
      return input;
    },
    afterResponse: async ({ input, response, sendUpdate }) => {
      console.log("[custom afterResponse for general agent]");
      console.log(input);
      console.log(response);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await sendUpdate({
        type: "thinking",
        content: "Custom afterResponse for general agent",
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return response;
    },
  };
};

/**
 * Create General Agent using the config-driven approach
 * Maintains backward compatibility while leveraging new architecture
 */
export const createGeneralAgent = async (): Promise<Agent> => {
  const customHandlers = await createGeneralAgentHandlers();

  // Load additional tools that aren't in the static config

  return createConfigurableAgent({
    llmService: baseLLMService({
      toolExecutionMode: "vercel-native",
    }),
    config: generalAgentConfig,
    customHandlers,
  });
};
