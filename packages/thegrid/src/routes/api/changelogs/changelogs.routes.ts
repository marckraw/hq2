import { createRoute, z } from "@hono/zod-openapi";
import { changelogRequestSchema } from "./validation/changelog";

// Response schemas
const ChangelogSchema = z.object({
  id: z.string(),
  repoOwner: z.string(),
  repoName: z.string(),
  prNumber: z.string(),
  title: z.string().nullable(),
  summary: z.string().nullable(),
  commits: z.any(),
  releaseDate: z.string().nullable(),
  createdBy: z.string().nullable(),
  published: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ChangelogSuccessResponseSchema = z.object({
  success: z.boolean(),
  data: ChangelogSchema,
});

const ChangelogsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ChangelogSchema),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
  }),
});

const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});

// Route definitions
export const getChangelogsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all changelogs",
  description: "Retrieves all changelogs with optional pagination",
  tags: ["Changelogs"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional().describe("Number of items to return (default: 50)"),
      offset: z.string().optional().describe("Number of items to skip (default: 0)"),
    }),
  },
  responses: {
    200: {
      description: "List of changelogs with pagination info",
      content: {
        "application/json": {
          schema: ChangelogsListResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving changelogs",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getChangelogByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get a changelog by ID",
  description: "Retrieves a single changelog by its ID",
  tags: ["Changelogs"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Changelog ID"),
    }),
  },
  responses: {
    200: {
      description: "Changelog found",
      content: {
        "application/json": {
          schema: ChangelogSuccessResponseSchema,
        },
      },
    },
    404: {
      description: "Changelog not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving changelog",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const createChangelogRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create a new changelog",
  description: "Creates a new changelog entry with the provided data",
  tags: ["Changelogs"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: changelogRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Changelog created successfully",
      content: {
        "application/json": {
          schema: ChangelogSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error creating changelog",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const updateChangelogRoute = createRoute({
  method: "put",
  path: "/{id}",
  summary: "Update a changelog",
  description: "Updates an existing changelog with the provided data",
  tags: ["Changelogs"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Changelog ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: changelogRequestSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Changelog updated successfully",
      content: {
        "application/json": {
          schema: ChangelogSuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Changelog not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error updating changelog",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const publishChangelogRoute = createRoute({
  method: "post",
  path: "/{id}/publish",
  summary: "Publish a changelog",
  description: "Marks a changelog as published",
  tags: ["Changelogs"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Changelog ID"),
    }),
  },
  responses: {
    200: {
      description: "Changelog published successfully",
      content: {
        "application/json": {
          schema: ChangelogSuccessResponseSchema,
        },
      },
    },
    404: {
      description: "Changelog not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error publishing changelog",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});