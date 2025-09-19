import { type Agent, createConfigurableAgent } from "@mrck-labs/grid-core";
import { createSonomaAgentHandlers } from "./handlers";
import { sonomaConfig } from "./config";

export const createSonomaAgent = async (): Promise<Agent> => {
  const { afterResponse, beforeAct, onError, transformInput, transformOutput, validateResponse } =
    await createSonomaAgentHandlers();

  return createConfigurableAgent({
    config: sonomaConfig,
    customHandlers: {
      afterResponse,
      beforeAct,
      onError,
      transformInput,
      transformOutput,
      validateResponse,
    },
  });
};
