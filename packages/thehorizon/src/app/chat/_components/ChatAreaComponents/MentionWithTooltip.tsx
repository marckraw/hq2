import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const MentionWithTooltip = ({
  mention,
  fullText,
}: {
  mention: string;
  fullText: string;
}) => (
  <TooltipProvider>
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <span className="mention bg-blue-100 text-blue-800 px-1 rounded cursor-help transition-colors hover:bg-blue-200 relative">
          {mention}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm">{fullText}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
