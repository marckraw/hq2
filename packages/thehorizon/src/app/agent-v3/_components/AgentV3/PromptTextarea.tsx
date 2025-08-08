"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PromptTextareaProps {
  onSubmit: (value: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptTextarea({
  onSubmit,
  isDisabled = false,
  placeholder = "Ask anything…",
  className,
}: PromptTextareaProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

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

      <motion.div
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && "ring-2 ring-primary/20"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 120,
          delay: 0.1,
        }}
      >
        <textarea
          ref={textareaRef}
          className={cn(
            "w-full bg-transparent p-6 outline-none resize-none",
            "text-xl leading-relaxed",
            "placeholder:text-muted-foreground/50",
            "min-h-[120px] max-h-[400px]",
            "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
            className
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isDisabled}
        />

        <AnimatePresence>
          {value.length > 0 && (
            <motion.div
              className="absolute bottom-2 right-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {value.length} characters • {isFocused ? "Enter to send" : ""}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
