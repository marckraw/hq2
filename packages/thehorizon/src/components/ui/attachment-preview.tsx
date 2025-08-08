import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cn } from "@/lib/utils";
import type { FileAttachment } from "@/hooks/useFileHandler";

interface AttachmentPreviewProps {
  attachments: FileAttachment[];
  onRemove?: (id: string) => void;
  maxVisible?: number;
  className?: string;
  previewClassName?: string;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onRemove,
  maxVisible = 4,
  className,
  previewClassName,
}) => {
  if (attachments.length === 0) return null;

  const visibleAttachments = attachments.slice(0, maxVisible);
  const remainingCount = attachments.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visibleAttachments.map((attachment) => (
        <TooltipProvider key={attachment.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative group w-[55px] h-[55px]",
                  previewClassName
                )}
              >
                {attachment.type === "image" ? (
                  <img
                    src={
                      attachment.dataUrl || URL.createObjectURL(attachment.file)
                    }
                    alt={attachment.name}
                    className="w-full h-full object-cover rounded-md border border-border"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-md border border-border bg-muted">
                    <span className="text-2xl">
                      {attachment.type === "pdf"
                        ? "📄"
                        : attachment.type === "markdown"
                        ? "📝"
                        : "📎"}
                    </span>
                  </div>
                )}
                {onRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(attachment.id)}
                    className="absolute -top-1 -right-1 bg-white text-gray-700 hover:text-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md border border-gray-200 hover:border-red-400"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{attachment.name}</p>
              <p className="text-xs text-muted-foreground">
                {(attachment.size / 1024).toFixed(1)} KB
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center w-[55px] h-[55px] bg-muted rounded-md border border-border",
                  previewClassName
                )}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{remainingCount} more files</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};