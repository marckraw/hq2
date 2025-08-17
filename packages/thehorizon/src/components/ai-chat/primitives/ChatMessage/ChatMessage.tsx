import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { User, Bot, Info } from "lucide-react";
import { AgentAvatar, AgentBadge, type Agent } from "@/components/ai-chat/ui/AgentAvatar";

export interface ChatMessageProps {
  /** The role of the message sender */
  role: "user" | "assistant" | "system";
  /** The message content - can be text or JSX */
  content: React.ReactNode;
  /** Optional timestamp */
  timestamp?: Date | string;
  /** Optional custom className */
  className?: string;
  /** Optional avatar URL or element */
  avatar?: string | React.ReactNode;
  /** Whether to show the default avatar icon */
  showAvatar?: boolean;
  /** Optional message status */
  status?: "sending" | "sent" | "error";
  /** Whether the message is highlighted */
  isHighlighted?: boolean;
  /** Optional action buttons or elements */
  actions?: React.ReactNode;
  /** Alignment of the message */
  align?: "left" | "right" | "center";
  /** Agent information for assistant messages */
  agent?: Agent;
  /** Whether to show agent badge */
  showAgentBadge?: boolean;
  /** Thinking/processing time in ms */
  thinkingTime?: number;
}

/**
 * ChatMessage - A pure presentational component for displaying chat messages
 * 
 * This component is completely stateless and focuses only on presentation.
 * All interactivity should be handled by parent components through props.
 */
export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      role,
      content,
      timestamp,
      className,
      avatar,
      showAvatar = true,
      status,
      isHighlighted = false,
      actions,
      align,
      agent,
      showAgentBadge = false,
      thinkingTime,
    },
    ref
  ) => {
    // Determine alignment based on role if not explicitly set
    const messageAlign = align || (role === "user" ? "right" : "left");
    
    // Get role-specific styles
    const roleStyles = {
      user: {
        card: "bg-primary text-primary-foreground",
        icon: User,
        iconClass: "bg-primary-foreground/10",
      },
      assistant: {
        card: "bg-card",
        icon: Bot,
        iconClass: "bg-primary/10 text-primary",
      },
      system: {
        card: "bg-muted",
        icon: Info,
        iconClass: "bg-muted-foreground/10",
      },
    };

    const styles = roleStyles[role];
    const Icon = styles.icon;

    // Format timestamp if provided
    const formattedTime = timestamp
      ? new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    // Build avatar element
    const avatarElement = showAvatar && (
      role === "assistant" && agent ? (
        <AgentAvatar 
          agent={agent} 
          size="sm"
          isActive={status === "sending"}
          animate
        />
      ) : (
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            styles.iconClass
          )}
        >
          {avatar ? (
            typeof avatar === "string" ? (
              <img
                src={avatar}
                alt={`${role} avatar`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              avatar
            )
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>
      )
    );

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full gap-3 group",
          messageAlign === "right" && "justify-end",
          messageAlign === "center" && "justify-center",
          className
        )}
      >
        {/* Avatar on the left for non-user messages */}
        {messageAlign === "left" && avatarElement}

        {/* Message content */}
        <div
          className={cn(
            "flex flex-col gap-1 max-w-[70%]",
            messageAlign === "right" && "items-end",
            messageAlign === "center" && "items-center"
          )}
        >
          {/* Agent badge for assistant messages */}
          {role === "assistant" && agent && showAgentBadge && (
            <div className="mb-1">
              <AgentBadge agent={agent} size="sm" />
            </div>
          )}

          <Card
            className={cn(
              "px-4 py-2 relative transition-all duration-200",
              styles.card,
              isHighlighted && "ring-2 ring-primary ring-offset-2",
              status === "sending" && "opacity-70",
              status === "error" && "ring-2 ring-destructive",
              "hover:shadow-md"
            )}
          >
            {/* Message content */}
            <div className="break-words whitespace-pre-wrap">{content}</div>

            {/* Status indicator for sending */}
            {status === "sending" && (
              <div className="absolute -bottom-1 -right-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            )}
          </Card>

          {/* Timestamp, thinking time, and actions row */}
          {(formattedTime || thinkingTime || actions) && (
            <div
              className={cn(
                "flex items-center gap-2 px-1",
                messageAlign === "right" && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "flex items-center gap-2 text-xs text-muted-foreground",
                messageAlign === "right" && "flex-row-reverse"
              )}>
                {formattedTime && (
                  <span>{formattedTime}</span>
                )}
                {thinkingTime && role === "assistant" && (
                  <span className="text-muted-foreground/60">
                    • {(thinkingTime / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
              
              {/* Actions - only visible on hover */}
              {actions && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {actions}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar on the right for user messages */}
        {messageAlign === "right" && avatarElement}
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";