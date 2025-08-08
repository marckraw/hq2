import { logger } from "@/utils/logger";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { bearerAuth } from "hono/bearer-auth";
import { config } from "../../../config.env";
import { streamManager } from "../../../services/atoms/StreamManagerService/stream.manager.service";

export const streamsRouter = new Hono();
const token = config.X_API_KEY;
streamsRouter.use("/init/*", bearerAuth({ token }));

type StreamTokenEntry = {
  userId: string;
  expiresAt: number;
};

const streamTokenMap = new Map<string, StreamTokenEntry>();

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of streamTokenMap.entries()) {
    if (entry.expiresAt < now) {
      streamTokenMap.delete(token);
    }
  }
}, 60000); // Clean up every minute

// the actual stream
streamsRouter.get("/horizon", async (c) => {
  const token = c.req.query("streamToken");

  if (!token) {
    return c.json({ success: false, error: "Missing stream token" }, 401);
  }

  const tokenData = streamTokenMap.get(token);

  if (!tokenData) {
    return c.json({ success: false, error: "Invalid stream token" }, 401);
  }

  if (tokenData.expiresAt < Date.now()) {
    streamTokenMap.delete(token);
    return c.json({ success: false, error: "Stream token expired" }, 401);
  }

  const userId = tokenData.userId;

  logger.info("[Streams] User ID", { userId, token, tokenData });

  //   Check if user already has an active stream
  if (streamManager.isStreamActive(userId)) {
    streamManager.stopStream(userId); // Close the existing stream
  }

  return streamSSE(c, async (stream) => {
    // VERY IMPORTANT — set correct SSE headers manually
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    const send = streamManager.createGridStreamSender<any>(stream);

    streamManager.addStream(userId, stream);

    try {
      // Send initial connection success message
      await send({
        type: "connection",
        content: "Successfully connected to The Grid",
        metadata: {
          userId,
          connectedAt: new Date().toISOString(),
        },
      });

      stream.onAbort(() => {
        streamManager.stopStream(userId);
        streamTokenMap.delete(token); // Clean up token when stream ends
        return;
      });

      // eslint-disable-next-line no-constant-condition
      while (true) {
        await stream.sleep(1000);
      }
    } catch (error) {
      await send({
        type: "error",
        content: "Stream initialization failed",
        metadata: { error: (error as Error).message },
      });
      streamManager.stopStream(userId);
    }
  });
});

// initialization of stream
streamsRouter.post("/init", async (c) => {
  try {
    const userId = "1"; // TODO: Get from auth context

    if (!userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Clean up any existing tokens for this user
    for (const [token, entry] of streamTokenMap.entries()) {
      if (entry.userId === userId) {
        streamTokenMap.delete(token);
      }
    }

    const streamToken = crypto.randomUUID();
    const expiresAt = Date.now() + 1000 * 60 * 5; // valid 5 minutes

    streamTokenMap.set(streamToken, { userId, expiresAt });

    return c.json({
      success: true,
      streamToken,
      expiresAt,
      userId,
    });
  } catch (error) {
    logger.error("Stream initialization error:", error);
    return c.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          code: "STREAM_INIT_ERROR",
        },
      },
      500
    );
  }
});
