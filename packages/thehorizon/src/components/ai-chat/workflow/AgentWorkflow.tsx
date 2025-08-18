import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { WorkflowStep, WorkflowGroup, StepStatus } from "./WorkflowStep";
import { AgentThinking } from "./AgentThinking";
import { ToolCall } from "./ToolCall";
import { AgentRouter } from "./AgentRouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, PlayCircle, FastForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type WorkflowItemType = "thinking" | "tool" | "routing" | "message" | "custom";

export interface WorkflowItem {
  id: string;
  type: WorkflowItemType;
  status?: StepStatus;
  parallel?: boolean;
  data?: any;
  children?: React.ReactNode;
}

export interface AgentWorkflowProps {
  /** Workflow items to display */
  items: WorkflowItem[];
  /** Current active step index */
  currentStep?: number;
  /** Display mode */
  mode?: "compact" | "detailed" | "auto";
  /** Whether workflow is running */
  isRunning?: boolean;
  /** Whether workflow is complete */
  isComplete?: boolean;
  /** Total duration of workflow */
  totalDuration?: number;
  /** Show step numbers */
  showStepNumbers?: boolean;
  /** Auto-expand active steps */
  autoExpandActive?: boolean;
  /** Custom className */
  className?: string;
  /** Header title */
  title?: string;
  /** Agent performing the workflow */
  agentName?: string;
  /** Callback when mode changes */
  onModeChange?: (mode: "compact" | "detailed") => void;
}

/**
 * AgentWorkflow - Complete workflow visualization container
 * 
 * Orchestrates all workflow components into a timeline view
 */
export const AgentWorkflow: React.FC<AgentWorkflowProps> = ({
  items,
  currentStep,
  mode = "auto",
  isRunning = false,
  isComplete = false,
  totalDuration,
  showStepNumbers = true,
  autoExpandActive = true,
  className,
  title = "Agent Workflow",
  agentName,
  onModeChange,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"compact" | "detailed">(
    mode === "auto" ? "detailed" : mode
  );

  const isCompact = viewMode === "compact";

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === "compact" ? "detailed" : "compact";
    setViewMode(newMode);
    onModeChange?.(newMode);
  };

  const renderWorkflowItem = (item: WorkflowItem, index: number) => {
    const isActive = currentStep === index;
    const isExpanded = expandedSteps.has(item.id) || (isActive && autoExpandActive);
    
    let content: React.ReactNode = null;

    switch (item.type) {
      case "thinking":
        content = (
          <AgentThinking
            {...item.data}
            compact={isCompact}
            expanded={isExpanded && !isCompact}
            onExpandedChange={() => toggleStepExpansion(item.id)}
            status={item.status === "active" ? "thinking" : 
                   item.status === "error" ? "error" : "complete"}
          />
        );
        break;

      case "tool":
        content = (
          <ToolCall
            {...item.data}
            compact={isCompact}
            expanded={isExpanded && !isCompact}
            onExpandedChange={() => toggleStepExpansion(item.id)}
            status={item.status === "active" ? "running" :
                   item.status === "complete" ? "success" :
                   item.status === "error" ? "error" : "pending"}
          />
        );
        break;

      case "routing":
        content = (
          <AgentRouter
            {...item.data}
            compact={isCompact}
            expanded={isExpanded && !isCompact}
            onExpandedChange={() => toggleStepExpansion(item.id)}
            status={item.status === "active" ? "routing" :
                   item.status === "error" ? "error" : "complete"}
          />
        );
        break;

      case "message":
        content = (
          <Card className="p-3 bg-muted/30">
            <p className="text-sm">{item.data?.content || "Message"}</p>
          </Card>
        );
        break;

      case "custom":
        content = item.children;
        break;
    }

    return (
      <WorkflowStep
        key={item.id}
        stepNumber={showStepNumbers ? index + 1 : undefined}
        status={item.status || "pending"}
        parallel={item.parallel}
        showConnector={index < items.length - 1}
        compact={isCompact}
        animationDelay={index * 0.1}
        animate={!isComplete}
      >
        {content}
      </WorkflowStep>
    );
  };

  // Group parallel items
  const groupedItems: Array<WorkflowItem | WorkflowItem[]> = [];
  let i = 0;
  while (i < items.length) {
    if (items[i].parallel) {
      const parallelGroup: WorkflowItem[] = [items[i]];
      i++;
      while (i < items.length && items[i].parallel) {
        parallelGroup.push(items[i]);
        i++;
      }
      groupedItems.push(parallelGroup);
    } else {
      groupedItems.push(items[i]);
      i++;
    }
  }

  const formatDuration = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{title}</h3>
          {agentName && (
            <Badge variant="secondary" className="text-xs h-5 px-2">
              {agentName}
            </Badge>
          )}
          {isRunning && (
            <Badge variant="default" className="text-xs h-5 px-2">
              <PlayCircle className="h-3 w-3 mr-1" />
              Running
            </Badge>
          )}
          {isComplete && totalDuration && (
            <Badge variant="outline" className="text-xs h-5 px-2">
              {formatDuration(totalDuration)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {isRunning && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              <FastForward className="h-3 w-3 mr-1" />
              Skip
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleViewMode}
            className="h-7 px-2"
          >
            {isCompact ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Workflow content */}
      <div className={cn(
        "p-3 space-y-2"
      )}>
        <AnimatePresence mode="sync">
          {groupedItems.map((item, index) => {
            if (Array.isArray(item)) {
              // Parallel group
              return (
                <WorkflowGroup
                  key={`group-${index}`}
                  type="parallel"
                  title={`Parallel execution (${item.length} operations)`}
                >
                  {item.map((parallelItem, pIndex) => 
                    renderWorkflowItem(parallelItem, index + pIndex)
                  )}
                </WorkflowGroup>
              );
            } else {
              // Sequential item
              return renderWorkflowItem(item, index);
            }
          })}
        </AnimatePresence>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No workflow steps yet</p>
          </div>
        )}
      </div>
    </Card>
  );
};