import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedTextProps {
  /** Text to animate */
  text: string;
  /** Animation type */
  type?: "typewriter" | "fade-in" | "slide-up" | "word-by-word";
  /** Speed of animation (ms per character for typewriter) */
  speed?: number;
  /** Whether to show cursor */
  showCursor?: boolean;
  /** Cursor character */
  cursor?: string;
  /** Whether to start animation immediately */
  autoStart?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Custom className */
  className?: string;
  /** Whether to animate on each text change */
  animateOnChange?: boolean;
  /** Delay before starting animation */
  delay?: number;
}

/**
 * AnimatedText - Animated text display with various effects
 * 
 * Pure presentational component for text animations
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  type = "typewriter",
  speed = 30,
  showCursor = true,
  cursor = "▊",
  autoStart = true,
  onComplete,
  className,
  animateOnChange = true,
  delay = 0,
}) => {
  const [displayText, setDisplayText] = useState(autoStart ? "" : text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const animationRef = useRef<NodeJS.Timeout>();
  const cursorRef = useRef<NodeJS.Timeout>();
  const previousTextRef = useRef(text);

  // Handle typewriter animation
  useEffect(() => {
    if (!autoStart && !animateOnChange) {
      setDisplayText(text);
      return;
    }

    // Check if text changed
    if (!animateOnChange && previousTextRef.current === text) {
      return;
    }
    previousTextRef.current = text;

    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    // Reset and start animation
    setDisplayText("");
    setIsAnimating(true);

    const startAnimation = () => {
      if (type === "typewriter") {
        let currentIndex = 0;
        
        const typeNext = () => {
          if (currentIndex <= text.length) {
            setDisplayText(text.slice(0, currentIndex));
            currentIndex++;
            animationRef.current = setTimeout(typeNext, speed);
          } else {
            setIsAnimating(false);
            onComplete?.();
          }
        };

        typeNext();
      } else if (type === "word-by-word") {
        const words = text.split(" ");
        let currentWordIndex = 0;
        
        const showNextWord = () => {
          if (currentWordIndex <= words.length) {
            setDisplayText(words.slice(0, currentWordIndex).join(" "));
            currentWordIndex++;
            animationRef.current = setTimeout(showNextWord, speed * 5);
          } else {
            setIsAnimating(false);
            onComplete?.();
          }
        };

        showNextWord();
      } else {
        // For fade-in and slide-up, we show all text immediately
        // and rely on CSS animations
        setDisplayText(text);
        setTimeout(() => {
          setIsAnimating(false);
          onComplete?.();
        }, 500);
      }
    };

    // Start animation after delay
    const delayTimeout = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(delayTimeout);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [text, type, speed, autoStart, onComplete, animateOnChange, delay]);

  // Cursor blinking animation
  useEffect(() => {
    if (showCursor && type === "typewriter") {
      cursorRef.current = setInterval(() => {
        setCursorVisible((v) => !v);
      }, 500);

      return () => {
        if (cursorRef.current) {
          clearInterval(cursorRef.current);
        }
      };
    }
  }, [showCursor, type]);

  // Build animation classes based on type
  const getAnimationClasses = () => {
    switch (type) {
      case "fade-in":
        return "animate-in fade-in duration-500";
      case "slide-up":
        return "animate-in slide-in-from-bottom-2 fade-in duration-500";
      default:
        return "";
    }
  };

  return (
    <span className={cn(getAnimationClasses(), className)}>
      {displayText}
      {showCursor && type === "typewriter" && isAnimating && (
        <span
          className={cn(
            "inline-block ml-[1px]",
            cursorVisible ? "opacity-100" : "opacity-0",
            "transition-opacity duration-100"
          )}
        >
          {cursor}
        </span>
      )}
    </span>
  );
};

/**
 * StreamingText - Simulates real-time text streaming
 */
export interface StreamingTextProps {
  /** Full text to stream */
  fullText: string;
  /** Whether streaming is active */
  isStreaming: boolean;
  /** Streaming speed (ms per character) */
  speed?: number;
  /** Custom className */
  className?: string;
  /** Show thinking dots while waiting */
  showThinkingDots?: boolean;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  fullText,
  isStreaming,
  speed = 20,
  className,
  showThinkingDots = true,
}) => {
  const [streamedText, setStreamedText] = useState("");
  const streamRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isStreaming) {
      setStreamedText(fullText);
      return;
    }

    let currentIndex = 0;
    setStreamedText("");

    const streamNext = () => {
      if (currentIndex <= fullText.length) {
        setStreamedText(fullText.slice(0, currentIndex));
        currentIndex++;
        streamRef.current = setTimeout(streamNext, speed);
      }
    };

    streamNext();

    return () => {
      if (streamRef.current) {
        clearTimeout(streamRef.current);
      }
    };
  }, [fullText, isStreaming, speed]);

  if (!isStreaming && !streamedText && showThinkingDots) {
    return <ThinkingDots />;
  }

  return (
    <span className={className}>
      {streamedText}
      {isStreaming && streamedText.length < fullText.length && (
        <span className="inline-block w-2 h-4 ml-[1px] bg-current animate-pulse" />
      )}
    </span>
  );
};

/**
 * ThinkingDots - Animated dots to show processing
 */
export const ThinkingDots: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
}> = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span
        className={cn(
          "rounded-full bg-current animate-bounce",
          sizeClasses[size],
          "[animation-delay:-0.3s]"
        )}
      />
      <span
        className={cn(
          "rounded-full bg-current animate-bounce",
          sizeClasses[size],
          "[animation-delay:-0.15s]"
        )}
      />
      <span
        className={cn(
          "rounded-full bg-current animate-bounce",
          sizeClasses[size]
        )}
      />
    </span>
  );
};