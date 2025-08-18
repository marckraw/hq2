import React from "react";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  X,
  AlertCircle,
  FileText,
  Image,
  Film,
  Music,
  File,
} from "lucide-react";
import { fontSize, componentSize, spacing, borders, effects } from "../design-system";
import { motion, AnimatePresence } from "framer-motion";

export type UploadStatus = "preparing" | "uploading" | "completed" | "error" | "cancelled";

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  type?: string;
  progress: number; // 0-100
  status: UploadStatus;
  error?: string;
  uploadedSize?: number;
  speed?: number; // bytes per second
  remainingTime?: number; // seconds
}

export interface UploadProgressProps {
  /** Upload items */
  uploads: UploadItem[];
  /** Whether uploads can be cancelled */
  cancellable?: boolean;
  /** Callback when cancel is clicked */
  onCancel?: (id: string) => void;
  /** Whether to show individual progress bars */
  showIndividualProgress?: boolean;
  /** Whether to show overall progress */
  showOverallProgress?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Auto-hide completed uploads after delay (ms) */
  autoHideCompleted?: number;
  /** Custom className */
  className?: string;
  /** Title for the upload progress */
  title?: string;
  /** Whether the component can be closed */
  closable?: boolean;
  /** Callback when close is clicked */
  onClose?: () => void;
}

/**
 * UploadProgress - Display upload progress for multiple files
 * 
 * Pure presentational component for showing upload status
 */
