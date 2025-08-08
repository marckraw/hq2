"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Theme =
  | "light"
  | "dark"
  | "light-sage"
  | "dark-sage"
  | "light-pink"
  | "dark-pink";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  setColorVariation: (variation: "default" | "sage" | "pink") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Helper functions to convert between our theme format and database format
const themeToSettings = (theme: Theme) => {
  const isDark = theme.includes("dark");
  const colorMode = isDark ? "dark" : "light";
  const themeVariation = theme.includes("sage")
    ? "sage"
    : theme.includes("pink")
    ? "pink"
    : "default";

  return { colorMode, theme: themeVariation };
};

const settingsToTheme = (colorMode: string, themeVariation: string): Theme => {
  const isDark = colorMode === "dark";

  if (themeVariation === "sage") {
    return isDark ? "dark-sage" : "light-sage";
  }
  if (themeVariation === "pink") {
    return isDark ? "dark-pink" : "light-pink";
  }
  return isDark ? "dark" : "light";
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from database settings
  useEffect(() => {
    const loadThemeFromDatabase = async () => {
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const API_TOKEN = process.env.NEXT_PUBLIC_GC_API_KEY || "";

        const response = await fetch(`${API_BASE_URL}/api/settings/grouped`, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.interface) {
            const { colorMode, theme: themeVariation } = result.data.interface;
            if (colorMode && themeVariation) {
              const dbTheme = settingsToTheme(colorMode, themeVariation);
              setTheme(dbTheme);
              setIsInitialized(true);
              return;
            }
          }
        }
      } catch (error) {
        console.warn(
          "🎨 ThemeProvider: Failed to load theme from database:",
          error
        );
      }

      // Fallback to localStorage or system preference
      const stored = localStorage.getItem("theme") as Theme | null;
      if (
        stored &&
        [
          "light",
          "dark",
          "light-sage",
          "dark-sage",
          "light-pink",
          "dark-pink",
        ].includes(stored)
      ) {
        setTheme(stored);
      } else {
        // Use system preference for default theme
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setTheme(prefersDark ? "dark" : "light");
      }
      setIsInitialized(true);
    };

    loadThemeFromDatabase();
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;

    // Set data-theme attribute (for our CSS)
    root.setAttribute("data-theme", theme);

    // Store in localStorage as backup
    localStorage.setItem("theme", theme);
  }, [theme, isInitialized]);

  // Save theme changes to database
  const saveThemeToDatabase = async (newTheme: Theme) => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const API_TOKEN = process.env.NEXT_PUBLIC_GC_API_KEY || "";

      const { colorMode, theme: themeVariation } = themeToSettings(newTheme);

      const response = await fetch(`${API_BASE_URL}/api/settings/bulk`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interface: {
            colorMode,
            theme: themeVariation,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log("🎨 ThemeProvider: Saved theme to database:", {
            colorMode,
            theme: themeVariation,
          });
        } else {
          console.warn("🎨 ThemeProvider: Failed to save theme:", result.error);
        }
      }
    } catch (error) {
      console.warn("🎨 ThemeProvider: Error saving theme to database:", error);
    }
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    // Save to database in background
    saveThemeToDatabase(newTheme);
  };

  const toggleDarkMode = () => {
    const isDark = theme.includes("dark");
    const colorVariation = theme.includes("sage")
      ? "sage"
      : theme.includes("pink")
      ? "pink"
      : "default";

    let newTheme: Theme;
    if (isDark) {
      // Switch to light mode with same color variation
      newTheme =
        colorVariation === "default"
          ? "light"
          : (`light-${colorVariation}` as Theme);
    } else {
      // Switch to dark mode with same color variation
      newTheme =
        colorVariation === "default"
          ? "dark"
          : (`dark-${colorVariation}` as Theme);
    }

    handleSetTheme(newTheme);
  };

  const setColorVariation = (variation: "default" | "sage" | "pink") => {
    const isDark = theme.includes("dark");

    let newTheme: Theme;
    if (variation === "default") {
      newTheme = isDark ? "dark" : "light";
    } else {
      newTheme = isDark
        ? (`dark-${variation}` as Theme)
        : (`light-${variation}` as Theme);
    }

    handleSetTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        toggleDarkMode,
        setColorVariation,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
