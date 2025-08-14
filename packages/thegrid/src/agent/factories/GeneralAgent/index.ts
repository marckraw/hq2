import { createConfigurableAgent, type CustomHandlers } from "@mrck-labs/grid-core";
import { generalAgentConfig, generalAgentMetadata } from "./general.config";
import { Agent } from "../agents.factory.types";
import { toolRegistry } from "../../tools";
import { mcpServersFactory } from "../../../domains/integration/factories/mcp-servers.factory";

// Re-export metadata for backward compatibility
export { generalAgentMetadata };

/**
 * Custom handlers for the General Agent
 * Handles the special input format and tool loading
 */
const createGeneralAgentHandlers = async (): Promise<CustomHandlers> => {
  return {
    // Transform complex input format to standard format
    transformInput: async (input: any) => {
      // Handle the special case where input is an object with messages and tools
      if (typeof input === "object" && input.messages && input.tools) {
        // Return the input with messages directly - the configurable agent expects this format
        return {
          messages: input.messages,
          // Store the requested tools for reference (though we use our configured tools)
          _requestedTools: input.tools,
        };
      }

      // For simple string input, convert to messages format
      if (typeof input === "string") {
        return {
          messages: [{ role: "user", content: input }],
        };
      }

      // Pass through other formats
      return input;
    },

    // Validate response before returning
    validateResponse: async (response: any) => {
      // Ensure response has required structure
      if (!response || typeof response !== "object") {
        return {
          isValid: false,
          errors: ["Response must be an object"],
        };
      }

      return { isValid: true };
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
  const figmaContextMcpService = await mcpServersFactory.createFigmaMCPServiceClient();
  const mcpTools = figmaContextMcpService?.tools ?? [];

  return createConfigurableAgent({
    config: generalAgentConfig,
    customHandlers,
    additionalTools: {
      local: toolRegistry.getDefinitions(),
      mcp: mcpTools,
    },
  });
};
