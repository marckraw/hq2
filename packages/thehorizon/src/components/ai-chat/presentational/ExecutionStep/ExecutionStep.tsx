"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Search,
  Database,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
  FileSearch,
  Globe,
  Terminal,
  User,
} from "lucide-react";

export type StepType = 
  | "user_message"
  | "thinking"
  | "tool_execution"
  | "tool_response"
  | "llm_response"
  | "memory_saved"
  | "finished"
  | "error"
  | "attachment_upload"
  | "agent_thought"
  | string; // Allow any string for unknown types

export type StepStatus = "pending" | "running" | "complete" | "error";

export interface ExecutionStepProps {
  id: string | number;
  type: StepType;
  content: string;
  status?: StepStatus;
  duration?: number;
  result?: string;
  metadata?: any;
  expanded?: boolean;
  onToggle?: () => void;
  showIcon?: boolean;
  showDuration?: boolean;
  className?: string;
  animated?: boolean;
  variant?: "default" | "compact" | "detailed";
}

const stepConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  user_message: { icon: User, color: "text-muted-foreground", label: "User" },
  thinking: { icon: Brain, color: "text-purple-500", label: "Thinking" },
  tool_execution: { icon: Terminal, color: "text-green-500", label: "Executing" },
  tool_response: { icon: CheckCircle, color: "text-green-500", label: "Response" },
  llm_response: { icon: FileSearch, color: "text-orange-500", label: "Analyzing" },
  memory_saved: { icon: Database, color: "text-indigo-500", label: "Memory" },
  finished: { icon: CheckCircle, color: "text-green-500", label: "Complete" },
  error: { icon: XCircle, color: "text-destructive", label: "Error" },
  attachment_upload: { icon: Globe, color: "text-blue-500", label: "Upload" },
  agent_thought: { icon: Brain, color: "text-purple-400", label: "Agent Thinking" },
};

const statusConfig: Record<StepStatus, { icon: React.ElementType; color: string }> = {
  pending: { icon: Clock, color: "text-muted-foreground" },
  running: { icon: Loader2, color: "text-primary" },
  complete: { icon: CheckCircle, color: "text-green-500" },
  error: { icon: XCircle, color: "text-destructive" },
};

export function ExecutionStep({
  id,
  type,
  content,
  status = "complete",
  duration,
  result,
  metadata,
  expanded = false,
  onToggle,
  showIcon = true,
  showDuration = true,
  className,
  animated = true,
  variant = "default",
}: ExecutionStepProps) {
  // Handle undefined or unknown step types
  const safeType = type || 'unknown';
  const stepInfo = stepConfig[safeType] || {
    icon: Terminal,
    color: "text-gray-500",
    label: safeType === 'unknown' ? 'Unknown Step' : safeType.charAt(0).toUpperCase() + safeType.slice(1).replace(/_/g, ' ')
  };
  const statusInfo = statusConfig[status];
  const StepIcon = stepInfo.icon;
  const StatusIcon = statusInfo.icon;

  const formatDuration = (ms?: number) => {
    if (!ms) return null;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const Container = animated ? motion.div : "div";
  const contentVariants = animated ? {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
  } : {};

  if (variant === "compact") {
    return (
      <Container
        className={cn(
          "flex items-center gap-2 text-sm",
          className
        )}
        {...(animated && !expanded ? {
          initial: { opacity: 0, x: -10 },
          animate: { opacity: 1, x: 0 },
        } : {})}
      >
        {showIcon && (
          <StepIcon className={cn("h-3.5 w-3.5", stepInfo.color)} />
        )}
        <span className="text-muted-foreground truncate">{content}</span>
        {status === "running" && (
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        )}
        {status === "complete" && showDuration && duration && (
          <Badge variant="secondary" className="text-xs h-4 px-1">
            {formatDuration(duration)}
          </Badge>
        )}
      </Container>
    );
  }

  return (
    <Container
      className={cn("space-y-2", className)}
      {...(animated && !expanded ? {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
      } : {})}
    >
      <div className="flex items-start gap-2">
        {showIcon && (
          <div className="mt-0.5">
            {status === "running" ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", statusInfo.color)} />
            ) : (
              <StepIcon className={cn(
                "h-4 w-4",
                status === "complete" ? stepInfo.color : statusInfo.color
              )} />
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 overflow-hidden">
              {onToggle ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-auto p-0 font-normal text-left justify-start hover:bg-transparent w-full overflow-hidden"
                >
                  <div className="flex items-start gap-1 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {expanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </div>
                    <span className={cn(
                      "text-sm",
                      status === "error" && "text-destructive",
                      !expanded && "truncate block",
                      expanded && "whitespace-normal break-words"
                    )} style={{ wordBreak: expanded ? 'break-word' : undefined }}>
                      {content}
                    </span>
                  </div>
                </Button>
              ) : (
                <span className={cn(
                  "text-sm",
                  status === "error" && "text-destructive"
                )}>
                  {content}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {variant === "detailed" && (
                <Badge variant="outline" className="text-xs">
                  {stepInfo.label}
                </Badge>
              )}
              {showDuration && duration && (
                <Badge variant="secondary" className="text-xs">
                  {formatDuration(duration)}
                </Badge>
              )}
              {status !== "running" && status !== "pending" && (
                <StatusIcon className={cn("h-3.5 w-3.5", statusInfo.color)} />
              )}
            </div>
          </div>

          <AnimatePresence>
            {expanded && (result || metadata) && (
              <Container
                className="mt-2 pl-4 space-y-2"
                {...(animated ? contentVariants : {})}
              >
                {result && (
                  <div className="text-xs text-muted-foreground">
                    {result}
                  </div>
                )}
                {metadata && (
                  <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                    {typeof metadata === "string" 
                      ? metadata 
                      : JSON.stringify(metadata, null, 2)}
                  </pre>
                )}
              </Container>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Container>
  );
}