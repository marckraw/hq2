import { useState, useEffect } from "react";

// Types matching the backend validation schemas
export interface AgentSettings {
  defaultModel: "gpt-4" | "gpt-3.5" | "claude-3";
  temperature: number;
  maxTokens: number;
  autoSave: boolean;
}

export interface PromptSettings {
  codeReview: string;
  bugFix: string;
  documentation: string;
}

export interface InterfaceSettings {
  colorMode: "system" | "light" | "dark";
  theme: "default" | "pink" | "sage";
  codeHighlighting: boolean;
  showLineNumbers: boolean;
  autoComplete: boolean;
  enabledSnippets: string[];
  debugMode: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
}

export interface GroupedSettings {
  agent: Partial<AgentSettings>;
  prompts: Partial<PromptSettings>;
  interface: Partial<InterfaceSettings>;
  notifications: Partial<NotificationSettings>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const API_TOKEN = process.env.NEXT_PUBLIC_GC_API_KEY || "";

export const useSettings = () => {
  const [settings, setSettings] = useState<GroupedSettings>({
    agent: {},
    prompts: {},
    interface: {},
    notifications: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/settings/grouped`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      } else {
        throw new Error(result.error?.message || "Failed to fetch settings");
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Update settings via bulk update API
  const updateSettings = async (newSettings: Partial<GroupedSettings>) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/settings/bulk`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Optimistically update local state
        setSettings((prev) => ({
          agent: { ...prev.agent, ...newSettings.agent },
          prompts: { ...prev.prompts, ...newSettings.prompts },
          interface: { ...prev.interface, ...newSettings.interface },
          notifications: {
            ...prev.notifications,
            ...newSettings.notifications,
          },
        }));
        return result.data;
      } else {
        throw new Error(result.error?.message || "Failed to update settings");
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  // Initialize default settings
  const initializeSettings = async () => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/settings/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to initialize settings: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Refresh settings after initialization
        await fetchSettings();
        return result.data;
      } else {
        throw new Error(
          result.error?.message || "Failed to initialize settings"
        );
      }
    } catch (err) {
      console.error("Error initializing settings:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    initializeSettings,
    refetch: fetchSettings,
  };
};
