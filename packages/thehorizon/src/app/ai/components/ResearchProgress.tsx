"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";
import type { ProgressMessage } from "@/schemas/stream.schemas";

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
  if (!isStreaming || progressMessages.length === 0) return null;

  const currentMessage = progressMessages[progressMessages.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-11"
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 animate-pulse" />
          <AnimatePresence mode="wait">
            <motion.span
              key={currentMessage.type}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {currentMessage.content}...
            </motion.span>
          </AnimatePresence>
        </div>
        <Loader2 className="h-3 w-3 animate-spin" />
        
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
    </motion.div>
  );
}