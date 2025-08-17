import React from "react";
import { cn } from "@/lib/utils";

export interface GlowEffectProps {
  /** Child components to apply glow to */
  children: React.ReactNode;
  /** Glow intensity */
  intensity?: "subtle" | "normal" | "intense";
  /** Glow color (CSS color value) */
  color?: string;
  /** Whether the glow is active */
  isActive?: boolean;
  /** Animate the glow */
  animate?: boolean;
  /** Animation duration in ms */
  duration?: number;
  /** Shape of the glow */
  shape?: "default" | "circle";
  /** Size of the glow */
  size?: "sm" | "md" | "lg";
  /** Custom class name */
  className?: string;
}

/**
 * GlowEffect - Adds a soft glow effect to components
 * 
 * Uses box-shadow for better performance and control
 */
export const GlowEffect: React.FC<GlowEffectProps> = ({
  children,
  intensity = "normal",
  color = "rgba(59, 130, 246, 0.5)", // Default blue
  isActive = true,
  animate = false,
  duration = 2000,
  shape = "default",
  size = "md",
  className,
}) => {
  // Configuration for different intensities
  const config = {
    subtle: {
      shadow: `0 0 10px ${color}30, 0 0 20px ${color}15`,
      scale: 1.02,
    },
    normal: {
      shadow: `0 0 20px ${color}40, 0 0 40px ${color}20, 0 0 60px ${color}10`,
      scale: 1.05,
    },
    intense: {
      shadow: `0 0 30px ${color}50, 0 0 60px ${color}30, 0 0 90px ${color}15, 0 0 120px ${color}05`,
      scale: 1.08,
    },
  }[intensity];

  // Apply glow styles
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
          shape === "circle" && "rounded-full",
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