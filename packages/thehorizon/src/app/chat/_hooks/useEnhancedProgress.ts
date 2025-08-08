import { useState, useEffect, useMemo } from "react";
import { progressEnhancementService } from "@/services/progress-enhancement.service";
import type { EnhancedProgressMessage, ProgressMessage } from "core.mrck.dev";

interface UseEnhancedProgressProps {
  rawMessages: ProgressMessage[];
  agentType: string;
  isActive: boolean;
}

interface UseEnhancedProgressReturn {
  enhancedMessages: EnhancedProgressMessage[];
  currentMessage: EnhancedProgressMessage | null;
  progress: number;
  phase: "understanding" | "working" | "finalizing" | "completed";
  completedSteps: number;
  estimatedTimeRemaining: number;
  hasErrors: boolean;
  suggestBetterAgent: (
    userInput: string
  ) => { agent: string; reason: string; confidence: number } | null;
}

export const useEnhancedProgress = ({
  rawMessages,
  agentType,
  isActive,
}: UseEnhancedProgressProps): UseEnhancedProgressReturn => {
  const [enhancedMessages, setEnhancedMessages] = useState<
    EnhancedProgressMessage[]
  >([]);
  const [displayMessages, setDisplayMessages] = useState<
    EnhancedProgressMessage[]
  >([]);

  // Enhance raw messages
  useEffect(() => {
    const enhanced = rawMessages.map((msg) =>
      progressEnhancementService.enhanceProgressMessage(msg)
    );
    setEnhancedMessages(enhanced);
  }, [rawMessages]);

  // Smart message replacement logic
  useEffect(() => {
    if (enhancedMessages.length === 0) {
      setDisplayMessages([]);
      return;
    }

    const newDisplayMessages: EnhancedProgressMessage[] = [];

    for (const message of enhancedMessages) {
      if (message.shouldReplace) {
        // Remove previous messages of the same type or phase
        const filteredMessages = newDisplayMessages.filter((existing) => {
          // Replace thinking messages with new thinking
          if (message.type === "thinking" && existing.type === "thinking") {
            return false;
          }
          // Replace tool execution of same tool
          if (
            message.type === "tool_execution" &&
            existing.type === "tool_execution" &&
            message.toolName === existing.toolName
          ) {
            return false;
          }
          return true;
        });
        newDisplayMessages.splice(
          0,
          newDisplayMessages.length,
          ...filteredMessages
        );
      }
      newDisplayMessages.push(message);
    }

    setDisplayMessages(newDisplayMessages);
  }, [enhancedMessages]);

  // Calculate derived state
  const derivedState = useMemo(() => {
    const currentMessage = displayMessages[displayMessages.length - 1] || null;
    const completedMessages = displayMessages.filter(
      (msg) => msg.type === "tool_response" || msg.type === "finished"
    );
    const errorMessages = displayMessages.filter((msg) => msg.type === "error");

    // Calculate progress
    let progress = 0;
    let phase: "understanding" | "working" | "finalizing" | "completed" =
      "understanding";

    if (currentMessage) {
      phase = currentMessage.phase || "working";

      if (currentMessage.type === "finished") {
        progress = 100;
        phase = "completed";
      } else if (phase === "understanding") {
        progress = 15;
      } else if (phase === "working") {
        progress = 30 + completedMessages.length * 15;
      } else if (phase === "finalizing") {
        progress = 85;
      }
    }

    // Estimate time remaining
    let estimatedTimeRemaining = 0;
    if (isActive && currentMessage?.estimatedDuration) {
      estimatedTimeRemaining = currentMessage.estimatedDuration;
    }

    return {
      currentMessage,
      progress: Math.min(progress, 100),
      phase,
      completedSteps: completedMessages.length,
      estimatedTimeRemaining,
      hasErrors: errorMessages.length > 0,
    };
  }, [displayMessages, isActive]);

  // Agent suggestion function
  const suggestBetterAgent = (userInput: string) => {
    const suggestion = progressEnhancementService.suggestAgent(userInput);
    if (!suggestion) return null;

    return {
      agent: suggestion.suggestedAgent,
      reason: suggestion.reason,
      confidence: suggestion.confidence,
    };
  };

  return {
    enhancedMessages: displayMessages,
    ...derivedState,
    suggestBetterAgent,
  };
};
