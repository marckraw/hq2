import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createConfigBasedRephraserAgent,
  rephraserAgentConfig,
} from "./RephraserAgent/rephraser.config";
import {
  createConfigBasedScribeAgent,
  scribeAgentConfig,
} from "./ScribeAgent/scribe.config";
import { agentRegistryService } from "../services/AgentRegistryService/agent-registry.service";
import { serviceRegistry } from "../../registry/service-registry";

// Mock LLM Service for testing
const createMockLLMService = () => ({
  runLLM: async (_input: any) => ({
    content: "Mocked LLM response",
    tool_calls: [],
  }),
  runCleanLLMWithJSONResponse: async (_input: any) => ({
    content: '{"response": "Mocked JSON response"}',
  }),
  runStreamingLLM: async function* (_input: any) {
    yield { content: "Mocked streaming response" };
  },
});

describe("Config-based Agents", () => {
  beforeEach(() => {
    // Clear registry before each test
    agentRegistryService.clear();

    // Register mock LLM service factory
    serviceRegistry.register("llm", createMockLLMService);
  });

  afterEach(() => {
    // Clear service instances for test isolation
    serviceRegistry.clearInstances();
  });

  describe("Rephraser Agent (Pure Config)", () => {
    it("should create a functional rephraser agent from config", async () => {
      const agent = createConfigBasedRephraserAgent();

      expect(agent).toBeDefined();
      expect(agent.type).toBe("rephraser");
      expect(agent.id).toBe("rephraser");

      // Test metadata
      const metadata = agent.getMetadata?.();
      expect(metadata?.name).toBe("Rephraser");
      expect(metadata?.capabilities).toContain("text_rephrasing");
    });

    it("should register with the agent registry", () => {
      const agent = createConfigBasedRephraserAgent();
      agentRegistryService.register(agent, rephraserAgentConfig);

      // Should be discoverable
      const found = agentRegistryService.get("rephraser");
      expect(found).toBe(agent);

      // Should be findable by capability
      const byCapability =
        agentRegistryService.findByCapability("text_rephrasing");
      expect(byCapability).toContain("rephraser");
    });
  });

  describe("Scribe Agent (Config + Custom)", () => {
    it("should create a scribe agent with custom handlers", async () => {
      const agent = createConfigBasedScribeAgent();

      expect(agent).toBeDefined();
      expect(agent.type).toBe("scribe");

      // Test metadata includes orchestration info
      const metadata = agent.getMetadata?.();
      expect(metadata?.orchestration?.canDelegate).toBe(true);
      expect(metadata?.orchestration?.allowedDelegates).toContain("rephraser");
    });

    it("should be discoverable as an orchestrator", () => {
      const agent = createConfigBasedScribeAgent();
      agentRegistryService.register(agent, scribeAgentConfig);

      // Should be found when looking for orchestrators
      const orchestrators = agentRegistryService.discover({
        includeOrchestrators: true,
      });
      expect(orchestrators).toContain("scribe");
    });
  });

  describe("Agent Discovery", () => {
    it("should support capability-based discovery", () => {
      // Register both agents
      agentRegistryService.register(
        createConfigBasedRephraserAgent(),
        rephraserAgentConfig
      );
      agentRegistryService.register(
        createConfigBasedScribeAgent(),
        scribeAgentConfig
      );

      // Find agents that can write
      const writers = agentRegistryService.findByCapability("writing");
      expect(writers).toContain("scribe");
      expect(writers).not.toContain("rephraser");

      // Find agents that can refine text
      const refiners = agentRegistryService.findByCapabilities([
        "text_refinement",
      ]);
      expect(refiners).toContain("scribe");
    });

    it("should generate agent communication graph", () => {
      agentRegistryService.register(
        createConfigBasedRephraserAgent(),
        rephraserAgentConfig
      );
      agentRegistryService.register(
        createConfigBasedScribeAgent(),
        scribeAgentConfig
      );

      const graph = agentRegistryService.getAgentGraph();

      // Scribe can call rephraser
      expect(graph.scribe.canCall).toContain("rephraser");

      // Rephraser can be called by scribe
      expect(graph.rephraser.canBeCalledBy).toContain("scribe");

      // Rephraser cannot call anyone
      expect(graph.rephraser.canCall).toHaveLength(0);
    });
  });
});
