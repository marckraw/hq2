import { createRoute, z } from "@hono/zod-openapi";
import { signalRequestSchema } from "./validation/signal";

// Response schemas
const SignalSchema = z.object({
  id: z.string(),
  source: z.string(),
  type: z.string(),
  payload: z.any(),
  metadata: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const SignalSuccessResponseSchema = z.object({
  success: z.boolean(),
  data: SignalSchema,
});

const SignalsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SignalSchema),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
  }),
});

const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

// Route definitions
export const getSignalsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all signals",
  description: "Retrieves all signals with optional pagination and filtering",
  tags: ["Signals"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional().describe("Number of items to return (default: 50)"),
      offset: z.string().optional().describe("Number of items to skip (default: 0)"),
    }),
  },
  responses: {
    200: {
      description: "List of signals with pagination info",
      content: {
        "application/json": {
          schema: SignalsListResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving signals",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getSignalByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get a signal by ID",
  description: "Retrieves a single signal by its ID",
  tags: ["Signals"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Signal ID"),
    }),
  },
  responses: {
    200: {
      description: "Signal found",
      content: {
        "application/json": {
          schema: SignalSuccessResponseSchema,
        },
      },
    },
    404: {
      description: "Signal not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving signal",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const createSignalRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create a new signal",
  description: "Creates a new signal with the provided data",
  tags: ["Signals"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: signalRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Signal created successfully",
      content: {
        "application/json": {
          schema: SignalSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error creating signal",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});