import { z } from "@hono/zod-openapi";
import { breakpointValuesSchema } from "./main.schema";
// Schema for backpack-layout values
const layoutValueSchema = z.record(z.any());

export const layoutFieldSchema = z.object({
  type: z.literal("custom"),
  field_type: z.literal("backpack-layout"),
  values: breakpointValuesSchema(layoutValueSchema).optional(),
});
