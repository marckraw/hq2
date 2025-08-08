import type { AgentPlan, SubthreadMessage } from "../types";

/**
 * Base interface that all agents must implement
 * This enables the orchestration system to work with any agent
 */
export interface AgentInterface {
  id: string;
  name: string;
  description: string;
  
  /**
   * Determines if this agent can handle the given input
   * Used for lead agent selection
   */
  canHandle(input: string): boolean;
  
  /**
   * Analyzes confidence level for handling this query
   * Higher confidence = more likely to be selected as lead
   */
  getConfidence(input: string): number;
  
  /**
   * Generate a direct response to the input
   * Used when agent is responding independently
   */
  respond(input: string, context?: any): Promise<string>;
  
  /**
   * Create an execution plan for orchestrating other agents
   * Only called when this agent is the orchestrator
   */
  createPlan(input: string, availableAgents: string[]): AgentPlan;
  
  /**
   * Execute a specific task as part of a plan
   * Called when this agent is participating in orchestration
   */
  executeTask(task: string, context?: any): Promise<SubthreadMessage>;
  
  /**
   * Synthesize multiple agent responses into a final response
   * Called by the orchestrator after gathering all subthread responses
   */
  synthesize(
    originalQuery: string,
    plan: AgentPlan,
    responses: SubthreadMessage[]
  ): string;
  
  /**
   * Get internal reasoning/thoughts for transparency
   * Can be shown in the reveal panel
   */
  getInternalThoughts(): string[];
  
  /**
   * Get the tools this agent can use
   */
  getAvailableTools(): string[];
}

/**
 * Factory function type for creating agent instances
 */
export type AgentFactory = () => AgentInterface;

/**
 * Registry for all available agents
 */
export class AgentRegistry {
  private static agents = new Map<string, AgentInterface>();
  
  static register(agent: AgentInterface) {
    this.agents.set(agent.id, agent);
  }
  
  static get(id: string): AgentInterface | undefined {
    return this.agents.get(id);
  }
  
  static getAll(): AgentInterface[] {
    return Array.from(this.agents.values());
  }
  
  static getAllIds(): string[] {
    return Array.from(this.agents.keys());
  }
}