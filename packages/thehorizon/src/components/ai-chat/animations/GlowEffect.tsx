import React from "react";
import { cn } from "@/lib/utils";

export interface GlowEffectProps {
  /** Child elements to wrap */
  children: React.ReactNode;
  /** Glow intensity */
  intensity?: "subtle" | "normal" | "intense";
  /** Glow color (CSS color or Tailwind variable) */
  color?: string;
  /** Whether glow is active */
  isActive?: boolean;
  /** Glow animation */
  animate?: boolean;
  /** Animation duration in ms */
  duration?: number;
  /** Custom className */
  className?: string;
  /** Glow size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Glow shape */
  shape?: "circle" | "ellipse" | "rect";
}

/**
 * GlowEffect - Adds customizable glow effects to any element
 * 
 * Uses box-shadow for a cleaner glow effect without overflow issues
 */
export const GlowEffect: React.FC<GlowEffectProps> = ({
  children,
  intensity = "normal",
  color = "hsl(var(--primary))",
  isActive = true,
  animate = false,
  duration = 2000,
  className,
  size = "md",
  shape = "rect",
}) => {
  // Intensity configurations for box-shadow
  const intensityConfig = {
    subtle: {
      shadow: `0 0 10px ${color}40, 0 0 20px ${color}20`,
      scale: 1.01,
    },
    normal: {
      shadow: `0 0 20px ${color}60, 0 0 40px ${color}30`,
      scale: 1.02,
    },
    intense: {
      shadow: `0 0 30px ${color}80, 0 0 60px ${color}40, 0 0 90px ${color}20`,
      scale: 1.03,
    },
  };

  const config = intensityConfig[intensity];

  // Build glow styles using box-shadow instead of pseudo-elements
  const glowStyles: React.CSSProperties = isActive
    ? {
        boxShadow: config.shadow,
        transition: "all 0.3s ease",
      }
    : {};

  // Animation styles
  const animationStyles = animate && isActive
    ? {
        animation: `glow-pulse-shadow ${duration}ms ease-in-out infinite`,
      }
    : {};

  return (
    <>
      <style jsx>{`
        @keyframes glow-pulse-shadow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(${config.scale});
            opacity: 0.9;
          }
        }
      `}</style>

      <div
        className={cn(
          "transition-all duration-300",
          className
        )}
        style={{
          ...glowStyles,
          ...animationStyles,
        }}
      >
        {children}
      </div>
    </>
  );
};

/**
 * StatusIndicator - Elegant status display with subtle animations
 */
export interface StatusIndicatorProps {
  /** Status text */
  text: string;
  /** Status type */
  status?: "online" | "processing" | "error" | "idle" | "active";
  /** Whether to show pulse animation */
  pulse?: boolean;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show dot indicator */
  showDot?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  text,
  status = "idle",
  pulse = false,
  className,
  size = "md",
  showDot = true,
}) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const statusConfig = {
    online: {
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-600 dark:bg-green-400",
      glowColor: "shadow-green-500/50",
    },
    processing: {
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-600 dark:bg-amber-400",
      glowColor: "shadow-amber-500/50",
    },
    error: {
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-600 dark:bg-red-400",
      glowColor: "shadow-red-500/50",
    },
    idle: {
      color: "text-muted-foreground",
      bgColor: "bg-muted-foreground",
      glowColor: "shadow-muted-foreground/50",
    },
    active: {
      color: "text-primary",
      bgColor: "bg-primary",
      glowColor: "shadow-primary/50",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        sizeClasses[size],
        config.color,
        className
      )}
    >
      {showDot && (
        <span className="relative flex">
          <span
            className={cn(
              "rounded-full",
              dotSizes[size],
              config.bgColor,
              pulse && "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full",
              dotSizes[size],
              config.bgColor,
              pulse && `shadow-sm ${config.glowColor}`
            )}
          />
        </span>
      )}
      <span className="font-medium tracking-wide uppercase opacity-90">
        {text}
      </span>
    </div>
  );
};

/**
 * ShimmerEffect - Shimmer loading effect
 */
export const ShimmerEffect: React.FC<{
  className?: string;
  width?: string;
  height?: string;
}> = ({ className, width = "100%", height = "20px" }) => {
  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            hsl(var(--muted)) 0%,
            hsl(var(--muted) / 0.5) 50%,
            hsl(var(--muted)) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className={cn("shimmer rounded", className)}
        style={{ width, height }}
      />
    </>
  );
};