import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, ThumbsUp, ThumbsDown, MoreHorizontal, Eye, Share, Flag, Edit, Trash } from "lucide-react";

export interface MessageAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: "default" | "destructive" | "success";
  disabled?: boolean;
}

export interface MessageActionsProps {
  visible?: boolean;
  onCopy?: () => void;
  onRetry?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onShowDetails?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFlag?: () => void;
  customActions?: MessageAction[];
  showActions?: {
    copy?: boolean;
    retry?: boolean;
    feedback?: boolean;
    details?: boolean;
    share?: boolean;
    edit?: boolean;
    delete?: boolean;
    flag?: boolean;
    more?: boolean;
  };
  direction?: "horizontal" | "vertical";
  size?: "sm" | "md";
  className?: string;
  animation?: "fade" | "slide" | "scale";
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  visible = false,
  onCopy,
  onRetry,
  onThumbsUp,
  onThumbsDown,
  onShowDetails,
  onShare,
  onEdit,
  onDelete,
  onFlag,
  customActions = [],
  showActions = {
    copy: true,
    retry: false,
    feedback: false,
    details: false,
    share: false,
    edit: false,
    delete: false,
    flag: false,
    more: false,
  },
  direction = "horizontal",
  size = "sm",
  className,
  animation = "fade",
}) => {
  const actions: MessageAction[] = [];
  if (showActions.copy && onCopy) actions.push({ id: "copy", label: "Copy", icon: Copy, onClick: onCopy });
  if (showActions.retry && onRetry) actions.push({ id: "retry", label: "Retry", icon: RotateCcw, onClick: onRetry });
  if (showActions.feedback && onThumbsUp)
    actions.push({ id: "thumbsUp", label: "Good", icon: ThumbsUp, onClick: onThumbsUp });
  if (showActions.feedback && onThumbsDown)
    actions.push({ id: "thumbsDown", label: "Bad", icon: ThumbsDown, onClick: onThumbsDown });
  if (showActions.details && onShowDetails)
    actions.push({ id: "details", label: "Details", icon: Eye, onClick: onShowDetails });
  if (showActions.share && onShare) actions.push({ id: "share", label: "Share", icon: Share, onClick: onShare });
  if (showActions.edit && onEdit) actions.push({ id: "edit", label: "Edit", icon: Edit, onClick: onEdit });
  if (showActions.flag && onFlag) actions.push({ id: "flag", label: "Report", icon: Flag, onClick: onFlag });
  if (showActions.delete && onDelete)
    actions.push({ id: "delete", label: "Delete", icon: Trash, onClick: onDelete, variant: "destructive" });
  actions.push(...customActions);

  const buttonSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  const animationVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: direction === "horizontal" ? -10 : 0, y: direction === "vertical" ? -10 : 0 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: direction === "horizontal" ? -10 : 0, y: direction === "vertical" ? -10 : 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
  };

  return (
    <AnimatePresence>
      {visible && actions.length > 0 && (
        <motion.div
          variants={animationVariants[animation]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.15 }}
          className={cn("flex gap-1", direction === "vertical" && "flex-col", className)}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            const variant =
              action.variant === "destructive" ? "destructive" : action.variant === "success" ? "default" : "ghost";

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Button
                  variant={variant}
                  size="icon"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    buttonSize,
                    action.variant === "success" && "hover:bg-green-500/10 hover:text-green-600"
                  )}
                  title={action.label}
                >
                  <Icon className={iconSize} />
                  <span className="sr-only">{action.label}</span>
                </Button>
              </motion.div>
            );
          })}

          {showActions.more && actions.length > 0 && (
            <Button variant="ghost" size="icon" className={buttonSize} title="More actions">
              <MoreHorizontal className={iconSize} />
              <span className="sr-only">More actions</span>
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export interface QuickActionsProps {
  actions: MessageAction[];
  visible?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  visible = false,
  position = "top",
  className,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={cn(
            "absolute z-10 flex gap-1 p-1 bg-background border rounded-lg shadow-lg",
            position === "top" && "bottom-full mb-2 left-0",
            position === "bottom" && "top-full mt-2 left-0",
            position === "left" && "right-full mr-2 top-0",
            position === "right" && "left-full ml-2 top-0",
            className
          )}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="h-8 px-2 gap-1"
              >
                <Icon className="h-3 w-3" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
