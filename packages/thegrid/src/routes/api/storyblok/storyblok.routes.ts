import { createRoute, z } from "@hono/zod-openapi";

// Response schemas
const SpaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  domain: z.string().optional(),
  plan: z.string().optional(),
});

const StorySchema = z.object({
  id: z.number(),
  uuid: z.string(),
  name: z.string(),
  slug: z.string(),
  full_slug: z.string().optional(),
  content: z.any().optional(),
  created_at: z.string().optional(),
  published_at: z.string().optional(),
});

const SpacesListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SpaceSchema),
  count: z.number(),
  totalCount: z.number(),
  searchTerm: z.string().nullable(),
});

const StoriesListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(StorySchema),
  count: z.number(),
  totalCount: z.number(),
  spaceId: z.string(),
  searchTerm: z.string().nullable(),
});

const StoryContentResponseSchema = z.object({
  success: z.boolean(),
  data: StorySchema,
  spaceId: z.string(),
  storyId: z.string(),
});

const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
  details: z.string().optional(),
});

// Route definitions
export const getSpacesRoute = createRoute({
  method: "get",
  path: "/spaces",
  summary: "Get available Storyblok spaces",
  description: "Retrieves all available Storyblok spaces with optional search filtering",
  tags: ["Storyblok"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      search: z.string().optional().describe("Search term to filter spaces by name (min 3 characters)"),
    }),
  },
  responses: {
    200: {
      description: "List of Storyblok spaces",
      content: {
        "application/json": {
          schema: SpacesListResponseSchema,
        },
      },
    },
    500: {
      description: "Error fetching spaces",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getStoriesRoute = createRoute({
  method: "get",
  path: "/spaces/{spaceId}/stories",
  summary: "Get stories from a space",
  description: "Retrieves all stories from a specific Storyblok space with optional search filtering",
  tags: ["Storyblok"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      spaceId: z.string().describe("Storyblok space ID"),
    }),
    query: z.object({
      search: z.string().optional().describe("Search term to filter stories by slug (min 3 characters)"),
    }),
  },
  responses: {
    200: {
      description: "List of stories from the space",
      content: {
        "application/json": {
          schema: StoriesListResponseSchema,
        },
      },
    },
    400: {
      description: "Missing space ID",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error fetching stories",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getStoryContentRoute = createRoute({
  method: "get",
  path: "/spaces/{spaceId}/stories/{storyId}",
  summary: "Get story content",
  description: "Retrieves the content of a specific story from a Storyblok space",
  tags: ["Storyblok"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      spaceId: z.string().describe("Storyblok space ID"),
      storyId: z.string().describe("Story ID"),
    }),
  },
  responses: {
    200: {
      description: "Story content retrieved successfully",
      content: {
        "application/json": {
          schema: StoryContentResponseSchema,
        },
      },
    },
    400: {
      description: "Missing space ID or story ID",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error fetching story content",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});