"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Trash2, 
  Pin,
  Archive,
  MoreVertical,
  Clock,
  Circle
} from "lucide-react";

export interface ConversationItemProps {
  id: string | number;
  title: string;
  preview?: string;
  timestamp?: Date | string;
  isActive?: boolean;
  isUnread?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  messageCount?: number;
  onSelect?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  showActions?: boolean;
  className?: string;
  animated?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export function ConversationItem({
  id,
  title,
  preview,
  timestamp,
  isActive = false,
  isUnread = false,
  isPinned = false,
  isArchived = false,
  messageCount,
  onSelect,
  onDelete,
  onPin,
  onArchive,
  showActions = true,
  className,
  animated = true,
  variant = "default",
}: ConversationItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const formatTimestamp = (ts: Date | string) => {
    const date = typeof ts === "string" ? new Date(ts) : ts;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const Container = animated ? motion.div : "div";
  
  const containerVariants = animated ? {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  } : {};

  return (
    <Container
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(animated ? containerVariants : {})}
    >
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start text-left group relative",
          variant === "compact" ? "h-auto py-2" : "h-auto py-3",
          isUnread && "font-medium",
          isArchived && "opacity-50",
          className
        )}
        onClick={onSelect}
      >
        <div className="flex items-start gap-3 w-full">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <MessageSquare className={cn(
              "text-muted-foreground",
              variant === "compact" ? "h-4 w-4 mt-0.5" : "h-4 w-4 mt-1",
              isActive && "text-primary"
            )} />
            {isUnread && (
              <Circle className="absolute -top-1 -right-1 h-2 w-2 fill-primary text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "truncate",
                    variant === "compact" ? "text-sm" : "text-sm",
                    isUnread && "text-foreground font-medium"
                  )}>
                    {title}
                  </span>
                  {isPinned && (
                    <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                
                {variant === "detailed" && preview && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {preview}
                  </p>
                )}
                
                {variant !== "compact" && (
                  <div className="flex items-center gap-3 mt-1">
                    {timestamp && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(timestamp)}
                      </span>
                    )}
                    {messageCount !== undefined && messageCount > 0 && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        {messageCount} messages
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <div className={cn(
                  "flex items-center gap-1 transition-opacity",
                  isHovered ? "opacity-100" : "opacity-0"
                )}>
                  {onPin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPin();
                      }}
                      className="h-6 w-6"
                    >
                      <Pin className={cn(
                        "h-3 w-3",
                        isPinned && "fill-current"
                      )} />
                    </Button>
                  )}
                  {onArchive && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive();
                      }}
                      className="h-6 w-6"
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="h-6 w-6 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Button>
    </Container>
  );
}