import { useState, useCallback, useEffect } from "react";
import { AVAILABLE_AGENTS } from "../_components/AgentV3/types";

interface AgentIntent {
  agentId: string;
  confidence: number;
  reasoning: string;
  suggestedTools?: string[];
}

// Keywords and patterns for each agent
const AGENT_PATTERNS = {
  chronos: {
    keywords: [
      "schedule",
      "time",
      "when",
      "deadline",
      "calendar",
      "timeline",
      "duration",
      "hours",
      "days",
      "weeks",
      "meeting",
      "appointment",
    ],
    patterns: [
      /when\s+(?:can|should|will)/i,
      /how\s+long/i,
      /by\s+when/i,
      /schedule\s+for/i,
    ],
    tools: ["calendar", "scheduler", "time-analyzer"],
  },
  valkyrie: {
    keywords: [
      "code",
      "debug",
      "error",
      "bug",
      "function",
      "variable",
      "test",
      "performance",
      "optimize",
      "refactor",
      "implement",
    ],
    patterns: [
      /fix\s+(?:this|the|my)/i,
      /why\s+(?:is|does)/i,
      /implement\s+\w+/i,
      /debug\s+/i,
    ],
    tools: ["code-analyzer", "debugger", "test-runner", "profiler"],
  },
  heimdall: {
    keywords: [
      "monitor",
      "system",
      "status",
      "health",
      "traffic",
      "usage",
      "memory",
      "cpu",
      "network",
      "alert",
      "log",
    ],
    patterns: [
      /check\s+(?:the\s+)?system/i,
      /monitor\s+/i,
      /what's\s+(?:the\s+)?status/i,
      /show\s+(?:me\s+)?logs/i,
    ],
    tools: ["system-monitor", "log-analyzer", "metrics-dashboard"],
  },
};

export function useAutoAgentSelection() {
  const [selectedAgent, setSelectedAgent] = useState("chronos");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastIntent, setLastIntent] = useState<AgentIntent | null>(null);

  const analyzeIntent = useCallback((query: string): AgentIntent => {
    const scores: Record<string, number> = {};
    const reasoning: Record<string, string[]> = {};
    const tools: Record<string, string[]> = {};

    // Analyze each agent's relevance
    Object.entries(AGENT_PATTERNS).forEach(([agentId, config]) => {
      let score = 0;
      const reasons: string[] = [];

      // Check keywords
      config.keywords.forEach((keyword) => {
        if (query.toLowerCase().includes(keyword)) {
          score += 10;
          reasons.push(`Contains "${keyword}"`);
        }
      });

      // Check patterns
      config.patterns.forEach((pattern) => {
        if (pattern.test(query)) {
          score += 15;
          reasons.push(`Matches pattern: ${pattern.source}`);
        }
      });

      scores[agentId] = score;
      reasoning[agentId] = reasons;
      tools[agentId] = config.tools;
    });

    // Find the best agent
    let bestAgent = "chronos"; // Default
    let highestScore = 0;

    Object.entries(scores).forEach(([agentId, score]) => {
      if (score > highestScore) {
        highestScore = score;
        bestAgent = agentId;
      }
    });

    // Calculate confidence (0-1)
    const confidence = Math.min(highestScore / 50, 1);

    return {
      agentId: bestAgent,
      confidence,
      reasoning: reasoning[bestAgent].join(", ") || "Default selection",
      suggestedTools: tools[bestAgent],
    };
  }, []);

  const selectAgentForQuery = useCallback(
    async (query: string) => {
      setIsAnalyzing(true);

      // Simulate analysis delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      const intent = analyzeIntent(query);
      setLastIntent(intent);
      setSelectedAgent(intent.agentId);
      setIsAnalyzing(false);

      return intent;
    },
    [analyzeIntent]
  );

  // Auto-analyze as user types (debounced)
  const [typingQuery, setTypingQuery] = useState("");

  useEffect(() => {
    if (!typingQuery) return;

    const timer = setTimeout(() => {
      analyzeIntent(typingQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [typingQuery, analyzeIntent]);

  return {
    selectedAgent,
    setSelectedAgent,
    selectAgentForQuery,
    isAnalyzing,
    lastIntent,
    setTypingQuery,
    analyzeIntent,
  };
}
