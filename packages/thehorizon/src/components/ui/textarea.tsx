import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface FilePreview {
  id: string;
  file: File;
  name: string;
  type: "image" | "pdf" | "markdown";
  size: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const ALLOWED_PDF_TYPES = ["application/pdf"];

const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size exceeds 10MB limit" };
  }

  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { isValid: true };
  }

  if (ALLOWED_PDF_TYPES.includes(file.type)) {
    return { isValid: true };
  }

  return { isValid: false, error: "Unsupported file type" };
};

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea"> & {
    onFilesDrop?: (files: File[]) => void;
    attachments?: FilePreview[];
    onRemoveAttachment?: (id: string) => void;
  }
>(
  (
    { className, onFilesDrop, attachments = [], onRemoveAttachment, ...props },
    ref,
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const dragCounter = React.useRef(0);

    const handleDragOver = React.useCallback(
      (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        e.stopPropagation();
      },
      [],
    );

    const handleDragEnter = React.useCallback(
      (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (dragCounter.current === 1) {
          setIsDragging(true);
        }
      },
      [],
    );

    const handleDragLeave = React.useCallback(
      (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
          setIsDragging(false);
        }
      },
      [],
    );

    const processFile = React.useCallback(async (file: File) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      return {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        type: ALLOWED_IMAGE_TYPES.includes(file.type)
          ? "image"
          : ALLOWED_PDF_TYPES.includes(file.type)
            ? "pdf"
            : "markdown",
        size: file.size,
      };
    }, []);

    const handleDrop = React.useCallback(
      async (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        const files = Array.from(e.dataTransfer.files);

        if (files.length === 0) return;

        if (onFilesDrop) {
          onFilesDrop(files);
        }
      },
      [onFilesDrop],
    );

    const handlePaste = React.useCallback(
      async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = Array.from(e.clipboardData.items);
        const files = items
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null);

        if (files.length === 0) return;

        if (onFilesDrop) {
          onFilesDrop(files);
        }
      },
      [onFilesDrop],
    );

    return (
      <div className="relative w-full h-full">
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-primary/50 bg-primary/5 rounded-md pointer-events-none z-10 flex items-center justify-center">
            <div className="text-primary/50 text-sm font-medium">
              Drop image here
            </div>
          </div>
        )}
        <textarea
          ref={ref}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        {attachments.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-1 w-[120px]">
            {attachments.slice(0, 4).map((preview) => (
              <TooltipProvider key={preview.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative group w-[55px] h-[55px]">
                      {preview.type === "image" ? (
                        <img
                          src={URL.createObjectURL(preview.file)}
                          alt={preview.name}
                          className="w-full h-full object-cover rounded-md border border-border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center rounded-md border border-border bg-muted">
                          <span className="text-2xl">
                            {preview.type === "pdf" ? "📄" : "📝"}
                          </span>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveAttachment?.(preview.id)}
                        className="absolute -top-1 -right-1 bg-white text-gray-700 hover:text-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md border border-gray-200 hover:border-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{preview.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {attachments.length > 4 && (
              <div className="flex items-center justify-center w-[55px] h-[55px] bg-muted rounded-md border border-border">
                +{attachments.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
