import { logger, userLogger } from "@/utils/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { agentFactory } from "../../../agent/factories/agents.factory";
import { SessionData } from "../../../db/schema/sessions";
import { serviceRegistry } from "../../../registry/service-registry";
import type { UploadedAttachment } from "../../../schemas/agent-flow.schemas";
import { databaseService } from "../../../services/atoms/DatabaseService/database.service";
import { sessionService } from "../../../services/atoms/SessionService/session.service";
import { transformMessagesForAI } from "../shared";
import { getAvailableAgentsRoute, initAgentRoute, stopStreamRoute } from "./agent.routes";
import { createConversationContext } from "@mrck-labs/grid-core";
import { RequestContext } from "./requestContext";

// Create OpenAPIHono router for documented endpoints
export const agentRouter = new OpenAPIHono();

// Create regular Hono router for streaming endpoints
const streamRouter = new Hono();

// GET /available-agents
agentRouter.openapi(getAvailableAgentsRoute, async (c) => {
  try {
    // Check if debug mode is enabled
    const settingsService = serviceRegistry.get("settings");
    const debugModeSetting = await settingsService.getSetting("interface", "debugMode");
    const isDebugMode = debugModeSetting?.value === true;

    logger.info(`Agent: Getting available agents. Debug mode: ${isDebugMode}`);

    // Get agent metadata from factory
    let agents = agentFactory.getAllAgentMetadata();

    // Filter out test agents if not in debug mode
    if (!isDebugMode) {
      agents = agents.filter((agent) => !agent.type.includes("test"));
    }

    // Convert to expected format with all required properties
    const formattedAgents = agents.map((agent) => ({
      type: agent.type,
      name: agent.name,
      description: agent.description,
      id: agent.id,
      capabilities: agent.capabilities,
      icon: agent.icon,
      version: agent.version,
      author: agent.author,
    }));

    return c.json(
      {
        success: true,
        data: formattedAgents,
      } as const,
      200
    );
  } catch (error) {
    logger.error("Failed to get available agents", error);
    return c.json(
      {
        success: false,
        error: {
          message: "Failed to retrieve available agents",
          code: "AGENTS_FETCH_ERROR",
        },
      } as const,
      500
    );
  }
});

