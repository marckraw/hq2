import { z } from "@hono/zod-openapi";
// Fallback for any other custom field type
export const genericCustomFieldSchema = z.object({
  type: z.literal("custom"),
  field_type: z.string(),
  values: z.record(z.any()).optional(),
});
