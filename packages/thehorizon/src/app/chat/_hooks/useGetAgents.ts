import { useEffect } from "react";
import { fetcherService } from "@/services/fetcher.service";
import { useAgents } from "../_state/chat";

export interface Agent {
  id: string;
  type: string;
  name: string;
  description: string;
  capabilities: string[];
  icon: string;
  version?: string;
  author?: string;
}

export const useGetAgents = () => {
  const { setAgents, setIsLoadingAgents } = useAgents();

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

  // Return nothing - components will access atoms directly
  return {};
};
