"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ProgressMessage } from "@/schemas/stream.schemas";
import { ExecutionStep, type StepType, type StepStatus } from "@/components/ai-chat/presentational/ExecutionStep/ExecutionStep";

interface ResearchProgressProps {
  isStreaming: boolean;
  progressMessages: ProgressMessage[];
  onStopStream: () => void;
}

export function ResearchProgress({
  isStreaming,
  progressMessages,
  onStopStream,
}: ResearchProgressProps) {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  if (!isStreaming || progressMessages.length === 0) return null;

  const currentMessage = progressMessages[progressMessages.length - 1];

  const toggleStepExpansion = (index: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getStepStatus = (index: number): StepStatus => {
    if (index < progressMessages.length - 1) return "complete";
    if (progressMessages[index].type === "error") return "error";
    return "running";
  };

  const calculateDuration = (index: number): number | undefined => {
    if (index === 0 || !progressMessages[index].timestamp || !progressMessages[index - 1].timestamp) {
      return undefined;
    }
    const current = new Date(progressMessages[index].timestamp!).getTime();
    const previous = new Date(progressMessages[index - 1].timestamp!).getTime();
    return current - previous;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-11 space-y-2"
    >
      {/* Header with Stop button and Show All toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            {showAllSteps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showAllSteps ? "Show current only" : `Show all steps (${progressMessages.length})`}
          </Button>
        </div>
        
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.5, scale: 1 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onStopStream}
                className="h-5 px-2 text-xs gap-1"
              >
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress messages */}
      <div className="space-y-1">
        <AnimatePresence mode="sync">
          {showAllSteps ? (
            // Show all steps
            progressMessages.map((message, index) => (
              <motion.div
                key={`${message.type}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <ExecutionStep
                  id={index}
                  type={message.type as StepType}
                  content={message.content}
                  status={getStepStatus(index)}
                  duration={calculateDuration(index)}
                  metadata={message.metadata}
                  expanded={expandedSteps.has(index)}
                  onToggle={() => toggleStepExpansion(index)}
                  variant={expandedSteps.has(index) ? "detailed" : "compact"}
                  animated={true}
                />
              </motion.div>
            ))
          ) : (
            // Show only current/latest step
            <motion.div
              key={`${currentMessage.type}-current`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <ExecutionStep
                id={progressMessages.length - 1}
                type={currentMessage.type as StepType}
                content={currentMessage.content}
                status="running"
                duration={calculateDuration(progressMessages.length - 1)}
                metadata={currentMessage.metadata}
                expanded={expandedSteps.has(progressMessages.length - 1)}
                onToggle={() => toggleStepExpansion(progressMessages.length - 1)}
                variant="compact"
                animated={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expand/Collapse All buttons when showing all steps */}
      {showAllSteps && progressMessages.length > 1 && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedSteps(new Set(progressMessages.map((_, i) => i)))}
            className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Expand all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedSteps(new Set())}
            className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Collapse all
          </Button>
        </div>
      )}
    </motion.div>
  );
}