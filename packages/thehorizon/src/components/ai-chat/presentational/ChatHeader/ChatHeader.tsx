"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Sparkles, 
  Menu,
  X,
  Settings,
  Share,
  Download,
  MoreVertical
} from "lucide-react";

export type ChatHeaderVariant = "default" | "minimal" | "detailed";

export interface ChatHeaderAction {
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "ghost" | "outline" | "default";
}

export interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  onBack?: () => void;
  onMenuClick?: () => void;
  actions?: ChatHeaderAction[];
  variant?: ChatHeaderVariant;
  status?: "online" | "offline" | "typing" | "thinking";
  badge?: string;
  className?: string;
  animated?: boolean;
  showBackButton?: boolean;
  showMenuButton?: boolean;
}

const statusConfig = {
  online: {
    color: "bg-green-500",
    text: "Online",
    pulse: true,
  },
  offline: {
    color: "bg-gray-400",
    text: "Offline",
    pulse: false,
  },
  typing: {
    color: "bg-blue-500",
    text: "Typing...",
    pulse: true,
  },
  thinking: {
    color: "bg-yellow-500",
    text: "Thinking...",
    pulse: true,
  },
};

export function ChatHeader({
  title = "AI Assistant",
  subtitle,
  icon: Icon = Sparkles,
  onBack,
  onMenuClick,
  actions = [],
  variant = "default",
  status,
  badge,
  className,
  animated = true,
  showBackButton = true,
  showMenuButton = false,
}: ChatHeaderProps) {
  const containerVariants = animated ? {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  } : {};

  const Container = animated ? motion.div : "div";

  return (
    <Container
      className={cn(
        "border-b bg-card/50 backdrop-blur",
        className
      )}
      {...(animated ? containerVariants : {})}
    >
      <div className="px-4">
        <div className={cn(
          "flex items-center justify-between",
          variant === "minimal" ? "h-12" : "h-14"
        )}>
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className={cn(
                  variant === "minimal" ? "h-7 w-7" : "h-8 w-8"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {showMenuButton && onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className={cn(
                  variant === "minimal" ? "h-7 w-7" : "h-8 w-8"
                )}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon className={cn(
                  "text-primary",
                  variant === "minimal" ? "h-4 w-4" : "h-5 w-5"
                )} />
                {status && (
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full",
                    statusConfig[status].color,
                    statusConfig[status].pulse && "animate-pulse"
                  )} />
                )}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium",
                    variant === "minimal" ? "text-sm" : "text-base"
                  )}>
                    {title}
                  </span>
                  {badge && (
                    <Badge variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
                
                {variant === "detailed" && subtitle && (
                  <span className="text-xs text-muted-foreground">
                    {subtitle}
                  </span>
                )}
                
                {variant === "detailed" && status && (
                  <span className="text-xs text-muted-foreground">
                    {statusConfig[status].text}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          {actions.length > 0 && (
            <div className="flex items-center gap-1">
              {variant === "minimal" && actions.length > 2 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={actions[0]?.onClick}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              ) : (
                actions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.div
                      key={action.id}
                      whileHover={animated ? { scale: 1.05 } : undefined}
                      whileTap={animated ? { scale: 0.95 } : undefined}
                    >
                      <Button
                        variant={action.variant || "ghost"}
                        size="icon"
                        onClick={action.onClick}
                        className={cn(
                          variant === "minimal" ? "h-7 w-7" : "h-8 w-8"
                        )}
                        title={action.label}
                      >
                        <ActionIcon className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}