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

  const createOrGetConversation = async (
    message: string,
    conversationId?: number
  ) => {
    if (conversationId) {
      // Verify conversation exists
      const conversations = await serviceRegistry
        .get("database")
        .getConversations();
      const exists = conversations.some((c) => c.id === conversationId);
      if (exists) return conversationId;
    }

    // Create new conversation
    const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
    const conversation = await serviceRegistry
      .get("database")
      .createConversation({
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
    send: (data: any) => Promise<void>
  ): Promise<UploadedAttachment[]> => {
    const uploaded: UploadedAttachment[] = [];

    if (!attachments || attachments.length === 0) {
      return uploaded;
    }

    await send({
      type: "thinking",
      content: "Uploading attachments...",
    });

    for (const attachment of attachments) {
      try {
        if (attachment.dataUrl) {
          const url = await serviceRegistry
            .get("aws")
            .uploadBase64ImageToS3(attachment.dataUrl, attachment.name);

          uploaded.push({
            name: attachment.name,
            url,
            type: attachment.type,
          });

          await send({
            type: "attachment_upload",
            content: `Successfully uploaded ${attachment.name}`,
            metadata: { name: attachment.name, url },
          });
        }
      } catch (error) {
        logger.error("Failed to upload attachment", error);
        await send({
          type: "error",
          content: `Failed to upload ${attachment.name}`,
        });
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
      await serviceRegistry
        .get("session")
        .createSession(token, sessionData, expiresAt);

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

    try {
      // Send user message acknowledgment
      await send({
        type: "user_message",
        content: session.message.content,
        metadata: { conversationId: session.conversationId },
      });

      // Upload attachments if any
      const uploadedAttachments = await uploadAttachments(
        session.attachments,
        send
      );

      if (uploadedAttachments.length > 0) {
        // Save attachments to conversation
        await serviceRegistry.get("conversation").addAttachments({
          conversationId: session.conversationId,
          attachments: uploadedAttachments,
        });
      }

      // Get conversation history
      const history = await serviceRegistry
        .get("database")
        .getConversationHistory(session.conversationId);

      // Skip getting execution record since we're not using agentFlow

      // Create agent (general by default, but can be specified)
      const agent = await agentFactory.createAgent(session.agentType as any);
      
      if (!agent) {
        logger.error("Failed to create agent of type:", session.agentType);
        throw new Error(`Failed to create agent of type: ${session.agentType}`);
      }

      // Prepare messages for agent (transform to AI format)
      const messagesForAI = history.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
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
      await send({
        type: "thinking",
        content: "Processing your request...",
      });

      // Execute agent directly
      let assistantResponse = "";
      try {
        // Call agent.act() directly with messages
        const result = await agent.act({
          messages: messagesForAI,
          modelId: session.modelId || "claude-3-sonnet",
        });

        // Extract the response content
        if (typeof result === "string") {
          assistantResponse = result;
        } else if (result && typeof result === "object") {
          assistantResponse = result.content || result.message || JSON.stringify(result);
        }

        // Stream the response
        await send({
          type: "llm_response",
          content: assistantResponse,
        });
      } catch (agentError) {
        logger.error("Agent execution error:", agentError);
        assistantResponse = "I encountered an error while processing your request. Please try again.";
        await send({
          type: "llm_response",
          content: assistantResponse,
        });
      }

      // Save assistant response
      if (assistantResponse) {
        const savedMessage = await serviceRegistry.get("database").addMessage({
          conversationId: session.conversationId,
          role: "assistant",
          content: assistantResponse,
        });

        // No execution to update since we're not using agentFlow
      }

      // Send completion
      await send({
        type: "finished",
        content: "Completed",
        metadata: {
          conversationId: session.conversationId,
        },
      });

      // End trace
      if (traceResult.generation) {
        langfuse.endStreamingTrace(
          traceResult.generation,
          assistantResponse || ""
        );
      }
    } catch (error) {
      logger.error("Stream error:", error);
      await send({
        type: "error",
        content: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
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
      const conversations = await serviceRegistry
        .get("database")
        .getConversations();
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
      const data = await serviceRegistry
        .get("database")
        .getConversationWithExecutions(conversationId);

      if (!data) {
        throw new Error("Conversation not found");
      }

      // Transform dates to ISO strings for JSON serialization
      const timeline = {
        messages: data.messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toISOString(),
        })),
        executions: data.executions.map((exec) => ({
          ...exec,
          createdAt: exec.createdAt.toISOString(),
          updatedAt: exec.updatedAt.toISOString(),
          steps: exec.steps.map((step) => ({
            ...step,
            createdAt: step.createdAt.toISOString(),
          })),
        })),
        timeline: data.timeline.map((item) => ({
          ...item,
          timestamp: item.timestamp,
          data: {
            ...item.data,
            createdAt: item.data.createdAt?.toISOString
              ? item.data.createdAt.toISOString()
              : item.data.createdAt,
          },
        })),
      };

      return timeline;
    } catch (error) {
      logger.error("Failed to get timeline:", error);
      throw error;
    }
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      const success = await serviceRegistry
        .get("database")
        .deleteConversation(conversationId);
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