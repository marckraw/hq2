import { z } from "@hono/zod-openapi";
import {
  booleanFieldSchema,
  layoutFieldSchema,
  numberFieldSchema,
  optionFieldSchema,
  spacingFieldSchema,
  toggleFieldSchema,
} from "../../../sb-schemas-registry/field-schemas";
import { sitebuilderDesignSchema } from "../../../sb-schemas-registry/site-builder-field-schema";

// Fields specific to sb-list
export const listFieldsSchema = z.object({
  order: numberFieldSchema.optional(),
  position: layoutFieldSchema.optional(),
  spacing: spacingFieldSchema.optional(),
  visibility: toggleFieldSchema.optional(),
  transitionsOnEnter: booleanFieldSchema.optional(),
  variant: optionFieldSchema.optional(),
  layout: optionFieldSchema.optional(),
  marker: optionFieldSchema.optional(),
  item_spacing: optionFieldSchema.optional(),
  inverse: booleanFieldSchema.optional(),
  item_divider: booleanFieldSchema.optional(),
});

// The complete design schema for the sb-list component
export const sbListDesignSchema = sitebuilderDesignSchema.extend({
  fields: listFieldsSchema,
});

export type SbListDesign = z.infer<typeof sbListDesignSchema>;
