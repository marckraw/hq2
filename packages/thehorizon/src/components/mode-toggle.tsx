import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/_state/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function LightDarkSwitch() {
  const { theme, toggleDarkMode } = useTheme();

  const handleThemeToggle = () => {
    console.log("LightDarkSwitch: Toggling theme from:", theme);
    // toggleDarkMode automatically saves to database
    toggleDarkMode();
  };

  const isDark = theme.includes("dark");

  return (
    <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
      <Sun
        className={`h-5 w-5 transition-all ${
          isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all ${
          isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
