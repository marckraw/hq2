import { z } from "@hono/zod-openapi";
import { breakpointValuesSchema } from "./main.schema";
// Schema for backpack-spacing values
export const spacingValueSchema = z
  .object({
    pt: z.string().optional(),
    pr: z.string().optional(),
    pb: z.string().optional(),
    pl: z.string().optional(),
    mt: z.string().optional(),
    mr: z.string().optional(),
    mb: z.string().optional(),
    ml: z.string().optional(),
  })
  .partial();

export const spacingFieldSchema = z.object({
  type: z.literal("custom"),
  field_type: z.literal("backpack-spacing"),
  values: breakpointValuesSchema(spacingValueSchema).optional(),
});
