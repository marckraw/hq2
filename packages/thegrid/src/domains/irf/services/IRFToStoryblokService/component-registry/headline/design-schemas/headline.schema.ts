import { z } from "@hono/zod-openapi";
import {
  booleanFieldSchema,
  colorPickerFieldSchema,
  layoutFieldSchema,
  numberFieldSchema,
  spacingFieldSchema,
  textVariantEnum,
  toggleFieldSchema,
} from "../../../sb-schemas-registry/field-schemas";
import { sitebuilderDesignSchema } from "../../../sb-schemas-registry/site-builder-field-schema";

// Fields specific to sb-headline
export const headlineFieldsSchema = z.object({
  order: numberFieldSchema.optional(),
  position: layoutFieldSchema.optional(),
  spacing: spacingFieldSchema.optional(),
  visibility: toggleFieldSchema.optional(),
  transitionsOnEnter: booleanFieldSchema.optional(),
  variant: textVariantEnum.optional(),
  text_align: toggleFieldSchema.optional(),
  animated: booleanFieldSchema.optional(),
  text_color: colorPickerFieldSchema.optional(),
});

// The complete design schema for the sb-headline component
export const sbHeadlineDesignSchema = sitebuilderDesignSchema.extend({
  fields: headlineFieldsSchema,
});

// Typescript Types
export type SbHeadlineDesign = z.infer<typeof sbHeadlineDesignSchema>;
