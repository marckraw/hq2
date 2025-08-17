import React, { forwardRef, useImperativeHandle, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square,
  Sparkles,
  Command,
  CornerDownLeft
} from "lucide-react";

export interface ChatInputProps {
  /** Current value of the input */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Called when user submits (Enter key or send button) */
  onSubmit?: (value: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to show the send button */
  showSendButton?: boolean;
  /** Whether to show attachment button */
  showAttachButton?: boolean;
  /** Whether to show voice button */
  showVoiceButton?: boolean;
  /** Maximum number of rows for auto-resize */
  maxRows?: number;
  /** Minimum number of rows */
  minRows?: number;
  /** Custom className */
  className?: string;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Voice recording state */
  isRecording?: boolean;
  /** Callback for attachment button click */
  onAttachClick?: () => void;
  /** Callback for voice button click */
  onVoiceClick?: () => void;
  /** Show keyboard shortcuts hint */
  showShortcuts?: boolean;
  /** Custom left addon element */
  leftAddon?: React.ReactNode;
  /** Custom right addon element */
  rightAddon?: React.ReactNode;
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Maximum character limit */
  maxLength?: number;
}

export interface ChatInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  setValue: (value: string) => void;
}

/**
 * ChatInput - A pure presentational component for chat message input
 * 
 * Features:
 * - Auto-resizing textarea
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - Optional buttons for attachments, voice, send
 * - Character counting
 * - Fully controlled component
 */
export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  (
    {
      value = "",
      placeholder = "Type a message...",
      onChange,
      onSubmit,
      disabled = false,
      showSendButton = true,
      showAttachButton = false,
      showVoiceButton = false,
      maxRows = 5,
      minRows = 1,
      className,
      autoFocus = false,
      isLoading = false,
      isRecording = false,
      onAttachClick,
      onVoiceClick,
      showShortcuts = true,
      leftAddon,
      rightAddon,
      showCharCount = false,
      maxLength,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [internalValue, setInternalValue] = React.useState(value);

    // Sync internal value with prop
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Auto-resize textarea based on content
    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [minRows, maxRows]);

    // Adjust height when value changes
    useEffect(() => {
      adjustTextareaHeight();
    }, [internalValue, adjustTextareaHeight]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      
      // Respect max length if set
      if (maxLength && newValue.length > maxLength) {
        return;
      }
      
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (without Shift)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (internalValue.trim() && !disabled && !isLoading) {
          onSubmit?.(internalValue);
        }
      }
    };

    // Handle send button click
    const handleSend = () => {
      if (internalValue.trim() && !disabled && !isLoading) {
        onSubmit?.(internalValue);
      }
    };

    // Imperative handle for parent components
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      clear: () => {
        setInternalValue("");
        onChange?.("");
      },
      setValue: (newValue: string) => {
        setInternalValue(newValue);
        onChange?.(newValue);
      },
    }));

    const canSend = internalValue.trim().length > 0 && !disabled && !isLoading;
    const charCount = internalValue.length;
    const isNearLimit = maxLength && charCount > maxLength * 0.9;

    return (
      <div className={cn("relative flex flex-col", className)}>
        <div className={cn(
          "flex items-end gap-2 rounded-lg border bg-background p-2 transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:border-primary/50 focus-within:border-primary"
        )}>
          {/* Left addon or attach button */}
          {leftAddon || (showAttachButton && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
              onClick={onAttachClick}
              disabled={disabled || isLoading}
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
          ))}

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={internalValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              autoFocus={autoFocus}
              className={cn(
                "w-full resize-none bg-transparent px-1 py-1.5 text-sm",
                "placeholder:text-muted-foreground",
                "focus:outline-none",
                "disabled:cursor-not-allowed",
                "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              )}
              style={{
                minHeight: `${minRows * 1.5}rem`,
                maxHeight: `${maxRows * 1.5}rem`,
              }}
            />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Voice button */}
            {showVoiceButton && (
              <Button
                type="button"
                size="icon"
                variant={isRecording ? "destructive" : "ghost"}
                className="h-8 w-8"
                onClick={onVoiceClick}
                disabled={disabled || isLoading}
              >
                {isRecording ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isRecording ? "Stop recording" : "Start voice input"}
                </span>
              </Button>
            )}

            {/* Right addon */}
            {rightAddon}

            {/* Send button */}
            {showSendButton && (
              <Button
                type="button"
                size="icon"
                variant={canSend ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 transition-all",
                  canSend && "hover:scale-105"
                )}
                onClick={handleSend}
                disabled={!canSend}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className={cn("h-4 w-4", canSend && "animate-in zoom-in-50")} />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        </div>

        {/* Bottom hints row */}
        {(showShortcuts || showCharCount) && (
          <div className="flex items-center justify-between px-2 pt-1">
            {/* Keyboard shortcuts */}
            {showShortcuts && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
                    <CornerDownLeft className="h-3 w-3 inline" />
                  </kbd>
                  <span>Send</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
                    Shift
                  </kbd>
                  +
                  <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
                    <CornerDownLeft className="h-3 w-3 inline" />
                  </kbd>
                  <span>New line</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
                    /
                  </kbd>
                  <span>Commands</span>
                </span>
              </div>
            )}

            {/* Character count */}
            {showCharCount && maxLength && (
              <div className={cn(
                "text-xs",
                isNearLimit ? "text-destructive" : "text-muted-foreground"
              )}>
                {charCount}/{maxLength}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";