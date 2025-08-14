import { Agent, AgentType, AgentFactory, AgentMetadata, AgentInitializationError } from "./agents.factory.types";
import { createGeneralAgent, generalAgentMetadata } from "./GeneralAgent";
import { createTestOpenRouterAgent, testOpenRouterAgentMetadata } from "./TestOpenRouteAgent";

// Dynamic agent registry - metadata is now imported from each agent
const AGENT_REGISTRY = {
  general: {
    createAgent: createGeneralAgent,
    metadata: generalAgentMetadata,
  },
  "test-openrouter": {
    createAgent: createTestOpenRouterAgent,
    metadata: testOpenRouterAgentMetadata,
  },
} as const;

// --- Factory Creator ---
export const createAgentFactory = (): AgentFactory => {
  const createAgent = async (type: AgentType): Promise<Agent> => {
    try {
      // TODO: fix this
      // @ts-ignore
      const agentConfig = AGENT_REGISTRY[type];
      if (!agentConfig) {
        throw new AgentInitializationError(type, type, new Error(`Unknown agent type: ${type}`));
      }

      return await agentConfig.createAgent();
    } catch (error) {
      if (error instanceof AgentInitializationError) {
        throw error;
      }
      throw new AgentInitializationError(type, type, error as Error);
    }
  };

  const getSupportedTypes = (): AgentType[] => {
    return Object.keys(AGENT_REGISTRY) as AgentType[];
  };

  const getAgentMetadata = (type: AgentType): AgentMetadata | null => {
    // TODO: fix this
    // @ts-ignore
    const agentConfig = AGENT_REGISTRY[type];
    return agentConfig?.metadata || null;
  };

  const getAllAgentMetadata = (): AgentMetadata[] => {
    return Object.values(AGENT_REGISTRY).map((config) => config.metadata);
  };

  return {
    createAgent,
    getSupportedTypes,
    getAgentMetadata,
    getAllAgentMetadata,
  };
};

export const agentFactory = createAgentFactory();
