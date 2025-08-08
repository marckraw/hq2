import { createNamedTool } from "@mrck-labs/grid-core";
import { z } from "@hono/zod-openapi";
import { agentFactory } from "../factories/agents.factory";
import type { AgentType } from "../factories/agents.factory.types";
import { logger, userLogger } from "../../utils/logger";

// Define the delegation parameters schema
const delegationSchema = z.object({
  task: z.string().describe("The specific task to delegate to this agent"),
  context: z.any().optional().describe("Additional context for the agent"),
  reasoning: z.string().describe("Why are you delegating to this agent?")
});

// Type for the parameters
type DelegationParams = z.infer<typeof delegationSchema>;

/**
 * Creates a delegation tool for a specific agent type
 */
export const createDelegationTool = (agentType: AgentType) => {
  const metadata = agentFactory.getAgentMetadata(agentType);
  if (!metadata) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  return createNamedTool({
    name: `delegate_to_${agentType}`,
    description: `Delegate task to ${metadata.name}: ${metadata.description}`,
    parameters: delegationSchema,
    execute: async (params: DelegationParams) => {
      userLogger.log(`[delegationTools] 🤝 Delegating to ${agentType} with task:`, params.task);
      
      try {
        // Create the target agent
        const agent = await agentFactory.createAgent(agentType);
        
        // Build the delegation context
        const delegationInput = {
          userMessage: params.task,
          messages: [{ role: "user" as const, content: params.task }],
          delegationContext: params.context
        };
        
        // Execute the delegation
        const result = await agent.act(delegationInput);
        
        userLogger.log(`[delegationTools] ✅ Delegation to ${agentType} completed`);
        
        // Extract the content from the agent response
        // The agent.act() returns an AgentResponse object, but tools should return strings
        if (typeof result === 'object' && result.content) {
          return result.content;
        } else if (typeof result === 'string') {
          return result;
        } else {
          return JSON.stringify(result);
        }
      } catch (error) {
        logger.error(`Error delegating to ${agentType}:`, error);
        throw new Error(`Failed to delegate to ${agentType}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  });
};

