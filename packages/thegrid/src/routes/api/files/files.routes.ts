import { createRoute, z } from "@hono/zod-openapi";

// Response schemas
const FileInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
  dataUrl: z.string(),
});

const FileSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: FileInfoSchema,
});

const FileErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

// Route definitions
export const prepareFileRoute = createRoute({
  method: "post",
  path: "/prepare",
  summary: "Prepare files for agent processing",
  description:
    "Validates and prepares uploaded files for processing by AI agents. Supports images (JPEG, PNG, GIF) and PDFs up to 10MB.",
  tags: ["Files"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.any().describe("File to upload (max 10MB)"),
            conversationId: z
              .string()
              .optional()
              .describe("Optional conversation ID"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "File prepared successfully",
      content: {
        "application/json": {
          schema: FileSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid file or missing file",
      content: {
        "application/json": {
          schema: FileErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: FileErrorResponseSchema,
        },
      },
    },
  },
});