// POST /init
agentRouter.openapi(initAgentRoute, async (c) => {
  try {
    const requestData = c.req.valid("json");
    const { messages, conversationId, agentType, autonomousMode, modelId, attachments, contextData } = requestData;

    // If no conversation ID provided, create a new conversation
    let currentConversationId = conversationId ? Number(conversationId) : undefined;
    let userMessageId: number | undefined;

    if (!currentConversationId) {
      // Create a new conversation with the first user message as title
      const userMessage = messages.find((msg) => msg.role === "user");
      const title = userMessage?.content.slice(0, 50) + "...";

      const conversation = await databaseService.createConversation({
        title,
        systemMessage: "You are a helpful AI assistant.",
      });

      if (!conversation) {
        throw new Error("Failed to create conversation");
      }

      currentConversationId = conversation.id;

      // Add the initial message to the conversation
      if (userMessage) {
        const savedUserMessage = await databaseService.addMessage({
          conversationId: currentConversationId,
          role: userMessage.role,
          content: userMessage.content,
        });
        userMessageId = savedUserMessage?.id;
      }
    } else {
      // For existing conversations, save the new user message to database
      const firstMessage = messages.find((msg) => msg.role === "user");
      if (firstMessage) {
        const savedUserMessage = await databaseService.addMessage({
          conversationId: currentConversationId,
          role: firstMessage.role,
          content: firstMessage.content,
        });
        userMessageId = savedUserMessage?.id;
      }
    }

    // Create a session for streaming
    const firstMessage = messages.find((msg) => msg.role === "user");
    if (!firstMessage) {
      throw new Error("No user message provided");
    }

    const sessionData: SessionData = {
      message: {
        content: firstMessage.content,
        role: firstMessage.role,
      },
      conversationId: currentConversationId,
      userMessageId: userMessageId || 0, // Add user message ID for linking executions
      autonomousMode, // Include autonomous mode
      agentType, // Include agent type
      attachments: attachments || [], // Include attachments
      modelId,
      // Include contextData if provided
      ...(contextData && {
        contextData,
      }),
    };

    // For existing conversations, try to reuse existing session token to maintain Langfuse session continuity
    let token: string;
    let expiresAt: Date;

    if (conversationId) {
      // Check if there's a recent agent execution with a stream token
      const recentExecution = await databaseService.getRecentAgentExecution(currentConversationId);

      if (recentExecution?.streamToken) {
        // Try to reuse the existing session token if it's still valid
        const existingSession = await sessionService.getSession(recentExecution.streamToken);

        if (existingSession) {
          // Reuse existing token and extend its expiration
          token = recentExecution.streamToken;
          expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes from now

          // Update the session data for the new message
          await sessionService.deleteSession(token); // Remove old session
          await sessionService.createSession(token, sessionData, expiresAt); // Create with new data

          logger.info(`🔄 Reusing session token for conversation continuity: ${token}`, {
            conversationId: currentConversationId,
            agentType,
          });
        } else {
          // Token expired or invalid, create new one
          token = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          expiresAt = new Date(Date.now() + 1000 * 60 * 10);
          await sessionService.createSession(token, sessionData, expiresAt);

          logger.info(`🆕 Created new session token (old token expired): ${token}`, {
            conversationId: currentConversationId,
            agentType,
          });
        }
      } else {
        // No recent execution or no stream token, create new one
        token = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        expiresAt = new Date(Date.now() + 1000 * 60 * 10);
        await sessionService.createSession(token, sessionData, expiresAt);

        logger.info(`🆕 Created new session token (no recent execution): ${token}`, {
          conversationId: currentConversationId,
          agentType,
        });
      }
    } else {
      // New conversation, always create new token
      token = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      expiresAt = new Date(Date.now() + 1000 * 60 * 10);
      await sessionService.createSession(token, sessionData, expiresAt);

      logger.info(`🆕 Created new session token (new conversation): ${token}`, {
        conversationId: currentConversationId,
        agentType,
      });
    }

    return c.json(
      {
        streamToken: token,
        conversationId: currentConversationId,
      } as const,
      200
    );
  } catch (error) {
    logger.error("Agent init error:", error);
    return c.json(
      {
        success: false,
        error: {
          message: (error as Error).message || "Failed to initialize agent",
          code: "AGENT_INIT_ERROR",
        },
      } as const,
      500
    );
  }
});

// POST /stop-stream
agentRouter.openapi(stopStreamRoute, async (c) => {
  logger.info("Agent: stop-stream endpoint hit");
  const streamToken = c.req.query("streamToken");
  if (!streamToken) {
    return c.json({ error: "No stream token provided" } as const, 400);
  }

  const stopped = serviceRegistry.get("stream").stopStream(streamToken);
  if (stopped) {
    return c.json({ success: true } as const, 200);
  }

  return c.json({ error: "Stream not found" } as const, 404);
});

