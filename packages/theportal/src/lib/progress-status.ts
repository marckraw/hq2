// Maps grid-core ProgressMessage.type to UI status variants used by ExecutionStep
import type { ExecutionStatus } from "@/components/ai-chat/presentational/ExecutionStep/ExecutionStep";

export const mapProgressTypeToStatus = (type: string): ExecutionStatus => {
  switch (type) {
    case "thinking":
    case "tool_execution":
    case "connection":
    case "iteration":
    case "state_update":
    case "notification":
    case "tool_response":
    case "unknown":
    case "evaluation":
    case "listening_start":
    case "speaking_start":
      return "info";
    case "memory_saved":
    case "success":
    case "speaking_complete":
    case "listening_complete":
      return "success";
    case "warning":
      return "info";
    case "error":
    case "voice_error":
      return "error";
    default:
      return "info";
  }
};
