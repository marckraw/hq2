import * as React from "react";
import { cn } from "@/lib/utils";

interface MessageInputToolbarProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const MessageInputToolbar: React.FC<MessageInputToolbarProps> = ({
  children,
  className,
  compact = false,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-muted/50 dark:bg-muted/30 backdrop-blur-sm",
        compact ? "px-1 py-1" : "px-2 py-1.5",
        className
      )}
    >
      {children}
    </div>
  );
};

interface ToolbarSectionProps {
  children: React.ReactNode;
  className?: string;
  position?: "left" | "center" | "right";
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  children,
  className,
  position = "left",
}) => {
  const positionClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  );
};

// Toolbar Divider Component
export const ToolbarDivider: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1",
        className
      )}
    />
  );
};

// Re-export for convenience
export default MessageInputToolbar;