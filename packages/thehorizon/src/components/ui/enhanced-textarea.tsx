import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "./textarea";
import { AttachmentPreview } from "./attachment-preview";
import { FileDropOverlay } from "./file-drop-overlay";
import { Button } from "./button";
import { Upload } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { useFileHandler, type FileAttachment } from "@/hooks/useFileHandler";

interface EnhancedTextareaProps
  extends React.ComponentPropsWithoutRef<"textarea"> {
  attachments?: FileAttachment[];
  onAttachmentsChange?: (attachments: FileAttachment[]) => void;
  onFileError?: (error: Error) => void;
  showFileButton?: boolean;
  fileButtonPosition?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  acceptedFileTypes?: string;
  maxFileSize?: number;
  fileInputId?: string;
}

const EnhancedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  EnhancedTextareaProps
>(
  (
    {
      className,
      attachments: externalAttachments,
      onAttachmentsChange,
      onFileError,
      showFileButton = true,
      fileButtonPosition = "bottom-left",
      acceptedFileTypes = "image/*,application/pdf,.md,.markdown",
      maxFileSize,
      fileInputId = "enhanced-textarea-file-input",
      disabled,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const dragCounter = React.useRef(0);

    const {
      attachments: internalAttachments,
      handleFileSelect,
      handleFileDrop,
      removeAttachment,
      setAttachments,
    } = useFileHandler({
      maxFileSize,
      onError: onFileError,
    });

    // Use external attachments if provided and not empty, otherwise use internal
    const attachments = (externalAttachments && externalAttachments.length > 0) 
      ? externalAttachments 
      : internalAttachments;
    
    // Debug logging
    console.log("[EnhancedTextarea] External attachments:", externalAttachments);
    console.log("[EnhancedTextarea] Internal attachments:", internalAttachments);
    console.log("[EnhancedTextarea] Using attachments:", attachments);

    // Update external attachments when internal ones change
    React.useEffect(() => {
      if (!externalAttachments && onAttachmentsChange) {
        onAttachmentsChange(internalAttachments);
      }
    }, [internalAttachments, externalAttachments, onAttachmentsChange]);

    // Update internal attachments when external ones change
    React.useEffect(() => {
      if (externalAttachments) {
        setAttachments(externalAttachments);
      }
    }, [externalAttachments, setAttachments]);

    const handleDragOver = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
      },
      []
    );

    const handleDragEnter = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (dragCounter.current === 1) {
          setIsDragging(true);
        }
      },
      []
    );

    const handleDragLeave = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
          setIsDragging(false);
        }
      },
      []
    );

    const handleDrop = React.useCallback(
      async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          await handleFileDrop(files);
        }
      },
      [handleFileDrop]
    );

    const handleRemove = React.useCallback(
      (id: string) => {
        if (externalAttachments && onAttachmentsChange) {
          onAttachmentsChange(attachments.filter((att) => att.id !== id));
        } else {
          removeAttachment(id);
        }
      },
      [attachments, externalAttachments, onAttachmentsChange, removeAttachment]
    );

    const positionClasses = {
      "bottom-left": "bottom-3 left-3",
      "bottom-right": "bottom-3 right-3",
      "top-left": "top-3 left-3",
      "top-right": "top-3 right-3",
    };

    return (
      <div
        className="relative w-full"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileDropOverlay isActive={isDragging} />
        
        <Textarea
          ref={ref}
          className={cn(
            "pr-12", // Add padding for attachments
            showFileButton && "pb-12", // Add padding for file button
            className
          )}
          disabled={disabled}
          {...props}
        />

        {/* File Selection Button */}
        {showFileButton && (
          <div className={cn("absolute", positionClasses[fileButtonPosition])}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() =>
                      document.getElementById(fileInputId)?.click()
                    }
                    disabled={disabled}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Upload files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="absolute top-2 right-2 max-w-[240px]">
            <AttachmentPreview
              attachments={attachments}
              onRemove={handleRemove}
              className="justify-end"
            />
          </div>
        )}

        {/* Hidden file input */}
        <input
          id={fileInputId}
          type="file"
          multiple
          accept={acceptedFileTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }
);

EnhancedTextarea.displayName = "EnhancedTextarea";

export { EnhancedTextarea };