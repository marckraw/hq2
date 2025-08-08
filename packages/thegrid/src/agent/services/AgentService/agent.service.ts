export interface AgentStatus {
  status:
    | "waiting-for-prompt"
    | "thinking"
    | "tool-response"
    | "task-complete"
    | "error"
    | "working";
  reason?: string;
}

const createAgentService = () => {
  const agentStatus: AgentStatus = {
    status: "waiting-for-prompt",
  };

  const setStatus = (status: AgentStatus["status"], reason: string = "") => {
    agentStatus.status = status;
    agentStatus.reason = reason;
  };

  const getStatus = () => agentStatus;

  // Return public interface
  return {
    agentStatus,
    setStatus,
    getStatus,
  };
};

export { createAgentService };
export const agentService = createAgentService();
