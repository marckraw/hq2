import { logger } from "@/utils/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { streamSSE } from "hono/streaming";
import { serviceRegistry } from "../../../registry/service-registry";
import { 
  initTriggerStreamRoute, 
  triggerStreamRoute,
  recordTriggerRoute, 
  getTriggersRoute, 
  clearTriggersRoute,
  cleanupStreamsRoute 
} from "./triggers.routes";

export const triggersRouter = new OpenAPIHono();

// Store active SSE connections
const activeTriggerConnections = new Map<string, any>();

// Initialize trigger stream
triggersRouter.openapi(initTriggerStreamRoute, async (c) => {
  const triggerService = serviceRegistry.get("trigger");
  const streamToken = triggerService.initializeStream();
  
  return c.json({ 
    success: true, 
    streamToken 
  });
});

// SSE stream endpoint
triggersRouter.openapi(triggerStreamRoute, async (c) => {
  const { streamToken } = c.req.valid("query");
  const triggerService = serviceRegistry.get("trigger");
  
  // Validate stream token
  const stream = triggerService.getStream(streamToken);
  if (!stream || stream.type !== "trigger") {
    return c.json({ error: "Invalid or expired stream token" }, 401);
  }
  
  // Set CORS headers for SSE
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Credentials', 'true');
  
  // Set up SSE stream
  return streamSSE(c, async (sseStream) => {
    // Store the connection
    activeTriggerConnections.set(streamToken, sseStream);
    
    // Send initial connection event
    await sseStream.writeSSE({
      event: "connected",
      data: JSON.stringify({ 
        message: "Connected to trigger stream",
        timestamp: new Date().toISOString()
      }),
    });
    
    // Keep the connection alive with heartbeat
    const heartbeatInterval = setInterval(async () => {
      try {
        await sseStream.writeSSE({
          event: "heartbeat",
          data: JSON.stringify({ 
            timestamp: new Date().toISOString() 
          }),
        });
      } catch (error) {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // Send heartbeat every 30 seconds
    
    // Handle stream abort
    sseStream.onAbort(() => {
      clearInterval(heartbeatInterval);
      activeTriggerConnections.delete(streamToken);
      triggerService.removeStream(streamToken);
      logger.info("Trigger stream disconnected", { streamToken });
    });
    
    // Keep the connection alive - wait indefinitely
    await new Promise((_resolve) => {
      // This promise never resolves, keeping the stream open
      // The connection will be closed when the client disconnects or onAbort is called
    });
  });
});

// Record a trigger
triggersRouter.openapi(recordTriggerRoute, async (c) => {
  const triggerService = serviceRegistry.get("trigger");
  const payload = await c.req.json();
  
  const trigger = triggerService.recordTrigger(payload);
  
  // Broadcast to all active connections
  for (const [streamToken, sseStream] of activeTriggerConnections) {
    try {
      await sseStream.writeSSE({
        event: "trigger",
        data: JSON.stringify(trigger),
      });
    } catch (error) {
      // Connection might be closed, remove it
      activeTriggerConnections.delete(streamToken);
      logger.error("Failed to send trigger to stream", { streamToken, error });
    }
  }
  
  return c.json({ 
    success: true, 
    data: trigger 
  });
});

// Get all triggers
triggersRouter.openapi(getTriggersRoute, (c) => {
  const triggerService = serviceRegistry.get("trigger");
  
  return c.json({ 
    success: true, 
    data: triggerService.getTriggers() 
  });
});

// Clear all triggers
triggersRouter.openapi(clearTriggersRoute, (c) => {
  const triggerService = serviceRegistry.get("trigger");
  triggerService.clearTriggers();
  
  return c.json({ 
    success: true 
  });
});

// Clean up inactive streams
triggersRouter.openapi(cleanupStreamsRoute, (c) => {
  const triggerService = serviceRegistry.get("trigger");
  let cleaned = 0;
  
  // Get all trigger streams
  const allStreams = triggerService.getAllStreams();
  
  // Close and remove inactive connections
  for (const [streamToken, stream] of Object.entries(allStreams)) {
    if (stream.type === "trigger") {
      // Close any active SSE connections for this token
      const sseStream = activeTriggerConnections.get(streamToken);
      if (sseStream) {
        try {
          activeTriggerConnections.delete(streamToken);
          cleaned++;
        } catch (error) {
          logger.error("Failed to close SSE connection", { streamToken, error });
        }
      }
      
      // Remove the stream from trigger service
      triggerService.removeStream(streamToken);
      cleaned++;
    }
  }
  
  logger.info(`Cleaned up ${cleaned} trigger streams`);
  
  return c.json({ 
    success: true,
    cleaned
  });
});