import React from "react";
import { cn } from "@/lib/utils";

export interface StatusIndicatorProps {
  /** Status text to display */
  text?: string;
  /** Status type */
  status?: "idle" | "processing" | "success" | "error" | "warning";
  /** Show animated dots */
  showDots?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * StatusIndicator - Shows status with optional animated dots
 * 
 * Pure presentational component for status display
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  text = "",
  status = "idle",
  showDots = true,
  className,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "text-primary";
      case "success":
        return "text-green-500";
      case "error":
        return "text-destructive";
      case "warning":
        return "text-amber-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", getStatusColor(), className)}>
      {text}
      {showDots && status === "processing" && (
        <span className="inline-flex">
          <span className="animate-pulse">.</span>
          <span className="animate-pulse [animation-delay:200ms]">.</span>
          <span className="animate-pulse [animation-delay:400ms]">.</span>
        </span>
      )}
    </span>
  );
};

export interface ShimmerEffectProps {
  /** Width of the shimmer element */
  width?: string;
  /** Height of the shimmer element */
  height?: string;
  /** Custom className */
  className?: string;
  /** Rounded corners */
  rounded?: boolean;
}

/**
 * ShimmerEffect - Loading placeholder with shimmer animation
 * 
 * Pure presentational component for loading states
 */
export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  width = "100%",
  height = "20px",
  className,
  rounded = true,
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        rounded && "rounded-md",
        className
      )}
      style={{ width, height }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};