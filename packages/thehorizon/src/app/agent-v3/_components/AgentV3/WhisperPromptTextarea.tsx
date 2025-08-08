"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBreathingAnimation } from "../../_hooks/useBreathingAnimation";
import { Sparkles } from "lucide-react";

interface WhisperPromptTextareaProps {
  onSubmit: (value: string) => void;
  onTyping?: (value: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
  suggestedAgent?: string;
  isAnalyzing?: boolean;
}

export const WhisperPromptTextarea = forwardRef<
  { focus: () => void; setValue: (value: string) => void },
  WhisperPromptTextareaProps
>(
  (
    {
      onSubmit,
      onTyping,
      isDisabled = false,
      placeholder = "Ask anything…",
      className,
      suggestedAgent,
      isAnalyzing = false,
    },
    ref
  ) => {
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isLongPressing, setIsLongPressing] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // Breathing animation
    const { scale, opacity, shadowBlur, shadowOpacity } = useBreathingAnimation(
      {
        intensity: isFocused ? 1.2 : 0.6,
        duration: isFocused ? 3 : 4,
      }
    );

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          textareaRef.current?.focus();
        },
        setValue: (newValue: string) => {
          setValue(newValue);
          // Trigger typing notification
          if (onTyping) {
            onTyping(newValue);
          }
        },
      }),
      [onTyping]
    );

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value]);

    // Notify parent of typing
    useEffect(() => {
      if (onTyping && value) {
        onTyping(value);
      }
    }, [value, onTyping]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Detect Enter key
      if (e.key === "Enter") {
        // Start long press detection
        longPressTimer.current = setTimeout(() => {
          setIsLongPressing(true);
        }, 500);

        if (!e.shiftKey) {
          e.preventDefault();
          if (value.trim() && !isDisabled) {
            onSubmit(value);
            setValue("");
            setIsLongPressing(false);
          }
        }
      }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
        setIsLongPressing(false);
      }
    };

    return (
      <div className="relative">
        <AnimatePresence>
          {isLongPressing && (
            <motion.div
              className="absolute -top-12 left-0 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              Hold for precision mode
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent suggestion */}
        <AnimatePresence>
          {value && suggestedAgent && !isAnalyzing && (
            <motion.div
              className="absolute -top-8 right-0 flex items-center gap-1.5 text-xs text-muted-foreground"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{suggestedAgent} will answer</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className={cn(
            "relative rounded-3xl transition-all duration-500",
            isFocused && "ring-2 ring-primary/20"
          )}
          style={{
            scale,
            boxShadow: `0 0 ${shadowBlur.get()}px rgba(var(--primary-rgb), ${shadowOpacity.get()})`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 120,
            delay: 0.1,
          }}
        >
          <motion.textarea
            ref={textareaRef}
            className={cn(
              "w-full bg-transparent p-8 outline-none resize-none",
              "text-xl leading-relaxed",
              "placeholder:text-muted-foreground/40",
              "min-h-[140px] max-h-[400px]",
              "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
              className
            )}
            style={{ opacity }}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isDisabled}
          />

          {/* Shimmer effect when analyzing */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {value.length > 0 && (
              <motion.div
                className="absolute bottom-4 right-4 text-xs text-muted-foreground/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {value.length} • {isFocused ? "Enter to send" : ""}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }
);

WhisperPromptTextarea.displayName = "WhisperPromptTextarea";
