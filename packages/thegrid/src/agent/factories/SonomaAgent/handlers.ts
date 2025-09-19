import { type CustomHandlers } from "@mrck-labs/grid-core";

/**
 * Custom handlers for the Sonoma Agent
 * Currently mirrors General agent, can diverge later
 */
export const createSonomaAgentHandlers = async (): Promise<CustomHandlers> => {
  return {
    transformInput: async ({ input }) => input,
    beforeAct: async ({ input }) => input,
    validateResponse: async () => ({ isValid: true }),
    afterResponse: async ({ response }) => response,
    onError: async () => {},
  };
};
