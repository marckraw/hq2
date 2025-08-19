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

  // Animation class names
  const animationClass = isActive && mounted ? `breathing-${type}-${intensity}` : "";

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
      <style>{`
        @keyframes breathing-scale-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes breathing-scale-normal {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes breathing-scale-intense {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes breathing-opacity-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        @keyframes breathing-opacity-normal {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes breathing-opacity-intense {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes breathing-both-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.95; }
        }
        @keyframes breathing-both-normal {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes breathing-both-intense {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        @keyframes breathing-pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          25% { transform: scale(1.0204); opacity: 0.9; }
          50% { transform: scale(1); opacity: 1; }
          75% { transform: scale(0.9796); opacity: 0.9; }
        }
        @keyframes breathing-pulse-normal {
          0%, 100% { transform: scale(1); opacity: 1; }
          25% { transform: scale(1.051); opacity: 0.9; }
          50% { transform: scale(1); opacity: 1; }
          75% { transform: scale(0.949); opacity: 0.9; }
        }
        @keyframes breathing-pulse-intense {
          0%, 100% { transform: scale(1); opacity: 1; }
          25% { transform: scale(1.102); opacity: 0.9; }
          50% { transform: scale(1); opacity: 1; }
          75% { transform: scale(0.898); opacity: 0.9; }
        }

        .breathing-scale-subtle { animation: breathing-scale-subtle 2s ease-in-out infinite; }
        .breathing-scale-normal { animation: breathing-scale-normal 2.5s ease-in-out infinite; }
        .breathing-scale-intense { animation: breathing-scale-intense 3s ease-in-out infinite; }

        .breathing-opacity-subtle { animation: breathing-opacity-subtle 2s ease-in-out infinite; }
        .breathing-opacity-normal { animation: breathing-opacity-normal 2.5s ease-in-out infinite; }
        .breathing-opacity-intense { animation: breathing-opacity-intense 3s ease-in-out infinite; }

        .breathing-both-subtle { animation: breathing-both-subtle 2s ease-in-out infinite; }
        .breathing-both-normal { animation: breathing-both-normal 2.5s ease-in-out infinite; }
        .breathing-both-intense { animation: breathing-both-intense 3s ease-in-out infinite; }

        .breathing-pulse-subtle { animation: breathing-pulse-subtle 2s ease-in-out infinite; }
        .breathing-pulse-normal { animation: breathing-pulse-normal 2.5s ease-in-out infinite; }
        .breathing-pulse-intense { animation: breathing-pulse-intense 3s ease-in-out infinite; }
      `}</style>

      <div
        className={cn("relative", animationClass, className)}
        style={glowStyles}
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