// GET /stream - Main agent SSE streaming endpoint (no bearer auth required - session token validates instead)
streamRouter.get("/stream", async (c) => {
  const token = c.req.query("streamToken");

  if (!token) {
    return c.json({ error: "No stream token provided" } as const, 400);
  }

  // Get session from database - this validates the token
  const sessionData = await serviceRegistry.get("session").getSession(token);

  if (!sessionData) {
    return c.json({ error: "Invalid or expired token" } as const, 401);
  }

  // Extend session expiration by 5 minutes since it's being actively used
  await serviceRegistry.get("session").extendSession(token);

  // Register stream in service
  const streamState = serviceRegistry.get("stream").addStream(token);

  const conversationContext = createConversationContext({ sessionId: token, initialState: sessionData });

  return streamSSE(c, async (stream) => {
    const logger = console;
    const originalSend = serviceRegistry.get("stream").createSender(stream);

    // Track execution steps
    let executionId: number | null = null;
    let stepCounter = 0;

    // Helper to save progress step to database
    const saveProgressStep = async (type: string, content: string, metadata?: any) => {
      if (executionId) {
        try {
          await serviceRegistry.get("agentExecution").addStep({
            executionId,
            stepType: type,
            content,
            metadata,
            stepOrder: stepCounter++,
          });
        } catch (error) {
          logger.error("Failed to save execution step:", error);
        }
      }
    };

    // Wrap send function to also save to database
    const send = async (data: any) => {
      await originalSend(data);
      if (data.type && data.content) {
        await saveProgressStep(data.type, data.content, data.metadata);
      }
    };

    stream.onAbort(() => {
      serviceRegistry.get("stream").stopStream(token);
      serviceRegistry.get("agent").setStatus("waiting-for-prompt");
    });

    try {
      serviceRegistry.get("agent").setStatus("working");

      // Save user message (only if not already saved during init)
      const conversationHistory = await serviceRegistry
        .get("database")
        .getConversationHistory(sessionData.conversationId);

      userLogger.log("[agent.ts] /stream inside streamSSE: [conversationHistory]", {
        conversationHistory,
      });

      // Check if the user message is already the last message
      const lastMessage = conversationHistory[conversationHistory.length - 1];

      userLogger.log("[agent.ts] /stream inside streamSSE: [lastMessage]", {
        lastMessage: lastMessage,
      });

      // If the user message is the last message and is saved to the database already
      const isMessageAlreadySaved =
        lastMessage && lastMessage.role === "user" && lastMessage.content === sessionData.message.content;

      userLogger.log("[agent.ts] /stream inside streamSSE: [isMessageAlreadySaved]", {
        isMessageAlreadySaved: isMessageAlreadySaved,
      });

      let userMessageId = sessionData.userMessageId;
      if (!isMessageAlreadySaved) {
        const conversationService = serviceRegistry.get("conversation");
        const savedMessage = await conversationService.addMessage({
          message: {
            role: "user",
            content: sessionData.message.content,
          },
          conversationId: sessionData.conversationId,
        });
        userMessageId = savedMessage?.id;
      }

      // Create agent execution record
      executionId = await serviceRegistry.get("agentExecution").createExecution({
        conversationId: sessionData.conversationId,
        triggeringMessageId: userMessageId,
        agentType: sessionData.agentType || "general",
        status: "running",
        autonomousMode: sessionData.autonomousMode || false,
        totalSteps: 0,
        streamToken: token,
      });

      userLogger.log("[agent.ts] /stream first send() event to frotnend: [user_message]", {
        type: "user_message",
        content: `User message: ${sessionData.message.content}`,
        metadata: { agentStatus: serviceRegistry.get("agent").getStatus() },
      });

      // AGENT MODE: Original autonomous agent logic
      await send({
        type: "user_message",
        content: `User message: ${sessionData.message.content}`,
        metadata: { agentStatus: serviceRegistry.get("agent").getStatus() },
      });

      // Prepare messages for agents
      const messagesForAI = transformMessagesForAI(conversationHistory);

      userLogger.log("[agent.ts] /stream inside streamSSE: [conversationHistory vs messagesForAI]", {
        conversationHistory,
        messagesForAI,
      });

      // --- Attachment Uploading ---
      const uploadedAttachments: UploadedAttachment[] = [];

      if (sessionData.attachments && sessionData.attachments.length > 0) {
        await send({
          type: "agent_thought",
          content: "Uploading attachments...",
        });
        for (const attachment of sessionData.attachments) {
          if (attachment.dataUrl) {
            try {
              const url = await serviceRegistry.get("aws").uploadBase64ImageToS3(
                attachment.dataUrl,
                attachment.name
                // TODO: Pass userId for uploadedBy field
              );
              uploadedAttachments.push({
                name: attachment.name,
                url,
                type: attachment.type,
              });
              await send({
                type: "agent_thought",
                content: `Successfully uploaded ${attachment.name}.`,
              });
            } catch (error) {
              logger.error("Failed to upload attachment", error);
              await send({
                type: "error",
                content: `Failed to upload attachment ${attachment.name}.`,
              });
            }
          }
        }

        // Save attachments to the conversation in the database
        if (uploadedAttachments.length > 0) {
          try {
            const conversationService = serviceRegistry.get("conversation");
            await conversationService.addAttachments({
              conversationId: sessionData.conversationId,
              attachments: uploadedAttachments.map((att) => ({
                name: att.name,
                type: att.type,
                url: att.url,
              })),
            });

            userLogger.log("[agent.ts] /stream: Saved attachments to conversation", {
              conversationId: sessionData.conversationId,
              attachmentCount: uploadedAttachments.length,
            });
          } catch (error) {
            logger.error("Failed to save attachments to conversation", error);
            // Don't fail the whole request if attachment saving fails
          }
        }
      }

      send({
        type: "unknown",
        content: "Uploaded attachments",
        metadata: {
          uploadedAttachments,
        },
      });

      const agentMessages = [...messagesForAI, { role: "user" as const, content: sessionData.message.content }];

      userLogger.log("[agent.ts] /stream inside streamSSE: [agentMessages]", {
        agentMessages,
      });

      // 🔍 Create execution trace for this agent run
      const langfuse = serviceRegistry.get("langfuse");
      const traceResult = langfuse.createExecutionTrace(
        token,
        sessionData.agentType as string,
        agentMessages,
        sessionData.conversationId,
        {
          userMessage: sessionData.message.content,
          autonomousMode: sessionData.autonomousMode,
          attachmentCount: uploadedAttachments.length,
        }
      );

      // Log trace creation (handle both enabled and disabled cases)
      if (traceResult.traceName) {
        logger.info(`🔍 Started trace: ${traceResult.traceName}`, {
          sessionToken: token,
          agentType: sessionData.agentType,
          executionNumber: traceResult.executionNumber,
        });
      } else {
        logger.info(`🔍 Tracing disabled - continuing without trace`, {
          sessionToken: token,
          agentType: sessionData.agentType,
        });
      }

      // Agent creation span with timing
      const agentCreationStartTime = performance.now();
      const agentCreationStartMemory = process.memoryUsage();
      const agentCreationSpan = langfuse.createSpanForSession(token, "agent-creation", {
        agentType: sessionData.agentType,
        startTime: new Date().toISOString(),
        startMemoryMB: Math.round(agentCreationStartMemory.heapUsed / 1024 / 1024),
      });

      // Use the AgentFlowService for autonomous loop - core part - we are creating agent in agentFactory that we will use going forward in this file
      const agent = await agentFactory.createAgent(sessionData.agentType as any);

      // End agent creation span with performance metrics
      if (agentCreationSpan) {
        const agentCreationEndTime = performance.now();
        const agentCreationEndMemory = process.memoryUsage();
        const agentCreationDuration = agentCreationEndTime - agentCreationStartTime;
        const agentCreationMemoryDelta = agentCreationEndMemory.heapUsed - agentCreationStartMemory.heapUsed;

        agentCreationSpan.end({
          output: {
            agentId: agent.id,
            agentType: agent.type,
            availableToolsCount: agent.availableTools.length,
          },
          metadata: {
            duration_ms: Math.round(agentCreationDuration),
            endTime: new Date().toISOString(),
            success: true,
            endMemoryMB: Math.round(agentCreationEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(agentCreationMemoryDelta / 1024 / 1024),
            toolsLoaded: agent.availableTools.length,
          },
        });
      }

      // Add agent creation event
      langfuse.addEventToSession(token, "agent-creation-completed", {
        agentId: agent.id,
        agentType: agent.type,
        toolsLoaded: agent.availableTools.length,
      });

      userLogger.log("[agent.ts] /stream inside streamSSE: [agent created]", {
        about: agent.getMetadata(),
        agent,
      });

      // get agent registry
      const agentFlowService = serviceRegistry.get("agentFlow");
      agentFlowService.setSendFunction(send);

      // Agent flow span with timing
      const agentFlowStartTime = performance.now();
      const agentFlowStartMemory = process.memoryUsage();
      const agentFlowSpan = langfuse.createSpanForSession(token, "agent-flow", {
        agentType: sessionData.agentType,
        autonomousMode: sessionData.autonomousMode,
        startTime: new Date().toISOString(),
        startMemoryMB: Math.round(agentFlowStartMemory.heapUsed / 1024 / 1024),
      });

      let finalConclusion: string | null = null;
      try {
        finalConclusion = await agentFlowService.executeAutonomousFlow(
          {
            agentType: sessionData.agentType as any,
            agent,
            userMessage: sessionData.message.content,
            conversationId: sessionData.conversationId,
            userMessageId: sessionData.userMessageId || 0,
            conversationHistory: agentMessages,
            uploadedAttachments,
            sessionData, // Pass sessionData including contextData
            sessionToken: token, // Pass session token for tracing
          },
          {
            autonomousMode: sessionData.autonomousMode,
            maxRequests: 10,
            streamState: streamState!,
          }
        );
      } finally {
        agentFlowService.clearSendFunction();
      }

      // End agent flow span with performance metrics
      if (agentFlowSpan) {
        const agentFlowEndTime = performance.now();
        const agentFlowEndMemory = process.memoryUsage();
        const agentFlowDuration = agentFlowEndTime - agentFlowStartTime;
        const agentFlowMemoryDelta = agentFlowEndMemory.heapUsed - agentFlowStartMemory.heapUsed;

        agentFlowSpan.end({
          output: { conclusion: finalConclusion },
          metadata: {
            duration_ms: Math.round(agentFlowDuration),
            endTime: new Date().toISOString(),
            success: true,
            endMemoryMB: Math.round(agentFlowEndMemory.heapUsed / 1024 / 1024),
            memoryDeltaMB: Math.round(agentFlowMemoryDelta / 1024 / 1024),
            conclusionLength: finalConclusion?.length || 0,
          },
        });
      }

      // Send final conclusion
      await send({
        type: "finished",
        content: "Conversation ended",
        metadata: {
          conclusion: finalConclusion,
          agentType: sessionData.agentType,
          agentStatus: serviceRegistry.get("agent").getStatus(),
        },
      });

      // Update execution status to completed
      if (executionId) {
        // Try to find the assistant message that was saved
        const updatedHistory = await serviceRegistry.get("database").getConversationHistory(sessionData.conversationId);
        const assistantMessage = updatedHistory.find(
          msg => msg.role === "assistant" && msg.id > (userMessageId || 0)
        );
        
        await serviceRegistry.get("agentExecution").updateExecution(executionId, {
          status: "completed",
          totalSteps: stepCounter,
          messageId: assistantMessage?.id,
        });
      }

      // 🔍 End execution trace
      langfuse.endExecutionTrace(token, {
        conclusion: finalConclusion,
        agentType: sessionData.agentType,
        success: true,
      });

      // Clean up
      serviceRegistry.get("stream").stopStream(token);
      serviceRegistry.get("agent").setStatus("waiting-for-prompt");
    } catch (error) {
      console.error("Stream error:", error);

      // 🔍 End execution trace with error
      const langfuse = serviceRegistry.get("langfuse");
      langfuse.endExecutionTrace(token, null, error instanceof Error ? error : new Error(String(error)));

      await send({
        type: "error",
        content: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
      await send({
        type: "finished",
        content: "Conversation ended",
        metadata: {
          conclusion: null,
          agentType: sessionData.agentType,
          agentStatus: serviceRegistry.get("agent").getStatus(),
          error: true,
        },
      });

      // Update execution status to failed
      if (executionId) {
        await serviceRegistry.get("agentExecution").updateExecution(executionId, {
          status: "failed",
          totalSteps: stepCounter,
        });
      }

      serviceRegistry.get("stream").stopStream(token);
      serviceRegistry.get("agent").setStatus("waiting-for-prompt");
    }
  });
});

// Mount the stream router on the agent router
agentRouter.route("/", streamRouter);
