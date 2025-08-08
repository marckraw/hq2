import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useChatUIState } from "../../_state/chat";

export const SubmitStatus = () => {
  const { canSubmit: submitStatus } = useChatUIState();

  const getStatusInfo = () => {
    if (submitStatus.isLoading) {
      return {
        icon: <AlertCircle className="h-3 w-3 text-yellow-500" />,
        text: "Processing...",
        color: "text-yellow-600",
      };
    }

    if (submitStatus.canSubmit) {
      return {
        icon: <CheckCircle className="h-3 w-3 text-green-500" />,
        text: "Ready to send",
        color: "text-green-600",
      };
    }

    if (!submitStatus.hasModel) {
      return {
        icon: <XCircle className="h-3 w-3 text-red-500" />,
        text: "No model selected",
        color: "text-red-600",
      };
    }

    if (!submitStatus.hasContent && !submitStatus.hasAttachments) {
      return {
        icon: <XCircle className="h-3 w-3 text-red-500" />,
        text: "Type a message or attach files",
        color: "text-red-600",
      };
    }

    return {
      icon: <XCircle className="h-3 w-3 text-red-500" />,
      text: "Cannot send",
      color: "text-red-600",
    };
  };

  const status = getStatusInfo();

  return (
    <div className="flex items-center gap-1 text-xs">
      {status.icon}
      <span className={status.color}>{status.text}</span>
    </div>
  );
};
