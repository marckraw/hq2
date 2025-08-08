import { createRoute, z } from "@hono/zod-openapi";

// Response schemas
const FigmaFileResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    file: z.any(), // Figma file structure is complex and varies
  }),
});

const FigmaErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

// Route definitions
export const getFigmaFileRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get Figma file by URL",
  description: "Retrieves a Figma file's data using the provided Figma URL",
  tags: ["Figma"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      url: z.string().url().describe("Figma file URL"),
    }),
  },
  responses: {
    200: {
      description: "Figma file retrieved successfully",
      content: {
        "application/json": {
          schema: FigmaFileResponseSchema,
        },
      },
    },
    400: {
      description: "Missing URL parameter",
      content: {
        "application/json": {
          schema: FigmaErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving Figma file",
      content: {
        "application/json": {
          schema: FigmaErrorResponseSchema,
        },
      },
    },
  },
});

export const getFigmaImageRoute = createRoute({
  method: "get",
  path: "/image",
  summary: "Get Figma file as image",
  description: "Retrieves a Figma file as an image using the file key",
  tags: ["Figma"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      key: z.string().optional().describe("Figma file key (defaults to vObm0XiNyOokbj7lfTOHmN if not provided)"),
    }),
  },
  responses: {
    200: {
      description: "Figma image retrieved successfully",
      content: {
        "application/json": {
          schema: FigmaFileResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving Figma image",
      content: {
        "application/json": {
          schema: FigmaErrorResponseSchema,
        },
      },
    },
  },
});