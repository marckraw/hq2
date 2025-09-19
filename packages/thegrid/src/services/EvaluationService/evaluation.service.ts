import { logger } from "@/utils/logger";
import type { ProgressMessage } from "core.mrck.dev";
import { agentService } from "../../agent/services/AgentService/agent.service";
import { evaluateResponseTool } from "../../agent/tools/planning/evaluateResponse.tool";
import { serviceRegistry } from "../../registry/service-registry";
import { ChatMessage } from "../../routes/api/shared";

type SendFunction = (data: ProgressMessage) => Promise<void>;

const createEvaluationService = () => {
  // Public methods
  const evaluateResponse = async ({
    userMessage,
    response,
    originalToolResponse,
    conversationHistory,
    send,
    traceContext,
  }: {
    userMessage: string;
    response: string;
    originalToolResponse: string;
    conversationHistory: ChatMessage[];
    send: SendFunction;
    traceContext?: {
      sessionId: string;
      conversationId?: number;
      agentType?: string;
      metadata?: Record<string, any>;
    };
  }) => {
    const llmService = serviceRegistry.get("llm");
    const completionEvaluation = await llmService.runLLM({
      messages: [
        ...conversationHistory,
        {
          role: "system",
          content: `
            You are a task completion checker. Your job is to determine if the current task is complete based on the plan of action you have created.
            
            IMPORTANT: You MUST use the evaluate_response tool to analyze the response. Do not provide a direct answer without using the tool.
            
            User's original request: 
            <user_request>
            ${userMessage}
            </user_request>

            Response to evaluate:
            <response_to_evaluate>
            ${response}
            </response_to_evaluate>
            
            Analyze this response and determine:
            1. Does it contain a question that requires user input?
            2. Does it indicate the task is completed?
            3. Or does it suggest continuing with next actions?
            
            Use the evaluate_response tool to provide your analysis.
            `,
        },
      ],
      tools: {
        // Grid-core expects ToolSet (record of tools)
        ...evaluateResponseTool,
      } as any,
      sendUpdate: async (_data: any) => {},
      // Pass both legacy traceContext and the new context shape expected by baseLLMService
      traceContext: traceContext
        ? {
            sessionId: traceContext.sessionId,
            conversationId: traceContext.conversationId,
            agentType: traceContext.agentType,
            metadata: {
              evaluationStep: "completion-evaluation",
              userMessage: userMessage.substring(0, 100),
              ...traceContext.metadata,
            },
          }
        : undefined,
      context: traceContext
        ? {
            sessionToken: traceContext.sessionId,
            metadata: {
              evaluationStep: "completion-evaluation",
              userMessage: userMessage.substring(0, 100),
              ...(traceContext.metadata || {}),
            },
          }
        : undefined,
    });

    if ((completionEvaluation as any)?.toolCalls) {
      const toolCall = (completionEvaluation as any).toolCalls[0];
      const toolCallId = toolCall?.id;

      await send({
        type: "tool_execution",
        content: `executing: ${toolCall?.function.name}`,
        metadata: {
          source: "llm",
          functionName: toolCall?.toolName,
          toolCallId: toolCallId,
          toolCallArguments: toolCall?.args,
        },
      });

      const evaluation = typeof toolCall?.args === "string" ? JSON.parse(toolCall.args as any) : toolCall?.args;

      const rephraseConclusions = await llmService.runLLM({
        messages: [
          {
            role: "system",
            content: `You are a rephrase and conclusion creator tool. You are given a task completion evaluation and you need to rephrase the conclusions from the evaluation.
            You have to also return information based on the evaluation, what is the next step in the task completion.
            If all the tasks are completed, you should return the final conclusion.
            `,
          },
          {
            role: "assistant",
            content: (typeof toolCall?.args === "string"
              ? JSON.parse(toolCall.args).reasoning
              : (toolCall?.args as any)?.reasoning) as any,
          },
        ],
        tools: {} as any,
        sendUpdate: async (_data: any) => {},
        traceContext: traceContext
          ? {
              sessionId: traceContext.sessionId,
              conversationId: traceContext.conversationId,
              agentType: traceContext.agentType,
              metadata: {
                evaluationStep: "rephrase-conclusions",
                originalReasoning:
                  typeof toolCall?.args === "string"
                    ? (JSON.parse(toolCall.args).reasoning?.substring(0, 100) as any)
                    : (toolCall?.args?.reasoning?.substring(0, 100) as any),
                ...traceContext.metadata,
              },
            }
          : undefined,
        context: traceContext
          ? {
              sessionToken: traceContext.sessionId,
              metadata: {
                evaluationStep: "rephrase-conclusions",
                originalReasoning:
                  typeof toolCall?.args === "string"
                    ? (JSON.parse(toolCall.args).reasoning?.substring(0, 100) as any)
                    : (toolCall?.args?.reasoning?.substring(0, 100) as any),
                ...(traceContext.metadata || {}),
              },
            }
          : undefined,
      });

      // Use the evaluation to determine next steps
      if (evaluation.evaluation.state === "waiting-for-prompt" && evaluation.evaluation.hasQuestion) {
        logger.info("Waiting for prompt");
        agentService.setStatus("waiting-for-prompt");
        await send({
          type: "llm_response",
          content: response,
          metadata: {
            agentStatus: agentService.getStatus(),
          },
        });

        // Don't send conclusion as separate message - it will be included in "finished" metadata
        return {
          completionEvaluation,
          shouldBreak: true,
          agentStatus: agentService.getStatus(),
          // TODO: fix this
          // @ts-ignore
          conclusion: rephraseConclusions.content as string,
        };
      } else if (evaluation.evaluation.state === "task-completed") {
        logger.info("Task completed");
        agentService.setStatus("task-complete");
        await send({
          type: "llm_response",
          content: `${response}`,
          metadata: {
            agentStatus: agentService.getStatus(),
            originalToolResponse: originalToolResponse,
          },
        });

        // Don't send conclusion as separate message - it will be included in "finished" metadata
        return {
          completionEvaluation,
          shouldBreak: true,
          agentStatus: agentService.getStatus(),
          // TODO: fix this
          // @ts-ignore
          conclusion: rephraseConclusions.content as string,
        };
      } else {
        // Don't send conclusion as separate message - it will be included in "finished" metadata
        return {
          completionEvaluation,
          shouldBreak: false,
          agentStatus: agentService.getStatus(),
          // TODO: fix this
          // @ts-ignore
          conclusion: rephraseConclusions.content as string,
        };
      }
    }

    // Fallback case: LLM didn't use the evaluation tool
    logger.info("Warning: LLM did not use evaluate_response tool, providing fallback evaluation");

    // Create a simple fallback conclusion
    const fallbackConclusion = `Task evaluation: The agent provided a response but did not use the evaluation tool. Response content: "${response.substring(
      0,
      100
    )}${response.length > 100 ? "..." : ""}"`;

    return {
      completionEvaluation,
      shouldBreak: false, // Continue by default when evaluation fails
      agentStatus: agentService.getStatus(),
      originalToolResponse: originalToolResponse,
      conclusion: fallbackConclusion,
    };
  };

  // Return public interface
  return {
    evaluateResponse,
  };
};

export const evaluationService = createEvaluationService();
export { createEvaluationService };
