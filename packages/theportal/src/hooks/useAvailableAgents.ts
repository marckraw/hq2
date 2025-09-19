"use client";

import { useEffect, useState } from "react";
import { fetchAvailableAgents } from "@/services/agents.service";

export function useAvailableAgents() {
  const [availableAgents, setAvailableAgents] = useState<string[]>(["general"]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const types = await fetchAvailableAgents();
        if (!cancelled && Array.isArray(types) && types.length > 0) {
          setAvailableAgents(Array.from(new Set(["general", ...types])));
        }
      } catch {
        // noop
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return availableAgents;
}
