import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/_state/hooks/useTheme";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSelector() {
  const { theme, toggleDarkMode, setColorVariation } = useTheme();

  const handleColorModeChange = () => {
    // toggleDarkMode automatically saves to database
    toggleDarkMode();
  };

  const handleThemeVariationChange = (
    variation: "default" | "pink" | "sage"
  ) => {
    console.log("ThemeSelector: Setting theme variation to:", variation);
    // setColorVariation automatically saves to database
    setColorVariation(variation);
  };

  const isDark = theme.includes("dark");
  const currentVariation = theme.includes("sage")
    ? "sage"
    : theme.includes("pink")
    ? "pink"
    : "default";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun
            className={`h-[1.2rem] w-[1.2rem] transition-all ${
              isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"
            }`}
          />
          <Moon
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
              isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"
            }`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleColorModeChange()}>
          {isDark ? "☀️ " : "✓ "}Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleColorModeChange()}>
          {isDark ? "✓ " : "🌙 "}Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeVariationChange("default")}>
          {currentVariation === "default" ? "✓ " : "🎨 "}Default Theme
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeVariationChange("pink")}>
          {currentVariation === "pink" ? "✓ " : "🌸 "}Pink Theme
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeVariationChange("sage")}>
          {currentVariation === "sage" ? "✓ " : "🌿 "}Sage Theme
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
