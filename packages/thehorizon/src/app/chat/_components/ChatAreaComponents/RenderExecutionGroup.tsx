import React, { useMemo } from "react";
import { MinimalStyleProgress } from "./MinimalStyleProgress";
import type { ProgressMessage } from "@/schemas/stream.schemas";

interface RenderExecutionGroupProps {
  group: any;
  index: number;
}

// Helper function to convert execution steps to ProgressMessage format
const convertStepsToProgressMessages = (steps: any[]): ProgressMessage[] => {
  return steps.map((step, index) => ({
    id: step.id || `step-${index}`,
    type: step.stepType as ProgressMessage["type"],
    content: step.content || "",
    timestamp: step.timestamp || new Date().toISOString(),
    metadata: {
      functionName: step.functionName,
      stepIndex: index,
      ...step.metadata,
    },
  }));
};

export const RenderExecutionGroup = ({
  group,
  index,
}: RenderExecutionGroupProps) => {
  // Convert execution steps to progress messages
  const progressMessages = useMemo(() => {
    if (!group.steps || !Array.isArray(group.steps)) {
      return [];
    }
    return convertStepsToProgressMessages(group.steps);
  }, [group.steps]);

  // Don't render if no steps
  if (!progressMessages.length) {
    return null;
  }

  return (
    <div key={`execution-${group.executionId}-${index}`}>
      <MinimalStyleProgress
        messages={progressMessages}
        isActive={false} // Execution groups are completed
        disableAutoHide={true} // Don't auto-hide execution groups
        className="mb-4"
      />
    </div>
  );
};
