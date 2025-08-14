import { logger } from "@/utils/logger";
import { agentRegistryService } from "./services/AgentRegistryService/agent-registry.service";
import { agentFactory } from "./factories/agents.factory";
import { createGeneralAgent } from "./factories/GeneralAgent";
import { generalAgentConfig } from "./factories/GeneralAgent/general.config";

/**
 * Initialize all agents and register them with the agent registry
 * This ensures agents can discover and communicate with each other
 */
export const initializeAgents = async () => {
  logger.info("Initializing agent system...");

  try {
    // Register config-based agents
    logger.info("Registering config-based agents...");

    // Register General agent (requires async creation for MCP tools)
    const general = await createGeneralAgent();
    agentRegistryService.register(general, generalAgentConfig as any);
    logger.info("  ✓ General agent registered");

    // Register other agents that aren't config-based yet
    const agentTypes = agentFactory.getSupportedTypes();
    for (const type of agentTypes) {
      // Skip already registered agents (these are registered manually above)
      if (type === "general") {
        continue;
      }

      try {
        const agent = await agentFactory.createAgent(type);
        const metadata = agentFactory.getAgentMetadata(type);

        if (agent) {
          // Ensure the agent has proper metadata
          const agentMetadata = metadata || {
            id: type,
            type: type as any,
            name: type,
            description: `${type} agent`,
            capabilities: [],
            icon: "🤖",
            version: "1.0.0",
          };

          agentRegistryService.register(agent, {
            id: type,
            type: type as any,
            version: agentMetadata.version || "1.0.0",
            metadata: agentMetadata,
            prompts: { system: `Default system prompt for ${type}` },
            behavior: {
              maxRetries: 3,
              responseFormat: "text" as const,
              validateResponse: false,
            },
            tools: { builtin: [] },
          });
          logger.info(`  ✓ ${type} agent registered`);
        }
      } catch (error) {
        logger.warn(`  ⚠ Failed to register ${type} agent:`, error);
      }
    }

    // Log summary
    const registeredAgents = agentRegistryService.getAllTypes();
    logger.info(`Agent system initialized with ${registeredAgents.length} agents:`, {
      agents: registeredAgents,
    });

    // Log agent communication graph
    const agentGraph = agentRegistryService.getAgentGraph();
    logger.info("Agent communication graph:", agentGraph);
  } catch (error) {
    logger.error("Failed to initialize agent system:", error);
    throw error;
  }
};

/**
 * Get initialization status
 */
export const getAgentSystemStatus = () => {
  const registeredAgents = agentRegistryService.getAllTypes();
  const capabilities = agentRegistryService.discover({ includeCallable: true });

  return {
    initialized: registeredAgents.length > 0,
    agentCount: registeredAgents.length,
    registeredAgents,
    callableAgents: capabilities,
  };
};
