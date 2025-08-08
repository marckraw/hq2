import { createRoute, z } from "@hono/zod-openapi";

// Schemas for webhook data
const WebhookEntrySchema = z.object({
  id: z.string(),
  headers: z.record(z.string()),
  payload: z.any(),
  timestamp: z.string(),
});

const WebhookSuccessResponseSchema = z.object({
  success: z.boolean(),
  data: WebhookEntrySchema,
});

const WebhookListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(WebhookEntrySchema),
});

const SimpleSuccessResponseSchema = z.object({
  success: z.boolean(),
});

// Route definitions
export const recordWebhookRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Record a webhook",
  description: "Records an incoming webhook request including headers and payload for testing purposes",
  tags: ["Webhook Tester"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.any().describe("Any JSON payload"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Webhook recorded successfully",
      content: {
        "application/json": {
          schema: WebhookSuccessResponseSchema,
        },
      },
    },
  },
});

export const getWebhooksRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all recorded webhooks",
  description: "Retrieves all webhooks that have been recorded for testing",
  tags: ["Webhook Tester"],
  responses: {
    200: {
      description: "List of recorded webhooks",
      content: {
        "application/json": {
          schema: WebhookListResponseSchema,
        },
      },
    },
  },
});

export const clearWebhooksRoute = createRoute({
  method: "post",
  path: "/clear",
  summary: "Clear all webhooks",
  description: "Clears all recorded webhook data from memory",
  tags: ["Webhook Tester"],
  responses: {
    200: {
      description: "Webhooks cleared successfully",
      content: {
        "application/json": {
          schema: SimpleSuccessResponseSchema,
        },
      },
    },
  },
});