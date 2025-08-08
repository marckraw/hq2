import { logger, userLogger } from "@/utils/logger";
import { mcpServersFactory } from "../../../domains/integration/factories/mcp-servers.factory";
import { serviceRegistry } from "../../../registry/service-registry";
import type { Agent } from "../../factories/agents.factory.types";
import type { AgentFlowContext } from "../../../schemas/agent-flow.schemas";

/**
 * Simplified tool execution for agents
 * Clear separation between MCP tools and local tools
 */
export const createExecuteToolForAgent = (
  sendUpdate: (data: any, context?: AgentFlowContext) => Promise<void>,
  generateDynamicToolList: (agentType: string, agent: Agent) => Promise<any>
) => {
  const executeToolForAgent = async ({
    toolCall,
    agentType,
    agent,
    userMessage,
    context,
  }: {
    toolCall: any;
    agentType: string;
    agent: Agent;
    userMessage: string;
    context?: AgentFlowContext;
  }): Promise<any> => {
    const startTime = Date.now();
    const toolName = toolCall.function.name;

    userLogger.log(`[executeToolForAgent] 🔍 Looking for tool: ${toolName}`);

    // 1. Special handling for list_available_tools
    if (toolName === "list_available_tools") {
      return await generateDynamicToolList(agentType, agent);
    }

    // 2. Check MCP tools (keep existing implementation)
    const figmaContextMcpService = await mcpServersFactory.createFigmaMCPServiceClient();
    
    if (figmaContextMcpService?.isTool(toolName)) {
      // Check agent permissions for MCP tools
      const allowedAgents = ["general", "figma-analyzer", "IRFLayoutArchitecture", "figma-to-storyblok"];
      
      if (allowedAgents.includes(agentType)) {
        if (context) {
          await sendUpdate(
            {
              type: "tool_execution",
              content: `📐 Executing Figma MCP tool: ${toolName}`,
              metadata: {
                phase: "mcp_tool_execution",
                toolName,
                toolSource: "mcp_figma",
              },
            },
            context
          );
        }

        const result = await figmaContextMcpService.handleToolCall(toolCall.function);
        
        const executionTime = Date.now() - startTime;
        userLogger.log(`[executeToolForAgent] ✅ MCP tool ${toolName} executed in ${executionTime}ms`);
        
        return typeof result === "string" ? result : JSON.stringify(result);
      } else {
        return `Tool '${toolName}' not available to ${agentType} agent.`;
      }
    }

    // 3. Check local tools (including delegation tools)
    const toolRunner = serviceRegistry.get("toolRunner");
    
    if (toolRunner.isLocalTool(toolName)) {
      if (context) {
        await sendUpdate(
          {
            type: "tool_execution",
            content: `🛠️ Executing local tool: ${toolName}`,
            metadata: {
              phase: "local_tool_execution",
              toolName,
              toolSource: "local",
            },
          },
          context
        );
      }

      const result = await toolRunner.runTool(toolCall, userMessage);
      
      const executionTime = Date.now() - startTime;
      userLogger.log(`[executeToolForAgent] ✅ Local tool ${toolName} executed in ${executionTime}ms`);
      
      return result;
    }

    // 4. Tool not found
    logger.error(`Tool not found: ${toolName}`);
    throw new Error(`Tool '${toolName}' not found in any registry`);
  };

  return executeToolForAgent;
};