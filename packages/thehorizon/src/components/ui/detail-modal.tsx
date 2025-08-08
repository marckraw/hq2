import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: "default" | "wide" | "fullscreen";
}

export function DetailModal({
  isOpen,
  onClose,
  title,
  children,
  width = "default",
}: DetailModalProps) {
  const getWidthClass = () => {
    switch (width) {
      case "wide":
        return "max-w-[90vw] md:max-w-[1200px]";
      case "fullscreen":
        return "max-w-[98vw] sm:max-w-[98vw] md:max-w-[98vw] lg:max-w-[98vw] xl:max-w-[98vw] h-[90vh]";
      default:
        return "max-w-[90vw] sm:max-w-lg";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${width === "fullscreen" ? "max-h-[90vh] flex flex-col" : "max-h-[80vh] overflow-y-auto"} [&>button]:hidden ${getWidthClass()}`}
      >
        <DialogHeader className="flex flex-row items-center justify-between shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className={`mt-4 ${width === "fullscreen" ? "flex-1 min-h-0 overflow-hidden" : ""}`}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
