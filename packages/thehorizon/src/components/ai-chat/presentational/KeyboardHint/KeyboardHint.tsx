"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Command, Keyboard } from "lucide-react";
import { motion } from "framer-motion";

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category?: string;
}

export interface KeyboardHintProps {
  shortcuts?: KeyboardShortcut[];
  platform?: "mac" | "windows" | "auto";
  compact?: boolean;
  showIcon?: boolean;
  className?: string;
  animated?: boolean;
  variant?: "inline" | "card" | "minimal";
}

const defaultShortcuts: KeyboardShortcut[] = [
  { id: "1", keys: ["⌘", "B"], description: "Toggle sidebar" },
  { id: "2", keys: ["⌃", "⇧", "B"], description: "Pin sidebar" },
  { id: "3", keys: ["⌘", "K"], description: "Command palette" },
  { id: "4", keys: ["⌘", "Enter"], description: "Send message" },
];

const windowsShortcuts: KeyboardShortcut[] = [
  { id: "1", keys: ["Ctrl", "B"], description: "Toggle sidebar" },
  { id: "2", keys: ["Ctrl", "Shift", "B"], description: "Pin sidebar" },
  { id: "3", keys: ["Ctrl", "K"], description: "Command palette" },
  { id: "4", keys: ["Ctrl", "Enter"], description: "Send message" },
];

export function KeyboardHint({
  shortcuts,
  platform = "auto",
  compact = false,
  showIcon = true,
  className,
  animated = true,
  variant = "inline",
}: KeyboardHintProps) {
  const detectedPlatform = React.useMemo(() => {
    if (platform !== "auto") return platform;
    if (typeof window === "undefined") return "mac";
    return navigator.platform?.toLowerCase().includes("mac") ? "mac" : "windows";
  }, [platform]);

  const displayShortcuts = React.useMemo(() => {
    if (shortcuts) return shortcuts;
    return detectedPlatform === "mac" ? defaultShortcuts : windowsShortcuts;
  }, [shortcuts, detectedPlatform]);

  const containerVariants = animated ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } : {};

  const itemVariants = animated ? {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
  } : {};

  const Container = animated ? motion.div : "div";
  const ItemContainer = animated ? motion.div : "div";

  if (variant === "minimal") {
    return (
      <Container
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          className
        )}
        {...(animated ? containerVariants : {})}
      >
        {showIcon && <Command className="h-3 w-3" />}
        <span>
          {displayShortcuts.slice(0, 2).map((shortcut, index) => (
            <span key={shortcut.id}>
              {index > 0 && " • "}
              {shortcut.keys.join("")} {shortcut.description}
            </span>
          ))}
        </span>
      </Container>
    );
  }

  if (variant === "card") {
    return (
      <Container
        className={cn(
          "rounded-lg border bg-card p-3 space-y-2",
          className
        )}
        {...(animated ? containerVariants : {})}
      >
        {showIcon && (
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Keyboard Shortcuts</span>
          </div>
        )}
        <div className="space-y-1">
          {displayShortcuts.map((shortcut, index) => (
            <ItemContainer
              key={shortcut.id}
              className="flex items-center justify-between gap-4 py-1"
              {...(animated ? {
                ...itemVariants,
                transition: { delay: index * 0.05 }
              } : {})}
            >
              <span className="text-xs text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-0.5">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    {keyIndex > 0 && (
                      <span className="text-xs text-muted-foreground">+</span>
                    )}
                    <kbd className={cn(
                      "px-1.5 py-0.5 text-xs font-mono",
                      "bg-muted rounded border",
                      "border-b-2 border-muted-foreground/20"
                    )}>
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </ItemContainer>
          ))}
        </div>
      </Container>
    );
  }

  // Default inline variant
  return (
    <Container
      className={cn(
        "flex items-center gap-3 text-xs text-muted-foreground",
        compact ? "gap-2" : "gap-3",
        className
      )}
      {...(animated ? containerVariants : {})}
    >
      {showIcon && (
        <Command className={cn(
          compact ? "h-3 w-3" : "h-3.5 w-3.5"
        )} />
      )}
      <div className="flex items-center gap-3">
        {displayShortcuts.map((shortcut, index) => (
          <ItemContainer
            key={shortcut.id}
            className="flex items-center gap-1"
            {...(animated ? {
              ...itemVariants,
              transition: { delay: index * 0.05 }
            } : {})}
          >
            <div className="flex items-center gap-0.5">
              {shortcut.keys.map((key, keyIndex) => (
                <React.Fragment key={keyIndex}>
                  {keyIndex > 0 && !compact && (
                    <span className="text-muted-foreground/50">+</span>
                  )}
                  <kbd className={cn(
                    "font-mono",
                    compact 
                      ? "px-1 py-0.5 text-[10px]" 
                      : "px-1.5 py-0.5 text-xs",
                    "bg-muted rounded border",
                    "border-b-2 border-muted-foreground/20"
                  )}>
                    {key}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
            <span className={cn(
              "text-muted-foreground",
              compact && "hidden sm:inline"
            )}>
              {shortcut.description}
            </span>
          </ItemContainer>
        ))}
      </div>
    </Container>
  );
}