import { z } from "@hono/zod-openapi";
import { breakpointValuesSchema } from "./main.schema";

// A specific enum for text/headline variants based on the GUI screenshot
export const textVariantEnum = z.enum([
  "none",
  "displaycaps",
  "display1",
  "display2",
  "header1",
  "header2",
  "header3",
  "header4",
  "header5",
  "body",
  "small",
]);

// A more specific schema for the variant option field
export const variantOptionFieldSchema = z.object({
  type: z.literal("option"),
  values: breakpointValuesSchema(textVariantEnum).optional(),
});
