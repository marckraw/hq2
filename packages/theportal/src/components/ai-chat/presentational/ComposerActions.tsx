"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ComposerActionsProps {
  isWorking: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onStop: () => void;
  className?: string;
}

export const ComposerActions: React.FC<ComposerActionsProps> = ({
  isWorking,
  canSubmit,
  onSubmit,
  onStop,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
    >
      {isWorking ? (
        <Button variant="destructive" onClick={onStop}>
          Stop
        </Button>
      ) : (
        <Button onClick={onSubmit} disabled={!canSubmit}>
          Submit
        </Button>
      )}
    </div>
  );
};

export default ComposerActions;
