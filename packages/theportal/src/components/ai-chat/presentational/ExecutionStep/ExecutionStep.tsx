"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, Loader2, PlayCircle, XCircle } from "lucide-react";

export type ExecutionStatus = "pending" | "running" | "success" | "error" | "info";

export interface ExecutionStepProps {
  status?: ExecutionStatus;
  title?: string;
  description?: string;
  content?: string;
  meta?: Array<{ label: string; value: string | number }>;
  compact?: boolean;
  rightActions?: React.ReactNode;
  className?: string;
}

const statusStyles: Record<ExecutionStatus, { container: string; icon: React.ElementType; label: string }> = {
  pending: {
    container: "border-muted bg-muted/20",
    icon: PlayCircle,
    label: "Pending",
  },
  running: {
    container: "border-primary/40 bg-primary/5",
    icon: Loader2,
    label: "Running",
  },
  success: {
    container: "border-green-500/30 bg-green-500/5",
    icon: CheckCircle2,
    label: "Done",
  },
  error: {
    container: "border-destructive/40 bg-destructive/5",
    icon: XCircle,
    label: "Error",
  },
  info: {
    container: "border-accent/40 bg-accent/5",
    icon: Info,
    label: "Info",
  },
};

export const ExecutionStep: React.FC<ExecutionStepProps> = ({
  status = "info",
  title,
  description,
  content,
  meta,
  compact = false,
  rightActions,
  className,
}) => {
  const Icon = statusStyles[status].icon as React.ElementType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn("relative rounded-lg border p-3 md:p-4", statusStyles[status].container, className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 text-muted-foreground">
            <Icon className={cn("h-4 w-4", status === "running" && "animate-spin")} />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{title || statusStyles[status].label}</div>
            {description && <div className="text-sm text-foreground/90">{description}</div>}
          </div>
        </div>
        {rightActions}
      </div>

      {content && (
        <div className={cn("mt-2 text-sm whitespace-pre-wrap leading-relaxed", compact && "text-xs")}>{content}</div>
      )}

      {meta && meta.length > 0 && (
        <div className={cn("mt-3 flex flex-wrap gap-2", compact && "mt-2")}>
          {meta.map((m, i) => (
            <div
              key={`${m.label}-${i}`}
              className="px-2 py-0.5 rounded border text-xs text-muted-foreground bg-background/50"
            >
              <span className="font-medium">{m.label}:</span> {String(m.value)}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ExecutionStep;
