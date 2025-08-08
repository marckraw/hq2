import { createRoute, z } from "@hono/zod-openapi";
import {
  CreatePromptSnippetSchema,
  UpdatePromptSnippetSchema,
} from "./validation";

// Response schemas
// Create a response-specific schema that matches JSON serialization
const PromptSnippetResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(), // Database returns null, not undefined
  insertText: z.string(),
  createdAt: z.string(), // JSON serializes Date to string
  updatedAt: z.string(), // JSON serializes Date to string
});

const SnippetSuccessResponseSchema = z.object({
  success: z.boolean(),
  data: PromptSnippetResponseSchema,
});

const SnippetsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PromptSnippetResponseSchema),
});

const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

// Route definitions
export const getSnippetsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all prompt snippets",
  description: "Retrieves all available prompt snippets",
  tags: ["Snippets"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of prompt snippets",
      content: {
        "application/json": {
          schema: SnippetsListResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving snippets",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const createSnippetRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create a new prompt snippet",
  description: "Creates a new prompt snippet with the provided data",
  tags: ["Snippets"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePromptSnippetSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Snippet created successfully",
      content: {
        "application/json": {
          schema: SnippetSuccessResponseSchema,
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
      description: "Error creating snippet",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const updateSnippetRoute = createRoute({
  method: "put",
  path: "/{id}",
  summary: "Update a prompt snippet",
  description: "Updates an existing prompt snippet with the provided data",
  tags: ["Snippets"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().describe("Snippet ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdatePromptSnippetSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Snippet updated successfully",
      content: {
        "application/json": {
          schema: SnippetSuccessResponseSchema,
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
    404: {
      description: "Snippet not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error updating snippet",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const deleteSnippetRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete a prompt snippet",
  description: "Deletes a prompt snippet by ID",
  tags: ["Snippets"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().describe("Snippet ID"),
    }),
  },
  responses: {
    200: {
      description: "Snippet deleted successfully",
      content: {
        "application/json": {
          schema: SnippetSuccessResponseSchema,
        },
      },
    },
    404: {
      description: "Snippet not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error deleting snippet",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});