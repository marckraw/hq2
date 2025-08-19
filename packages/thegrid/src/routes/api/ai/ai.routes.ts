import { createRoute } from "@hono/zod-openapi";
import {
  InitRequestSchema,
  InitResponseSchema,
  StopStreamRequestSchema,
  ConversationsResponseSchema,
  TimelineResponseSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "./validation/ai.schemas";
import { z } from "@hono/zod-openapi";

// Initialize conversation and get stream token
export const initRoute = createRoute({
  method: "post",
  path: "/init",
  summary: "Initialize AI conversation",
  description:
    "Creates or continues a conversation and returns a stream token for real-time communication",
  tags: ["AI"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: InitRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully initialized conversation",
      content: {
        "application/json": {
          schema: InitResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Stop active stream
export const stopStreamRoute = createRoute({
  method: "post",
  path: "/stop",
  summary: "Stop active AI stream",
  description: "Terminates an active SSE stream",
  tags: ["AI"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: StopStreamRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Stream stopped successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema,
        },
      },
    },
    404: {
      description: "Stream not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get all conversations
export const conversationsRoute = createRoute({
  method: "get",
  path: "/conversations",
  summary: "Get all conversations",
  description: "Retrieves all conversations for the current user",
  tags: ["AI"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Successfully retrieved conversations",
      content: {
        "application/json": {
          schema: ConversationsResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get conversation timeline
export const timelineRoute = createRoute({
  method: "get",
  path: "/conversation/{id}/timeline",
  summary: "Get conversation timeline",
  description:
    "Retrieves the timeline of messages and execution steps for a conversation",
  tags: ["AI"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .transform(Number)
        .pipe(z.number().positive())
        .describe("Conversation ID"),
    }),
  },
  responses: {
    200: {
      description: "Successfully retrieved timeline",
      content: {
        "application/json": {
          schema: TimelineResponseSchema,
        },
      },
    },
    404: {
      description: "Conversation not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Delete conversation
export const deleteConversationRoute = createRoute({
  method: "delete",
  path: "/conversation/{id}",
  summary: "Delete conversation",
  description: "Deletes a conversation and all its messages",
  tags: ["AI"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .transform(Number)
        .pipe(z.number().positive())
        .describe("Conversation ID"),
    }),
  },
  responses: {
    200: {
      description: "Successfully deleted conversation",
      content: {
        "application/json": {
          schema: SuccessResponseSchema,
        },
      },
    },
    404: {
      description: "Conversation not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Stream route (not OpenAPI - plain SSE)
export const streamRoute = {
  method: "get" as const,
  path: "/stream",
  summary: "Stream AI responses via SSE",
  description:
    "Establishes a Server-Sent Events stream for real-time AI responses",
  tags: ["AI"],
};