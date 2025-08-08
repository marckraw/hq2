import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "@hono/zod-openapi";
import { agentFactory } from "../../../agent/factories/agents.factory";
import { SessionData } from "../../../db/schema/sessions";
import { serviceRegistry } from "../../../registry/service-registry";
import { logger } from "../../../utils/logger";
import { processedMessageWithAttachments, transformMessagesForAI } from "../shared";

// Validation schemas
const chatInitSchema = z.object({
  messages: z.array(
    z.object({
      content: z.string(),
      role: z.enum(["user", "assistant"]),
    })
  ),
  conversationId: z.number().optional(),
  modelId: z.string().optional().default("claude-3-sonnet"),
  // Add agentic features
  agentType: z
    .enum([
      "chat", // Default chat mode
      "general",
      "test-openrouter",
      "scribe",
      "rephraser",
      "figma-analyzer",
      "figma-to-storyblok",
      "decision-maker",
    ])
    .optional()
    .default("chat"),
  autonomousMode: z.boolean().optional().default(false),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        dataUrl: z.string(),
      })
    )
    .optional()
    .default([]),
  contextData: z
    .object({
      contextType: z.string().optional(),
      selectedSpace: z.string().optional(),
      selectedStory: z.string().optional(),
    })
    .optional(),
});

const messagesRequestSchema = z.object({
  conversationId: z.number(),
});

export const chatRouter = new Hono();

// Initialize chat conversation and create session token
chatRouter.post("/init", zValidator("json", chatInitSchema), async (c) => {
  try {
    const requestData = c.req.valid("json");
    const { messages, conversationId, modelId, agentType, autonomousMode, attachments, contextData } = requestData;

    // If no conversation ID provided, create a new conversation
    let currentConversationId = conversationId;
    let userMessageId: number | undefined;

    if (!currentConversationId) {
      // Create a new conversation with the first user message as title
      const userMessage = messages.find((msg) => msg.role === "user");
      const title = userMessage?.content.slice(0, 50) + "..." || "New Chat";

      const conversation = await serviceRegistry.get("database").createConversation({
        title,
        systemMessage: "You are a helpful AI assistant.",
      });

      currentConversationId = conversation?.id || 0;

      // Add the initial message to the conversation
      if (userMessage) {
        const savedUserMessage = await serviceRegistry.get("database").addMessage({
          conversationId: currentConversationId || 0,
          role: userMessage.role,
          content: userMessage.content,
        });
        userMessageId = savedUserMessage?.id;
      }
    } else {
      // For existing conversations, save the new user message to database
      const userMessage = messages.find((msg) => msg.role === "user");
      if (userMessage) {
        const savedUserMessage = await serviceRegistry.get("database").addMessage({
          conversationId: currentConversationId || 0,
          role: userMessage.role,
          content: userMessage.content,
        });
        userMessageId = savedUserMessage?.id;
      }
    }

    // Create a session for streaming
    const userMessage = messages.find((msg) => msg.role === "user");
    const sessionData: SessionData = {
      message: {
        content: userMessage?.content || "",
        role: userMessage?.role || "user",
      },
      conversationId: currentConversationId || 0,
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

    // Generate a unique token and set expiration (10 minutes from now)
    const token = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    await serviceRegistry.get("session").createSession(token, sessionData, expiresAt);

    return c.json({
      success: true,
      conversationId: currentConversationId,
      streamToken: token,
    });
  } catch (error) {
    logger.error("Chat init error", { error });
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "CHAT_INIT_ERROR",
        },
      },
      500
    );
  }
});

// Get all conversations
chatRouter.get("/conversations", async (c) => {
  try {
    // Get all conversations ordered by updated date (most recent first)
    const conversations = await serviceRegistry.get("database").getConversations();

    return c.json({
      success: true,
      content: conversations,
    });
  } catch (error) {
    logger.error("Get conversations error", { error });
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "CONVERSATIONS_ERROR",
        },
      },
      500
    );
  }
});

