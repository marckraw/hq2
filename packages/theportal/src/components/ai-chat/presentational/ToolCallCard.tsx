"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, Clock, Copy } from "lucide-react";
import { pickToolIcon } from "@/lib/tool-icons";
import JsonBlock from "./JsonBlock";

export interface ToolCallCardProps {
  toolName?: string;
  parameters?: unknown;
  result?: unknown;
  status?: "running" | "completed" | "error";
  elapsedMs?: number;
  defaultCollapsed?: boolean;
  className?: string;
}

const Section: React.FC<{ title: string; children: React.ReactNode; onCopy?: () => void }> = ({
  title,
  children,
  onCopy,
}) => {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{title}</span>
        {onCopy && (
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onCopy}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy
          </Button>
        )}
      </div>
      <div className="rounded-md border bg-background/60 p-2 text-xs whitespace-pre-wrap overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

export const ToolCallCard: React.FC<ToolCallCardProps> = ({
  toolName = "tool",
  parameters,
  result,
  status = result !== undefined ? "completed" : "running",
  elapsedMs,
  defaultCollapsed = true,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const prettyParams = useMemo(() => {
    try {
      return typeof parameters === "string"
        ? JSON.stringify(JSON.parse(parameters), null, 2)
        : JSON.stringify(parameters, null, 2);
    } catch {
      return typeof parameters === "string" ? parameters : JSON.stringify(parameters, null, 2);
    }
  }, [parameters]);

  const prettyResult = useMemo(() => {
    try {
      return typeof result === "string" ? JSON.stringify(JSON.parse(result), null, 2) : JSON.stringify(result, null, 2);
    } catch {
      return typeof result === "string" ? result : JSON.stringify(result, null, 2);
    }
  }, [result]);

  const statusPill = (
    <div
      className={cn(
        "px-2 py-0.5 rounded text-xs border",
        status === "completed" && "bg-green-500/10 text-green-700 border-green-500/30",
        status === "running" && "bg-primary/5 text-primary border-primary/30",
        status === "error" && "bg-destructive/10 text-destructive border-destructive/40"
      )}
    >
      {status === "completed" ? "Completed" : status === "running" ? "Running" : "Error"}
    </div>
  );

  return (
    <div className={cn("rounded-lg border p-3 md:p-4 bg-card text-card-foreground", className)}>
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between gap-2"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {React.createElement(pickToolIcon(toolName), { className: "h-4 w-4" })}
          <span>{toolName}</span>
        </div>
        <div className="flex items-center gap-2">
          {statusPill}
          {typeof elapsedMs === "number" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{Math.max(1, Math.round(elapsedMs))} ms</span>
            </div>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", !collapsed && "rotate-180")} />
        </div>
      </button>

      {!collapsed && (
        <div className="mt-3 grid gap-3">
          {parameters !== undefined && (
            <Section title="PARAMETERS" onCopy={() => navigator.clipboard.writeText(prettyParams)}>
              <JsonBlock value={parameters} />
            </Section>
          )}

          {result !== undefined && (
            <Section title="RESULT" onCopy={() => navigator.clipboard.writeText(prettyResult)}>
              <JsonBlock value={result} />
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCallCard;
