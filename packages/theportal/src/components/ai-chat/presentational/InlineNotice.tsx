"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface InlineNoticeProps {
  variant?: "error" | "info" | "warning";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const variantStyles: Record<NonNullable<InlineNoticeProps["variant"]>, string> = {
  error: "border-destructive/40 bg-destructive/10 text-destructive-foreground/90",
  info: "border-primary/30 bg-primary/5",
  warning: "border-yellow-500/40 bg-yellow-500/10",
};

export const InlineNotice: React.FC<InlineNoticeProps> = ({
  variant = "info",
  message,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
        variantStyles[variant],
        className
      )}
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default InlineNotice;
