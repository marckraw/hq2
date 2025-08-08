import { z } from "@hono/zod-openapi";

export const signalRequestSchema = z.object({
  source: z.string(),
  type: z.string(),
  payload: z.any(),
  metadata: z.record(z.any()).optional(),
});
