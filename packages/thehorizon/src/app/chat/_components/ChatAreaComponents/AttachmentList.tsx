import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useChatInput } from "../../_state/chat";

interface AttachmentListProps {
  onRemoveAttachment: (id: string) => void;
}

export function AttachmentList({ onRemoveAttachment }: AttachmentListProps) {
  // Get attachments from custom hook following official Jotai pattern
  const { attachments } = useChatInput();
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-10 left-2 right-16 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-1 shadow-sm border border-border hover:shadow-md rounded px-2 py-1 text-xs"
        >
          <span className="truncate max-w-20">{attachment.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-destructive/20"
            onClick={() => onRemoveAttachment(attachment.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
