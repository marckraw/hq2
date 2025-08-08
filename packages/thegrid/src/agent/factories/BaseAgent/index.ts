import { logger } from "@/utils/logger";
import { LLMService } from "@/domains/ai/services/LLMService/llm.service";
import { serviceRegistry } from "../../../registry/service-registry";
import { Agent, BaseAgentConfig, AgentMetadata, AgentInput } from "../agents.factory.types";

export interface BaseAgent extends Omit<Agent, "act" | "sendUpdate"> {
  makeApiRequest: (endpoint: string, payload: any) => Promise<any>;
  log: (message: string) => void;
  availableTools: any[];
  llmService: LLMService;
}

// Extended BaseAgentConfig to include optional llmService
export interface BaseAgentConfigWithLLM extends BaseAgentConfig {
  llmService?: LLMService;
}

// --- Base Agent ---
export const createBaseAgent = ({
  id,
  type,
  availableTools = [],
  metadata,
  llmService,
}: BaseAgentConfigWithLLM): BaseAgent => {
  // Use provided LLM service or default to baseLLMService
  const llm = llmService || serviceRegistry.get("llm");
  // Private shared utilities for all agents
  const makeApiRequest = async (endpoint: string, payload: any) => {
    // Example request logic (real logic later)
    logger.info(`[${type.toUpperCase()}] Calling API: ${endpoint}`, payload);

    // Fake delay for demo
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true, response: `Response from ${endpoint}` };
  };

  const log = (message: string) => {
    logger.info(`[${type.toUpperCase()}] ${message}`);
  };

  // Default metadata for the agent
  const getMetadata = (): AgentMetadata => {
    return {
      // id:,
      // type: type || "",
      // name: metadata?.name || `${type} Agent`,
      // description: metadata?.description || `A ${type} agent`,
      // capabilities: metadata?.capabilities || [],
      // icon: metadata?.icon || "🤖",
      // version: metadata?.version || "1.0.0",
      // author: metadata?.author || "System",
      ...(metadata as AgentMetadata),
    };
  };

  // Input validation
  const validateInput = (input: AgentInput | string): boolean => {
    if (typeof input === "string") {
      return input.trim().length > 0;
    }

    if (typeof input === "object" && input.messages) {
      return Array.isArray(input.messages) && input.messages.length > 0;
    }

    return false;
  };

  return {
    llmService: llm,
    id,
    type,
    makeApiRequest,
    log,
    availableTools,
    getMetadata,
    validateInput,
  };
};
