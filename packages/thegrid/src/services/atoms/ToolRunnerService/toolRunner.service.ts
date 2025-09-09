import type OpenAI from "openai";
import { toolRegistry } from "../../../agent/tools";
import { createDelegationTool } from "../../../agent/tools/delegationTools";
import { userLogger } from "../../../utils/logger";
import type { AgentType } from "../../../agent/factories/agents.factory.types";

/**
 * Simplified tool runner service - only handles local tools
 * MCP tools are handled separately in agent flow service
 */
const createToolRunnerService = () => {
  const runTool = async (toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall, _userMessage: string) => {
    // Support both function-call and potential future variants safely
    const fn = (toolCall as any).function;
    const toolName = fn?.name as string;
    const toolArgs = JSON.parse((fn?.arguments as string) || "{}");

    userLogger.log(`[toolRunner] 🏃 Running tool: ${toolName}`);

    // Check if it's in the registry first
    if (toolRegistry.has(toolName)) {
      return await toolRegistry.execute(toolName, toolArgs);
    }

    // Check if it's a delegation tool
    if (toolName && toolName.startsWith("delegate_to_")) {
      const agentType = toolName.replace("delegate_to_", "") as AgentType;
      userLogger.log(`[toolRunner] 🤝 Creating dynamic delegation tool for ${agentType}`);

      try {
        const delegationTool = createDelegationTool(agentType);
        // Execute directly without registering (keeps it dynamic)
        const options = {
          toolCallId: `call_${Date.now()}`,
          messages: [],
        };
        if (!delegationTool.execute) {
          throw new Error(`Delegation tool for ${agentType} has no execute function`);
        }
        return await delegationTool.execute(toolArgs, options);
      } catch (error) {
        userLogger.log(`[toolRunner] ❌ Failed to create delegation tool for ${agentType}:`, error);
        throw new Error(
          `Failed to delegate to ${agentType}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    throw new Error(`Tool ${toolName} not found in local registry`);
  };

  const isLocalTool = (name: string): boolean => {
    // Check registry or if it's a delegation tool
    return toolRegistry.has(name) || name.startsWith("delegate_to_");
  };

  const getToolDefinitions = () => {
    // Grid-core ToolSet expects a record of tools (name -> tool)
    return toolRegistry.getDefinitions();
  };

  const getAvailableTools = () => {
    return toolRegistry.getToolNames();
  };

  // Return public interface
  return {
    runTool,
    isLocalTool,
    getToolDefinitions,
    getAvailableTools,
  };
};

export { createToolRunnerService };
export const toolRunnerService = createToolRunnerService();
