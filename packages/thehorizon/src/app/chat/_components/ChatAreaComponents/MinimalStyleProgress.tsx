"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Image,
  FileText,
  Youtube,
  Figma,
  Brain,
  Database,
  Settings,
  Check,
  Loader2,
  ChevronDown,
  MessageSquare,
  Bot,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProgressMessage } from "@/schemas/stream.schemas";

interface MinimalStyleProgressProps {
  messages: ProgressMessage[];
  isActive: boolean;
  className?: string;
  disableAutoHide?: boolean; // New prop to disable auto-hide behavior
}

// Tool icon mapping
const getToolIcon = (toolName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    create_image: <Image className="h-4 w-4" />,
    read_url: <Search className="h-4 w-4" />,
    analyze_youtube_video: <Youtube className="h-4 w-4" />,
    get_figma_data: <Figma className="h-4 w-4" />,
    save_memory: <Database className="h-4 w-4" />,
    compose_plan: <FileText className="h-4 w-4" />,
    evaluate_response: <Check className="h-4 w-4" />,
  };
  return iconMap[toolName] || <Settings className="h-4 w-4" />;
};

// Generate user-friendly messages
const getUserFriendlyMessage = (message: ProgressMessage): string => {
  const { type, content, metadata } = message;

  // Extract tool name from content or metadata
  const toolName =
    metadata?.functionName ||
    content.match(/executing[:\s]+([a-z_]+)/)?.[1] ||
    content.match(/([a-z_]+)\s+execution/)?.[1];

  switch (type) {
    case "thinking":
      return "Thinking...";

    case "tool_execution":
      if (toolName) {
        switch (toolName) {
          case "create_image":
            return "Creating image...";
          case "read_url":
            return "Reading webpage...";
          case "analyze_youtube_video":
            return "Analyzing video...";
          case "get_figma_data":
            return "Fetching Figma data...";
          case "save_memory":
            return "Saving information...";
          case "compose_plan":
            return "Creating plan...";
          case "evaluate_response":
            return "Evaluating response...";
          default:
            return `Running ${toolName.replace(/_/g, " ")}...`;
        }
      }
      return "Processing...";

    case "tool_response":
      return "Completed";

    case "finished":
      return "Done";

    default:
      return content.length > 50 ? content.substring(0, 50) + "..." : content;
  }
};

export const MinimalStyleProgress: React.FC<MinimalStyleProgressProps> = ({
  messages,
  isActive,
  className = "",
  disableAutoHide = false,
}) => {
  const [currentMessage, setCurrentMessage] = useState<ProgressMessage | null>(null);
  const [displayText, setDisplayText] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update current message based on latest progress
  useEffect(() => {
    if (messages.length === 0) {
      setCurrentMessage(null);
      setDisplayText("");
      setIsCompleted(false);
      return;
    }

    const latest = messages[messages.length - 1];
    setCurrentMessage(latest);
    setDisplayText(getUserFriendlyMessage(latest));
    setIsCompleted(latest.type === "finished" || latest.type === "tool_response");
  }, [messages]);

  // Auto-hide after completion (only if not disabled)
  useEffect(() => {
    if (isCompleted && !isActive && !disableAutoHide) {
      const timer = setTimeout(() => {
        setCurrentMessage(null);
        setDisplayText("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, isActive, disableAutoHide]);

  if (!currentMessage || !displayText) {
    return null;
  }

  // Extract tool name for icon
  const toolName =
    currentMessage.metadata?.functionName ||
    currentMessage.content.match(/executing[:\s]+([a-z_]+)/)?.[1] ||
    currentMessage.content.match(/([a-z_]+)\s+execution/)?.[1];

  // Helper function to get icon for message type
  const getMessageTypeIcon = (message: ProgressMessage) => {
    switch (message.type) {
      case "thinking":
        return <Brain className="h-3 w-3 text-blue-500" />;
      case "tool_execution":
        return <Settings className="h-3 w-3 text-orange-500" />;
      case "tool_response":
        return <Check className="h-3 w-3 text-green-500" />;
      case "user_message":
        return <MessageSquare className="h-3 w-3 text-gray-500" />;
      case "llm_response":
        return <Bot className="h-3 w-3 text-primary" />;
      case "error":
        return <X className="h-3 w-3 text-red-500" />;
      case "memory_saved":
        return <Database className="h-3 w-3 text-purple-500" />;
      case "finished":
        return <Check className="h-3 w-3 text-green-600" />;
      default:
        return <Settings className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("mr-auto max-w-[90%] mb-4", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.content}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "bg-muted/40 border border-border/30 rounded-2xl",
            "backdrop-blur-sm overflow-hidden",
            isCompleted ? "bg-green-50/50 border-green-200/50" : ""
          )}
        >
          {/* Main Progress Bar - Clickable */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              "hover:bg-muted/20 transition-colors duration-200",
              messages.length > 1 ? "cursor-pointer" : "cursor-default"
            )}
            onClick={() => messages.length > 1 && setIsExpanded(!isExpanded)}
          >
            {/* Icon */}
            <div className={cn("flex-shrink-0", isCompleted ? "text-green-600" : "text-muted-foreground")}>
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : currentMessage.type === "thinking" ? (
                <Brain className="h-4 w-4 text-blue-500" />
              ) : toolName ? (
                <div className="text-orange-500">{getToolIcon(toolName)}</div>
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>

            {/* Text */}
            <span className={cn("text-sm font-medium flex-1", isCompleted ? "text-green-700" : "text-foreground")}>
              {displayText}
            </span>

            {/* Step count and expand indicator */}
            {messages.length > 1 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {messages.length} step{messages.length !== 1 ? "s" : ""}
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            )}

            {/* Loading dots animation (only when active and not completed) */}
            {isActive && !isCompleted && messages.length === 1 && (
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-1 h-1 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-1 h-1 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-1 h-1 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            )}
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {isExpanded && messages.length > 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="border-t border-border/30"
              >
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 rounded-md bg-background/50 border border-border/20"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-background border border-border/50 flex items-center justify-center">
                          {getMessageTypeIcon(message)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">
                            {message.type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </span>
                          <span className="text-xs text-muted-foreground">{index + 1}</span>
                        </div>
                        <div className="text-xs text-foreground/80 leading-relaxed">
                          {getUserFriendlyMessage(message)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