// Get messages for a specific conversation
chatRouter.post("/messages", zValidator("json", messagesRequestSchema), async (c) => {
  try {
    const requestData = c.req.valid("json");
    const { conversationId } = requestData;

    // Get all messages for the conversation
    const messages = await serviceRegistry.get("database").getConversationHistory(conversationId);

    return c.json({
      success: true,
      content: messages,
    });
  } catch (error) {
    logger.error("Get messages error", { error });
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "MESSAGES_ERROR",
        },
      },
      500
    );
  }
});

// Get conversation timeline with execution steps
chatRouter.post("/timeline", zValidator("json", messagesRequestSchema), async (c) => {
  try {
    const requestData = c.req.valid("json");
    const { conversationId } = requestData;

    // Get conversation with execution timeline
    const conversationData = await serviceRegistry.get("database").getConversationWithExecutions(conversationId);

    return c.json({
      success: true,
      content: conversationData,
    });
  } catch (error) {
    logger.error("Get timeline error", { error });
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "TIMELINE_ERROR",
        },
      },
      500
    );
  }
});

// Delete a conversation
chatRouter.delete("/conversation/:id", async (c) => {
  try {
    const conversationId = parseInt(c.req.param("id"));

    if (isNaN(conversationId)) {
      return c.json(
        {
          success: false,
          error: {
            message: "Invalid conversation ID",
            code: "INVALID_CONVERSATION_ID",
          },
        },
        400
      );
    }

    // Delete the conversation and all its messages
    await serviceRegistry.get("database").deleteConversation(conversationId);

    return c.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    logger.error("Delete conversation error", { error });
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "DELETE_CONVERSATION_ERROR",
        },
      },
      500
    );
  }
});

// Stop stream endpoint
chatRouter.post("/stop-stream", async (c) => {
  logger.info("Chat: stop-stream endpoint hit");
  const streamToken = c.req.query("streamToken");
  if (!streamToken) {
    return c.json({ error: "No stream token provided" }, 400);
  }

  const stopped = serviceRegistry.get("stream").stopStream(streamToken);
  if (stopped) {
    return c.json({ success: true });
  }

  return c.json({ error: "Stream not found" }, 404);
});

