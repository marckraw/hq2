import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface BreathingWrapperProps {
  /** Child components to wrap */
  children: React.ReactNode;
  /** Type of breathing animation */
  type?: "scale" | "opacity" | "both" | "pulse";
  /** Animation intensity */
  intensity?: "subtle" | "normal" | "intense";
  /** Whether animation is active */
  isActive?: boolean;
  /** Optional delay before animation starts (ms) */
  delay?: number;
  /** Add glow effect */
  withGlow?: boolean;
  /** Glow color (CSS color value) */
  glowColor?: string;
  /** Custom class name */
  className?: string;
}

/**
 * BreathingWrapper - Adds organic breathing animation to wrapped components
 * 
 * Pure CSS animation wrapper that makes components feel alive
 */
export const BreathingWrapper: React.FC<BreathingWrapperProps> = ({
  children,
  type = "scale",
  intensity = "normal",
  isActive = true,
  delay = 0,
  withGlow = false,
  glowColor = "rgba(59, 130, 246, 0.5)", // Default blue glow
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Configuration for different intensities
  const config = {
    subtle: {
      scale: 1.02,
      opacity: 0.95,
      duration: "2s",
    },
    normal: {
      scale: 1.05,
      opacity: 0.85,
      duration: "2.5s",
    },
    intense: {
      scale: 1.1,
      opacity: 0.7,
      duration: "3s",
    },
  }[intensity];

  // Animation styles
  const animationStyles: React.CSSProperties = {};
  
  if (isActive && mounted) {
    animationStyles.animationDuration = config.duration;
    animationStyles.animationTimingFunction = "ease-in-out";
    animationStyles.animationIterationCount = "infinite";
    
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
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          25% {
            transform: scale(${config.scale * 1.02});
            opacity: 0.9;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          75% {
            transform: scale(${config.scale * 0.98});
            opacity: 0.9;
          }
        }
      `}</style>

      <div
        className={cn("relative", className)}
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

export interface BreathingDotProps {
  /** Size of the dot */
  size?: "sm" | "md" | "lg";
  /** Color class (e.g., "bg-blue-500") */
  color?: string;
  /** Custom className */
  className?: string;
}

/**
 * BreathingDot - Animated dot indicator
 */
export const BreathingDot: React.FC<BreathingDotProps> = ({
  size = "md",
  color = "bg-primary",
  className,
}) => {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <BreathingWrapper type="both" intensity="normal">
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