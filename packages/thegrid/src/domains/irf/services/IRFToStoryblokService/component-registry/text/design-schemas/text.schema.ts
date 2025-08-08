import { z } from "@hono/zod-openapi";
import {
  booleanFieldSchema,
  colorPickerFieldSchema,
  layoutFieldSchema,
  numberFieldSchema,
  spacingFieldSchema,
  toggleFieldSchema,
  variantOptionFieldSchema,
} from "../../../sb-schemas-registry/field-schemas";
import { sitebuilderDesignSchema } from "../../../sb-schemas-registry/site-builder-field-schema";
// Fields specific to sb-text
export const textFieldsSchema = z.object({
  order: numberFieldSchema.optional(),
  position: layoutFieldSchema.optional(),
  spacing: spacingFieldSchema.optional(),
  visibility: toggleFieldSchema.optional(),
  transitionsOnEnter: booleanFieldSchema.optional(),
  variant: variantOptionFieldSchema.optional(),
  text_align: toggleFieldSchema.optional(),
  text_color: colorPickerFieldSchema.optional(),
  link_text_color: colorPickerFieldSchema.optional(),
  link_text_hover_color: colorPickerFieldSchema.optional(),
});

// The complete design schema for the sb-text component
export const sbTextDesignSchema = sitebuilderDesignSchema.extend({
  fields: textFieldsSchema,
});

export type SbTextDesign = z.infer<typeof sbTextDesignSchema>;
