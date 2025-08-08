import {
  useCurrentSelection,
  useConversationState,
  useChatUIState,
} from "../../_state/chat";
import { getSpeedIcon, getIntelligenceIcon } from "../ChatArea.utils";

export const ModelStatusDisplay = () => {
  // Direct access to state through hooks - no prop drilling! 🎉
  const {
    currentModelPerformance: modelPerformance,
    currentCapabilities: capabilities,
  } = useCurrentSelection();
  const { messageStats } = useConversationState();
  const { canSubmit: submitStatus } = useChatUIState();

  if (!modelPerformance) {
    return (
      <div className="text-xs text-muted-foreground p-2 border rounded">
        No model selected
      </div>
    );
  }

  return (
    <div className="text-xs p-3 border rounded-lg bg-muted/30 space-y-2">
      <div className="font-medium flex items-center gap-2">
        <span>🤖</span>
        <span>{modelPerformance.name}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {getSpeedIcon(modelPerformance.speed)}
          <span className="text-muted-foreground">Speed</span>
        </div>
        <div className="flex items-center gap-1">
          {getIntelligenceIcon(modelPerformance.intelligence)}
          <span className="text-muted-foreground">Intelligence</span>
        </div>
      </div>

      <div className="text-muted-foreground">
        {modelPerformance.description}
      </div>

      {capabilities.hasCapabilities && (
        <div>
          <div className="font-medium mb-1">Capabilities:</div>
          <div className="flex flex-wrap gap-1">
            {capabilities.capabilities.slice(0, 3).map((cap) => (
              <span
                key={cap}
                className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
              >
                {cap.replace(/_/g, " ")}
              </span>
            ))}
            {capabilities.capabilities.length > 3 && (
              <span className="text-muted-foreground">
                +{capabilities.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="pt-2 border-t flex justify-between text-muted-foreground">
        <span>Messages: {messageStats.total}</span>
        <span
          className={submitStatus.canSubmit ? "text-green-600" : "text-red-600"}
        >
          {submitStatus.canSubmit ? "Ready" : "Not Ready"}
        </span>
      </div>
    </div>
  );
};
