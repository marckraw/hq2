"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";
import { Moon, Sun } from "lucide-react";

export function UserBadge() {
  const { data } = useSession();
  const user = data?.user;
  const { theme, toggleDarkMode } = useTheme();

  if (!user) return null;

  return (
    <div className="fixed top-3 right-3 flex items-center gap-3 bg-card text-card-foreground border border-border rounded-md px-3 py-1.5 shadow-sm">
      {user.image ? (
        <img src={user.image} alt="Avatar" className="h-6 w-6 rounded-full border" />
      ) : (
        <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">
          {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
        </div>
      )}
      <span className="text-sm">You are logged in as: {user.name || user.email}</span>
      <Button
        variant="outline"
        size="sm"
        aria-label="Toggle theme"
        onClick={toggleDarkMode}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </Button>
    </div>
  );
}
