import React from "react";
import { cn } from "@/lib/utils";
import type { DocumentAttachmentProps } from "./DocumentAttachment";
import { DocumentAttachment } from "./DocumentAttachment";
import { motion, AnimatePresence } from "framer-motion";
import { fontSize, spacing, borders, effects } from "../design-system";
import { Paperclip } from "lucide-react";

export interface AttachmentListProps {
  /** List of attachments */
  attachments: DocumentAttachmentProps[];
  /** Maximum number of visible attachments before collapsing */
  maxVisible?: number;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Layout direction */
  direction?: "horizontal" | "vertical" | "grid";
  /** Show attachment count */
  showCount?: boolean;
  /** Title/label for the list */
  title?: string;
  /** Callback when any attachment is removed */
  onRemove?: (id: string) => void;
  /** Callback when any attachment is previewed */
  onPreview?: (id: string) => void;
  /** Callback when any attachment is downloaded */
  onDownload?: (id: string) => void;
  /** Custom className */
  className?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether list is editable */
  editable?: boolean;
}

/**
 * AttachmentList - Display multiple document attachments
 * 
 * Pure presentational component for showing a list of attachments
 */
export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  maxVisible = 3,
  compact = false,
  direction = "vertical",
  showCount = true,
  title,
  onRemove,
  onPreview,
  onDownload,
  className,
  emptyMessage = "No attachments",
  editable = true,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const visibleAttachments = expanded
    ? attachments
    : attachments.slice(0, maxVisible);

  const hiddenCount = attachments.length - maxVisible;
  const hasMore = hiddenCount > 0 && !expanded;

  // Empty state
  if (attachments.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          spacing.padding.md,
          borders.radius.md,
          borders.width.thin,
          "border-dashed",
          borders.opacity.light,
          className
        )}
      >
        <p className={cn(fontSize.body, effects.status.muted)}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Grid layout for compact mode
  if (compact && direction === "grid") {
    return (
      <div className={cn("space-y-2", className)}>
        {title && (
          <div className="flex items-center gap-1">
            <Paperclip className="h-3 w-3 text-muted-foreground" />
            <span className={cn(fontSize.label, effects.status.muted)}>
              {title}
            </span>
            {showCount && (
              <span className={cn(fontSize.caption, effects.status.muted)}>
                ({attachments.length})
              </span>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          <AnimatePresence mode="popLayout">
            {visibleAttachments.map((attachment, index) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <DocumentAttachment
                  {...attachment}
                  compact={true}
                  removable={editable && attachment.removable}
                  onRemove={onRemove}
                  onPreview={onPreview}
                  onDownload={onDownload}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {hasMore && (
            <button
              onClick={() => setExpanded(true)}
              className={cn(
                "inline-flex items-center",
                spacing.gap.xs,
                spacing.padding.xs,
                borders.radius.md,
                borders.width.thin,
                borders.opacity.light,
                effects.background.subtle,
                effects.hover.medium,
                fontSize.caption,
                "transition-colors"
              )}
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      </div>
    );
  }

  // Horizontal layout
  if (direction === "horizontal") {
    return (
      <div className={cn("space-y-2", className)}>
        {(title || showCount) && (
          <div className="flex items-center justify-between">
            {title && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className={cn(fontSize.body, "font-medium")}>
                  {title}
                </span>
              </div>
            )}
            {showCount && (
              <span className={cn(fontSize.label, effects.status.muted)}>
                {attachments.length} {attachments.length === 1 ? "file" : "files"}
              </span>
            )}
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <AnimatePresence mode="popLayout">
            {visibleAttachments.map((attachment, index) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex-shrink-0"
              >
                <DocumentAttachment
                  {...attachment}
                  compact={compact}
                  removable={editable && attachment.removable}
                  onRemove={onRemove}
                  onPreview={onPreview}
                  onDownload={onDownload}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {hasMore && (
            <button
              onClick={() => setExpanded(true)}
              className={cn(
                "flex-shrink-0 flex items-center justify-center px-4",
                borders.radius.md,
                borders.width.thin,
                borders.opacity.light,
                effects.background.subtle,
                effects.hover.medium,
                fontSize.body,
                "transition-colors"
              )}
            >
              View all ({attachments.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default vertical layout
  return (
    <div className={cn("space-y-2", className)}>
      {(title || showCount) && (
        <div className="flex items-center justify-between">
          {title && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={cn(fontSize.body, "font-medium")}>
                {title}
              </span>
            </div>
          )}
          {showCount && (
            <span className={cn(fontSize.label, effects.status.muted)}>
              {attachments.length} {attachments.length === 1 ? "file" : "files"}
            </span>
          )}
        </div>
      )}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleAttachments.map((attachment, index) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <DocumentAttachment
                {...attachment}
                compact={compact}
                removable={editable && attachment.removable}
                onRemove={onRemove}
                onPreview={onPreview}
                onDownload={onDownload}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {hasMore && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setExpanded(true)}
            className={cn(
              "w-full",
              spacing.padding.sm,
              borders.radius.md,
              borders.width.thin,
              borders.opacity.light,
              effects.background.subtle,
              effects.hover.medium,
              fontSize.body,
              effects.status.muted,
              "transition-colors text-center"
            )}
          >
            Show {hiddenCount} more {hiddenCount === 1 ? "attachment" : "attachments"}
          </motion.button>
        )}
        {expanded && hiddenCount > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setExpanded(false)}
            className={cn(
              "w-full",
              spacing.padding.sm,
              fontSize.body,
              effects.status.muted,
              effects.hover.subtle,
              "transition-colors text-center"
            )}
          >
            Show less
          </motion.button>
        )}
      </div>
    </div>
  );
};