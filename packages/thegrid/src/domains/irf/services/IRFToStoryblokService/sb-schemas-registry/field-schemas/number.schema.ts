import { z } from "@hono/zod-openapi";
// Schema for standard number fields
export const numberFieldSchema = z.object({
  type: z.literal("number"),
  values: z.record(z.any()).optional(), // Can be an empty object
});
