import { logger } from "@/utils/logger";
import { z } from "@hono/zod-openapi";

// Storyblok component data schema
export const StoryblokComponentDataSchema = z.object({
  name: z.string(),
  jsonContent: z.string(),
  markdownContent: z.string(),
});

// Storyblok components request schema
export const StoryblokComponentsRequestSchema = z.object({
  components: z.array(StoryblokComponentDataSchema),
});

// Storyblok story schema (simplified)
export const StoryblokStorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  full_slug: z.string(),
  content: z.any(), // Story content can be any structure
  created_at: z.string(),
  updated_at: z.string(),
  published_at: z.string().optional(),
  is_folder: z.boolean(),
  parent_id: z.number().optional(),
  position: z.number(),
  tag_list: z.array(z.string()),
  published: z.boolean(),
  uuid: z.string().optional(),
  lang: z.string().optional(),
  path: z.string().optional(),
  alternates: z.array(z.any()).optional(),
  default_full_slug: z.string().optional(),
  translated_slugs: z.array(z.any()).optional(),
  group_id: z.string().optional(),
  disable_fe_editor: z.boolean().optional(),
});

// Storyblok create response schema
export const StoryblokCreateResponseSchema = z.object({
  story: StoryblokStorySchema,
});

// Storyblok update response schema
export const StoryblokUpdateResponseSchema = z.object({
  story: StoryblokStorySchema,
});

// Storyblok delete response schema
export const StoryblokDeleteResponseSchema = z.object({
  success: z.boolean(),
  story_id: z.number(),
});

// Storyblok list response schema
export const StoryblokListResponseSchema = z.object({
  stories: z.array(StoryblokStorySchema),
  headers: z
    .object({
      total: z.number(),
      per_page: z.number(),
    })
    .optional(),
});

// Storyblok space schema
export const StoryblokSpaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  domain: z.string(),
  version: z.number(),
  plan: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Storyblok asset schema
export const StoryblokAssetSchema = z.object({
  id: z.number(),
  filename: z.string(),
  alt: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  copyright: z.string().optional(),
  content_type: z.string(),
  content_length: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Storyblok component/block field types
export const StoryblokFieldTypeSchema = z.enum([
  "text",
  "textarea",
  "richtext",
  "markdown",
  "number",
  "asset",
  "boolean",
  "option",
  "options",
  "datetime",
  "link",
  "multilink",
  "email",
  "custom",
  "bloks",
  "tab",
  "section",
]);

// Storyblok component schema definition
export const StoryblokComponentSchemaSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  schema: z.record(
    z.object({
      type: StoryblokFieldTypeSchema,
      pos: z.number().optional(),
      translatable: z.boolean().optional(),
      required: z.boolean().optional(),
      description: z.string().optional(),
      default_value: z.any().optional(),
      options: z
        .array(
          z.object({
            name: z.string(),
            value: z.string(),
          })
        )
        .optional(),
      component_whitelist: z.array(z.string()).optional(),
      maximum: z.number().optional(),
      folder_slug: z.string().optional(),
    })
  ),
  image: z.string().optional(),
  preview_field: z.string().optional(),
  is_root: z.boolean().optional(),
  is_nestable: z.boolean().optional(),
  all_presets: z.array(z.any()).optional(),
  presets: z.array(z.any()).optional(),
  real_name: z.string().optional(),
  component_group_uuid: z.string().optional(),
});

// Storyblok API error schema
export const StoryblokErrorSchema = z.object({
  error: z.string(),
  status: z.number(),
  message: z.string().optional(),
  errors: z.record(z.array(z.string())).optional(),
});

// Storyblok publish request schema
export const StoryblokPublishRequestSchema = z.object({
  story_id: z.number(),
  lang: z.string().optional(),
  release_id: z.number().optional(),
});

// Storyblok publish response schema
export const StoryblokPublishResponseSchema = z.object({
  story: StoryblokStorySchema,
});

