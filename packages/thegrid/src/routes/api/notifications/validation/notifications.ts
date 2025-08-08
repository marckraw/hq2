import { z } from "@hono/zod-openapi";

// Create a new notification
export const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum(["alert", "reminder", "insight"]),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
});
