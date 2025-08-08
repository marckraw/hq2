import { z } from "@hono/zod-openapi";

import { booleanFieldSchema } from "./field-schemas/boolean.schema";
import { colorPickerFieldSchema } from "./field-schemas/color-picker.schema";
import { genericCustomFieldSchema } from "./field-schemas/generic-custom.schema";
import { layoutFieldSchema } from "./field-schemas/layout.schema";
import { numberFieldSchema } from "./field-schemas/number.schema";
import { optionFieldSchema } from "./field-schemas/option.schema";
import { spacingFieldSchema } from "./field-schemas/spacing.schema";
import { toggleFieldSchema } from "./field-schemas/toggle.schema";
import { transitionFieldSchema } from "./field-schemas/transition.schema";

// A single design field in Storyblok can be one of the above schemas
export const sitebuilderFieldSchema = z.union([
  spacingFieldSchema,
  colorPickerFieldSchema,
  toggleFieldSchema,
  layoutFieldSchema,
  transitionFieldSchema,
  optionFieldSchema,
  booleanFieldSchema,
  numberFieldSchema,
  genericCustomFieldSchema, // Fallback must be last
]);

// The `fields` object is a record of these individual field schemas
export const sitebuilderFieldsSchema = z.record(sitebuilderFieldSchema);

// The complete design object for a Storyblok component
export const sitebuilderDesignSchema = z.object({
  fields: sitebuilderFieldsSchema,
  plugin: z.string().optional(),
  version: z.string().optional(),
});

// type for the design object
export type SitebuilderDesign = z.infer<typeof sitebuilderDesignSchema>;
