import { createRoute, z } from "@hono/zod-openapi";

// Request/Response schemas
const StoryblokComponentDataSchema = z.object({
  name: z.string(),
  jsonContent: z.any(),
  markdownContent: z.string(),
});

const StoryblokComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  jsonContent: z.any(),
  markdownContent: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ComponentSuccessResponseSchema = z.object({
  success: z.boolean(),
  component: StoryblokComponentSchema,
});

const ComponentsListResponseSchema = z.array(StoryblokComponentSchema);

const ComponentNamesResponseSchema = z.array(
  z.object({
    name: z.string(),
  })
);

const ErrorResponseSchema = z.object({
  error: z.string(),
});

// Route definitions
export const createOrUpdateComponentRoute = createRoute({
  method: "post",
  path: "/components",
  summary: "Create or update a Storyblok component",
  description: "Creates a new Storyblok component or updates an existing one based on the component name",
  tags: ["Storyblok Components"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: StoryblokComponentDataSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Component created or updated successfully",
      content: {
        "application/json": {
          schema: ComponentSuccessResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getAllComponentsRoute = createRoute({
  method: "get",
  path: "/components",
  summary: "Get all Storyblok components",
  description: "Retrieves all stored Storyblok components",
  tags: ["Storyblok Components"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of all components",
      content: {
        "application/json": {
          schema: ComponentsListResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getComponentNamesRoute = createRoute({
  method: "get",
  path: "/component-names",
  summary: "Get all component names",
  description: "Retrieves only the names of all stored Storyblok components",
  tags: ["Storyblok Components"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of component names",
      content: {
        "application/json": {
          schema: ComponentNamesResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getComponentByNameRoute = createRoute({
  method: "get",
  path: "/components/{name}",
  summary: "Get a component by name",
  description: "Retrieves a specific Storyblok component by its name",
  tags: ["Storyblok Components"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      name: z.string().describe("Component name"),
    }),
  },
  responses: {
    200: {
      description: "Component found",
      content: {
        "application/json": {
          schema: StoryblokComponentSchema,
        },
      },
    },
    404: {
      description: "Component not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});