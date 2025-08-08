/**
 * This file contains the design intent schema for the design intent mapper service.
 * It is used to describe the design intent for a node.
 * It is used to describe the visual styling of a component.
 * It defined what kind of design intent the user has, and how it should be translated into the IRF.
 *
 * It is the intention of the user, for LLM to generate proper design part of the IRF
 */
import { z } from "@hono/zod-openapi";

// Describes the intent for spacing and dimensions. Values can be numbers or CSS strings.
const sizeValueSchema = z.union([z.number(), z.string()]);

// A structured way to define padding.
const paddingSchema = z
  .object({
    // TODO: deprecate left/right for start/end in future
    top: sizeValueSchema.optional(),
    bottom: sizeValueSchema.optional(),
    left: sizeValueSchema.optional(),
    right: sizeValueSchema.optional(),
  })
  .optional();

// Describes the intent for layout properties, mirroring simplified Flexbox.
const layoutIntentSchema = z
  .object({
    direction: z.enum(["horizontal", "vertical"]).optional(),
    width: sizeValueSchema.optional(),
    height: sizeValueSchema.optional(),
    padding: paddingSchema,
    gap: sizeValueSchema.optional(),
    alignItems: z.string().optional(),
    justifyContent: z.string().optional(),
  })
  .optional();

// Describes the intent for visual appearance. Colors are strings.
const appearanceIntentSchema = z
  .object({
    backgroundColor: z
      .union([
        z.string(),
        z.object({
          imageRef: z.string(),
        }),
      ])
      .optional(),
    textColor: z.string().optional(),
    borderColor: z.string().optional(),
    borderRadius: sizeValueSchema.optional(),
    opacity: z.number().min(0).max(1).optional(),
    withPointer: z.boolean().optional(),
  })
  .optional();

// Describes the intent for typography.
const typographyIntentSchema = z
  .object({
    fontSize: sizeValueSchema.optional(),
    fontWeight: z.number().optional(),
    fontFamily: z.string().optional(),
    // TODO: deprecate left/right for start/end in future
    textAlign: z.enum(["left", "center", "right", "justify", "start", "end"]).optional(),
    lineHeight: sizeValueSchema.optional(),
    color: z.string().optional(), // Can override appearance.textColor for specificity
  })
  .optional();

/**
 * The main Design Intent Schema.
 * This structure is LLM-friendly and can be deterministically mapped
 * to the final Storyblok component design schema.
 */
export const designIntentSchema = z.object({
  layout: layoutIntentSchema,
  appearance: appearanceIntentSchema,
  typography: typographyIntentSchema,
});

export type DesignIntent = z.infer<typeof designIntentSchema>;
