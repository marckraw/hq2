import { useEffect, useCallback } from "react";

interface UseKeyboardShortcutsProps {
  onSlashCommand: () => void;
  onCommandK: () => void;
  onEscape: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onSlashCommand,
  onCommandK,
  onEscape,
  enabled = true
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Slash command (only when not in input)
    if (e.key === "/" && e.target instanceof Element && 
        !["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
      e.preventDefault();
      onSlashCommand();
    }

    // Command/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      onCommandK();
    }

    // Escape
    if (e.key === "Escape") {
      e.preventDefault();
      onEscape();
    }
  }, [enabled, onSlashCommand, onCommandK, onEscape]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}