// Storyblok webhook payload schema
export const StoryblokWebhookPayloadSchema = z.object({
  action: z.enum([
    "published",
    "unpublished",
    "deleted",
    "moved",
    "story_published",
    "story_unpublished",
    "story_deleted",
  ]),
  space_id: z.number(),
  story_id: z.number(),
  text: z.string(),
  user_id: z.number().optional(),
  story: StoryblokStorySchema.optional(),
});

// Search and filtering schemas
export const StoryblokSearchParamsSchema = z.object({
  starts_with: z.string().optional(),
  by_uuids: z.string().optional(),
  by_slugs: z.string().optional(),
  excluding_slugs: z.string().optional(),
  excluding_ids: z.string().optional(),
  with_tag: z.string().optional(),
  is_startpage: z.boolean().optional(),
  sort_by: z.string().optional(),
  search_term: z.string().optional(),
  filter_query: z.record(z.any()).optional(),
  per_page: z.number().min(1).max(1000).optional(),
  page: z.number().min(1).optional(),
});

// Inferred types
export type StoryblokComponentData = z.infer<
  typeof StoryblokComponentDataSchema
>;
export type StoryblokComponentsRequest = z.infer<
  typeof StoryblokComponentsRequestSchema
>;
export type StoryblokStory = z.infer<typeof StoryblokStorySchema>;
export type StoryblokCreateResponse = z.infer<
  typeof StoryblokCreateResponseSchema
>;
export type StoryblokUpdateResponse = z.infer<
  typeof StoryblokUpdateResponseSchema
>;
export type StoryblokDeleteResponse = z.infer<
  typeof StoryblokDeleteResponseSchema
>;
export type StoryblokListResponse = z.infer<typeof StoryblokListResponseSchema>;
export type StoryblokSpace = z.infer<typeof StoryblokSpaceSchema>;
export type StoryblokAsset = z.infer<typeof StoryblokAssetSchema>;
export type StoryblokFieldType = z.infer<typeof StoryblokFieldTypeSchema>;
export type StoryblokComponentSchema = z.infer<
  typeof StoryblokComponentSchemaSchema
>;
export type StoryblokError = z.infer<typeof StoryblokErrorSchema>;
export type StoryblokPublishRequest = z.infer<
  typeof StoryblokPublishRequestSchema
>;
export type StoryblokPublishResponse = z.infer<
  typeof StoryblokPublishResponseSchema
>;
export type StoryblokWebhookPayload = z.infer<
  typeof StoryblokWebhookPayloadSchema
>;
export type StoryblokSearchParams = z.infer<typeof StoryblokSearchParamsSchema>;

// Validation helpers
export const validateStoryblokStory = (
  data: unknown
):
  | { success: true; data: StoryblokStory }
  | { success: false; error: string } => {
  const result = StoryblokStorySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn("Storyblok story validation failed:", result.error.format());
  return { success: false, error: result.error.message };
};

export const validateStoryblokComponentData = (
  data: unknown
):
  | { success: true; data: StoryblokComponentData }
  | { success: false; error: string } => {
  const result = StoryblokComponentDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn(
    "Storyblok component data validation failed:",
    result.error.format()
  );
  return { success: false, error: result.error.message };
};

export const validateStoryblokCreateResponse = (
  data: unknown
):
  | { success: true; data: StoryblokCreateResponse }
  | { success: false; error: string } => {
  const result = StoryblokCreateResponseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn(
    "Storyblok create response validation failed:",
    result.error.format()
  );
  return { success: false, error: result.error.message };
};

export const validateStoryblokWebhookPayload = (
  data: unknown
):
  | { success: true; data: StoryblokWebhookPayload }
  | { success: false; error: string } => {
  const result = StoryblokWebhookPayloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn(
    "Storyblok webhook payload validation failed:",
    result.error.format()
  );
  return { success: false, error: result.error.message };
};

export const validateStoryblokSearchParams = (
  data: unknown
):
  | { success: true; data: StoryblokSearchParams }
  | { success: false; error: string } => {
  const result = StoryblokSearchParamsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn(
    "Storyblok search params validation failed:",
    result.error.format()
  );
  return { success: false, error: result.error.message };
};
