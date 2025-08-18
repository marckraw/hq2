import React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, File, Plus } from "lucide-react";
import { fontSize, componentSize, spacing, borders, effects } from "../design-system";
import { motion, AnimatePresence } from "framer-motion";

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
}

export interface FileUploadProps {
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Whether multiple files can be selected */
  multiple?: boolean;
  /** Currently selected files */
  files?: FileInfo[];
  /** Callback when files are selected */
  onFilesSelected?: (files: FileInfo[]) => void;
  /** Callback when a file is removed */
  onFileRemove?: (id: string) => void;
  /** Whether drag and drop is enabled */
  dragDropEnabled?: boolean;
  /** Custom upload text */
  uploadText?: string;
  /** Custom browse text */
  browseText?: string;
  /** Compact mode */
  compact?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Error message */
  error?: string;
  /** Show file list */
  showFileList?: boolean;
}

/**
 * FileUpload - File upload interface with drag and drop
 * 
 * Pure presentational component for file upload UI
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 10,
  multiple = true,
  files = [],
  onFilesSelected,
  onFileRemove,
  dragDropEnabled = true,
  uploadText = "Drop your files here or browse",
  browseText = "browse",
  compact = false,
  disabled = false,
  className,
  error,
  showFileList = true,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleDragEnter = (e: React.DragEvent) => {
    if (!dragDropEnabled || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dragDropEnabled || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!dragDropEnabled || disabled) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!dragDropEnabled || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return;
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (newFiles: File[]) => {
    if (!onFilesSelected) return;

    // Check max files limit
    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) {
      return;
    }

    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    // Convert to FileInfo objects
    const fileInfos: FileInfo[] = filesToAdd.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));

    // Filter by size
    const validFiles = fileInfos.filter(f => f.size <= maxSize);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleBrowseClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Compact mode - simple button
  if (compact) {
    return (
      <div className={cn("inline-flex flex-col gap-2", className)}>
        <button
          onClick={handleBrowseClick}
          disabled={disabled || files.length >= maxFiles}
          className={cn(
            "inline-flex items-center",
            spacing.gap.xs,
            spacing.padding.sm,
            borders.radius.md,
            borders.width.thin,
            borders.opacity.light,
            effects.background.subtle,
            effects.hover.medium,
            fontSize.body,
            "transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive/30"
          )}
        >
          <Plus className={componentSize.icon.sm} />
          <span>Add files</span>
          {files.length > 0 && (
            <span className={cn(fontSize.caption, effects.status.muted)}>
              ({files.length}/{maxFiles})
            </span>
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {error && (
          <p className={cn(fontSize.caption, effects.status.error)}>{error}</p>
        )}
      </div>
    );
  }

  // Full upload interface
  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "min-h-[150px] cursor-pointer",
          spacing.padding.lg,
          borders.radius.lg,
          borders.width.thin,
          "border-dashed",
          isDragging ? "border-primary bg-primary/5" : borders.opacity.medium,
          effects.hover.subtle,
          "transition-all",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive/30",
          className
        )}
      >
        <Upload 
          className={cn(
            "h-10 w-10 mb-3",
            isDragging ? "text-primary" : effects.status.muted,
            "transition-colors"
          )}
        />
        
        <p className={cn(fontSize.body, "text-center")}>
          {uploadText}
        </p>
        
        <p className={cn(fontSize.label, effects.status.muted, "mt-1")}>
          Max file size up to {formatSize(maxSize)}
        </p>

        {files.length > 0 && (
          <p className={cn(fontSize.caption, effects.status.muted, "mt-2")}>
            {files.length} of {maxFiles} files selected
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className={cn(fontSize.body, effects.status.error)}>{error}</p>
      )}

      {/* File list */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          <p className={cn(fontSize.label, effects.status.muted)}>
            Uploads
          </p>
          <AnimatePresence mode="popLayout">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "flex items-center",
                  spacing.gap.sm,
                  spacing.padding.sm,
                  borders.radius.md,
                  borders.width.thin,
                  borders.opacity.light,
                  effects.background.subtle,
                  "group"
                )}
              >
                <File className={cn(componentSize.icon.sm, effects.status.muted)} />
                <div className="flex-1 min-w-0">
                  <p className={cn(fontSize.body, "truncate")}>{file.name}</p>
                  <p className={cn(fontSize.caption, effects.status.muted)}>
                    {formatSize(file.size)}
                  </p>
                </div>
                {onFileRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemove(file.id);
                    }}
                    className={cn(
                      "p-1 opacity-0 group-hover:opacity-100",
                      borders.radius.sm,
                      "hover:bg-destructive/10 hover:text-destructive",
                      "transition-all"
                    )}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className={componentSize.icon.sm} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};