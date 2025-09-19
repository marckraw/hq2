"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Timer } from "lucide-react";
import { formatDurationShort } from "@/lib/time";

export interface RunAccordionProps {
  durationMs: number;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
}

export const RunAccordion: React.FC<RunAccordionProps> = ({
  durationMs,
  children,
  defaultCollapsed = true,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div className={cn("rounded-lg border mt-3 mb-2", className)}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-3 text-sm"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>Worked for {formatDurationShort(durationMs)}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", !collapsed && "rotate-180")} />
      </button>
      {!collapsed && <div className="p-3 border-t">{children}</div>}
    </div>
  );
};

export default RunAccordion;
