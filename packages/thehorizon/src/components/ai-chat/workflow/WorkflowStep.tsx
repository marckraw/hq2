import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Circle, CheckCircle, XCircle, Loader2, GitMerge } from "lucide-react";
import { fontSize, componentSize, spacing, borders, effects } from "../design-system";

export type StepStatus = "pending" | "active" | "complete" | "error" | "skipped";
export type StepType = "sequential" | "parallel" | "branch";

export interface WorkflowStepProps {
  /** Step number/index */
  stepNumber?: number;
  /** Status of this step */
  status?: StepStatus;
  /** Type of step execution */
  type?: StepType;
  /** Child components (AgentThinking, ToolCall, AgentRouter, etc) */
  children: React.ReactNode;
  /** Whether this step is part of a parallel group */
  parallel?: boolean;
  /** Number of parallel branches if type is parallel */
  parallelCount?: number;
  /** Show connector line to next step */
  showConnector?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom className */
  className?: string;
  /** Animation delay for staggered appearance */
  animationDelay?: number;
  /** Whether to animate on mount */
  animate?: boolean;
}

/**
 * WorkflowStep - Container for workflow visualization steps
 * 
 * Pure presentational component that wraps other workflow components
 */
export const WorkflowStep: React.FC<WorkflowStepProps> = ({
  stepNumber,
  status = "pending",
  type = "sequential",
  children,
  parallel = false,
  parallelCount,
  showConnector = true,
  compact = false,
  className,
  animationDelay = 0,
  animate = true,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <Loader2 className={cn(componentSize.icon.xs, "animate-spin", effects.status.active)} />;
      case "complete":
        return <CheckCircle className={cn(componentSize.icon.xs, effects.status.success)} />;
      case "error":
        return <XCircle className={cn(componentSize.icon.xs, effects.status.error)} />;
      case "skipped":
        return <Circle className={cn(componentSize.icon.xs, effects.status.muted, "opacity-50")} />;
      default:
        return <Circle className={cn(componentSize.icon.xs, effects.status.muted)} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "active": return "border-primary bg-primary/5";
      case "complete": return "border-green-500/30 bg-green-500/5";
      case "error": return "border-destructive/30 bg-destructive/5";
      case "skipped": return "opacity-50";
      default: return "border-muted-foreground/10";
    }
  };

  const stepContent = (
    <div className={cn(
      "relative flex",
      spacing.gap.sm,
      className
    )}>
      {/* Step indicator */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "flex items-center justify-center bg-background flex-shrink-0 mt-0.5",
          borders.radius.full,
          borders.width.thin,
          componentSize.circle.sm,
          getStatusColor()
        )}>
          {stepNumber ? (
            <span className={cn(
              "font-medium",
              fontSize.caption,
              status === "active" && effects.status.active,
              status === "complete" && effects.status.success,
              status === "error" && effects.status.error
            )}>
              {stepNumber}
            </span>
          ) : (
            getStatusIcon()
          )}
        </div>
        
        {/* Connector line */}
        {showConnector && (
          <div className={cn(
            "w-0.5 flex-1 mt-1",
            status === "complete" ? "bg-green-500/20" : "bg-muted-foreground/10",
            status === "active" && "bg-primary/20 animate-pulse"
          )} />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1">
        {type === "parallel" && parallelCount && parallelCount > 1 && (
          <div className="flex items-center gap-1 mb-1 text-[10px] text-muted-foreground">
            <GitMerge className="h-2.5 w-2.5" />
            <span>Parallel ({parallelCount})</span>
          </div>
        )}
        
        <div className={cn(
          parallel && "ml-3 border-l border-dashed border-muted-foreground/10 pl-3"
        )}>
          {children}
        </div>
      </div>
    </div>
  );

  if (!animate) {
    return stepContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: animationDelay,
        ease: "easeOut"
      }}
    >
      {stepContent}
    </motion.div>
  );
};

/**
 * WorkflowGroup - Groups multiple WorkflowSteps
 */
export interface WorkflowGroupProps {
  /** Group title */
  title?: string;
  /** Group type */
  type?: "sequential" | "parallel";
  /** Children (WorkflowSteps) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const WorkflowGroup: React.FC<WorkflowGroupProps> = ({
  title,
  type = "sequential",
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          {type === "parallel" && <GitMerge className="h-4 w-4" />}
          <span>{title}</span>
        </div>
      )}
      
      <div className={cn(
        type === "parallel" && "ml-6 border-l-2 border-dashed border-muted-foreground/20 pl-4"
      )}>
        {children}
      </div>
    </div>
  );
};