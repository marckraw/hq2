"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ApprovalHeader } from "../ApprovalHeader";
import { ApprovalPreview } from "../ApprovalPreview";
import { ApprovalDetails } from "../ApprovalDetails";
import { ApprovalActions } from "../ApprovalActions";
import { ApprovalMetadata } from "../ApprovalMetadata";
import type { Agent } from "@/components/ai-chat/ui/AgentAvatar";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";
export type ApprovalPriority = "low" | "medium" | "high" | "critical";

export interface ApprovalData {
  id: string;
  title: string;
  description: string;
  details?: {
    before?: string | React.ReactNode;
    after?: string | React.ReactNode;
    changes?: string[];
    risks?: string[];
    alternatives?: Array<{
      title: string;
      description: string;
      confidence: number;
    }>;
  };
  metadata?: {
    cost?: {
      tokens?: number;
      apiCalls?: number;
      estimatedTime?: string;
    };
    rollback?: boolean;
    dependencies?: string[];
  };
  confidence?: number;
  deadline?: Date;
  createdAt?: Date;
}

export interface ApprovalCardProps {
  approval: ApprovalData;
  agent?: Agent;
  status?: ApprovalStatus;
  priority?: ApprovalPriority;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onRequestChanges?: (id: string, changes: string) => void;
  onDefer?: (id: string, until?: Date) => void;
  className?: string;
  defaultExpanded?: boolean;
  showMetadata?: boolean;
  variant?: "inline" | "standalone" | "compact";
  animated?: boolean;
}

export function ApprovalCard({
  approval,
  agent,
  status = "pending",
  priority = "medium",
  onApprove,
  onReject,
  onRequestChanges,
  onDefer,
  className,
  defaultExpanded = false,
  showMetadata = true,
  variant = "inline",
  animated = true,
}: ApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [localStatus, setLocalStatus] = useState(status);

  const handleApprove = () => {
    if (onApprove) {
      setLocalStatus("approved");
      onApprove(approval.id);
    }
  };

  const handleReject = (reason?: string) => {
    if (onReject) {
      setLocalStatus("rejected");
      onReject(approval.id, reason);
    }
  };

  const statusStyles = {
    pending: "border-yellow-500/20 bg-yellow-500/5",
    approved: "border-green-500/20 bg-green-500/5",
    rejected: "border-red-500/20 bg-red-500/5",
    expired: "border-gray-500/20 bg-gray-500/5",
  };

  const priorityPulse = {
    low: "",
    medium: "",
    high: "animate-zen-breathe",
    critical: "animate-zen-breathe",
  };

  const cardContent = (
    <>
      <ApprovalHeader
        title={approval.title}
        agent={agent}
        status={localStatus}
        priority={priority}
        confidence={approval.confidence}
        deadline={approval.deadline}
        createdAt={approval.createdAt}
      />

      {!isExpanded && (
        <ApprovalPreview
          description={approval.description}
          changesCount={approval.details?.changes?.length}
          onExpand={() => setIsExpanded(true)}
        />
      )}

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ApprovalDetails
              details={approval.details}
              onCollapse={() => setIsExpanded(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {localStatus === "pending" && (
        <ApprovalActions
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={
            onRequestChanges
              ? (changes) => onRequestChanges(approval.id, changes)
              : undefined
          }
          onDefer={
            onDefer ? (until) => onDefer(approval.id, until) : undefined
          }
          variant={variant === "compact" ? "minimal" : "full"}
        />
      )}

      {showMetadata && approval.metadata && isExpanded && (
        <ApprovalMetadata metadata={approval.metadata} />
      )}
    </>
  );

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "p-3 rounded-lg border",
          // Only add transition if not using priority animation
          (priority === "low" || priority === "medium") && "transition-all",
          statusStyles[localStatus],
          priorityPulse[priority],
          className
        )}
      >
        {cardContent}
      </div>
    );
  }

  const CardWrapper = animated ? motion.div : "div";
  const cardProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <CardWrapper {...cardProps}>
      <Card
        className={cn(
          "overflow-hidden",
          // Only add transition if not using priority animation
          (priority === "low" || priority === "medium") && "transition-all duration-200",
          statusStyles[localStatus],
          priorityPulse[priority],
          localStatus === "pending" && "hover:shadow-lg",
          className
        )}
      >
        <div className="p-4 space-y-3">{cardContent}</div>
      </Card>
    </CardWrapper>
  );
}