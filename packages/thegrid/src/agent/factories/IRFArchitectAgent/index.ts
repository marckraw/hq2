import { Agent } from "../agents.factory.types";
import { createConfigurableAgent, CustomHandlers } from "../configurable-agent.factory";
import { handleBeforeAct, handleOnError, handleTransformOutput, handleValidateResponse } from "./handlers";
import { irfArchitectAgentConfig, irfArchitectAgentMetadata } from "./irf-architect.config";

// Re-export metadata for backward compatibility
export { irfArchitectAgentMetadata };

/**
 * Create IRF Architect Agent using the config-driven approach
 * Preserves all custom logic while leveraging the new architecture
 */
export const createIRFArchitectAgent = async (): Promise<Agent> => {
  // Compose all lifecycle handlers using extracted functions
  const customHandlers: CustomHandlers = {
    beforeAct: handleBeforeAct,
    validateResponse: handleValidateResponse,
    transformOutput: handleTransformOutput,
    onError: handleOnError,
  };

  return createConfigurableAgent({
    config: irfArchitectAgentConfig,
    customHandlers,
  });
};
