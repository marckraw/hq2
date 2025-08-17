import React from "react";
import { cn } from "@/lib/utils";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import { CollapsibleSection } from "../disclosure";
import { ThinkingDots } from "../animations";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
        "flex items-center gap-2 text-sm",
        status === "thinking" && "text-muted-foreground",
        status === "error" && "text-destructive",
        className
      )}>
        <Brain className={cn(
          "h-3.5 w-3.5 flex-shrink-0",
          status === "thinking" && "animate-pulse text-primary"
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
    <div className="flex items-center gap-2 text-sm">
      <Brain className={cn(
        "h-3.5 w-3.5",
        status === "thinking" && "animate-pulse text-primary"
      )} />
      <span className="flex-1 flex items-center gap-2">
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
        <Badge variant="secondary" className="text-xs h-5">
          {formatDuration(duration)}
        </Badge>
      )}
      {status === "error" && (
        <Badge variant="destructive" className="text-xs h-5">
          Error
        </Badge>
      )}
    </div>
  );

  // If no thoughts or still thinking without thoughts, show simple version
  if (thoughts.length === 0) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-md",
        "bg-muted/20 border border-muted-foreground/5",
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
        "rounded-md border border-muted-foreground/5 bg-muted/20",
        className
      )}
      headerClassName="p-2 hover:bg-muted/30"
      contentClassName="px-2 pb-2"
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
            className="flex items-start gap-2"
          >
            <span className="text-xs text-muted-foreground mt-0.5">
              {index + 1}.
            </span>
            <div className="flex-1 space-y-0.5">
              <p className="text-xs leading-relaxed">{thought.content}</p>
              {showTimestamps && thought.timestamp && (
                <p className="text-[10px] text-muted-foreground">
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