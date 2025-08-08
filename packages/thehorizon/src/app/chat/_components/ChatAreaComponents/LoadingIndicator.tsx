import { useConversationState } from "../../_state/chat";
import { Loader2 } from "lucide-react";

export const LoadingIndicator = () => {
  const { isLoading } = useConversationState();

  if (!isLoading) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>Processing...</span>
    </div>
  );
};
