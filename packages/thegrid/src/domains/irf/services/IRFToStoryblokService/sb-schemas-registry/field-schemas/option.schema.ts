import { z } from "@hono/zod-openapi";
import { breakpointValuesSchema } from "./main.schema";
// Schema for standard option fields
export const optionFieldSchema = z.object({
  type: z.literal("option"),
  values: breakpointValuesSchema(z.string()).optional(),
});
