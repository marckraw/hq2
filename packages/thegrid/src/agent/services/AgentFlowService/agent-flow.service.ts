import { logger, userLogger } from "@/utils/logger";
import type { ProgressMessage } from "core.mrck.dev";
import { mcpServersFactory } from "../../../domains/integration/factories/mcp-servers.factory";
import { serviceRegistry } from "../../../registry/service-registry";
import { ChatMessage, transformMessagesForAI } from "../../../routes/api/shared";
import {
  AgentFlowContext,
  AgentFlowOptions,
  FlowStepResult,
  ToolExecutionResult,
} from "../../../schemas/agent-flow.schemas";
import { agentFactory } from "../../factories/agents.factory";
import { Agent, AgentResponse, validateAgentActResponse } from "../../factories/agents.factory.types";
import { agentExecutionService } from "../AgentExecutionService/agent-execution.service";

// Types are now imported from schemas/conversation.schemas.ts
// Using Zod-inferred types for better type safety and validation

const createAgentFlowService = () => {
  // Global send function that can be set by the main API route
  let globalSendFunction: ((data: ProgressMessage) => Promise<void>) | null = null;

  /**
   * Set the global send function for streaming updates
   */
  const setSendFunction = (sendFn: (data: ProgressMessage) => Promise<void>) => {
    globalSendFunction = sendFn;
  };

  /**
   * Clear the global send function
   */
  const clearSendFunction = () => {
    globalSendFunction = null;
  };

  /**
   * Send a progress update using the global send function and save to database
   */
  const sendUpdate = async (data: ProgressMessage, context?: AgentFlowContext): Promise<void> => {
    if (globalSendFunction) {
      await globalSendFunction(data);
    } else {
      // Fallback: just log the update
      logger.info("🔄 Progress Update:", data);
    }

    // Save to database if execution context is available
    if (context?.executionId) {
      try {
        // Get current step count for this execution
        const executionData = await agentExecutionService.getExecutionWithSteps(context.executionId);
        const stepOrder = executionData ? executionData.steps.length + 1 : 1;

        await agentExecutionService.addStep({
          executionId: context.executionId,
          stepType: data.type,
          content: data.content,
          metadata: data.metadata,
          stepOrder,
        } as any);
      } catch (error) {
        logger.error("Failed to save execution step:", error);
      }
    }
  };

  /**
   * Handle LLM response - evaluation, storage, and streaming
   */
  const handleLLMResponse = async (response: AgentResponse, context: AgentFlowContext): Promise<FlowStepResult> => {
    if (!response.content) {
      return { shouldBreak: false };
    }

    userLogger.log("[agent-flow.service.ts] handleLLMResponse response: ", {
      response,
    });

    userLogger.log("[agent-flow.service.ts] handleLLMResponse we are going to store the next nmessage do we ? : ");

    // Store the main response
    const assistantMessage = await serviceRegistry.get("conversation").addMessage({
      message: { role: "assistant", content: response.content },
      conversationId: context.conversationId,
    });

    // 🔍 Create evaluation span with timing
    const langfuse = serviceRegistry.get("langfuse");
    const evalStartTime = performance.now();
    const evalStartMemory = process.memoryUsage();
    const evaluationSpan = context.sessionToken
      ? langfuse.createSpanForSession(
          context.sessionToken,
          "evaluation-llm-response",
          {
            agentType: context.agentType,
            responseLength: response.content.length,
            hasOriginalToolResponse: false,
            startTime: new Date().toISOString(),
            startMemoryMB: Math.round(evalStartMemory.heapUsed / 1024 / 1024),
          },
          {
            userMessage: context.userMessage,
            response: response.content.substring(0, 300),
          }
        )
      : null;

    let evaluationResult;
    try {
      evaluationResult = await serviceRegistry.get("evaluation").evaluateResponse({
        userMessage: context.userMessage,
        response: response.content,
        originalToolResponse: "",
        conversationHistory: context.conversationHistory,
        send: (() => {
          if (!globalSendFunction) {
            throw new Error("globalSendFunction is not initialized. Message streaming cannot proceed.");
          }
          return globalSendFunction;
        })(),
        traceContext: context.sessionToken
          ? {
              sessionId: context.sessionToken,
              conversationId: context.conversationId,
              agentType: context.agentType,
              metadata: {
                evaluationContext: "llm-response",
                responseLength: response.content?.length || 0,
              },
            }
          : undefined,
      });

      // 🔍 End evaluation span with performance metrics
      if (evaluationSpan) {
        const evalEndTime = performance.now();
        const evalEndMemory = process.memoryUsage();
        const evalDuration = evalEndTime - evalStartTime;
        const evalMemoryDelta = evalEndMemory.heapUsed - evalStartMemory.heapUsed;

        evaluationSpan.end({
          output: {
            shouldBreak: evaluationResult.shouldBreak,
            hasConclusion: !!evaluationResult.conclusion,
          },
          metadata: {
            duration_ms: Math.round(evalDuration),
            endTime: new Date().toISOString(),
            success: true,
            endMemoryMB: Math.round(evalEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(evalMemoryDelta / 1024 / 1024),
            evaluationType: "llm-response",
            conclusionLength: evaluationResult.conclusion?.length || 0,
          },
        });
      }
    } catch (error) {
      // 🔍 End evaluation span with error and performance metrics
      if (evaluationSpan) {
        const evalEndTime = performance.now();
        const evalEndMemory = process.memoryUsage();
        const evalDuration = evalEndTime - evalStartTime;
        const evalMemoryDelta = evalEndMemory.heapUsed - evalStartMemory.heapUsed;

        evaluationSpan.end({
          output: null,
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: {
            duration_ms: Math.round(evalDuration),
            endTime: new Date().toISOString(),
            success: false,
            endMemoryMB: Math.round(evalEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(evalMemoryDelta / 1024 / 1024),
            evaluationType: "llm-response",
          },
        });
      }
      throw error;
    }

    const { shouldBreak, conclusion } = evaluationResult;

    if (shouldBreak) {
      return { shouldBreak: true, conclusion };
    }

    // Link execution to the assistant message if we have an executionId
    if (context.executionId && assistantMessage) {
      try {
        await agentExecutionService.updateExecution(context.executionId, {
          messageId: assistantMessage.id,
        });
      } catch (error) {
        logger.error("Failed to link execution to message:", error);
      }
    }

    // Send response via stream
    await sendUpdate(
      {
        type: "llm_response",
        content: response.content,
        metadata: {
          agentStatus: serviceRegistry.get("agent").getStatus(),
          agentType: context.agentType,
        },
      },
      context
    );

    return { shouldBreak: false, conclusion };
  };

  /**
   * Handle tool calls - execution, rephrasing, and evaluation
   */
  const handleToolCalls = async (
    response: AgentResponse,
    context: AgentFlowContext
  ): Promise<ToolExecutionResult | null> => {
    if (!response.toolCalls || response.toolCalls.length === 0) {
      return null;
    }

    const toolCall = response.toolCalls[0];
    // TODO: fix this
    // @ts-ignore
    const toolCallId = toolCall.id;

    // Store tool call message with proper format for transformMessagesForAI
    // The transformMessagesForAI function expects tool calls to be stored as JSON in content
    // with tool_call_id present to identify it as a tool call
    await serviceRegistry.get("conversation").addMessage({
      message: {
        role: "assistant",
        // TODO: fix this
        // @ts-ignore
        content: JSON.stringify(toolCall.function), // Store function call as JSON in content
        tool_call_id: toolCallId, // This identifies it as a tool call message
      } as any, // Cast to avoid TypeScript issues with tool_call_id on assistant messages
      conversationId: context.conversationId,
    });

    await sendUpdate(
      {
        type: "tool_execution",
        // TODO: fix this
        // @ts-ignore
        content: `${context.agentType} executing: ${toolCall.function.name}`,
        metadata: {
          source: "llm",
          // TODO: fix this
          // @ts-ignore
          functionName: toolCall.function.name,
          toolCallId: toolCallId,
          // TODO: fix this
          // @ts-ignore
          toolCallArguments: toolCall.function.arguments,
          agentType: context.agentType,
        },
      },
      context
    );

    // 🔍 Create tool execution span with timing and memory
    const langfuse = serviceRegistry.get("langfuse");
    const toolStartTime = performance.now();
    const toolStartMemory = process.memoryUsage();
    const toolExecutionSpan = context.sessionToken
      ? langfuse.createSpanForSession(
          context.sessionToken,
          `tool-execution`,
          {
            // TODO: fix this
            // @ts-ignore
            toolName: toolCall.function.name,
            agentType: context.agentType,
            toolCallId: toolCallId,
            startTime: new Date().toISOString(),
            startMemoryMB: Math.round(toolStartMemory.heapUsed / 1024 / 1024),
          },
          // TODO: fix this
          // @ts-ignore
          toolCall.function.arguments
        )
      : null;

    let toolResponse;
    try {
      // Execute tool
      toolResponse = await executeToolForAgent({
        toolCall,
        agentType: context.agentType,
        agent: context.agent,
        userMessage: context.userMessage,
        context,
      });

      // 🔍 End tool execution span with performance metrics
      if (toolExecutionSpan) {
        const toolEndTime = performance.now();
        const toolEndMemory = process.memoryUsage();
        const toolDuration = toolEndTime - toolStartTime;
        const memoryDelta = toolEndMemory.heapUsed - toolStartMemory.heapUsed;

        toolExecutionSpan.end({
          output: typeof toolResponse === "string" ? toolResponse.substring(0, 500) : toolResponse,
          metadata: {
            duration_ms: Math.round(toolDuration),
            endTime: new Date().toISOString(),
            success: true,
            endMemoryMB: Math.round(toolEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(memoryDelta / 1024 / 1024),
            outputSize: typeof toolResponse === "string" ? toolResponse.length : JSON.stringify(toolResponse).length,
            // TODO: fix this
            // @ts-ignore
            toolName: toolCall.function.name,
          },
        });
      }
    } catch (error) {
      // 🔍 End tool execution span with error and performance metrics
      if (toolExecutionSpan) {
        const toolEndTime = performance.now();
        const toolEndMemory = process.memoryUsage();
        const toolDuration = toolEndTime - toolStartTime;
        const memoryDelta = toolEndMemory.heapUsed - toolStartMemory.heapUsed;

        toolExecutionSpan.end({
          output: null,
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: {
            duration_ms: Math.round(toolDuration),
            endTime: new Date().toISOString(),
            success: false,
            endMemoryMB: Math.round(toolEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(memoryDelta / 1024 / 1024),
            // TODO: fix this
            // @ts-ignore
            toolName: toolCall.function.name,
          },
        });
      }
      throw error;
    }

    // Store tool response
    await serviceRegistry.get("conversation").saveToolResponse({
      toolCallId,
      toolResponse: toolResponse as string,
      conversationId: context.conversationId,
    });

    await sendUpdate(
      {
        type: "tool_response",
        content: toolResponse as string,
        metadata: {
          originalToolResponse: toolResponse,
          agentType: context.agentType,
          isRaw: true,
        },
      },
      context
    );

    // Rephrase tool response
    const rephraser = await agentFactory.createAgent("rephraser");

    // 🔍 Create span for rephraser agent call (LLM generations happen inside)
    const rephraserStartTime = performance.now();
    const rephraserSpan = context.sessionToken
      ? langfuse.createSpanForSession(
          context.sessionToken,
          "rephraser-call",
          {
            originalResponseLength: String(toolResponse).length,
            agentType: "rephraser",
            parentAgentType: context.agentType,
            startTime: new Date().toISOString(),
          },
          [{ role: "user", content: toolResponse as string }]
        )
      : null;

    let rawRephrasedToolResponse;
    try {
      rawRephrasedToolResponse = await rephraser.act({
        messages: [{ role: "user", content: toolResponse as string }],
      });

      // 🔍 End rephraser span with timing
      if (rephraserSpan) {
        const rephraserEndTime = performance.now();
        const rephraserDuration = rephraserEndTime - rephraserStartTime;

        rephraserSpan.end({
          output: rawRephrasedToolResponse,
          metadata: {
            duration_ms: Math.round(rephraserDuration),
            endTime: new Date().toISOString(),
            success: true,
            outputLength: JSON.stringify(rawRephrasedToolResponse).length,
            compressionRatio: JSON.stringify(rawRephrasedToolResponse).length / String(toolResponse).length,
          },
        });
      }
    } catch (error) {
      // 🔍 End rephraser span with error and timing
      if (rephraserSpan) {
        const rephraserEndTime = performance.now();
        const rephraserDuration = rephraserEndTime - rephraserStartTime;

        rephraserSpan.end({
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: {
            duration_ms: Math.round(rephraserDuration),
            endTime: new Date().toISOString(),
            success: false,
          },
        });
      }
      throw error;
    }

    // 🔥 VALIDATE REPHRASER RESPONSE WITH ZOD
    const rephraserValidation = validateAgentActResponse(rawRephrasedToolResponse, "rephraser");
    const rephrasedToolResponse = rephraserValidation.data;

    if (!rephraserValidation.success) {
      logger.warn("⚠️ Rephraser agent returned invalid response, using fallback content extraction");
    }

    const rephrasedContent =
      typeof rephrasedToolResponse === "string"
        ? rephrasedToolResponse
        : rephrasedToolResponse?.content || rephrasedToolResponse;

    // 🔍 Create evaluation span for tool response with timing
    const toolEvalStartTime = performance.now();
    const toolEvalStartMemory = process.memoryUsage();
    const evaluationSpan = context.sessionToken
      ? langfuse.createSpanForSession(
          context.sessionToken,
          "evaluation-tool-response",
          {
            agentType: context.agentType,
            responseLength: String(rephrasedContent).length,
            originalToolResponseLength: String(toolResponse).length,
            hasOriginalToolResponse: true,
            startTime: new Date().toISOString(),
            startMemoryMB: Math.round(toolEvalStartMemory.heapUsed / 1024 / 1024),
          },
          {
            userMessage: context.userMessage,
            response: String(rephrasedContent).substring(0, 300),
            originalToolResponse: String(toolResponse).substring(0, 300),
          }
        )
      : null;

    let evaluationResult;
    try {
      evaluationResult = await serviceRegistry.get("evaluation").evaluateResponse({
        userMessage: context.userMessage,
        response: rephrasedContent as string,
        originalToolResponse: toolResponse as string,
        conversationHistory: context.conversationHistory,
        send: globalSendFunction || (async () => {}),
        traceContext: context.sessionToken
          ? {
              sessionId: context.sessionToken,
              conversationId: context.conversationId,
              agentType: context.agentType,
              metadata: {
                evaluationContext: "tool-response",
                responseLength: String(rephrasedContent).length,
                originalToolResponseLength: String(toolResponse).length,
              },
            }
          : undefined,
      });

      // 🔍 End evaluation span with performance metrics
      if (evaluationSpan) {
        const toolEvalEndTime = performance.now();
        const toolEvalEndMemory = process.memoryUsage();
        const toolEvalDuration = toolEvalEndTime - toolEvalStartTime;
        const toolEvalMemoryDelta = toolEvalEndMemory.heapUsed - toolEvalStartMemory.heapUsed;

        evaluationSpan.end({
          output: {
            shouldBreak: evaluationResult.shouldBreak,
            hasConclusion: !!evaluationResult.conclusion,
          },
          metadata: {
            duration_ms: Math.round(toolEvalDuration),
            endTime: new Date().toISOString(),
            success: true,
            endMemoryMB: Math.round(toolEvalEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(toolEvalMemoryDelta / 1024 / 1024),
            evaluationType: "tool-response",
            conclusionLength: evaluationResult.conclusion?.length || 0,
            compressionRatio: String(rephrasedContent).length / String(toolResponse).length,
          },
        });
      }
    } catch (error) {
      // 🔍 End evaluation span with error and performance metrics
      if (evaluationSpan) {
        const toolEvalEndTime = performance.now();
        const toolEvalEndMemory = process.memoryUsage();
        const toolEvalDuration = toolEvalEndTime - toolEvalStartTime;
        const toolEvalMemoryDelta = toolEvalEndMemory.heapUsed - toolEvalStartMemory.heapUsed;

        evaluationSpan.end({
          output: null,
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: {
            duration_ms: Math.round(toolEvalDuration),
            endTime: new Date().toISOString(),
            success: false,
            endMemoryMB: Math.round(toolEvalEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(toolEvalMemoryDelta / 1024 / 1024),
            evaluationType: "tool-response",
          },
        });
      }
      throw error;
    }

    // Evaluate rephrased response
    const { shouldBreak, conclusion } = evaluationResult;

    // Store conclusion
    if (conclusion) {
      await serviceRegistry.get("conversation").addMessage({
        message: { role: "assistant", content: conclusion },
        conversationId: context.conversationId,
      });
    }

    if (shouldBreak) {
      return {
        toolResponse,
        rephrasedContent: rephrasedContent as string,
        shouldBreak: true,
        conclusion,
      };
    }

    // Send rephrased response
    await sendUpdate(
      {
        type: "tool_response",
        content: rephrasedContent as string,
        metadata: {
          originalToolResponse: toolResponse,
          agentType: context.agentType,
          isRephrased: true,
        },
      },
      context
    );

    return {
      toolResponse,
      rephrasedContent: rephrasedContent as string,
      shouldBreak: false,
      conclusion,
    };
  };

  /**
   * Execute a single agent iteration (LLM call + response handling)
   */
  const executeAgentIteration = async (messages: ChatMessage[], context: AgentFlowContext): Promise<FlowStepResult> => {
    userLogger.log("[agent-flow.service.ts] executeAgentIteration start: ", {
      messages,
    });

    sendUpdate(
      {
        type: "unknown",
        content: "🔄 Starting agent iteration",
        metadata: {
          messages: messages,
        },
      },
      undefined
    );

    // Get agent response with full context
    if (context.sessionData?.contextData) {
      logger.info("🔄 Context includes contextData from session:", context.sessionData.contextData);
    }

    // 🔍 Create span for main agent call (LLM generations happen inside)
    const langfuse = serviceRegistry.get("langfuse");
    const startTime = performance.now();
    const mainSpan = context.sessionToken
      ? langfuse.createSpanForSession(
          context.sessionToken,
          `${context.agentType}-main-call`,
          {
            agentType: context.agentType,
            messageCount: messages.length,
            hasContextData: !!context.sessionData?.contextData,
            startTime: new Date().toISOString(),
          },
          messages
        )
      : null;

    let rawResponse;
    try {
      rawResponse = await context.agent.act({
        messages,
        tools: [], // agent.act will have its own tools
        context, // Pass the full context
      });

      // 🔍 End span with success and timing
      if (mainSpan) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        mainSpan.end({
          output: rawResponse,
          metadata: {
            duration_ms: Math.round(duration),
            endTime: new Date().toISOString(),
            success: true,
            responseLength: JSON.stringify(rawResponse).length,
          },
        });
      }
    } catch (error) {
      // 🔍 End span with error and timing
      if (mainSpan) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        mainSpan.end({
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: {
            duration_ms: Math.round(duration),
            endTime: new Date().toISOString(),
            success: false,
          },
        });
      }
      throw error; // Re-throw the error
    }

    userLogger.log("[agent-flow.service.ts] executeAgentIteration rawResponse: ", {
      rawResponse,
    });

    // 🔥 VALIDATE AGENT RESPONSE WITH ZOD
    const validation = validateAgentActResponse(rawResponse, context.agentType);
    const response = validation.data; // Use validated data (or raw data for graceful degradation)

    if (!validation.success) {
      // Send warning to client if possible
      await sendUpdate(
        {
          type: "tool_response", // Using tool_response type for internal messages
          content: `⚠️ Agent "${context.agentType}" returned invalid response format. Attempting graceful recovery...`,
          metadata: {
            source: "validation_system",
            agentType: context.agentType,
            validationError: validation.error?.issues,
            isRaw: true,
          },
        },
        context
      );
    }

    let finalConclusion: string | undefined;

    // Handle LLM response
    if (response.content) {
      const llmResult = await handleLLMResponse(response, context);
      if (llmResult.shouldBreak) {
        return { shouldBreak: true, conclusion: llmResult.conclusion };
      }
      if (llmResult.conclusion) {
        finalConclusion = llmResult.conclusion;
      }
    }

    // Handle tool calls
    if (response.tool_calls) {
      const toolResult = await handleToolCalls(response, context);
      if (toolResult?.shouldBreak) {
        return { shouldBreak: true, conclusion: toolResult.conclusion };
      }
      if (toolResult?.conclusion) {
        finalConclusion = toolResult.conclusion;
      }
    }

    return { shouldBreak: false, conclusion: finalConclusion };
  };

  /**
   * Execute autonomous agent flow with multiple iterations
   */
  const executeAutonomousFlow = async (
    context: AgentFlowContext,
    options: AgentFlowOptions = { autonomousMode: false }
  ): Promise<string | null> => {
    const MAX_REQUESTS = options.maxRequests || 10;
    const agentIsAutonomous = options.autonomousMode;
    let requestsCount = 0;
    let finalConclusion: string | null = null;

    // Create execution record for tracking
    let executionId: number | undefined;

    userLogger.log("[agent-flow.service.ts] executeAutonomousFlow: [createExecution]", {
      executionArguments: {
        conversationId: context.conversationId,
        triggeringMessageId: context.userMessageId,
        agentType: context.agentType,
        status: "running",
        autonomousMode: agentIsAutonomous,
        totalSteps: 0,
      },
    });

    try {
      executionId = await agentExecutionService.createExecution({
        conversationId: context.conversationId,
        triggeringMessageId: context.userMessageId,
        agentType: context.agentType,
        status: "running",
        autonomousMode: agentIsAutonomous,
        totalSteps: 0,
        streamToken: context.sessionToken, // Add stream token for session continuity
      } as any);

      // Add executionId to context for step tracking
      context.executionId = executionId;

      userLogger.info(
        `Created execution record ${executionId} for ${context.agentType}, triggered by message ${context.userMessageId}`
      );
    } catch (error) {
      logger.error("Failed to create execution record:", error);
    }

    // Note: User message is already saved as regular message, no need to duplicate as execution step

    // 🔍 Add autonomous flow start event with timing
    const flowStartTime = performance.now();
    const flowStartMemory = process.memoryUsage();
    if (context.sessionToken) {
      const langfuse = serviceRegistry.get("langfuse");
      langfuse.addEventToSession(context.sessionToken, "autonomous-flow-started", {
        agentType: context.agentType,
        maxRequests: MAX_REQUESTS,
        autonomousMode: agentIsAutonomous,
        conversationId: context.conversationId,
        executionId: executionId,
        startTime: new Date().toISOString(),
        startMemoryMB: Math.round(flowStartMemory.heapUsed / 1024 / 1024),
      });
    }

    do {
      // Check if stream is still active
      if (options.streamState && !options.streamState.isActive) {
        userLogger.info("Client disconnected, stopping stream");
        break;
      }

      // 🔍 Create iteration span with timing
      const langfuse = serviceRegistry.get("langfuse");
      const iterationStartTime = performance.now();
      const iterationStartMemory = process.memoryUsage();
      const iterationSpan = context.sessionToken
        ? langfuse.createSpanForSession(context.sessionToken, `iteration-${requestsCount + 1}`, {
            agentType: context.agentType,
            iterationNumber: requestsCount + 1,
            autonomousMode: agentIsAutonomous,
            startTime: new Date().toISOString(),
            startMemoryMB: Math.round(iterationStartMemory.heapUsed / 1024 / 1024),
          })
        : null;

      await sendUpdate(
        {
          type: "thinking",
          content: `${context.agentType} is thinking...`,
        },
        context
      );

      const freshConversationHistory = await serviceRegistry
        .get("database")
        .getConversationHistory(context.conversationId);
      const refreshedMessages = transformMessagesForAI(freshConversationHistory);

      let attachmentMessage: ChatMessage | null = null;

      if (context.uploadedAttachments?.[0]?.url) {
        attachmentMessage = {
          role: "user",
          content: context.uploadedAttachments.map((attachment) => ({
            type: "image_url",
            image_url: {
              url: attachment.url,
            },
          })),
        };
      }

      if (attachmentMessage) {
        refreshedMessages.push(attachmentMessage);
      }

      userLogger.info("agent-flow refreshed messages: ", refreshedMessages);

      // Execute single iteration with refreshed conversation history
      const result = await executeAgentIteration(refreshedMessages, context);

      // 🔍 End iteration span with performance metrics
      if (iterationSpan) {
        const iterationEndTime = performance.now();
        const iterationEndMemory = process.memoryUsage();
        const iterationDuration = iterationEndTime - iterationStartTime;
        const iterationMemoryDelta = iterationEndMemory.heapUsed - iterationStartMemory.heapUsed;

        iterationSpan.end({
          output: {
            shouldBreak: result.shouldBreak,
            hasConclusion: !!result.conclusion,
            conclusion: result.conclusion?.substring(0, 200), // Truncate for tracing
          },
          metadata: {
            duration_ms: Math.round(iterationDuration),
            endTime: new Date().toISOString(),
            success: true,
            endMemoryMB: Math.round(iterationEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(iterationMemoryDelta / 1024 / 1024),
            iterationNumber: requestsCount + 1,
            conclusionLength: result.conclusion?.length || 0,
          },
        });
      }

      // 🔍 Add iteration event
      if (context.sessionToken) {
        langfuse.addEventToSession(context.sessionToken, "iteration-completed", {
          iterationNumber: requestsCount + 1,
          shouldBreak: result.shouldBreak,
          hasConclusion: !!result.conclusion,
          agentType: context.agentType,
        });
      }

      if (result.conclusion) {
        finalConclusion = result.conclusion;
      }

      if (result.shouldBreak) {
        break;
      }

      requestsCount++;
      userLogger.info(`${context.agentType} completed iteration ${requestsCount}`);
    } while (agentIsAutonomous && requestsCount < MAX_REQUESTS);

    // Handle max requests reached
    if (requestsCount === MAX_REQUESTS) {
      const tooManyRequestsContent = `${context.agentType} reached maximum requests. Task may be too complex.`;

      // 🔍 Add max requests reached event with timing
      if (context.sessionToken) {
        const langfuse = serviceRegistry.get("langfuse");
        const maxRequestsTime = performance.now();
        const maxRequestsMemory = process.memoryUsage();
        const maxRequestsDuration = maxRequestsTime - flowStartTime;

        langfuse.addEventToSession(context.sessionToken, "max-requests-reached", {
          agentType: context.agentType,
          maxRequests: MAX_REQUESTS,
          finalRequestsCount: requestsCount,
          // Performance metrics when hitting limit
          duration_ms: Math.round(maxRequestsDuration),
          currentTime: new Date().toISOString(),
          currentMemoryMB: Math.round(maxRequestsMemory.heapUsed / 1024 / 1024),
          avgIterationDuration_ms: Math.round(maxRequestsDuration / requestsCount),
        });
      }

      await serviceRegistry.get("conversation").addMessage({
        message: { role: "assistant", content: tooManyRequestsContent },
        conversationId: context.conversationId,
      });

      await sendUpdate(
        {
          type: "llm_response",
          content: tooManyRequestsContent,
        },
        context
      );

      finalConclusion = tooManyRequestsContent;
    }

    // 🔍 Add autonomous flow completed event with performance metrics
    if (context.sessionToken) {
      const langfuse = serviceRegistry.get("langfuse");
      const flowEndTime = performance.now();
      const flowEndMemory = process.memoryUsage();
      const flowDuration = flowEndTime - flowStartTime;
      const flowMemoryDelta = flowEndMemory.heapUsed - flowStartMemory.heapUsed;

      langfuse.addEventToSession(context.sessionToken, "autonomous-flow-completed", {
        agentType: context.agentType,
        totalIterations: requestsCount,
        hasConclusion: !!finalConclusion,
        reachedMaxRequests: requestsCount === MAX_REQUESTS,
        executionId: executionId,
        // Performance metrics
        duration_ms: Math.round(flowDuration),
        endTime: new Date().toISOString(),
        endMemoryMB: Math.round(flowEndMemory.heapUsed / 1024 / 1024),
        memoryDeltaMB: Math.round(flowMemoryDelta / 1024 / 1024),
        avgIterationDuration_ms: requestsCount > 0 ? Math.round(flowDuration / requestsCount) : 0,
        conclusionLength: finalConclusion?.length || 0,
      });
    }

    // Send finished step and update execution status
    await sendUpdate(
      {
        type: "finished",
        content: "Conversation ended",
        metadata: {
          conclusion: finalConclusion,
          agentType: context.agentType,
          agentStatus: serviceRegistry.get("agent").getStatus(),
        },
      },
      context
    );

    // Update execution status to completed
    if (executionId) {
      try {
        await agentExecutionService.updateExecution(executionId, {
          status: "completed",
          totalSteps: requestsCount,
        });
        userLogger.info(`Completed execution ${executionId}`);
      } catch (error) {
        logger.error("Failed to update execution status:", error);
      }
    }

    return finalConclusion;
  };

  /**
   * Execute tool for agent (extracted from main API)
   */
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

    // Log tool execution start
    if (context) {
      await sendUpdate(
        {
          type: "tool_execution",
          content: `🔍 Looking for tool: ${toolName}`,
          metadata: {
            phase: "tool_discovery",
            toolName,
            agentType,
          },
        },
        context
      );
    }

    // Special handling for list_available_tools
    if (toolName === "list_available_tools") {
      return await generateDynamicToolList(agentType, agent);
    }

    // Check MCP tools first
    if (context) {
      await sendUpdate(
        {
          type: "tool_execution",
          content: `🔄 Checking legacy tool registries for: ${toolName}`,
          metadata: {
            phase: "legacy_check",
            toolName,
          },
        },
        context
      );
    }

    const figmaContextMcpService = await mcpServersFactory.createFigmaMCPServiceClient();

    // Check if it's a Figma MCP tool
    if (figmaContextMcpService?.isTool(toolName)) {
      if (["general", "figma-analyzer", "IRFLayoutArchitecture", "figma-to-storyblok"].includes(agentType)) {
        if (context) {
          await sendUpdate(
            {
              type: "tool_execution",
              content: `📐 Found Figma MCP tool: ${toolName}`,
              metadata: {
                phase: "tool_found",
                toolName,
                toolSource: "mcp_figma",
                isLegacy: true,
              },
            },
            context
          );
        }

        const result = await figmaContextMcpService.handleToolCall(toolCall.function);

        const executionTime = Date.now() - startTime;
        if (context) {
          await sendUpdate(
            {
              type: "tool_response",
              content: `✅ Figma MCP tool executed in ${executionTime}ms`,
              metadata: {
                phase: "tool_completed",
                toolName,
                toolSource: "mcp_figma",
                executionTime,
              },
            },
            context
          );
        }

        return typeof result === "string" ? result : JSON.stringify(result);
      } else {
        if (context) {
          await sendUpdate(
            {
              type: "tool_response",
              content: `❌ Tool '${toolName}' not available to ${agentType} agent`,
              metadata: {
                phase: "tool_denied",
                toolName,
                agentType,
                reason: "permission",
              },
            },
            context
          );
        }
        return `Tool '${toolName}' not available to ${agentType} agent.`;
      }
    }

    // Delegation tools are now pre-registered in the tool registry

    // Check if it's a local tool (including dynamically registered ones)
    if (serviceRegistry.get("toolRunner").isLocalTool(toolName)) {
      if (context) {
        await sendUpdate(
          {
            type: "tool_execution",
            content: `🛠️ Found local tool: ${toolName}`,
            metadata: {
              phase: "tool_found",
              toolName,
              toolSource: "local_legacy",
              isLegacy: true,
            },
          },
          context
        );
      }

      const result = await serviceRegistry.get("toolRunner").runTool(toolCall, userMessage);

      const executionTime = Date.now() - startTime;
      if (context) {
        await sendUpdate(
          {
            type: "tool_response",
            content: `✅ Local tool executed in ${executionTime}ms`,
            metadata: {
              phase: "tool_completed",
              toolName,
              toolSource: "local_legacy",
              executionTime,
            },
          },
          context
        );
      }

      return result;
    }

    // Tool not found
    if (context) {
      await sendUpdate(
        {
          type: "tool_response",
          content: `❌ Tool '${toolName}' not found`,
          metadata: {
            phase: "tool_not_found",
            toolName,
            agentType,
            checkedSources: ["unified", "mcp_figma", "local_legacy"],
          },
        },
        context
      );
    }

    return `Tool '${toolName}' not found or not available to ${agentType} agent.`;
  };

  /**
   * Generate dynamic tool list (extracted from main API)
   */
  const generateDynamicToolList = async (agentType: string, agent: Agent): Promise<string> => {
    // Log tool discovery
    await sendUpdate(
      {
        type: "tool_response",
        content: `📊 Loading tool registry...`,
        metadata: {
          phase: "tool_list_generation",
        },
      },
      undefined // No context for tool list generation
    );

    // Get tools from agent
    const agentTools = agent.availableTools;

    // Filter out the list_available_tools tool itself to avoid recursion
    const toolsToShow = agentTools.filter(
      (tool: any) => tool.name !== "list_available_tools" && tool.function?.name !== "list_available_tools"
    );

    // Get all tools
    const allTools = toolsToShow.map((tool: any) => ({
      name: tool.name || tool.function?.name || "Unknown Tool",
      description: tool.description || tool.function?.description || "No description available",
      source: "local",
    }));

    const agentDescriptions: Record<string, string> = {
      general: "🤖 General Assistant - I have access to all available tools for complex, multi-step tasks",
      "test-openrouter":
        "🧪 OpenRouter Test - I use experimental OpenRouter models for testing and advanced capabilities",
      rephraser: "🔄 Rephraser - I focus on improving text clarity and readability",
      "figma-analyzer": "🎨 Figma Analyzer - I analyze and work with Figma designs and components",
      storyblok: "📝 Storyblok Assistant - I help with CMS operations and content management",
      IRFLayoutArchitecture: "🏗️ Layout Architect - I create and manage design system layouts",
      "figma-to-storyblok": "🔄 Figma to Storyblok - I transform Figma designs into Storyblok components",
    };

    const agentDescription = agentDescriptions[agentType] || `${agentType} Agent`;

    let response = `# My Capabilities\n\n`;
    response += `${agentDescription}\n\n`;
    response += `## Available Tools (${allTools.length})\n\n`;

    response += `**Total tools available**: ${allTools.length}\n\n`;

    if (allTools.length === 0) {
      response +=
        "I currently don't have any specialized tools available, but I can still help with general conversation and analysis.\n";
      return response;
    }

    // Group tools by category for better organization
    const toolCategories: Record<string, any[]> = {
      "Planning & Memory": [],
      "Content Creation": [],
      "Design & Layout": [],
      "External Services": [],
      "Agent Tools": [],
      Other: [],
    };

    allTools.forEach((tool: any) => {
      const toolName = tool.name;
      const description = tool.description;
      const sourceLabel = `[${tool.source}]`;

      // Categorize tools
      if (tool.source === "agent") {
        toolCategories["Agent Tools"]?.push({
          name: toolName,
          description,
          sourceLabel,
        });
      } else if (toolName.includes("plan") || toolName.includes("memory")) {
        toolCategories["Planning & Memory"]?.push({
          name: toolName,
          description,
          sourceLabel,
        });
      } else if (toolName.includes("create") || toolName.includes("compose") || toolName.includes("layout")) {
        toolCategories["Content Creation"]?.push({
          name: toolName,
          description,
          sourceLabel,
        });
      } else if (toolName.includes("figma") || toolName.includes("design")) {
        toolCategories["Design & Layout"]?.push({
          name: toolName,
          description,
          sourceLabel,
        });
      } else if (toolName.includes("url") || toolName.includes("api") || toolName.includes("external")) {
        toolCategories["External Services"]?.push({
          name: toolName,
          description,
          sourceLabel,
        });
      } else {
        toolCategories["Other"]?.push({
          name: toolName,
          description,
          sourceLabel,
        });
      }
    });

    // Display tools by category
    Object.entries(toolCategories).forEach(([category, tools]) => {
      if (tools.length > 0) {
        response += `### ${category}\n`;
        tools.forEach((tool: any) => {
          response += `- **${tool.name}** ${tool.sourceLabel}: ${tool.description}\n`;
        });
        response += `\n`;
      }
    });

    response += `\n💡 **How to use**: Just ask me to do something, and I'll automatically choose the right tools to help you!\n`;
    response += `\n🔧 **Tool System**: ${allTools.length} tools available for ${agentType} agent.\n`;

    return response;
  };

  // Return public interface
  return {
    handleLLMResponse,
    handleToolCalls,
    executeAgentIteration,
    executeAutonomousFlow,
    executeToolForAgent,
    generateDynamicToolList,
    // Global send function management
    setSendFunction,
    clearSendFunction,
    sendUpdate,
  };
};

// Export singleton instance
export const agentFlowService = createAgentFlowService();
