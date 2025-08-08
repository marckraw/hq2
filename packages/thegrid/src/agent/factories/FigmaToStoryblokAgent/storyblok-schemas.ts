import { logger } from "@/utils/logger";
/**
 * Storyblok Component Schemas and Validators
 *
 * This file contains Zod schemas for Storyblok components based on actual
 * exported JSON structures from Storyblok CMS.
 */

import { z } from "@hono/zod-openapi";

// Base Storyblok component schema
export const StoryblokBaseComponentSchema = z.object({
  component: z.string(),
  _uid: z.string(),
});

// Backpack design field schema for responsive design
export const BackpackDesignSchema = z
  .object({
    fields: z
      .record(
        z.object({
          type: z.string(),
          values: z.record(z.any()).optional(),
          field_type: z.string().optional(),
        })
      )
      .optional(),
    plugin: z.string().optional(),
    version: z.string().optional(),
  })
  .optional();

// Rich text content schema (Storyblok's rich text format)
export const RichTextSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(
      z.object({
        type: z.string(),
        content: z
          .array(
            z.object({
              text: z.string(),
              type: z.literal("text"),
              marks: z
                .array(
                  z.object({
                    type: z.string(),
                    attrs: z.record(z.any()).optional(),
                  })
                )
                .optional(),
            })
          )
          .optional(),
      })
    ),
  })
  .optional();

// Common field types used across Storyblok components
export const StoryblokFieldSchemas = {
  // Text field
  text: z.string().optional(),

  // Rich text field (Storyblok's doc format)
  richtext: RichTextSchema,

  // Asset field (image/video)
  asset: z
    .object({
      id: z.number().optional(),
      alt: z.string().optional(),
      name: z.string().optional(),
      focus: z.string().optional(),
      title: z.string().optional(),
      filename: z.string(),
      copyright: z.string().optional(),
      fieldtype: z.literal("asset").optional(),
    })
    .optional(),

  // Link field
  link: z
    .object({
      id: z.string().optional(),
      url: z.string().optional(),
      linktype: z.enum(["story", "asset", "url", "email"]).optional(),
      fieldtype: z.literal("link").optional(),
      cached_url: z.string().optional(),
    })
    .optional(),

  // Boolean field
  boolean: z.boolean().optional(),

  // Number field
  number: z.number().optional(),

  // Option field (single select)
  option: z.string().optional(),

  // Options field (multi select)
  options: z.array(z.string()).optional(),

  // Bloks field (nested components)
  bloks: z.array(z.any()).optional(),

  // Design field (Backpack responsive design)
  design: BackpackDesignSchema,

  // Custom classname
  custom_classname: z.string().optional(),
};

// Page Component Schema (root level)
export const PageSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("page"),
  body: z.array(z.any()), // Array of nested components
  no_index: z.boolean().optional(),
  canonical: z
    .object({
      id: z.string().optional(),
      url: z.string().optional(),
      linktype: z.string().optional(),
      fieldtype: z.string().optional(),
      cached_url: z.string().optional(),
    })
    .optional(),
  no_follow: z.boolean().optional(),
  seo_meta_fields: z.string().optional(),
  structured_data: z.string().optional(),
  background_color: z
    .object({
      _uid: z.string(),
      title: z.string(),
      plugin: z.string(),
      selected: z.object({
        name: z.string(),
        value: z.string(),
      }),
      description: z.string(),
    })
    .optional(),
});

// Section Component Schema
export const SectionSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("sb-section"),
  name: z.string().optional(),
  design: BackpackDesignSchema,
  content: z.array(z.any()), // Array of nested components
  backpack_ai: z.string().optional(),
  custom_classname: z.string().optional(),
});

// Blockquote Section Component Schema
export const BlockquoteSectionSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("sb-blockquote-section"),
  design: BackpackDesignSchema,
  content: RichTextSchema,
  citation: RichTextSchema,
  custom_classname: z.string().optional(),
});

// Text Section Component Schema
export const TextSectionSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("sb-text-section"),
  design: BackpackDesignSchema,
  content: RichTextSchema,
  custom_classname: z.string().optional(),
});

// Headline Section Component Schema
export const HeadlineSectionSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("sb-headline-section"),
  design: BackpackDesignSchema,
  content: RichTextSchema,
  custom_classname: z.string().optional(),
});

