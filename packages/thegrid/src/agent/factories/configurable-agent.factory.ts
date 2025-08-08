import { LLMService, LLMTraceContext } from "@/domains/ai/services/LLMService/llm.service";
import { eventBus } from "@/eda/events/event-bus";
import { logger } from "@/utils/logger";
import { AgentConfig } from "../schemas/agent-config.schemas";
import { createBaseAgent } from "./BaseAgent";
import { Agent, AgentResponse } from "./agents.factory.types";
import { ProgressMessage } from "@/schemas";
import { ToolExecutor } from "@mrck-labs/grid-core";
// Custom handler types for hooks
export interface CustomHandlers {
  beforeAct?: (
    input: any,
    config: AgentConfig,
    traceContext: LLMTraceContext | undefined,
    sendUpdate: (data: ProgressMessage) => Promise<void>
  ) => Promise<any>;
  afterResponse?: (response: any, input: any, sendUpdate: (data: ProgressMessage) => Promise<void>) => Promise<any>;
  onError?: (error: Error, attempt: number, sendUpdate: (data: ProgressMessage) => Promise<void>) => Promise<any>;
  validateResponse?: (
    response: any,
    sendUpdate: (data: ProgressMessage) => Promise<void>
  ) => Promise<{ isValid: boolean; errors?: any[] }>;
  transformInput?: (
    input: any,
    traceContext: LLMTraceContext | undefined,
    sendUpdate: (data: ProgressMessage) => Promise<void>
  ) => Promise<any>;
  transformOutput?: (output: any, sendUpdate: (data: ProgressMessage) => Promise<void>) => Promise<any>;
}

// Additional tools that can be passed
export interface AdditionalTools {
  local?: any[];
  mcp?: any[];
  agents?: any[];
}

export interface CreateConfigurableAgentOptions {
  config: AgentConfig;
  customHandlers?: CustomHandlers;
  llmService?: LLMService;
  additionalTools?: AdditionalTools;
  toolExecutor?: ToolExecutor;
}

/**
 * Creates an agent based on configuration with optional custom handlers
 */
