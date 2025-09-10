"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SidebarHintPillProps {
  count?: number;
  label?: string;
  icon?: React.ElementType;
  isActive?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  position?: "left" | "right";
  animated?: boolean;
  showBadge?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "expanded";
}

export function SidebarHintPill({
  count = 0,
  label = "chats",
  icon: Icon = MessageSquare,
  isActive = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  position = "left",
  animated = true,
  showBadge = true,
  className,
  variant = "default",
}: SidebarHintPillProps) {
  const Container = animated ? motion.div : "div";

  const containerVariants: Variants | {} = animated
    ? {
        initial: { x: position === "left" ? -10 : 10, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: position === "left" ? -10 : 10, opacity: 0 },
      }
    : {};

  const hoverVariants: Variants | undefined = animated
    ? {
        rest: { x: 0 },
        hover: { x: position === "left" ? 2 : -2 },
      }
    : undefined;

  const isExpanded = variant === "expanded" || isHovered;

  return (
    <Container
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-40",
        position === "left" ? "left-0" : "right-0",
        "transition-all duration-200",
        isActive && "opacity-0 pointer-events-none",
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      {...(animated ? containerVariants : {})}
    >
      <motion.div
        className={cn(
          "flex items-center gap-2 px-2 py-3",
          position === "left" ? "rounded-r-full" : "rounded-l-full",
          "bg-card/80 backdrop-blur border",
          position === "left" ? "border-l-0" : "border-r-0",
          "cursor-pointer transition-all duration-200",
          "hover:px-4 hover:gap-3 group",
          variant === "minimal" && "py-2",
          variant === "expanded" && "px-4 gap-3"
        )}
        variants={hoverVariants}
        initial="rest"
        whileHover="hover"
        animate={isHovered ? "hover" : "rest"}
      >
        <Icon
          className={cn(
            "text-muted-foreground transition-colors",
            "group-hover:text-foreground",
            variant === "minimal" ? "h-3.5 w-3.5" : "h-4 w-4"
          )}
        />

        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "font-medium text-muted-foreground",
                "transition-colors group-hover:text-foreground overflow-hidden",
                variant === "minimal" ? "text-xs" : "text-sm"
              )}
            >
              {count > 0 ? `${count} ${label}` : `No ${label}`}
            </motion.span>
          )}
        </AnimatePresence>

        {!isExpanded && variant !== "minimal" && (
          <ChevronRight
            className={cn(
              "h-3 w-3 text-muted-foreground/50",
              "transition-all duration-200",
              "group-hover:text-muted-foreground",
              position === "right" && "rotate-180"
            )}
          />
        )}

        {/* Badge for count when collapsed */}
        <AnimatePresence>
          {showBadge && count > 0 && !isExpanded && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                "absolute -top-1",
                position === "left" ? "-right-1" : "-left-1",
                "h-5 w-5 rounded-full",
                "bg-primary text-primary-foreground",
                "text-xs flex items-center justify-center font-medium"
              )}
            >
              {count > 99 ? "99+" : count}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
}
