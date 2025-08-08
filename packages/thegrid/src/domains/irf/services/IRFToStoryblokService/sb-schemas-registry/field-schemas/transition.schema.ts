import { z } from "@hono/zod-openapi";
import { breakpointValuesSchema } from "./main.schema";

// Schema for backpack-transition values
export const transitionValueSchema = z.object({
  config: z.object({
    effect: z.string(),
    triggerOnce: z.boolean(),
  }),
  enabled: z.string(),
  classNames: z.object({
    after: z.string(),
    before: z.string(),
  }),
  transitionConfig: z.object({
    easing: z.string(),
    stagger: z.number(),
    duration: z.string(),
    transitionProperty: z.string(),
  }),
});

export const transitionFieldSchema = z.object({
  type: z.literal("custom"),
  field_type: z.literal("backpack-transition"),
  values: breakpointValuesSchema(transitionValueSchema).optional(),
});