export const createConfigurableAgent = ({
  config,
  customHandlers = {},
  llmService,
  additionalTools = {},
}: CreateConfigurableAgentOptions): Agent => {

  // Create base agent
  const base = createBaseAgent({
    id: config.id,
    type: config.type,
    llmService,
  });

  // Build tools array based on configuration
  const buildTools = () => {
    const tools = [...base.availableTools];

    // Add built-in tools
    if (config.tools.builtin.length > 0) {
      // const toolRunner = serviceRegistry.get("toolRunner");
      config.tools.builtin.forEach((toolName: string) => {
        // TODO: Get tool from tool registry
        logger.debug(`Adding built-in tool: ${toolName}`);
      });
    }

    // Add custom tools
    if (config.tools.custom) {
      // TODO: Get from custom tool registry
      logger.debug(`Adding ${config.tools.custom.length} custom tools`);
    }

    // Add MCP tools
    if (config.tools.mcp) {
      // TODO: Get from MCP registry
      logger.debug(`Adding ${config.tools.mcp.length} MCP tools`);
    }

    // Add agent tools (for orchestration)
    if (config.tools.agents && config.tools.agents.length > 0) {
      logger.debug(`Creating ${config.tools.agents.length} agent delegation tools`);

      // Create LLM tool format for delegation
      // We don't need the full metadata here - the agent type is sufficient for the tool definition
      // The actual delegation tool with full metadata is created dynamically in the tool runner
      const llmAgentTools = config.tools.agents.map((agentType: string) => ({
        type: "function" as const,
        function: {
          name: `delegate_to_${agentType}`,
          description: `Delegate task to ${agentType} agent`,
          parameters: {
            type: "object",
            properties: {
              task: {
                type: "string",
                description: "The specific task to delegate to this agent"
              },
              context: {
                type: "object",
                description: "Additional context for the agent",
                additionalProperties: true
              },
              reasoning: {
                type: "string",
                description: "Why are you delegating to this agent?"
              }
            },
            required: ["task", "reasoning"],
          },
        },
      }));

      tools.push(...llmAgentTools);
      logger.info(
        `[${config.id}] Added ${llmAgentTools.length} agent delegation tools:`,
        llmAgentTools.map((t) => t.function.name)
      );
    }

    // Add any additional tools passed directly
    if (additionalTools.local) tools.push(...additionalTools.local);
    if (additionalTools.mcp) tools.push(...additionalTools.mcp);
    if (additionalTools.agents) tools.push(...additionalTools.agents);

    return tools;
  };

  let sendUpdate: (data: ProgressMessage) => Promise<void> = async (data) => {
    console.log("sendUpdate", data);
  };

  /**
   * Set the global send function for streaming updates
   */
  const setSendUpdate = (sendFn: (data: ProgressMessage) => Promise<void>) => {
    sendUpdate = sendFn;
  };

  const availableTools = buildTools();

  return {
    ...base,
    availableTools,
    setSendUpdate,
    sendUpdate,
    // Enhanced metadata with config info
    getMetadata: () => ({
      ...config.metadata,
      configVersion: config.version,
      orchestration: config.orchestration,
    }),

    // Main act method with all enhancements
    act: async (input) => {
      // Create trace context for LLM call
      const traceContext = input.context?.sessionToken
        ? {
            sessionId: input.context.sessionToken,
            conversationId: input.context?.conversationId,
            agentType: config.id,
            metadata: {
              maxRetries: config.behavior.maxRetries,
              responseFormat: config.behavior.responseFormat,
            },
          }
        : undefined;

      // Transform input if hook is configured
      if (config.hooks?.transformInput && customHandlers.transformInput) {
        input = await customHandlers.transformInput(input, traceContext, sendUpdate);
      }

      // Pre-processing hook
      if (config.hooks?.beforeAct && customHandlers.beforeAct) {
        input = await customHandlers.beforeAct(input, config, traceContext, sendUpdate);
      }

      let attempt = 0;
      let lastValidationResult = null;
      let lastError = null;

      while (attempt < config.behavior.maxRetries) {
        attempt++;

        try {
          // Prepare messages with system prompt
          const messages = [{ role: "system" as const, content: config.prompts.system }, ...input.messages];

          // Add error correction message if we have validation errors from previous attempt
          if (lastValidationResult && !lastValidationResult.isValid && config.prompts.errorCorrection) {
            messages.push({
              role: "user" as const,
              content: config.prompts.errorCorrection.replace(
                "{errors}",
                JSON.stringify(lastValidationResult.errors || lastValidationResult)
              ),
            });
          }

          // Call LLM based on response format
          let response: AgentResponse;

          // Use tools from input if modified by hooks, otherwise use availableTools
          const toolsToUse = input.tools && input.tools.length > 0 ? input.tools : availableTools;

          // Debug logging for site-builder
          if (config.id === "site-builder") {
            logger.info(
              `[${config.id}] Calling LLM with ${toolsToUse.length} tools:`,
              toolsToUse.map((t: any) => t.function?.name || t.name)
            );
          }

          await sendUpdate({
            type: "unknown",
            content: "Calling LLM",
          });
          if (config.behavior.responseFormat === "json") {
            const llmResponse = await base.llmService.runCleanLLMWithJSONResponse({
              messages,
              tools: toolsToUse,
              traceContext,
            });
            console.log("LLM RESPONSE");
            console.log(llmResponse);
            response = llmResponse as AgentResponse;
          } else {
            const llmResponse = await base.llmService.runLLM({
              messages,
              tools: toolsToUse,
              traceContext,
            });
            response = llmResponse as AgentResponse;
          }

          await sendUpdate({
            type: "unknown",
            content: "LLM response received",
          });

          console.log("IRF AGENT RESPONSE");
          console.log(response);
          // Debug logging for site-builder
          if (config.id === "site-builder") {
            logger.info(`[${config.id}] LLM response:`, {
              hasToolCalls: !!(response as any).tool_calls,
              toolCallsCount: (response as any).tool_calls?.length || 0,
              responseType: typeof response,
              content: (response as any).content?.substring(0, 100),
            });
          }

          // Custom response processing
          if (config.hooks?.afterResponse && customHandlers.afterResponse) {
            response = await customHandlers.afterResponse(response, input, sendUpdate);
          }

          // Validation if configured
          if (config.behavior.validateResponse && customHandlers.validateResponse) {
            const validation = await customHandlers.validateResponse(response, sendUpdate);
            if (!validation.isValid) {
              lastValidationResult = validation;
              logger.warn(
                `Response validation failed for ${config.id} (attempt ${attempt}/${config.behavior.maxRetries})`
              );

              // Log validation errors for visibility
              logger.error(`Validation errors for ${config.id}:`, validation.errors);

              // If this is not the last attempt, continue to retry
              if (attempt < config.behavior.maxRetries) {
                continue;
              }

              // Last attempt - log that max retries reached
              logger.error(`Max validation retries reached for ${config.id}`);
            }
          }

          // Emit configured events
          if (config.behavior.emitEvents && config.behavior.emitEvents.length > 0) {
            for (const eventName of config.behavior.emitEvents) {
              logger.debug(`Emitting event: ${eventName}`);
              eventBus.emit(eventName as any, {
                agentId: config.id,
                agentType: config.type,
                response,
                input,
                metadata: {
                  attempt,
                  totalAttempts: config.behavior.maxRetries,
                },
              });
            }
          }

          // Transform output if hook is configured
          if (config.hooks?.transformOutput && customHandlers.transformOutput) {
            response = await customHandlers.transformOutput(response, sendUpdate);
          }

          return response;
        } catch (error) {
          lastError = error;
          logger.error(`Error in ${config.id} agent (attempt ${attempt}/${config.behavior.maxRetries})`, error);

          // Custom error handling
          if (config.hooks?.onError && customHandlers.onError) {
            const handled = await customHandlers.onError(error as Error, attempt, sendUpdate);
            if (handled) {
              return handled;
            }
          }

          // If this is the last attempt, throw the error
          if (attempt >= config.behavior.maxRetries) {
            throw error;
          }

          // Otherwise, continue to next attempt
          logger.info(`Retrying ${config.id} agent (attempt ${attempt + 1}/${config.behavior.maxRetries})`);
        }
      }

      // This should not be reached, but just in case
      throw (
        lastError || new Error(`Failed to get response from ${config.id} after ${config.behavior.maxRetries} attempts`)
      );
    },
  };
};
