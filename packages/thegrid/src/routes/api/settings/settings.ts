import { logger } from "@/utils/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { serviceRegistry } from "../../../registry/service-registry";
import { serializeRecord, serializeRecords } from "../shared/serializers";
import {
  AgentSettingsSchema,
  PromptSettingsSchema,
  InterfaceSettingsSchema,
  NotificationSettingsSchema,
} from "./validation";
import {
  getSettingsRoute,
  getGroupedSettingsRoute,
  getSpecificSettingRoute,
  createSettingRoute,
  bulkUpdateSettingsRoute,
  deleteSettingRoute,
  initializeSettingsRoute,
} from "./settings.routes";

export const settingsRouter = new OpenAPIHono();

// GET /api/settings - Get all settings or by category
// @ts-expect-error - OpenAPI type inference issue with response union types
settingsRouter.openapi(getSettingsRoute, async (c) => {
  try {
    const category = c.req.query("category") as any;
    const settings = await serviceRegistry.get("settings").getSettings(category);

    return c.json({
      success: true,
      data: serializeRecords(settings),
    } as const, 200);
  } catch (error) {
    logger.error("Error fetching settings:", error);
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "SETTINGS_FETCH_ERROR",
        },
      } as const,
      500
    );
  }
});

// GET /api/settings/grouped - Get settings grouped by category (convenient for frontend)
// @ts-expect-error - OpenAPI type inference issue with response union types
settingsRouter.openapi(getGroupedSettingsRoute, async (c) => {
  try {
    const settings = await serviceRegistry.get("settings").getGroupedSettings();

    return c.json({
      success: true,
      data: settings,
    } as const, 200);
  } catch (error) {
    logger.error("Error fetching grouped settings:", error);
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "SETTINGS_FETCH_ERROR",
        },
      } as const,
      500
    );
  }
});

// GET /api/settings/:category/:key - Get a specific setting
// @ts-expect-error - OpenAPI type inference issue with response union types
settingsRouter.openapi(getSpecificSettingRoute, async (c) => {
  try {
    const category = c.req.param("category") as any;
    const key = c.req.param("key");

    const setting = await serviceRegistry.get("settings").getSetting(category, key);

    if (!setting) {
      return c.json(
        {
          success: false,
          error: {
            message: "Setting not found",
            code: "SETTING_NOT_FOUND",
          },
        } as const,
        404
      );
    }

    return c.json({
      success: true,
      data: serializeRecord(setting),
    } as const, 200);
  } catch (error) {
    logger.error("Error fetching setting:", error);
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "SETTING_FETCH_ERROR",
        },
      } as const,
      500
    );
  }
});

// POST /api/settings - Create or update a setting
// @ts-expect-error - OpenAPI type inference issue with response union types
settingsRouter.openapi(createSettingRoute, async (c) => {
    try {
      const data = c.req.valid("json");

      // Validate value based on category
      try {
        switch (data.category) {
          case "agent":
            AgentSettingsSchema.partial().parse({ [data.key]: data.value });
            break;
          case "prompts":
            PromptSettingsSchema.partial().parse({ [data.key]: data.value });
            break;
          case "interface":
            InterfaceSettingsSchema.partial().parse({ [data.key]: data.value });
            break;
          case "notifications":
            NotificationSettingsSchema.partial().parse({
              [data.key]: data.value,
            });
            break;
        }
      } catch (validationError) {
        return c.json(
          {
            success: false,
            error: {
              message: `Invalid value for ${data.category}.${data.key}`,
              code: "INVALID_SETTING_VALUE",
              details: validationError,
            },
          } as const,
          400
        );
      }

      const setting = await serviceRegistry.get("settings").upsertSetting(data);

      return c.json({
        success: true,
        data: serializeRecord(setting),
      } as const, 200);
    } catch (error) {
      logger.error("Error creating/updating setting:", error);
      return c.json(
        {
          success: false,
          error: {
            message: (error as any).message,
            code: "SETTING_UPSERT_ERROR",
          },
        },
        500
      );
    }
  }
);

// PUT /api/settings/bulk - Bulk update settings (convenient for frontend)
// @ts-expect-error - OpenAPI type inference issue with response union types
settingsRouter.openapi(bulkUpdateSettingsRoute, async (c) => {
    try {
      const data = c.req.valid("json");

      const results = await serviceRegistry.get("settings").bulkUpdateSettings(data);

      return c.json({
        success: true,
        data: serializeRecords(results),
        message: `Updated ${results.length} settings`,
      } as const, 200);
    } catch (error) {
      logger.error("Error bulk updating settings:", error);
      return c.json(
        {
          success: false,
          error: {
            message: (error as any).message,
            code: "SETTINGS_BULK_UPDATE_ERROR",
          },
        },
        500
      );
    }
  }
);

// DELETE /api/settings/:category/:key - Delete a setting
// @ts-expect-error - OpenAPI type inference issue with response union types
settingsRouter.openapi(deleteSettingRoute, async (c) => {
  try {
    const category = c.req.param("category") as any;
    const key = c.req.param("key");

    const deleted = await serviceRegistry.get("settings").deleteSetting(category, key);

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: {
            message: "Setting not found",
            code: "SETTING_NOT_FOUND",
          },
        } as const,
        404
      );
    }

    return c.json({
      success: true,
      data: serializeRecord(deleted),
      message: "Setting deleted successfully",
    } as const, 200);
  } catch (error) {
    logger.error("Error deleting setting:", error);
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "SETTING_DELETE_ERROR",
        },
      } as const,
      500
    );
  }
});

// POST /api/settings/initialize - Initialize default settings
// @ts-expect-error - OpenAPI type inference issue with response union types
settingsRouter.openapi(initializeSettingsRoute, async (c) => {
  try {
    const results = await serviceRegistry.get("settings").initializeDefaultSettings();

    return c.json({
      success: true,
      data: serializeRecords(results),
      message: `Initialized ${results.length} default settings`,
    } as const, 200);
  } catch (error) {
    logger.error("Error initializing default settings:", error);
    return c.json(
      {
        success: false,
        error: {
          message: (error as any).message,
          code: "SETTINGS_INITIALIZE_ERROR",
        },
      } as const,
      500
    );
  }
});
