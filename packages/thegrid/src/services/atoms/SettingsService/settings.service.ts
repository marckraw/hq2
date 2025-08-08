import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { settings } from "../../../db/schema/settings";
import { pool } from "../../../db";
import type {
  SettingCategory,
  CreateSettingRequest,
  UpdateSettingRequest,
  AgentSettings,
  PromptSettings,
  InterfaceSettings,
  NotificationSettings,
} from "../../../routes/api/settings/validation";

export const createSettingsService = () => {
  const db = drizzle(pool);

  // Get all settings or by category
  const getSettings = async (category?: SettingCategory) => {
    if (category) {
      return db
        .select()
        .from(settings)
        .where(eq(settings.category, category))
        .orderBy(settings.key);
    }

    return db.select().from(settings).orderBy(settings.category, settings.key);
  };

  // Get a specific setting
  const getSetting = async (category: SettingCategory, key: string) => {
    const result = await db
      .select()
      .from(settings)
      .where(and(eq(settings.category, category), eq(settings.key, key)))
      .limit(1);

    return result[0] || null;
  };

  // Create or update a setting (upsert)
  const upsertSetting = async (
    data: CreateSettingRequest | UpdateSettingRequest
  ) => {
    const existing = await getSetting(data.category, data.key);

    if (existing) {
      // Update existing setting
      const [updated] = await db
        .update(settings)
        .set({
          value: data.value,
          description: data.description ?? null,
          updatedAt: new Date(),
        })
        .where(
          and(eq(settings.category, data.category), eq(settings.key, data.key))
        )
        .returning();

      return updated;
    } else {
      // Create new setting
      const [created] = await db
        .insert(settings)
        .values({
          category: data.category,
          key: data.key,
          value: data.value,
          description: data.description ?? null,
        })
        .returning();

      return created;
    }
  };

  // Delete a setting
  const deleteSetting = async (category: SettingCategory, key: string) => {
    const [deleted] = await db
      .delete(settings)
      .where(and(eq(settings.category, category), eq(settings.key, key)))
      .returning();

    return deleted || null;
  };

  // Bulk update settings (for frontend convenience)
  const bulkUpdateSettings = async (settingsData: {
    agent?: Partial<AgentSettings>;
    prompts?: Partial<PromptSettings>;
    interface?: Partial<InterfaceSettings>;
    notifications?: Partial<NotificationSettings>;
  }) => {
    const results = [];

    // Update agent settings
    if (settingsData.agent) {
      for (const [key, value] of Object.entries(settingsData.agent)) {
        if (value !== undefined) {
          const result = await upsertSetting({
            category: "agent",
            key,
            value,
          });
          results.push(result);
        }
      }
    }

    // Update prompt settings
    if (settingsData.prompts) {
      for (const [key, value] of Object.entries(settingsData.prompts)) {
        if (value !== undefined) {
          const result = await upsertSetting({
            category: "prompts",
            key,
            value,
          });
          results.push(result);
        }
      }
    }

    // Update interface settings
    if (settingsData.interface) {
      for (const [key, value] of Object.entries(settingsData.interface)) {
        if (value !== undefined) {
          const result = await upsertSetting({
            category: "interface",
            key,
            value,
          });
          results.push(result);
        }
      }
    }

    // Update notification settings
    if (settingsData.notifications) {
      for (const [key, value] of Object.entries(settingsData.notifications)) {
        if (value !== undefined) {
          const result = await upsertSetting({
            category: "notifications",
            key,
            value,
          });
          results.push(result);
        }
      }
    }

    return results;
  };

  // Get settings grouped by category (for frontend convenience)
  const getGroupedSettings = async () => {
    const allSettings = await getSettings();

    const grouped = {
      agent: {} as Record<string, any>,
      prompts: {} as Record<string, any>,
      interface: {} as Record<string, any>,
      notifications: {} as Record<string, any>,
    };

    for (const setting of allSettings) {
      grouped[setting.category as SettingCategory][setting.key] = setting.value;
    }

    return grouped;
  };

  // Initialize default settings
  const initializeDefaultSettings = async () => {
    const defaultSettings = [
      // Agent settings
      {
        category: "agent" as const,
        key: "defaultModel",
        value: "gpt-4",
        description: "Default AI model to use",
      },
      {
        category: "agent" as const,
        key: "temperature",
        value: 0.7,
        description: "AI model temperature",
      },
      {
        category: "agent" as const,
        key: "maxTokens",
        value: 2000,
        description: "Maximum tokens per response",
      },
      {
        category: "agent" as const,
        key: "autoSave",
        value: true,
        description: "Auto-save agent responses",
      },

      // Prompt settings
      {
        category: "prompts" as const,
        key: "codeReview",
        value:
          "Please review this code for potential issues and improvements...",
        description: "Default code review prompt",
      },
      {
        category: "prompts" as const,
        key: "bugFix",
        value: "Analyze the following code and identify any bugs or issues...",
        description: "Default bug fix prompt",
      },
      {
        category: "prompts" as const,
        key: "documentation",
        value: "Generate comprehensive documentation for the following code...",
        description: "Default documentation prompt",
      },

      // Interface settings
      {
        category: "interface" as const,
        key: "colorMode",
        value: "system",
        description: "Color mode preference",
      },
      {
        category: "interface" as const,
        key: "theme",
        value: "default",
        description: "Theme variation",
      },
      {
        category: "interface" as const,
        key: "codeHighlighting",
        value: true,
        description: "Enable code syntax highlighting",
      },
      {
        category: "interface" as const,
        key: "showLineNumbers",
        value: true,
        description: "Show line numbers in code",
      },
      {
        category: "interface" as const,
        key: "autoComplete",
        value: true,
        description: "Enable auto-completion",
      },
      {
        category: "interface" as const,
        key: "enabledSnippets",
        value: [],
        description: "IDs of enabled prompt snippets",
      },
      {
        category: "interface" as const,
        key: "debugMode",
        value: false,
        description: "Enable debug mode for additional options",
      },

      // Notification settings
      {
        category: "notifications" as const,
        key: "enabled",
        value: true,
        description: "Enable notifications",
      },
      {
        category: "notifications" as const,
        key: "sound",
        value: true,
        description: "Enable sound alerts",
      },
      {
        category: "notifications" as const,
        key: "desktop",
        value: true,
        description: "Enable desktop notifications",
      },
    ];

    const results = [];
    for (const setting of defaultSettings) {
      const existing = await getSetting(setting.category, setting.key);
      if (!existing) {
        const created = await upsertSetting(setting);
        results.push(created);
      }
    }

    return results;
  };

  return {
    getSettings,
    getSetting,
    upsertSetting,
    deleteSetting,
    bulkUpdateSettings,
    getGroupedSettings,
    initializeDefaultSettings,
  };
};

export type SettingsService = ReturnType<typeof createSettingsService>;
