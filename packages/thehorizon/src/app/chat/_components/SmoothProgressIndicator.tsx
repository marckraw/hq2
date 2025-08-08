"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EnhancedProgressMessage } from "core.mrck.dev";

interface SmoothProgressIndicatorProps {
  messages: EnhancedProgressMessage[];
  agentType: string;
  isActive: boolean;
  className?: string;
}

interface ProgressState {
  currentMessage: EnhancedProgressMessage | null;
  phase: "understanding" | "working" | "finalizing" | "completed";
  progress: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}

export const SmoothProgressIndicator: React.FC<
  SmoothProgressIndicatorProps
> = ({ messages, agentType, isActive, className = "" }) => {
  const [progressState, setProgressState] = useState<ProgressState>({
    currentMessage: null,
    phase: "understanding",
    progress: 0,
    timeElapsed: 0,
    estimatedTimeRemaining: 0,
  });
  const [showDetails, setShowDetails] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<
    EnhancedProgressMessage[]
  >([]);

  // Update progress state when messages change
  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    const completedMessages = messages.filter(
      (msg) => msg.type === "tool_response" || msg.type === "finished"
    );

    // Calculate progress based on phase and completion
    let progress = 0;
    if (latestMessage.phase === "understanding") progress = 15;
    else if (latestMessage.phase === "working")
      progress = 30 + completedMessages.length * 20;
    else if (latestMessage.phase === "finalizing") progress = 85;
    else if (latestMessage.type === "finished") progress = 100;

    setProgressState({
      currentMessage: latestMessage,
      phase: latestMessage.phase || "working",
      progress: Math.min(progress, 100),
      timeElapsed: 0, // This would be calculated from timestamps in real implementation
      estimatedTimeRemaining: latestMessage.estimatedDuration || 0,
    });

    setCompletedSteps(completedMessages);
  }, [messages]);

  // Timer for elapsed time (simplified)
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setProgressState((prev) => ({
        ...prev,
        timeElapsed: prev.timeElapsed + 1,
        estimatedTimeRemaining: Math.max(0, prev.estimatedTimeRemaining - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "understanding":
        return "bg-blue-500";
      case "working":
        return "bg-orange-500";
      case "finalizing":
        return "bg-green-500";
      case "completed":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "understanding":
        return "Understanding";
      case "working":
        return "Working";
      case "finalizing":
        return "Finalizing";
      case "completed":
        return "Completed";
      default:
        return "Processing";
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!progressState.currentMessage && messages.length === 0) {
    return null;
  }

  const isCompleted = progressState.progress >= 100 || !isActive;

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card className="p-4 bg-gradient-to-r from-background/50 to-muted/30 border-border/50">
        {/* Main Progress Display */}
        <div className="space-y-3">
          {/* Header with Agent Type and Phase */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-500",
                  getPhaseColor(progressState.phase),
                  isActive && "animate-pulse"
                )}
              />
              <Badge variant="secondary" className="text-xs">
                {agentType}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getPhaseLabel(progressState.phase)}
              </span>
            </div>

            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-6 px-2"
              >
                <Info className="h-3 w-3 mr-1" />
                Details
                <ChevronDown
                  className={cn(
                    "h-3 w-3 ml-1 transition-transform duration-200",
                    showDetails && "rotate-180"
                  )}
                />
              </Button>
            )}
          </div>

          {/* Current Activity */}
          <AnimatePresence mode="wait">
            {progressState.currentMessage && (
              <motion.div
                key={progressState.currentMessage.content}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg">
                  {progressState.currentMessage.icon || "🤖"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {progressState.currentMessage.userFriendlyContent ||
                      progressState.currentMessage.content}
                  </p>
                  {isActive && progressState.estimatedTimeRemaining > 0 && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        ~{formatTime(progressState.estimatedTimeRemaining)}{" "}
                        remaining
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressState.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressState.progress}% complete</span>
              {isActive && (
                <span>Elapsed: {formatTime(progressState.timeElapsed)}</span>
              )}
            </div>
          </div>

          {/* Completed Steps Summary */}
          {completedSteps.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                ✅ {completedSteps.length} step
                {completedSteps.length !== 1 ? "s" : ""} completed
              </span>
            </div>
          )}
        </div>

        {/* Detailed Progress (Collapsible) */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Detailed Progress
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded text-xs",
                        message.type === "error"
                          ? "bg-red-50 text-red-700"
                          : message.type === "finished"
                          ? "bg-green-50 text-green-700"
                          : "bg-muted/30"
                      )}
                    >
                      <span>{message.icon || "•"}</span>
                      <span className="flex-1">
                        {message.userFriendlyContent || message.content}
                      </span>
                      {message.type === "tool_response" && (
                        <Badge variant="outline" className="text-xs">
                          Done
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};
