import { z } from "@hono/zod-openapi";
import {
  colorPickerFieldSchema,
  spacingFieldSchema,
} from "../../../sb-schemas-registry/field-schemas";
import { sitebuilderDesignSchema } from "../../../sb-schemas-registry/site-builder-field-schema";

// Fields specific to sb-headline
export const blockquoteFieldsSchema = z.object({
  spacing: spacingFieldSchema.optional(),
  accent_color: colorPickerFieldSchema.optional(),
  text_color: colorPickerFieldSchema.optional(),
});

// The complete design schema for the sb-blockquote-section component
export const sbBlockquoteSectionDesignSchema = sitebuilderDesignSchema.extend({
  fields: blockquoteFieldsSchema,
});

export const sbBlockquoteFlexGroupDesignSchema = sitebuilderDesignSchema.extend(
  {
    fields: blockquoteFieldsSchema,
  }
);

export type SbBlockquoteSectionDesign = z.infer<
  typeof sbBlockquoteSectionDesignSchema
>;
export type SbBlockquoteFlexGroupDesign = z.infer<
  typeof sbBlockquoteFlexGroupDesignSchema
>;
