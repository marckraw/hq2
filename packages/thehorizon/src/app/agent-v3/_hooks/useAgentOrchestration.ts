import { useState, useCallback } from "react";
import type {
  Message,
  OrchestrationResult,
  SubthreadMessage,
} from "../_components/AgentV3/types";
import { AgentRegistry } from "../_components/AgentV3/interfaces/AgentInterface";
import { ChronosAgent } from "../_components/AgentV3/agents/ChronosAgent";
import { ValkyrieAgent } from "../_components/AgentV3/agents/ValkyrieAgent";
import { HeimdallAgent } from "../_components/AgentV3/agents/HeimdallAgent";
import { OdinAgent } from "../_components/AgentV3/agents/OdinAgent";
import { HermesAgent } from "../_components/AgentV3/agents/HermesAgent";

// Initialize agents
const chronosAgent = new ChronosAgent();
const valkyrieAgent = new ValkyrieAgent();
const heimdallAgent = new HeimdallAgent();
const odinAgent = new OdinAgent();
const hermesAgent = new HermesAgent();

AgentRegistry.register(chronosAgent);
AgentRegistry.register(valkyrieAgent);
AgentRegistry.register(heimdallAgent);
AgentRegistry.register(odinAgent);
AgentRegistry.register(hermesAgent);

export function useAgentOrchestration() {
  const [orchestrationResults, setOrchestrationResults] = useState<
    Record<string, OrchestrationResult>
  >({});
  const [activeOrchestrations, setActiveOrchestrations] = useState<Set<string>>(
    new Set()
  );

  /**
   * Select the best agent to orchestrate based on query
   */
  const selectOrchestrator = useCallback((query: string) => {
    const agents = AgentRegistry.getAll();
    let bestAgent = agents[0];
    let highestConfidence = 0;

    agents.forEach((agent) => {
      const confidence = agent.getConfidence(query);
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestAgent = agent;
      }
    });

    return { agent: bestAgent, confidence: highestConfidence };
  }, []);

  /**
   * Execute a plan step (internal agent-to-agent communication)
   */
  const executeStep = async (
    step: any,
    context: any
  ): Promise<SubthreadMessage> => {
    const agent = AgentRegistry.get(step.agent);
    if (!agent) {
      throw new Error(`Agent ${step.agent} not found`);
    }

    return await agent.executeTask(step.task, context);
  };

  /**
   * Main orchestration function
   */
  const orchestrate = useCallback(
    async (
      query: string,
      onProgressUpdate?: (update: {
        orchestrationId: string;
        currentStep: number;
        totalSteps: number;
        activeAgent: string;
        currentTask?: string;
      }) => void
    ): Promise<Message> => {
      const orchestrationId = Date.now().toString();
      const startTime = Date.now();

      setActiveOrchestrations((prev) => new Set(prev).add(orchestrationId));

      try {
        // 1. Select lead agent
        const { agent: orchestrator, confidence } = selectOrchestrator(query);

        // 2. Create execution plan
        const availableAgents = AgentRegistry.getAllIds();
        const plan = orchestrator.createPlan(query, availableAgents);

        // 3. Execute plan steps
        const subthreads: SubthreadMessage[] = [];
        const executedSteps = new Map<string, SubthreadMessage>();

        for (let i = 0; i < plan.steps.length; i++) {
          const step = plan.steps[i];

          // Send progress update
          if (onProgressUpdate) {
            onProgressUpdate({
              orchestrationId,
              currentStep: i + 1,
              totalSteps: plan.steps.length,
              activeAgent: step.agent,
              currentTask: step.task.toLowerCase().includes("analyze")
                ? "analysis"
                : step.task.toLowerCase().includes("estimate")
                ? "estimation"
                : step.task.toLowerCase().includes("assess")
                ? "assessment"
                : step.task.toLowerCase().includes("create")
                ? "planning"
                : step.task.toLowerCase().includes("synthesize")
                ? "synthesis"
                : "processing",
            });
          }
          // Wait for dependencies
          if (step.dependsOn && step.dependsOn.length > 0) {
            const dependencies = step.dependsOn.map((dep) =>
              executedSteps.get(dep)
            );
            const context = { dependencies, query };

            const result = await executeStep(step, context);
            subthreads.push(result);
            executedSteps.set(step.agent, result);
          } else {
            const result = await executeStep(step, { query });
            subthreads.push(result);
            executedSteps.set(step.agent, result);
          }
        }

        // 4. Synthesize final response
        const finalResponse = orchestrator.synthesize(query, plan, subthreads);

        // 5. Create trace
        const trace = subthreads.map((msg, idx) => {
          if (idx === 0) return `${msg.fromAgent} (orchestrator)`;
          const prev = subthreads[idx - 1];
          return `${prev.fromAgent} → ${msg.fromAgent}`;
        });

        // Store orchestration result
        const result: OrchestrationResult = {
          id: orchestrationId,
          finalResponse,
          orchestrator: orchestrator.id,
          plan,
          subthreads,
          trace,
          confidence,
          duration: Date.now() - startTime,
          toolsUsed: subthreads.flatMap((s) => s.tools || []),
          memoryHits: subthreads.flatMap((s) => s.memoryHits || []),
        };

        setOrchestrationResults((prev) => ({
          ...prev,
          [orchestrationId]: result,
        }));

        // Return final message
        return {
          id: `${orchestrationId}-response`,
          role: "assistant",
          content: finalResponse,
          agent: orchestrator.id,
          timestamp: new Date(),
          orchestrationId,
          isOrchestrated: true,
          orchestrator: orchestrator.id,
        };
      } finally {
        setActiveOrchestrations((prev) => {
          const next = new Set(prev);
          next.delete(orchestrationId);
          return next;
        });
      }
    },
    [selectOrchestrator]
  );

  /**
   * Check if a query should use orchestration
   */
  const shouldOrchestrate = useCallback((query: string): boolean => {
    // Complex queries that benefit from multiple perspectives
    const complexPatterns = [
      /plan.*implement/i,
      /debug.*production/i,
      /analyze.*optimize/i,
      /design.*system/i,
      /roadmap/i,
      /strategy/i,
    ];

    return complexPatterns.some((pattern) => pattern.test(query));
  }, []);

  return {
    orchestrate,
    shouldOrchestrate,
    orchestrationResults,
    activeOrchestrations,
    getOrchestrationResult: (id: string) => orchestrationResults[id],
  };
}
