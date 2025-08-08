import { useState, useCallback } from "react";
import type {
  Message,
  CollaborationTrace,
  AgentInteraction,
} from "../_components/AgentV3/types";
import { AVAILABLE_AGENTS } from "../_components/AgentV3/types";
import { useMockResponses } from "./useMockResponses";

// Collaboration patterns based on query types
const COLLABORATION_PATTERNS = [
  {
    // System issues require monitoring + analysis + timeline
    triggers: ["spike", "error", "issue", "problem", "down", "slow"],
    agents: ["heimdall", "valkyrie", "chronos"],
    pattern: "sequential",
  },
  {
    // Code/debugging needs analysis + monitoring
    triggers: ["debug", "fix", "code", "bug", "performance"],
    agents: ["valkyrie", "heimdall"],
    pattern: "parallel",
  },
  {
    // Planning needs timeline + analysis
    triggers: ["plan", "schedule", "when", "timeline", "deadline"],
    agents: ["chronos", "valkyrie"],
    pattern: "sequential",
  },
];

// Agent interaction templates
const AGENT_INTERACTIONS = {
  heimdall_to_valkyrie: [
    "I've detected anomalies in the system. Can you analyze the patterns?",
    "The spike correlates with deployment. Please check the code changes.",
    "Memory usage is abnormal. Could this be a memory leak?",
  ],
  valkyrie_to_chronos: [
    "Based on my analysis, when did similar issues occur before?",
    "Can you provide a timeline for implementing these fixes?",
    "What's the historical pattern for this type of problem?",
  ],
  chronos_to_heimdall: [
    "This happened before on these dates. Can you check those logs?",
    "The pattern suggests a recurring issue. Monitor for the next occurrence.",
    "Based on history, we should expect this to happen again in 3 days.",
  ],
};

export function useAgentCollaboration() {
  const [collaborationTraces, setCollaborationTraces] = useState<
    Record<string, CollaborationTrace>
  >({});
  const [activeCollaborations, setActiveCollaborations] = useState<Set<string>>(
    new Set()
  );
  const { generateMessage } = useMockResponses();

  const detectCollaborationPattern = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();

    for (const pattern of COLLABORATION_PATTERNS) {
      if (pattern.triggers.some((trigger) => lowerQuery.includes(trigger))) {
        return {
          agents: pattern.agents,
          orchestration: pattern.pattern,
        };
      }
    }

    // Default: single agent response
    return null;
  }, []);

  const generateAgentInteraction = useCallback(
    (fromAgent: string, toAgent: string): AgentInteraction => {
      const interactionKey = `${fromAgent}_to_${toAgent}`;
      const templates = AGENT_INTERACTIONS[
        interactionKey as keyof typeof AGENT_INTERACTIONS
      ] || [`${fromAgent} is sharing insights with ${toAgent}...`];

      return {
        fromAgent,
        toAgent,
        action: templates[Math.floor(Math.random() * templates.length)],
        timestamp: new Date(),
      };
    },
    []
  );

  const orchestrateCollaboration = useCallback(
    async (
      query: string,
      pattern: { agents: string[]; orchestration: string },
      onMessageGenerated?: (message: Message) => void
    ): Promise<{ messages: Message[]; trace: CollaborationTrace }> => {
      const collaborationId = Date.now().toString();
      const messages: Message[] = [];
      const interactions: AgentInteraction[] = [];

      setActiveCollaborations((prev) => new Set(prev).add(collaborationId));

      // Create collaboration trace
      const trace: CollaborationTrace = {
        id: collaborationId,
        userQuery: query,
        agents: pattern.agents,
        interactions: interactions,
      };

      // Sequential collaboration
      if (pattern.orchestration === "sequential") {
        for (let i = 0; i < pattern.agents.length; i++) {
          const agentId = pattern.agents[i];

          // Generate inter-agent communication
          if (i > 0) {
            const interaction = generateAgentInteraction(
              pattern.agents[i - 1],
              agentId
            );
            interactions.push(interaction);

            // Small delay between agents
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // Generate agent response
          const message = await generateMessage(query, agentId);
          const enhancedMessage: Message = {
            ...message,
            collaborationId,
            isPartOfChain: true,
            referencedAgents: i > 0 ? [pattern.agents[i - 1]] : undefined,
            referencedMessageId: i > 0 ? messages[i - 1].id : undefined,
          };

          messages.push(enhancedMessage);
          if (onMessageGenerated) {
            onMessageGenerated(enhancedMessage);
          }
        }
      }
      // Parallel collaboration
      else if (pattern.orchestration === "parallel") {
        const parallelPromises = pattern.agents.map(async (agentId, index) => {
          // Add slight stagger for visual effect
          await new Promise((resolve) => setTimeout(resolve, index * 500));

          const message = await generateMessage(query, agentId);
          return {
            ...message,
            collaborationId,
            isPartOfChain: true,
          };
        });

        const parallelMessages = await Promise.all(parallelPromises);
        messages.push(...parallelMessages);

        // Generate synthesis message from primary agent
        const synthesisAgent = pattern.agents[0];
        const synthesisMessage = await generateMessage(
          `Synthesize the insights from ${pattern.agents.join(", ")}`,
          synthesisAgent
        );

        messages.push({
          ...synthesisMessage,
          collaborationId,
          isPartOfChain: true,
          referencedAgents: pattern.agents,
          content: `Based on our collaborative analysis: ${synthesisMessage.content}`,
        });
      }

      setCollaborationTraces((prev) => ({
        ...prev,
        [collaborationId]: { ...trace, interactions },
      }));

      setActiveCollaborations((prev) => {
        const next = new Set(prev);
        next.delete(collaborationId);
        return next;
      });

      return { messages, trace };
    },
    [generateMessage, generateAgentInteraction]
  );

  const shouldCollaborate = useCallback(
    (query: string): boolean => {
      const pattern = detectCollaborationPattern(query);
      return pattern !== null && pattern.agents.length > 1;
    },
    [detectCollaborationPattern]
  );

  return {
    detectCollaborationPattern,
    orchestrateCollaboration,
    shouldCollaborate,
    collaborationTraces,
    activeCollaborations,
    getCollaborationTrace: (id: string) => collaborationTraces[id],
  };
}
