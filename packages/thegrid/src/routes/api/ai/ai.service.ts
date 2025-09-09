import { agentFactory } from "../../../agent/factories/agents.factory";
import { serviceRegistry } from "../../../registry/service-registry";
import { logger } from "../../../utils/logger";
import type { UploadedAttachment } from "../../../schemas/agent-flow.schemas";
import type { InitRequest } from "./validation/ai.schemas";

const createAIService = () => {
  // Private variables
  const activeStreams = new Map<string, boolean>();

  // Private helper functions
  const generateStreamToken = () => {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createOrGetConversation = async (message: string, conversationId?: number) => {
    if (conversationId) {
      // Verify conversation exists
      const conversations = await serviceRegistry.get("database").getConversations();
      const exists = conversations.some((c) => c.id === conversationId);
      if (exists) return conversationId;
    }

    // Create new conversation
    const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
    const conversation = await serviceRegistry.get("database").createConversation({
      title,
      systemMessage: "You are a helpful AI assistant.",
    });

    if (!conversation) {
      throw new Error("Failed to create conversation");
    }

    return conversation.id;
  };

  const uploadAttachments = async (
    attachments: any[],
    send: (data: any) => Promise<void>,
    saveStep?: (type: string, content: string, metadata?: any) => Promise<void>
  ): Promise<UploadedAttachment[]> => {
    const uploaded: UploadedAttachment[] = [];

    if (!attachments || attachments.length === 0) {
      return uploaded;
    }

    const uploadMsg = {
      type: "thinking",
      content: "Uploading attachments...",
    };
    await send(uploadMsg);
    if (saveStep) await saveStep(uploadMsg.type, uploadMsg.content);

    for (const attachment of attachments) {
      try {
        if (attachment.dataUrl) {
          const url = await serviceRegistry.get("aws").uploadBase64ImageToS3(attachment.dataUrl, attachment.name);

          uploaded.push({
            name: attachment.name,
            url,
            type: attachment.type,
          });

          const successMsg = {
            type: "attachment_upload",
            content: `Successfully uploaded ${attachment.name}`,
            metadata: { name: attachment.name, url },
          };
          await send(successMsg);
          if (saveStep) await saveStep(successMsg.type, successMsg.content, successMsg.metadata);
        }
      } catch (error) {
        logger.error("Failed to upload attachment", error);
        const errorMsg = {
          type: "error",
          content: `Failed to upload ${attachment.name}`,
        };
        await send(errorMsg);
        if (saveStep) await saveStep(errorMsg.type, errorMsg.content);
      }
    }

    return uploaded;
  };

  // Public methods
  const initializeConversation = async ({
    message,
    conversationId,
    attachments = [],
    agentType = "general",
    modelId = "claude-3-sonnet",
  }: InitRequest) => {
    try {
      // Get or create conversation
      const convId = await createOrGetConversation(message, conversationId);

      // Save user message to database
      const savedMessage = await serviceRegistry.get("database").addMessage({
        conversationId: convId,
        role: "user",
        content: message,
      });

      const userMessageId = savedMessage?.id;

      // Create session data
      const token = generateStreamToken();
      const sessionData = {
        conversationId: convId,
        message: { role: "user" as const, content: message },
        attachments: attachments || [],
        agentType,
        modelId,
        userMessageId,
        autonomousMode: true, // Add required property
      };

      // Store session
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await serviceRegistry.get("session").createSession(token, sessionData, expiresAt);

      // Skip creating agent execution record since we're not using agentFlow
      // This was causing the null conversation_id error

      return { streamToken: token, conversationId: convId };
    } catch (error) {
      logger.error("Failed to initialize conversation:", error);
      throw error;
    }
  };

  const handleStream = async (token: string, stream: any) => {
    const session = await serviceRegistry.get("session").getSession(token);
    if (!session) {
      throw new Error("Invalid or expired stream token");
    }

    // Extend session for continued use
    await serviceRegistry.get("session").extendSession(token);

    const send = serviceRegistry.get("stream").createSender(stream);
    activeStreams.set(token, true);

    // Register stream
    serviceRegistry.get("stream").addStream(token);

    // Track execution steps
    let executionId: number | null = null;
    let stepCounter = 0;
    const progressSteps: Array<{ type: string; content: string; metadata?: any }> = [];

    // Helper to save progress step to database
    const saveProgressStep = async (type: string, content: string, metadata?: any) => {
      if (executionId) {
        await serviceRegistry.get("agentExecution").addStep({
          executionId,
          stepType: type,
          content,
          metadata,
          stepOrder: stepCounter++,
        });
      }
      progressSteps.push({ type, content, metadata });
    };

    try {
      // Create agent execution record
      executionId = await serviceRegistry.get("agentExecution").createExecution({
        conversationId: session.conversationId,
        triggeringMessageId: session.userMessageId,
        agentType: session.agentType || "assistant",
        status: "running",
        autonomousMode: false,
        totalSteps: 0,
        streamToken: token,
      });

      // Send user message acknowledgment
      const userMessageData = {
        type: "user_message" as const,
        content: session.message.content as string,
        metadata: { conversationId: session.conversationId },
      };
      await send(userMessageData);
      await saveProgressStep(userMessageData.type, userMessageData.content, userMessageData.metadata);

      console.log("[ai.service.ts] user message acknowledgment sent");
      console.log(session.message.content);

      // Upload attachments if any
      const uploadedAttachments = await uploadAttachments(session.attachments as any[], send, saveProgressStep);

      if (uploadedAttachments.length > 0) {
        // Save attachments to conversation
        await serviceRegistry.get("conversation").addAttachments({
          conversationId: session.conversationId,
          attachments: uploadedAttachments,
        });
      }

      // Get conversation history
      const history = await serviceRegistry.get("database").getConversationHistory(session.conversationId);

      console.log("[ai.service.ts] conversation history fetched");
      console.log(history);

      // Skip getting execution record since we're not using agentFlow

      // Create agent (general by default, but can be specified)
      const agent = await agentFactory.createAgent(session.agentType as any);

      agent.setSendUpdate?.(send);

      if (!agent) {
        logger.error("Failed to create agent of type:", session.agentType);
        throw new Error(`Failed to create agent of type: ${session.agentType}`);
      }

      // Prepare messages for agent (transform to AI format)
      const messagesForAI = history.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content as any,
      }));

      // Create trace for monitoring
      const langfuse = serviceRegistry.get("langfuse");
      const traceResult = langfuse.createExecutionTrace(
        token,
        session.agentType,
        messagesForAI,
        session.conversationId,
        {
          userMessage: session.message.content,
          attachmentCount: uploadedAttachments.length,
        }
      );

      if (traceResult.traceName) {
        logger.info(`🔍 Started trace: ${traceResult.traceName}`, {
          sessionToken: token,
          agentType: session.agentType,
        });
      }

      // Send initial thinking message
      const thinkingData = {
        type: "thinking" as const,
        content: "Processing your request...",
      };
      await send(thinkingData);
      await saveProgressStep(thinkingData.type, thinkingData.content);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Execute agent directly
      let assistantResponse = "";
      try {
        // Call agent.act() directly with messages
        const result = await agent.act({
          messages: messagesForAI as any,
        } as any);

        // Extract the response content
        if (typeof result === "string") {
          assistantResponse = result;
        } else if (result && typeof result === "object") {
          // Grid-core AgentResponse has 'content'
          assistantResponse = (result as any).content || JSON.stringify(result);
        }

        // Stream the response
        const llmResponseData = {
          type: "llm_response" as const,
          content: assistantResponse,
        };
        await send(llmResponseData);
        await saveProgressStep(llmResponseData.type, llmResponseData.content);
      } catch (agentError) {
        logger.error("Agent execution error:", agentError);
        assistantResponse = "I encountered an error while processing your request. Please try again.";
        const errorResponseData = {
          type: "llm_response" as const,
          content: assistantResponse,
        };
        await send(errorResponseData);
        await saveProgressStep(errorResponseData.type, errorResponseData.content);
      }

      // Save assistant response
      let assistantMessageId: number | undefined;
      if (assistantResponse) {
        const savedMessage = await serviceRegistry.get("database").addMessage({
          conversationId: session.conversationId,
          role: "assistant",
          content: assistantResponse,
        });
        assistantMessageId = savedMessage?.id;

        // Update execution with the assistant message ID
        if (executionId && assistantMessageId) {
          await serviceRegistry.get("agentExecution").updateExecution(executionId, {
            messageId: assistantMessageId,
            status: "completed",
            totalSteps: stepCounter,
          });
        }
      }

      // Send completion
      const finishedData = {
        type: "finished" as const,
        content: "Completed",
        metadata: {
          conversationId: session.conversationId,
        },
      };
      await send(finishedData);
      await saveProgressStep(finishedData.type, finishedData.content, finishedData.metadata);

      // End trace
      // Non-streaming path: nothing to end here
    } catch (error) {
      logger.error("Stream error:", error);
      const errorData = {
        type: "error" as const,
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
      await send(errorData);
      await saveProgressStep(errorData.type, errorData.content);

      // Update execution status to failed
      if (executionId) {
        await serviceRegistry.get("agentExecution").updateExecution(executionId, {
          status: "failed",
          totalSteps: stepCounter,
        });
      }
      throw error;
    } finally {
      // Cleanup
      activeStreams.delete(token);
      serviceRegistry.get("stream").stopStream(token);
      // Remove agentFlow cleanup since we're not using it
      try {
        serviceRegistry.get("agent").setStatus("waiting-for-prompt");
      } catch (err) {
        // Ignore if agent service doesn't have setStatus
      }
    }
  };

  const stopStream = (token: string) => {
    if (activeStreams.has(token)) {
      activeStreams.delete(token);
      serviceRegistry.get("stream").stopStream(token);
      serviceRegistry.get("agent").setStatus("waiting-for-prompt");
      return true;
    }
    return false;
  };

  const getConversations = async () => {
    try {
      const conversations = await serviceRegistry.get("database").getConversations();
      return conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        systemMessage: conv.systemMessage,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      }));
    } catch (error) {
      logger.error("Failed to get conversations:", error);
      throw error;
    }
  };

  const getTimeline = async (conversationId: number) => {
    try {
      const data = await serviceRegistry.get("database").getConversationWithExecutions(conversationId);

      if (!data) {
        throw new Error("Conversation not found");
      }

      // Transform dates to ISO strings for JSON serialization
      const timeline = {
        messages: data.messages.map((msg) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          role: msg.role,
          content: msg.content,
          tool_call_id: (msg as any).tool_call_id ?? null,
          createdAt: msg.createdAt.toISOString(),
        })),
        executions: data.executions.map((exec) => ({
          ...exec,
          createdAt: exec.createdAt.toISOString(),
          updatedAt: exec.updatedAt.toISOString(),
          steps: exec.steps.map((step: any) => ({
            ...step,
            createdAt: step.createdAt.toISOString(),
          })),
        })),
        timeline: data.timeline.map((item) => {
          const ts = item.timestamp instanceof Date ? item.timestamp.toISOString() : String(item.timestamp);
          if (item.type === "message") {
            const m = item.data as any;
            return {
              type: "message" as const,
              data: {
                id: m.id,
                conversationId: m.conversationId,
                role: m.role,
                content: m.content,
                tool_call_id: m.tool_call_id ?? null,
                createdAt: (m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt)) as string,
              },
              timestamp: ts,
            };
          } else {
            const s = item.data as any;
            return {
              type: "execution_step" as const,
              data: {
                id: s.id,
                executionId: s.executionId,
                stepType: s.stepType,
                content: s.content,
                metadata: s.metadata ?? null,
                stepOrder: s.stepOrder,
                createdAt: (s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt)) as string,
                execution: s.execution,
              },
              timestamp: ts,
            };
          }
        }),
      };

      return timeline;
    } catch (error) {
      logger.error("Failed to get timeline:", error);
      throw error;
    }
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      const success = await serviceRegistry.get("database").deleteConversation(conversationId);
      if (!success) {
        throw new Error("Failed to delete conversation");
      }
      return true;
    } catch (error) {
      logger.error("Failed to delete conversation:", error);
      throw error;
    }
  };

  // Return public interface
  return {
    initializeConversation,
    handleStream,
    stopStream,
    getConversations,
    getTimeline,
    deleteConversation,
  };
};

// Create singleton instance
export const aiService = createAIService();
export type AIService = ReturnType<typeof createAIService>;
