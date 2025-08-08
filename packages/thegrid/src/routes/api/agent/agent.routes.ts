import { createRoute, z } from "@hono/zod-openapi";

// Response schemas
const AgentMetadataSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string(),
  capabilities: z.array(z.string()),
  icon: z.string(),
  version: z.string().optional(),
  author: z.string().optional(),
});

const AgentListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(AgentMetadataSchema),
});

const AgentInitResponseSchema = z.object({
  streamToken: z.string(),
  conversationId: z.number(),
});

const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

const SimpleSuccessResponseSchema = z.object({
  success: z.boolean(),
});

const SimpleErrorResponseSchema = z.object({
  error: z.string(),
});

// Request schemas
const AgentInitRequestSchema = z.object({
  messages: z.array(
    z.object({
      content: z.string(),
      role: z.enum(["user", "assistant", "system"]),
    })
  ),
  conversationId: z
    .union([z.string(), z.number()])
    .nullish()
    .transform((val) => val ?? undefined),
  agentType: z.string().default("general"),
  autonomousMode: z.boolean().default(false),
  modelId: z.string().default("claude-3-sonnet"),
  attachments: z.array(z.any()).optional(),
  contextData: z.any().optional(),
});

// Route definitions
export const getAvailableAgentsRoute = createRoute({
  method: "get",
  path: "/available-agents",
  summary: "Get list of available AI agents",
  description:
    "Retrieves metadata for all available AI agents. In production mode, only production-ready agents are returned. Debug mode shows all agents.",
  tags: ["Agent"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of available agents retrieved successfully",
      content: {
        "application/json": {
          schema: AgentListResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving agents list",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const initAgentRoute = createRoute({
  method: "post",
  path: "/init",
  summary: "Initialize agent conversation session",
  description:
    "Creates a new conversation session and returns a stream token for real-time communication with the AI agent",
  tags: ["Agent"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AgentInitRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Session initialized successfully",
      content: {
        "application/json": {
          schema: AgentInitResponseSchema,
        },
      },
    },
    500: {
      description: "Error initializing session",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const stopStreamRoute = createRoute({
  method: "post",
  path: "/stop-stream",
  summary: "Stop active agent stream",
  description: "Terminates an active SSE stream for an agent conversation",
  tags: ["Agent"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      streamToken: z.string().describe("Stream token to stop"),
    }),
  },
  responses: {
    200: {
      description: "Stream stopped successfully",
      content: {
        "application/json": {
          schema: SimpleSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "No stream token provided",
      content: {
        "application/json": {
          schema: SimpleErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Stream not found",
      content: {
        "application/json": {
          schema: SimpleErrorResponseSchema,
        },
      },
    },
  },
});

export const streamAgentRoute = createRoute({
  method: "get",
  path: "/stream",
  summary: "Stream agent responses via SSE",
  description:
    "Establishes a Server-Sent Events stream for real-time agent responses. Uses session token validation instead of bearer auth for compatibility with EventSource API.",
  tags: ["Agent"],
  request: {
    query: z.object({
      streamToken: z
        .string()
        .describe("Session token obtained from /init endpoint"),
    }),
  },
  responses: {
    200: {
      description: "SSE stream established successfully",
      content: {
        "text/event-stream": {
          schema: z
            .string()
            .describe("Server-sent events stream with agent responses"),
        },
      },
    },
    400: {
      description: "No stream token provided",
      content: {
        "application/json": {
          schema: SimpleErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid or expired token",
      content: {
        "application/json": {
          schema: SimpleErrorResponseSchema,
        },
      },
    },
  },
});
