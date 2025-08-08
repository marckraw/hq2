import { useEffect } from "react";
import { fetcherService } from "@/services/fetcher.service";
import { useAgents, useAutonomousMode } from "../_state/chat";

interface Agent {
  id: string;
  type: string;
  name: string;
  description: string;
  capabilities: string[];
  icon: string;
  version?: string;
  author?: string;
}

export const useAgentManagement = () => {
  // Use new hooks for shared state
  const {
    agentType,
    setAgentType,
    agents,
    setAgents,
    isLoadingAgents,
    setIsLoadingAgents,
  } = useAgents();
  const { isAutonomousMode, toggleAutonomousMode } = useAutonomousMode();

  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const agents = await fetcherService.fetchAvailableAgents();
      setAgents(agents || []);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    // Agent data
    agents,
    isLoadingAgents,

    // Agent type selection
    agentType,
    setAgentType,

    // Autonomous mode
    isAutonomousMode,
    toggleAutonomousMode,

    // Actions
    fetchAgents,
  };
};
