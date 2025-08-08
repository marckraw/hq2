import { z } from "@hono/zod-openapi";
import {
  booleanFieldSchema,
  colorPickerFieldSchema,
  numberFieldSchema,
  optionFieldSchema,
  spacingFieldSchema,
  toggleFieldSchema,
  transitionFieldSchema,
} from "../../../sb-schemas-registry/field-schemas";
import { sitebuilderDesignSchema } from "../../../sb-schemas-registry/site-builder-field-schema";

// Fields specific to sb-section
export const sectionFieldsSchema = z.object({
  spacing: spacingFieldSchema.optional(),
  minimum_height: numberFieldSchema.optional(),
  gap: optionFieldSchema.optional(),
  aspect_ratio: optionFieldSchema.optional(),
  rounded_top: booleanFieldSchema.optional(),
  rounded_bottom: booleanFieldSchema.optional(),
  inner_shadow_top: booleanFieldSchema.optional(),
  inner_shadow_bottom: booleanFieldSchema.optional(),
  background_color: colorPickerFieldSchema.optional(),
  text_color: colorPickerFieldSchema.optional(),
  visibility: toggleFieldSchema.optional(),
  transition: transitionFieldSchema.optional(),
});

// The complete design schema for the sb-section component
export const sbSectionDesignSchema = sitebuilderDesignSchema.extend({
  fields: sectionFieldsSchema,
});

export type SbSectionDesign = z.infer<typeof sbSectionDesignSchema>;
