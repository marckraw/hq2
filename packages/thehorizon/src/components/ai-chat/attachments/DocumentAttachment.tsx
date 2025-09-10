import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Image, Film, Music, Link2, File, X, ExternalLink, Download, Eye } from "lucide-react";
import { fontSize, componentSize, spacing, borders, effects } from "../design-system";
import { HoverCard } from "../disclosure";

export type AttachmentType = "pdf" | "image" | "video" | "audio" | "link" | "file";

export interface DocumentAttachmentProps {
  /** Unique identifier */
  id: string;
  /** Display name of the attachment */
  name: string;
  /** Type of attachment */
  type: AttachmentType;
  /** File size in bytes (for files) */
  size?: number;
  /** URL for links or preview */
  url?: string;
  /** Preview image URL */
  thumbnail?: string;
  /** Whether attachment is removable */
  removable?: boolean;
  /** Callback when remove is clicked */
  onRemove?: (id: string) => void;
  /** Whether attachment can be previewed */
  previewable?: boolean;
  /** Callback when preview is clicked */
  onPreview?: (id: string) => void;
  /** Whether attachment can be downloaded */
  downloadable?: boolean;
  /** Callback when download is clicked */
  onDownload?: (id: string) => void;
  /** Compact mode */
  compact?: boolean;
  /** Custom className */
  className?: string;
  /** Error state */
  error?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * DocumentAttachment - Display an attached document/file/link
 *
 * Pure presentational component for showing attachments
 */
export const DocumentAttachment: React.FC<DocumentAttachmentProps> = ({
  id,
  name,
  type,
  size,
  url,
  thumbnail,
  removable = true,
  onRemove,
  previewable = false,
  onPreview,
  downloadable = false,
  onDownload,
  compact = false,
  className,
  error,
  loading = false,
}) => {
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "pdf":
        return FileText;
      case "image":
        return Image;
      case "video":
        return Film;
      case "audio":
        return Music;
      case "link":
        return Link2;
      default:
        return File;
    }
  };

  const Icon = getIcon();

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return null;
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Get file extension from name
  const getExtension = () => {
    if (type === "link" || !name) return null;
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : null;
  };

  const extension = getExtension();
  const formattedSize = formatSize(size);

  // Compact mode - minimal display
  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center",
          spacing.gap.xs,
          spacing.padding.xs,
          borders.radius.md,
          borders.width.thin,
          borders.opacity.light,
          effects.background.subtle,
          effects.hover.subtle,
          "transition-colors",
          error && "border-destructive/30 bg-destructive/5",
          loading && "opacity-50",
          className
        )}
      >
        <Icon className={cn(componentSize.icon.xs, effects.status.muted)} />
        <span className={cn(fontSize.caption, "truncate max-w-[100px]")}>{name}</span>
        {removable && onRemove && (
          <button
            onClick={() => onRemove(id)}
            className={cn("ml-auto", effects.hover.medium, "rounded-sm p-0.5", "transition-colors")}
            aria-label={`Remove ${name}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    );
  }

  // Full attachment display
  const attachmentContent = (
    <div
      className={cn(
        "group flex items-center",
        spacing.gap.sm,
        spacing.padding.sm,
        borders.radius.md,
        borders.width.thin,
        borders.opacity.light,
        effects.background.subtle,
        "transition-all",
        !error && effects.hover.subtle,
        error && "border-destructive/30 bg-destructive/5",
        loading && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Thumbnail or Icon */}
      <div className="flex-shrink-0">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="h-10 w-10 rounded object-cover" />
        ) : (
          <div
            className={cn("flex h-10 w-10 items-center justify-center", borders.radius.md, effects.background.light)}
          >
            <Icon className={cn(componentSize.icon.md, effects.status.muted)} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className={cn(fontSize.body, "truncate font-medium")}>{name}</p>
          {type === "link" && url && <ExternalLink className={cn(componentSize.icon.xs, effects.status.muted)} />}
        </div>
        <div className="flex items-center gap-2">
          {extension && <span className={cn(fontSize.caption, effects.status.muted)}>{extension}</span>}
          {formattedSize && <span className={cn(fontSize.caption, effects.status.muted)}>{formattedSize}</span>}
          {error && <span className={cn(fontSize.caption, effects.status.error)}>{error}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {previewable && onPreview && (
          <button
            onClick={() => onPreview(id)}
            className={cn("p-1", borders.radius.sm, effects.hover.medium, "transition-colors")}
            aria-label={`Preview ${name}`}
          >
            <Eye className={componentSize.icon.sm} />
          </button>
        )}
        {downloadable && onDownload && (
          <button
            onClick={() => onDownload(id)}
            className={cn("p-1", borders.radius.sm, effects.hover.medium, "transition-colors")}
            aria-label={`Download ${name}`}
          >
            <Download className={componentSize.icon.sm} />
          </button>
        )}
        {removable && onRemove && (
          <button
            onClick={() => onRemove(id)}
            className={cn(
              "p-1",
              borders.radius.sm,
              "hover:bg-destructive/10 hover:text-destructive",
              "transition-colors"
            )}
            aria-label={`Remove ${name}`}
          >
            <X className={componentSize.icon.sm} />
          </button>
        )}
      </div>
    </div>
  );

  // Add hover card for additional info if needed
  if (url && type === "link") {
    return (
      <HoverCard
        content={
          <div className="text-xs">
            <p className="font-medium mb-1">External Link</p>
            <p className="text-muted-foreground break-all">{url}</p>
          </div>
        }
        openDelay={300}
      >
        {attachmentContent}
      </HoverCard>
    );
  }

  return attachmentContent;
};
