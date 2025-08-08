import { z } from "@hono/zod-openapi";

// Base schema for values that are keyed by breakpoint (s, m, l)
export const breakpointValuesSchema = <T extends z.ZodTypeAny>(
  valueSchema: T
) =>
  z
    .object({
      s: valueSchema.optional(),
      m: valueSchema.optional(),
      l: valueSchema.optional(),
    })
    .partial();