// SSE streaming endpoint for chat responses (no bearer auth required - session token is auth)
chatRouter.get("/stream", async (c) => {
  const streamToken = c.req.query("streamToken");

  if (!streamToken) {
    return c.text("Missing streamToken parameter", 400);
  }

  try {
    // Get session data (this validates the token)
    const sessionData = await serviceRegistry.get("session").getSession(streamToken);
    if (!sessionData) {
      return c.text("Invalid or expired stream token", 401);
    }

    logger.info("This is the session data [in stream endpoint]: ", sessionData);

    // Extend session for continued use
    await serviceRegistry.get("session").extendSession(streamToken);

    // Get conversation history
    const conversationHistory = await serviceRegistry
      .get("database")
      .getConversationHistory(sessionData.conversationId);

    // Get the user's latest message for memory context
    const latestUserMessage = conversationHistory.filter((msg) => msg.role === "user").pop()?.content || "";

    logger.info("This is the latest user message: ");
    logger.info(latestUserMessage);

    // Extract session parameters
    const userMessage = sessionData.message;
    const currentConversationId = sessionData.conversationId;
    const autonomousMode = sessionData.autonomousMode || false;
    const agentType = sessionData.agentType || "chat";
    const attachments = sessionData.attachments || [];
    const modelId = sessionData.modelId || "gpt-4.1";

    logger.info("These are data from session", {
      userMessage,
      currentConversationId,
      autonomousMode,
      agentType,
      attachments,
      modelId,
    });

    // Check if this is chat mode (simple LLM streaming)
    const isChatMode = agentType === "chat";

    // Register stream in service if not chat mode
    const streamState = !isChatMode ? serviceRegistry.get("stream").addStream(streamToken) : null;

    // Use Hono's streamSSE for better integration
    return streamSSE(c, async (stream) => {
      const logger = console;
      const send = serviceRegistry.get("stream").createSender(stream);

      // Handle stream abort
      stream.onAbort(() => {
        if (!isChatMode) {
          serviceRegistry.get("stream").stopStream(streamToken);
          serviceRegistry.get("agent").setStatus("waiting-for-prompt");
        }
      });

      try {
        if (!isChatMode) {
          serviceRegistry.get("agent").setStatus("working");
        }

        if (isChatMode) {
          // CHAT MODE: Three-phase approach with Decision Maker
          await stream.writeSSE({
            data: JSON.stringify({
              type: "user_message",
              content: `User: ${userMessage.content}`,
            }),
          });

          // PHASE 1: Decision Making
          await stream.writeSSE({
            data: JSON.stringify({
              type: "thinking",
              content: "🧠 Analyzing your message and planning response...",
            }),
          });

          const conversationHistoryForDecision = conversationHistory.map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          }));

          const decision = await serviceRegistry
            .get("decisionMaker")
            .analyzeUserMessage(userMessage.content, conversationHistoryForDecision);

          logger.info("This is my decision: ", decision);

          await stream.writeSSE({
            data: JSON.stringify({
              type: "decision",
              content: `📋 Plan: ${decision.summary}`,
              metadata: {
                actions: decision.actions,
                confidence: decision.confidence,
              },
            }),
          });

          // PHASE 2: Execute Actions (based on decision)
          const actionsExecuted = [];

          for (const action of decision.actions.sort((a, b) => b.priority - a.priority)) {
            switch (action.type) {
              case "search_memory":
                try {
                  await stream.writeSSE({
                    data: JSON.stringify({
                      type: "thinking",
                      content: "🔍 Searching memories for relevant context...",
                    }),
                  });

                  actionsExecuted.push("Found relevant memories");
                } catch (error) {
                  logger.error("Memory search error:", error);
                  actionsExecuted.push("Memory search failed");
                }
                break;


              case "analyze_content":
                await stream.writeSSE({
                  data: JSON.stringify({
                    type: "thinking",
                    content: "🔬 Performing detailed content analysis...",
                  }),
                });
                actionsExecuted.push("Content analysis completed");
                break;
            }
          }

          // PHASE 3: Generate Response
          await stream.writeSSE({
            data: JSON.stringify({
              type: "thinking",
              content: `✅ Actions completed: ${actionsExecuted.join(", ")}. Generating response...`,
            }),
          });

          // Format messages for LLM
          const formattedMessages = conversationHistory.map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          }));

          // Add system message if it's a new conversation
          if (formattedMessages.length === 1) {
            formattedMessages.unshift({
              role: "system",
              content: "You are a helpful AI assistant.",
            });
          }

          const reasoningModels = ["o4-mini", "o4", "o3-mini", "o3"];
          const isReasoningModel = reasoningModels.some((model) => modelId.toLowerCase().includes(model.toLowerCase()));

          // Stream LLM response with tools if needed
          let fullResponse = "";
          // Removed: saveMemory tool functionality
          // const shouldUseSaveMemoryTool = decision.actions.some(
          //   (action) => action.type === "save_memory"
          // );
          const tools: any[] = [];

          logger.info("### What we send to LLM: ###");
          logger.info("Model ID: ", modelId);
          logger.info("Formatted messages: ", formattedMessages);
          logger.info("Tools available: ", tools.length);

          // Create trace context for Langfuse
          const traceContext = serviceRegistry.get("llm").createTraceContext({
            sessionId: streamToken,
            userId: "user", // You can enhance this with actual user ID
            conversationId: currentConversationId,
            agentType: "chat",
            metadata: {
              modelId,
              toolCount: tools.length,
              isReasoningModel,
              feature: "chat-streaming",
            },
          });

          const {
            stream: chatStream,
            generation: _generation,
            trace: _trace,
          } = await serviceRegistry.get("llm").runStreamedLLMWithTools({
            model: modelId,
            messages: formattedMessages,
            tools,
            isReasoningModel,
            traceContext,
          });

          // const chatStream = await llmService.openai.chat.completions.create({
          //   model: modelId,
          //   messages: formattedMessages,
          //   stream: true,
          //   temperature: isReasoningModel ? 1 : 0.7,
          //   tools: [zodFunction(saveMemoryToolDefinition)],
          //   tool_choice: "auto",
          // });

          let _totalTokens = 0;
          for await (const chunk of chatStream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              await stream.writeSSE({
                data: JSON.stringify({
                  type: "llm_response",
                  content: content,
                }),
              });
            }

            // Track token usage if available
            if (chunk.usage) {
              _totalTokens = chunk.usage.total_tokens || 0;
            }
          }

          // End the Langfuse trace with final statistics
          serviceRegistry.get("llm").endStreamingTrace(
            _generation,
            _trace,
            {
              input: Math.floor(_totalTokens * 0.7), // Approximate input tokens
              output: Math.floor(_totalTokens * 0.3), // Approximate output tokens
              total: _totalTokens,
            },
            fullResponse
          );

          // Save assistant response to database
          await serviceRegistry.get("database").addMessage({
            conversationId: sessionData.conversationId,
            role: "assistant",
            content: fullResponse,
          });

          // Send completion signal
          await stream.writeSSE({
            data: JSON.stringify({
              type: "finished",
              content: fullResponse,
            }),
          });
        } else {
          // AGENT MODE: Autonomous agent flow
          await send({
            type: "user_message",
            content: `User message: ${userMessage.content}`,
            metadata: { agentStatus: serviceRegistry.get("agent").getStatus() },
          });

          // Save user message (only if not already saved during init)
          const lastMessage = conversationHistory[conversationHistory.length - 1];
          const isMessageAlreadySaved =
            lastMessage && lastMessage.role === "user" && lastMessage.content === userMessage.content;

          if (!isMessageAlreadySaved) {
            await serviceRegistry.get("conversation").addMessage({
              message: {
                role: "user",
                content: userMessage.content,
              },
              conversationId: currentConversationId,
            });
          }

          // Prepare messages for agents
          const messagesForAI = transformMessagesForAI(conversationHistory);
          const agentMessages = [
            ...messagesForAI,
            ...(attachments.length > 0 ? [processedMessageWithAttachments(attachments)] : []),
          ];

          // Use the AgentFlowService for autonomous loop
          const agent = await agentFactory.createAgent(agentType as any);
          serviceRegistry.get("agentFlow").setSendFunction(send);

          let finalConclusion: string | null = null;
          try {
            finalConclusion = await serviceRegistry.get("agentFlow").executeAutonomousFlow(
              {
                agentType: agentType as any,
                agent,
                userMessage: userMessage.content,
                conversationId: currentConversationId,
                userMessageId: sessionData.userMessageId || 0,
                conversationHistory: agentMessages,
                sessionData, // Pass sessionData including contextData
              },
              {
                autonomousMode,
                maxRequests: 10,
                streamState: streamState!,
              }
            );
          } finally {
            serviceRegistry.get("agentFlow").clearSendFunction();
          }

          await send({
            type: "finished",
            content: "Conversation ended",
            metadata: {
              conclusion: finalConclusion,
              agentType,
              agentStatus: serviceRegistry.get("agent").getStatus(),
            },
          });

          serviceRegistry.get("stream").stopStream(streamToken);
          serviceRegistry.get("agent").setStatus("waiting-for-prompt");
        }

        await stream.close();
      } catch (error) {
        logger.error("Stream error:", error);
        await stream.writeSSE({
          data: JSON.stringify({
            type: "error",
            content: "Failed to process request",
          }),
        });

        if (!isChatMode) {
          await send({
            type: "finished",
            content: "Conversation ended",
            metadata: {
              conclusion: null,
              agentType,
              agentStatus: serviceRegistry.get("agent").getStatus(),
              error: true,
            },
          });
          serviceRegistry.get("stream").stopStream(streamToken);
          serviceRegistry.get("agent").setStatus("waiting-for-prompt");
        }

        await stream.close();
      }
    });
  } catch (error) {
    logger.error("Chat stream error:", error);
    return c.text("Internal server error", 500);
  }
});
