"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ApprovalPreviewProps {
  description: string;
  changesCount?: number;
  onExpand: () => void;
  className?: string;
}

export function ApprovalPreview({
  description,
  changesCount,
  onExpand,
  className,
}: ApprovalPreviewProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {changesCount !== undefined && changesCount > 0 && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {changesCount} change{changesCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            View details
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="h-7 px-2 text-xs"
        >
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-3 w-3" />
          </motion.div>
          <span className="ml-1">Expand</span>
        </Button>
      </div>
    </div>
  );
}