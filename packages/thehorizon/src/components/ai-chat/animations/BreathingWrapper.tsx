import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface BreathingWrapperProps {
  /** Child elements to wrap */
  children: React.ReactNode;
  /** Whether the breathing animation is active */
  isActive?: boolean;
  /** Animation intensity (subtle, normal, intense) */
  intensity?: "subtle" | "normal" | "intense";
  /** Animation speed in ms */
  duration?: number;
  /** Whether to add glow effect */
  withGlow?: boolean;
  /** Glow color (CSS color value) */
  glowColor?: string;
  /** Custom className */
  className?: string;
  /** Whether to animate on mount */
  animateOnMount?: boolean;
  /** Animation type */
  type?: "scale" | "opacity" | "both" | "pulse";
}

/**
 * BreathingWrapper - Adds organic breathing animation to any element
 * 
 * Makes UI elements feel alive with subtle scaling and glow effects
 */
export const BreathingWrapper: React.FC<BreathingWrapperProps> = ({
  children,
  isActive = true,
  intensity = "normal",
  duration = 3000,
  withGlow = false,
  glowColor = "hsl(var(--primary))",
  className,
  animateOnMount = true,
  type = "scale",
}) => {
  const [mounted, setMounted] = useState(!animateOnMount);

  useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animateOnMount]);

  // Intensity configurations
  const intensityConfig = {
    subtle: {
      scale: "0.98",
      opacity: "0.85",
      blur: "4px",
      spread: "2px",
    },
    normal: {
      scale: "0.95",
      opacity: "0.7",
      blur: "8px",
      spread: "4px",
    },
    intense: {
      scale: "0.92",
      opacity: "0.5",
      blur: "12px",
      spread: "8px",
    },
  };

  const config = intensityConfig[intensity];

  // Build animation styles
  const animationStyles: React.CSSProperties = {
    animationDuration: `${duration}ms`,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationFillMode: "both",
  };

  // Add specific animation based on type
  if (isActive && mounted) {
    switch (type) {
      case "scale":
        animationStyles.animationName = "breathing-scale";
        break;
      case "opacity":
        animationStyles.animationName = "breathing-opacity";
        break;
      case "both":
        animationStyles.animationName = "breathing-both";
        break;
      case "pulse":
        animationStyles.animationName = "breathing-pulse";
        break;
    }
  }

  // Glow effect styles - using multiple shadows for a softer effect
  const glowStyles: React.CSSProperties = withGlow && isActive && mounted
    ? {
        boxShadow: intensity === "subtle" 
          ? `0 0 10px ${glowColor}30, 0 0 20px ${glowColor}15`
          : intensity === "normal"
          ? `0 0 20px ${glowColor}40, 0 0 30px ${glowColor}20`
          : `0 0 30px ${glowColor}50, 0 0 45px ${glowColor}30, 0 0 60px ${glowColor}15`,
        transition: "box-shadow 0.3s ease-in-out",
      }
    : {};

  return (
    <>
      <style jsx>{`
        @keyframes breathing-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(${config.scale});
          }
        }

        @keyframes breathing-opacity {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: ${config.opacity};
          }
        }

        @keyframes breathing-both {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(${config.scale});
            opacity: ${config.opacity};
          }
        }

        @keyframes breathing-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          25% {
            transform: scale(${config.scale});
            opacity: ${config.opacity};
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          75% {
            transform: scale(${config.scale});
            opacity: ${config.opacity};
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      
      <div
        className={cn(
          "transition-all duration-300",
          mounted && "animate-in fade-in-50 zoom-in-95",
          className
        )}
        style={{
          ...animationStyles,
          ...glowStyles,
        }}
      >
        {children}
      </div>
    </>
  );
};

/**
 * BreathingDot - A simple breathing dot indicator
 */
export const BreathingDot: React.FC<{
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}> = ({ size = "md", color = "bg-primary", className }) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <BreathingWrapper
      intensity="normal"
      duration={2000}
      type="both"
      withGlow
      glowColor={`hsl(var(--primary) / 0.5)`}
    >
      <div
        className={cn(
          "rounded-full",
          sizeClasses[size],
          color,
          className
        )}
      />
    </BreathingWrapper>
  );
};