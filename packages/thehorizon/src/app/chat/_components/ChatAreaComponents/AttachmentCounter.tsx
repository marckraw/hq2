import { useChatUIState } from "../../_state/chat";
import { Paperclip } from "lucide-react";

export const AttachmentCounter = () => {
  const { attachments } = useChatUIState();

  if (attachments.length === 0) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
      <Paperclip className="h-3 w-3" />
      <span>
        {attachments.length} file{attachments.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
};