export const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  cancellable = true,
  onCancel,
  showIndividualProgress = true,
  showOverallProgress = true,
  compact = false,
  autoHideCompleted,
  className,
  title = "Uploading",
  closable = false,
  onClose,
}) => {
  const [hiddenIds, setHiddenIds] = React.useState<Set<string>>(new Set());

  // Auto-hide completed uploads
  React.useEffect(() => {
    if (!autoHideCompleted) return;

    const timers: NodeJS.Timeout[] = [];
    
    uploads.forEach(upload => {
      if (upload.status === "completed" && !hiddenIds.has(upload.id)) {
        const timer = setTimeout(() => {
          setHiddenIds(prev => new Set([...prev, upload.id]));
        }, autoHideCompleted);
        timers.push(timer);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [uploads, autoHideCompleted, hiddenIds]);

  const visibleUploads = uploads.filter(u => !hiddenIds.has(u.id));

  // Calculate overall progress
  const overallProgress = React.useMemo(() => {
    if (uploads.length === 0) return 0;
    const totalProgress = uploads.reduce((sum, u) => sum + u.progress, 0);
    return Math.round(totalProgress / uploads.length);
  }, [uploads]);

  const activeUploads = uploads.filter(u => u.status === "uploading").length;
  const completedUploads = uploads.filter(u => u.status === "completed").length;
  const errorUploads = uploads.filter(u => u.status === "error").length;

  const formatSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return null;
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const formatSpeed = (bytesPerSecond?: number) => {
    if (!bytesPerSecond) return null;
    return `${formatSize(bytesPerSecond)}/s`;
  };

  const getFileIcon = (type?: string) => {
    if (!type) return File;
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Film;
    if (type.startsWith("audio/")) return Music;
    if (type.includes("pdf")) return FileText;
    return File;
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case "preparing":
        return <Upload className={cn(componentSize.icon.xs, "animate-pulse")} />;
      case "uploading":
        return <Upload className={cn(componentSize.icon.xs, "animate-bounce")} />;
      case "completed":
        return <CheckCircle className={cn(componentSize.icon.xs, effects.status.success)} />;
      case "error":
        return <XCircle className={cn(componentSize.icon.xs, effects.status.error)} />;
      case "cancelled":
        return <AlertCircle className={cn(componentSize.icon.xs, effects.status.muted)} />;
    }
  };

  if (visibleUploads.length === 0) {
    return null;
  }

  // Compact mode - minimal display
  if (compact) {
    return (
      <div className={cn(
        "flex items-center",
        spacing.gap.sm,
        spacing.padding.sm,
        borders.radius.md,
        borders.width.thin,
        borders.opacity.light,
        effects.background.subtle,
        className
      )}>
        <Upload className={cn(componentSize.icon.sm, "animate-pulse")} />
        <div className="flex-1 min-w-0">
          <p className={cn(fontSize.body)}>
            {activeUploads > 0 ? `Uploading ${activeUploads} file(s)` : "Upload complete"}
          </p>
          {showOverallProgress && activeUploads > 0 && (
            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          )}
        </div>
        {closable && onClose && (
          <button
            onClick={onClose}
            className={cn(
              "p-1",
              borders.radius.sm,
              effects.hover.medium,
              "transition-colors"
            )}
          >
            <X className={componentSize.icon.sm} />
          </button>
        )}
      </div>
    );
  }

  // Full progress display
  return (
    <div className={cn(
      "space-y-3",
      spacing.padding.md,
      borders.radius.lg,
      borders.width.thin,
      borders.opacity.light,
      effects.background.subtle,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className={cn(componentSize.icon.md, effects.status.active)} />
          <h3 className={cn(fontSize.body, "font-medium")}>{title}</h3>
          <span className={cn(fontSize.label, effects.status.muted)}>
            ({completedUploads}/{uploads.length})
          </span>
        </div>
        {closable && onClose && (
          <button
            onClick={onClose}
            className={cn(
              "p-1",
              borders.radius.sm,
              effects.hover.medium,
              "transition-colors"
            )}
          >
            <X className={componentSize.icon.sm} />
          </button>
        )}
      </div>

      {/* Overall progress */}
      {showOverallProgress && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className={cn(fontSize.label, effects.status.muted)}>
              Overall progress
            </span>
            <span className={cn(fontSize.label)}>{overallProgress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          {errorUploads > 0 && (
            <p className={cn(fontSize.caption, effects.status.error)}>
              {errorUploads} upload(s) failed
            </p>
          )}
        </div>
      )}

      {/* Individual uploads */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleUploads.map((upload) => {
            const FileIcon = getFileIcon(upload.type);
            const isActive = upload.status === "uploading" || upload.status === "preparing";
            
            return (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "space-y-2",
                  spacing.padding.sm,
                  borders.radius.md,
                  borders.width.thin,
                  borders.opacity.light,
                  upload.status === "error" && "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <FileIcon className={cn(componentSize.icon.sm, effects.status.muted)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(fontSize.body, "truncate")}>{upload.name}</p>
                      {getStatusIcon(upload.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(fontSize.caption, effects.status.muted)}>
                        {upload.uploadedSize ? formatSize(upload.uploadedSize) : "0 B"} / {formatSize(upload.size)}
                      </span>
                      {upload.speed && isActive && (
                        <span className={cn(fontSize.caption, effects.status.muted)}>
                          • {formatSpeed(upload.speed)}
                        </span>
                      )}
                      {upload.remainingTime && isActive && (
                        <span className={cn(fontSize.caption, effects.status.muted)}>
                          • {formatTime(upload.remainingTime)} left
                        </span>
                      )}
                      {upload.status === "completed" && (
                        <span className={cn(fontSize.caption, effects.status.success)}>
                          Completed
                        </span>
                      )}
                    </div>
                    {upload.error && (
                      <p className={cn(fontSize.caption, effects.status.error, "mt-1")}>
                        {upload.error}
                      </p>
                    )}
                  </div>
                  {cancellable && onCancel && isActive && (
                    <button
                      onClick={() => onCancel(upload.id)}
                      className={cn(
                        "p-1",
                        borders.radius.sm,
                        "hover:bg-destructive/10 hover:text-destructive",
                        "transition-colors"
                      )}
                      aria-label={`Cancel uploading ${upload.name}`}
                    >
                      <X className={componentSize.icon.sm} />
                    </button>
                  )}
                </div>
                
                {showIndividualProgress && isActive && (
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        upload.status === "error" ? "bg-destructive" : "bg-primary"
                      )}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};