import { z } from "@hono/zod-openapi";
import { breakpointValuesSchema } from "./main.schema";

// Schema for backpack-toggle values (e.g., text-align)
export const toggleValueSchema = z.string();

export const toggleFieldSchema = z.object({
  type: z.literal("custom"),
  field_type: z.literal("backpack-toggle"),
  values: breakpointValuesSchema(toggleValueSchema).optional(),
});
