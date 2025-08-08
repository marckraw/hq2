import { z } from "@hono/zod-openapi";
import { breakpointValuesSchema } from "./main.schema";

// Schema for backpack-color-picker values
export const colorValueSchema = z.object({
  selected: z.object({
    id: z.number(),
    name: z.string(),
    value: z.string(),
    dimension_value: z.any().nullable(),
  }),
});

export const colorPickerFieldSchema = z.object({
  type: z.literal("custom"),
  field_type: z.literal("backpack-color-picker"),
  values: breakpointValuesSchema(colorValueSchema).optional(),
});
