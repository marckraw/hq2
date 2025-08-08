import { createRoute, z } from "@hono/zod-openapi";
import {
  SettingCategoryEnum,
  CreateSettingRequestSchema,
  BulkUpdateSettingsRequestSchema,
  SettingResponseSchema,
  SettingsResponseSchema,
} from "./validation";

// Common response schemas
const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
    code: z.string(),
    details: z.any().optional(),
  }),
});

// Route definitions
export const getSettingsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all settings or filter by category",
  description: "Retrieves all settings or settings from a specific category",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      category: SettingCategoryEnum.optional().describe("Filter by category"),
    }),
  },
  responses: {
    200: {
      description: "Settings retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: SettingsResponseSchema,
          }),
        },
      },
    },
    500: {
      description: "Error retrieving settings",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getGroupedSettingsRoute = createRoute({
  method: "get",
  path: "/grouped",
  summary: "Get settings grouped by category",
  description: "Retrieves all settings organized by their categories for convenient frontend usage",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Grouped settings retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.record(SettingCategoryEnum, SettingsResponseSchema),
          }),
        },
      },
    },
    500: {
      description: "Error retrieving grouped settings",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getSpecificSettingRoute = createRoute({
  method: "get",
  path: "/{category}/{key}",
  summary: "Get a specific setting",
  description: "Retrieves a single setting by category and key",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      category: SettingCategoryEnum.describe("Setting category"),
      key: z.string().describe("Setting key"),
    }),
  },
  responses: {
    200: {
      description: "Setting retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: SettingResponseSchema,
          }),
        },
      },
    },
    404: {
      description: "Setting not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error retrieving setting",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const createSettingRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create or update a setting",
  description: "Creates a new setting or updates an existing one",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSettingRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Setting created/updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: SettingResponseSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid setting value",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error creating/updating setting",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const bulkUpdateSettingsRoute = createRoute({
  method: "put",
  path: "/bulk",
  summary: "Bulk update settings",
  description: "Updates multiple settings across different categories in a single request",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: BulkUpdateSettingsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Settings updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: SettingsResponseSchema,
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error bulk updating settings",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const deleteSettingRoute = createRoute({
  method: "delete",
  path: "/{category}/{key}",
  summary: "Delete a setting",
  description: "Deletes a specific setting by category and key",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      category: SettingCategoryEnum.describe("Setting category"),
      key: z.string().describe("Setting key"),
    }),
  },
  responses: {
    200: {
      description: "Setting deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: SettingResponseSchema,
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Setting not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error deleting setting",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const initializeSettingsRoute = createRoute({
  method: "post",
  path: "/initialize",
  summary: "Initialize default settings",
  description: "Initializes all default settings for the application",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Settings initialized successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: SettingsResponseSchema,
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error initializing settings",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});