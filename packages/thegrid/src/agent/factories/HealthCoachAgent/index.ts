import { type Agent, createConfigurableAgent } from "@mrck-labs/grid-core";
import { healthCoachConfig, healthCoachMetadata } from "./config";

export { healthCoachMetadata };

export const createHealthCoachAgent = async (): Promise<Agent> => {
  return createConfigurableAgent({
    config: healthCoachConfig,
  });
};
