import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface FileDropOverlayProps {
  isActive: boolean;
  className?: string;
  message?: string;
}

export const FileDropOverlay: React.FC<FileDropOverlayProps> = ({
  isActive,
  className,
  message = "Drop files here",
}) => {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 border-2 border-dashed border-primary/50 bg-primary/5 rounded-md pointer-events-none z-10 flex items-center justify-center transition-all duration-200",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-8 w-8 text-primary/50" />
        <div className="text-primary/50 text-sm font-medium">{message}</div>
      </div>
    </div>
  );
};