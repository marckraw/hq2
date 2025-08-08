import { createRoute, z } from "@hono/zod-openapi";

// Schemas for trigger data
const TriggerEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  timestamp: z.string(),
  data: z.any().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const TriggerInitResponseSchema = z.object({
  success: z.boolean(),
  streamToken: z.string(),
});

const TriggerRecordRequestSchema = z.object({
  type: z.string().describe("Type of trigger event"),
  data: z.any().optional().describe("Optional data payload for the trigger"),
  metadata: z.record(z.string(), z.any()).optional().describe("Optional metadata for the trigger"),
});

const TriggerSuccessResponseSchema = z.object({
  success: z.boolean(),
  data: TriggerEventSchema,
});

const TriggerListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(TriggerEventSchema),
});

const SimpleSuccessResponseSchema = z.object({
  success: z.boolean(),
});

// Route definitions
export const initTriggerStreamRoute = createRoute({
  method: "post",
  path: "/init",
  summary: "Initialize trigger stream",
  description: "Initializes a new SSE stream for receiving trigger events and returns a stream token",
  tags: ["Triggers"],
  responses: {
    200: {
      description: "Stream initialized successfully",
      content: {
        "application/json": {
          schema: TriggerInitResponseSchema,
        },
      },
    },
  },
});

export const triggerStreamRoute = createRoute({
  method: "get",
  path: "/stream",
  summary: "SSE trigger stream",
  description: "Server-Sent Events stream for receiving real-time trigger notifications",
  tags: ["Triggers"],
  request: {
    query: z.object({
      streamToken: z.string().describe("Stream token from init endpoint"),
    }),
  },
  responses: {
    200: {
      description: "SSE stream established",
      content: {
        "text/event-stream": {
          schema: z.any(),
        },
      },
    },
    401: {
      description: "Invalid or missing stream token",
    },
  },
});

export const recordTriggerRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Record a trigger",
  description: "Records a trigger event that will be broadcast to all connected SSE clients",
  tags: ["Triggers"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: TriggerRecordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Trigger recorded successfully",
      content: {
        "application/json": {
          schema: TriggerSuccessResponseSchema,
        },
      },
    },
  },
});

export const getTriggersRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all recorded triggers",
  description: "Retrieves all triggers that have been recorded",
  tags: ["Triggers"],
  responses: {
    200: {
      description: "List of recorded triggers",
      content: {
        "application/json": {
          schema: TriggerListResponseSchema,
        },
      },
    },
  },
});

export const clearTriggersRoute = createRoute({
  method: "post",
  path: "/clear",
  summary: "Clear all triggers",
  description: "Clears all recorded trigger data from memory",
  tags: ["Triggers"],
  responses: {
    200: {
      description: "Triggers cleared successfully",
      content: {
        "application/json": {
          schema: SimpleSuccessResponseSchema,
        },
      },
    },
  },
});

export const cleanupStreamsRoute = createRoute({
  method: "post",
  path: "/cleanup-streams",
  summary: "Clean up trigger streams",
  description: "Removes all inactive trigger stream tokens and closes any orphaned connections",
  tags: ["Triggers"],
  responses: {
    200: {
      description: "Streams cleaned up successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            cleaned: z.number(),
          }),
        },
      },
    },
  },
});
