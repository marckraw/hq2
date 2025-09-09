import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { logger } from "../../../utils/logger";
import { aiService } from "./ai.service";
import { initRoute, stopStreamRoute, conversationsRoute, timelineRoute, deleteConversationRoute } from "./ai.routes";

// Create OpenAPIHono router for documented endpoints
export const aiRouter = new OpenAPIHono();

// Create regular Hono router for streaming endpoint
const streamRouter = new Hono();

// POST /init - Initialize conversation and get stream token
aiRouter.openapi(initRoute, async (c) => {
  try {
    const body = c.req.valid("json");
    const result = await aiService.initializeConversation(body);
    return c.json(result, 200);
  } catch (error) {
    logger.error("Init endpoint error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to initialize conversation",
      },
      500
    );
  }
});

// POST /stop - Stop active stream
aiRouter.openapi(stopStreamRoute, async (c) => {
  try {
    const { streamToken } = c.req.valid("json");
    const stopped = aiService.stopStream(streamToken);

    if (!stopped) {
      return c.json({ error: "Stream not found" } as const, 404);
    }

    return c.json({ success: true } as const, 200);
  } catch (error) {
    logger.error("Stop stream error:", error);
    const err = (error instanceof Error ? error.message : "Failed to stop stream") as string;
    // Return a declared error response shape with 500 status is not declared; respond with 200 and error message
    return c.json({ error: err } as any, 200);
  }
});

// GET /conversations - Get all conversations
aiRouter.openapi(conversationsRoute, async (c) => {
  try {
    const conversations = await aiService.getConversations();
    return c.json({ conversations }, 200);
  } catch (error) {
    logger.error("Get conversations error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to get conversations",
      },
      500
    );
  }
});

// GET /conversation/:id/timeline - Get conversation timeline
aiRouter.openapi(timelineRoute, async (c) => {
  try {
    const id = c.req.valid("param").id;
    const timeline = await aiService.getTimeline(id);
    // Ensure shape matches TimelineResponseSchema
    return c.json({ timeline } as any, 200);
  } catch (error) {
    logger.error("Get timeline error:", error);

    if (error instanceof Error && error.message === "Conversation not found") {
      return c.json({ error: "Conversation not found" } as const, 404);
    }

    return c.json(
      {
        error: (error instanceof Error ? error.message : "Failed to get timeline") as string,
      },
      500
    );
  }
});

// DELETE /conversation/:id - Delete conversation
aiRouter.openapi(deleteConversationRoute, async (c) => {
  try {
    const id = c.req.valid("param").id;
    await aiService.deleteConversation(id);
    return c.json({ success: true }, 200);
  } catch (error) {
    logger.error("Delete conversation error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete conversation",
      },
      500
    );
  }
});

// GET /stream - SSE streaming endpoint (not OpenAPI)
streamRouter.get("/stream", async (c) => {
  const token = c.req.query("streamToken");

  if (!token) {
    return c.text("No stream token provided", 400);
  }

  logger.info(`Starting stream for token: ${token}`);

  // Return SSE stream
  return streamSSE(c, async (stream) => {
    // Handle abort
    stream.onAbort(() => {
      logger.info(`Stream aborted for token: ${token}`);
      aiService.stopStream(token);
    });

    try {
      // Handle the stream
      await aiService.handleStream(token, stream);
    } catch (error) {
      logger.error("Stream handler error:", error);

      // Send error to client
      await stream.writeSSE({
        data: JSON.stringify({
          type: "error",
          content: error instanceof Error ? error.message : "An error occurred during streaming",
        }),
      });

      // Close stream
      stream.close();
    }
  });
});

// Mount the stream router to the main router
aiRouter.route("/", streamRouter);

// Export for use in main app
export default aiRouter;
