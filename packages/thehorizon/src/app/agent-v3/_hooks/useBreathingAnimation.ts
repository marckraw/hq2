import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

interface UseBreathingAnimationOptions {
  minScale?: number;
  maxScale?: number;
  duration?: number;
  intensity?: number;
}

export function useBreathingAnimation({
  minScale = 0.98,
  maxScale = 1.02,
  duration = 4,
  intensity = 1
}: UseBreathingAnimationOptions = {}) {
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);
  const glow = useMotionValue(0);
  
  // Transform values for different effects
  const shadowBlur = useTransform(scale, [minScale, maxScale], [0, 15 * intensity]);
  const shadowOpacity = useTransform(scale, [minScale, maxScale], [0, 0.3 * intensity]);
  
  useEffect(() => {
    // Main breathing animation
    const controls = animate(scale, [minScale, 1, maxScale, 1, minScale], {
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    });

    // Subtle opacity variation
    const opacityControls = animate(opacity, [1, 0.95, 1, 0.95, 1], {
      duration: duration * 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    });

    // Glow effect
    const glowControls = animate(glow, [0, 0.5, 0, 0.3, 0], {
      duration: duration * 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    });

    return () => {
      controls.stop();
      opacityControls.stop();
      glowControls.stop();
    };
  }, [scale, opacity, glow, minScale, maxScale, duration]);

  return {
    scale,
    opacity,
    glow,
    shadowBlur,
    shadowOpacity,
    // Utility function to apply breathing to box shadow
    getBoxShadow: (color = "rgba(var(--primary), 0.2)") => 
      `0 0 ${shadowBlur.get()}px ${color}`,
  };
}