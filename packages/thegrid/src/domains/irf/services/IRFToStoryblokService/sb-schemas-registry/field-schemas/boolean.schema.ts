import { z } from "@hono/zod-openapi";
import { breakpointValuesSchema } from "./main.schema";
// Schema for standard boolean fields
export const booleanFieldSchema = z.object({
  type: z.literal("boolean"),
  values: breakpointValuesSchema(z.enum(["true", "false"])).optional(),
});
