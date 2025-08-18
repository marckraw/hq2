import React from "react";
import { cn } from "@/lib/utils";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import { CollapsibleSection } from "../disclosure";
import { ThinkingDots } from "../animations";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fontSize, componentSize, spacing, borders, effects } from "../design-system";

export interface ThoughtStep {
  id: string;
  content: string;
  timestamp?: Date;
  duration?: number;
}

export interface AgentThinkingProps {
  /** Whether agent is currently thinking */
  thinking?: boolean;
  /** Thought steps to display */
  thoughts?: ThoughtStep[];
  /** Total thinking duration in ms */
  duration?: number;
  /** Whether section is expanded */
  expanded?: boolean;
  /** Callback when expansion changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Compact mode (single line) */
  compact?: boolean;
  /** Show timestamp for each thought */
  showTimestamps?: boolean;
  /** Custom className */
  className?: string;
  /** Agent name/id doing the thinking */
  agentName?: string;
  /** Status: thinking, complete, error */
  status?: "thinking" | "complete" | "error";
}

/**
 * AgentThinking - Visualizes agent's thinking process
 * 
 * Pure presentational component for showing agent reasoning
 */
export const AgentThinking: React.FC<AgentThinkingProps> = ({
  thinking = false,
  thoughts = [],
  duration,
  expanded = false,
  onExpandedChange,
  compact = false,
  showTimestamps = false,
  className,
  agentName,
  status = thinking ? "thinking" : "complete",
}) => {
  const formatDuration = (ms?: number) => {
    if (!ms) return null;
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  // Get current thought or summary
  const getCurrentIntent = () => {
    if (thoughts.length === 0) return null;
    if (status === "thinking") {
      // Show the first thought as current intent
      return thoughts[0]?.content;
    }
    // Show last thought as final decision
    return thoughts[thoughts.length - 1]?.content;
  };

  const intent = getCurrentIntent();

  // Compact mode - single line with intent
  if (compact) {
    return (
      <div className={cn(
        "flex items-center",
        spacing.gap.sm,
        fontSize.body,
        status === "thinking" && effects.status.muted,
        status === "error" && effects.status.error,
        className
      )}>
        <Brain className={cn(
          componentSize.icon.sm,
          "flex-shrink-0",
          status === "thinking" && "animate-pulse",
          status === "thinking" && effects.status.active
        )} />
        <span className="flex items-center gap-1 flex-1 min-w-0">
          {status === "thinking" ? (
            <>
              {intent ? (
                <span className="truncate italic">{intent}</span>
              ) : (
                <>
                  {agentName && <span className="font-medium">{agentName}</span>}
                  <span>thinking</span>
                </>
              )}
              <ThinkingDots />
            </>
          ) : status === "error" ? (
            <>Thinking failed</>
          ) : (
            <>
              {intent ? (
                <span className="truncate">{intent}</span>
              ) : (
                <>
                  {agentName && <span className="font-medium">{agentName}</span>}
                  <span>analyzed</span>
                </>
              )}
              {duration && (
                <span className="text-muted-foreground ml-auto">
                  ({formatDuration(duration)})
                </span>
              )}
            </>
          )}
        </span>
      </div>
    );
  }

  // Full mode with collapsible details
  const header = (
    <div className={cn("flex items-center", spacing.gap.sm, fontSize.body)}>
      <Brain className={cn(
        componentSize.icon.sm,
        status === "thinking" && "animate-pulse",
        status === "thinking" && effects.status.active
      )} />
      <span className={cn("flex-1 flex items-center", spacing.gap.sm)}>
        {intent ? (
          <span className="font-medium truncate">{intent}</span>
        ) : (
          <span className="font-medium">
            {status === "thinking" ? "Thinking" : "Thought Process"}
          </span>
        )}
        {status === "thinking" && <ThinkingDots />}
      </span>
      {duration && status !== "thinking" && (
        <Badge variant="secondary" className={componentSize.badge.md}>
          {formatDuration(duration)}
        </Badge>
      )}
      {status === "error" && (
        <Badge variant="destructive" className={componentSize.badge.md}>
          Error
        </Badge>
      )}
    </div>
  );

  // If no thoughts or still thinking without thoughts, show simple version
  if (thoughts.length === 0) {
    return (
      <div className={cn(
        "flex items-center",
        spacing.gap.sm,
        spacing.padding.sm,
        borders.radius.md,
        effects.background.subtle,
        borders.width.thin,
        borders.opacity.subtle,
        className
      )}>
        {header}
      </div>
    );
  }

  return (
    <CollapsibleSection
      title={header}
      open={expanded}
      onOpenChange={onExpandedChange}
      className={cn(
        borders.radius.md,
        borders.width.thin,
        borders.opacity.subtle,
        effects.background.subtle,
        className
      )}
      headerClassName={cn(spacing.padding.sm, effects.hover.subtle)}
      contentClassName={cn("px-2 pb-2")}
      showIcon={true}
      closedIcon={ChevronRight}
      openIcon={ChevronDown}
    >
      <div className="space-y-1.5">
        {thoughts.map((thought, index) => (
          <motion.div
            key={thought.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn("flex items-start", spacing.gap.sm)}
          >
            <span className={cn(fontSize.label, effects.status.muted, "mt-0.5")}>
              {index + 1}.
            </span>
            <div className="flex-1 space-y-0.5">
              <p className={cn(fontSize.label, "leading-relaxed")}>{thought.content}</p>
              {showTimestamps && thought.timestamp && (
                <p className={cn(fontSize.caption, effects.status.muted)}>
                  {thought.timestamp.toLocaleTimeString()}
                  {thought.duration && ` (${formatDuration(thought.duration)})`}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </CollapsibleSection>
  );
};