// Example: Hero Section Component Schema
// Based on actual Storyblok export - replace with your real schema
export const HeroSectionSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("sb-hero-section"),
  title: StoryblokFieldSchemas.text,
  subtitle: StoryblokFieldSchemas.text,
  description: StoryblokFieldSchemas.richtext,
  background_image: StoryblokFieldSchemas.asset,
  cta_button: StoryblokFieldSchemas.link,
  cta_text: StoryblokFieldSchemas.text,
  alignment: z.enum(["left", "center", "right"]).optional(),
  show_cta: StoryblokFieldSchemas.boolean,
});

// Example: Editorial Card Component Schema
export const EditorialCardSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("sb-editorial-card-section"),
  title: StoryblokFieldSchemas.text,
  paragraph: StoryblokFieldSchemas.richtext,
  image: StoryblokFieldSchemas.asset,
  link: StoryblokFieldSchemas.link,
  show_link: StoryblokFieldSchemas.boolean,
  aspect_ratio: z.enum(["1:1", "16:9", "4:3", "3:2"]).optional(),
  eyebrow: StoryblokFieldSchemas.text,
  show_eyebrow: StoryblokFieldSchemas.boolean,
});

// Example: Button Component Schema
export const ButtonSchema = StoryblokBaseComponentSchema.extend({
  component: z.literal("sb-button"),
  label: StoryblokFieldSchemas.text,
  link: StoryblokFieldSchemas.link,
  variant: z.enum(["primary", "secondary", "outline", "ghost"]).optional(),
  size: z.enum(["small", "medium", "large"]).optional(),
  icon: StoryblokFieldSchemas.text,
  icon_position: z.enum(["left", "right"]).optional(),
  full_width: StoryblokFieldSchemas.boolean,
});

// Type inference from schemas
export type PageComponent = z.infer<typeof PageSchema>;
export type SectionComponent = z.infer<typeof SectionSchema>;
export type BlockquoteSectionComponent = z.infer<
  typeof BlockquoteSectionSchema
>;
export type TextSectionComponent = z.infer<typeof TextSectionSchema>;
export type HeadlineSectionComponent = z.infer<typeof HeadlineSectionSchema>;
export type HeroSectionComponent = z.infer<typeof HeroSectionSchema>;
export type EditorialCardComponent = z.infer<typeof EditorialCardSchema>;
export type ButtonComponent = z.infer<typeof ButtonSchema>;

// Schema registry for validation
export const StoryblokSchemaRegistry = {
  page: PageSchema,
  "sb-section": SectionSchema,
  "sb-blockquote-section": BlockquoteSectionSchema,
  "sb-text-section": TextSectionSchema,
  "sb-headline-section": HeadlineSectionSchema,
  "sb-hero-section": HeroSectionSchema,
  "sb-editorial-card-section": EditorialCardSchema,
  "sb-button": ButtonSchema,
} as const;

// Utility function to validate a component against its schema
export const validateStoryblokComponent = (
  component: any,
  componentType?: string
): { valid: boolean; errors?: string[]; data?: any } => {
  const type = componentType || component.component;
  const schema =
    StoryblokSchemaRegistry[type as keyof typeof StoryblokSchemaRegistry];

  if (!schema) {
    return {
      valid: false,
      errors: [`No schema found for component type: ${type}`],
    };
  }

  try {
    const validatedData = schema.parse(component);
    return {
      valid: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ),
      };
    }
    return {
      valid: false,
      errors: [`Validation error: ${error}`],
    };
  }
};

// Helper to create a validated transformer
export const createValidatedTransformer = <T extends z.ZodType>(
  schema: T,
  transformer: (node: any, options?: any) => z.infer<T>
) => {
  return (node: any, options?: any) => {
    const result = transformer(node, options);
    const validation = schema.safeParse(result);

    if (!validation.success) {
      logger.warn(`Transformer validation failed:`, validation.error.errors);
      // Return the result anyway but log the validation errors
      // In production, you might want to throw or handle this differently
    }

    return result;
  };
};

// Export utility types
export type StoryblokComponentType = keyof typeof StoryblokSchemaRegistry;
export type ValidatedComponent<T extends StoryblokComponentType> = z.infer<
  (typeof StoryblokSchemaRegistry)[T]
>;
