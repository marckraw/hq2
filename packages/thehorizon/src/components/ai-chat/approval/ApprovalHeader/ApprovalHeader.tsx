"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AgentAvatar, type Agent } from "@/components/ai-chat/ui/AgentAvatar";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle, XCircle, Timer } from "lucide-react";
import type { ApprovalStatus, ApprovalPriority } from "../ApprovalCard/ApprovalCard";

interface ApprovalHeaderProps {
  title: string;
  agent?: Agent;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  confidence?: number;
  deadline?: Date;
  createdAt?: Date;
  className?: string;
}

export function ApprovalHeader({
  title,
  agent,
  status,
  priority,
  confidence,
  deadline,
  createdAt,
  className,
}: ApprovalHeaderProps) {
  const statusIcons = {
    pending: <Clock className="h-3 w-3" />,
    approved: <CheckCircle className="h-3 w-3" />,
    rejected: <XCircle className="h-3 w-3" />,
    expired: <Timer className="h-3 w-3" />,
  };

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    approved: "bg-green-500/10 text-green-700 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
    expired: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    high: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    critical: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  const getTimeRemaining = () => {
    if (!deadline) return null;
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {agent && (
        <AgentAvatar 
          agent={agent} 
          size="sm"
          showStatus={status === "pending"}
          status="active"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-sm truncate">{title}</h3>
          
          <div className="flex items-center gap-1.5">
            <Badge 
              variant="secondary" 
              className={cn("text-xs gap-1", statusColors[status])}
            >
              {statusIcons[status]}
              {status}
            </Badge>
            
            {priority !== "medium" && (
              <Badge 
                variant="secondary"
                className={cn("text-xs", priorityColors[priority])}
              >
                {priority === "critical" && <AlertCircle className="h-3 w-3 mr-1" />}
                {priority}
              </Badge>
            )}
            
            {confidence !== undefined && (
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                {confidence}% confidence
              </Badge>
            )}
          </div>
        </div>
        
        {(timeRemaining || createdAt) && (
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {timeRemaining && (
              <span className={cn(
                "flex items-center gap-1",
                timeRemaining === "Expired" && "text-red-500"
              )}>
                <Timer className="h-3 w-3" />
                {timeRemaining}
              </span>
            )}
            {createdAt && (
              <span>
                {new Date(createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}