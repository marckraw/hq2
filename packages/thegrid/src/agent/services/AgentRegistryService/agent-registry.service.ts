import { logger } from "@/utils/logger";
import { AgentType, AgentCapability, AgentMetadata, Agent } from "../../factories/agents.factory.types";
import { AgentConfig } from "../../schemas/agent-config.schemas";

export interface AgentRegistryEntry {
  agent: Agent;
  config?: AgentConfig;
  metadata: AgentMetadata;
  capabilities: AgentCapability[];
}

export interface AgentDiscoveryOptions {
  capabilities?: AgentCapability[];
  excludeTypes?: AgentType[];
  includeCallable?: boolean;
  includeOrchestrators?: boolean;
}

/**
 * Service for managing agent registration, discovery, and capabilities
 */
export const createAgentRegistryService = () => {
  // Private state
  const agents = new Map<AgentType, AgentRegistryEntry>();
  const capabilityIndex = new Map<AgentCapability, Set<AgentType>>();
  const agentConfigs = new Map<AgentType, AgentConfig>();
  
  /**
   * Register an agent with the registry
   */
  const register = (agent: Agent, config?: AgentConfig) => {
    const metadata = agent.getMetadata?.() || {
      id: agent.id,
      type: agent.type,
      name: agent.type,
      description: "",
      capabilities: [],
      icon: "🤖",
    };
    
    // Store agent entry
    agents.set(agent.type, {
      agent,
      config,
      metadata,
      capabilities: metadata.capabilities,
    });
    
    // Store config if provided
    if (config) {
      agentConfigs.set(agent.type, config);
    }
    
    // Update capability index
    const capabilities = metadata.capabilities || [];
    capabilities.forEach(capability => {
      if (!capabilityIndex.has(capability)) {
        capabilityIndex.set(capability, new Set());
      }
      capabilityIndex.get(capability)!.add(agent.type);
    });
    
    logger.info(`Registered agent: ${agent.type} with ${capabilities.length} capabilities`);
  };
  
  /**
   * Get an agent by type
   */
  const get = (type: AgentType): Agent | null => {
    const entry = agents.get(type);
    return entry?.agent || null;
  };
  
  /**
   * Get agent configuration
   */
  const getConfig = (type: AgentType): AgentConfig | null => {
    return agentConfigs.get(type) || null;
  };
  
  /**
   * Get agent metadata
   */
  const getMetadata = (type: AgentType): AgentMetadata | null => {
    const entry = agents.get(type);
    return entry?.metadata || null;
  };
  
  /**
   * Find agents by capability
   */
  const findByCapability = (capability: AgentCapability): AgentType[] => {
    const agentTypes = capabilityIndex.get(capability);
    return agentTypes ? Array.from(agentTypes) : [];
  };
  
  /**
   * Find agents by multiple capabilities (agents must have ALL capabilities)
   */
  const findByCapabilities = (capabilities: AgentCapability[]): AgentType[] => {
    if (capabilities.length === 0) return getAllTypes();
    
    // Find agents that have ALL requested capabilities
    const agentTypeSets = capabilities.map(cap => capabilityIndex.get(cap) || new Set());
    
    // Intersection of all sets
    const firstSet = agentTypeSets[0];
    if (!firstSet) return [];
    
    const result = new Set<AgentType>();
    
    firstSet.forEach(agentType => {
      if (agentTypeSets.every(set => set.has(agentType))) {
        result.add(agentType as AgentType);
      }
    });
    
    return Array.from(result);
  };
  
  /**
   * Get all registered agent types
   */
  const getAllTypes = (): AgentType[] => {
    return Array.from(agents.keys());
  };
  
  /**
   * Get all registered agents
   */
  const getAll = (): Agent[] => {
    return Array.from(agents.values()).map(entry => entry.agent);
  };
  
  /**
   * Get all agent metadata
   */
  const getAllMetadata = (): AgentMetadata[] => {
    return Array.from(agents.values()).map(entry => entry.metadata);
  };
  
  /**
   * Discover agents based on criteria
   */
  const discover = (options: AgentDiscoveryOptions = {}): AgentType[] => {
    let results = getAllTypes();
    
    // Filter by capabilities
    if (options.capabilities && options.capabilities.length > 0) {
      results = findByCapabilities(options.capabilities);
    }
    
    // Exclude specific types
    if (options.excludeTypes && options.excludeTypes.length > 0) {
      results = results.filter(type => !options.excludeTypes!.includes(type));
    }
    
    // Filter by orchestration capabilities
    if (options.includeCallable !== undefined || options.includeOrchestrators !== undefined) {
      results = results.filter(type => {
        const config = getConfig(type);
        if (!config?.orchestration) return false;
        
        if (options.includeCallable !== undefined && config.orchestration?.callable !== options.includeCallable) {
          return false;
        }
        
        if (options.includeOrchestrators !== undefined && config.orchestration?.canDelegate !== options.includeOrchestrators) {
          return false;
        }
        
        return true;
      });
    }
    
    return results;
  };
  
  /**
   * Get best agent for a set of requirements
   */
  const getBestAgent = (requirements: {
    capabilities: AgentCapability[];
    preferredTypes?: AgentType[];
    excludeTypes?: AgentType[];
  }): AgentType | null => {
    let candidates = findByCapabilities(requirements.capabilities);
    
    // Exclude specific types
    if (requirements.excludeTypes) {
      candidates = candidates.filter(type => !requirements.excludeTypes!.includes(type));
    }
    
    // Prefer specific types if provided
    if (requirements.preferredTypes && requirements.preferredTypes.length > 0) {
      const preferred = candidates.filter(type => requirements.preferredTypes!.includes(type));
      if (preferred.length > 0) {
        return preferred[0] || null;
      }
    }
    
    // Return first match or null
    return candidates.length > 0 ? (candidates[0] || null) : null;
  };
  
  /**
   * Get agent communication graph (which agents can call which)
   */
  const getAgentGraph = (): Record<AgentType, {
    canCall: AgentType[];
    canBeCalledBy: AgentType[];
  }> => {
    const graph: Record<string, { canCall: AgentType[]; canBeCalledBy: AgentType[] }> = {};
    
    // Initialize graph
    getAllTypes().forEach(type => {
      graph[type] = { canCall: [], canBeCalledBy: [] };
    });
    
    // Build relationships based on configurations
    agents.forEach((_entry, type) => {
      const config = getConfig(type);
      if (!config?.orchestration) return;
      
      // This agent can delegate
      if (config.orchestration?.canDelegate) {
        const allowedDelegates = config.orchestration?.allowedDelegates || getAllTypes().filter(t => t !== type);
        if (graph[type]) {
          graph[type].canCall = allowedDelegates;
        }
        
        // Update reverse relationships
        allowedDelegates.forEach((delegate: AgentType) => {
          if (graph[delegate]) {
            graph[delegate].canBeCalledBy.push(type);
          }
        });
      }
    });
    
    return graph;
  };
  
  /**
   * Check if an agent can call another agent
   */
  const canCall = (caller: AgentType, callee: AgentType): boolean => {
    const config = getConfig(caller);
    if (!config?.orchestration?.canDelegate) return false;
    
    const allowedDelegates = config.orchestration?.allowedDelegates;
    if (!allowedDelegates) return true; // Can call any agent if not restricted
    
    return allowedDelegates.includes(callee);
  };
  
  /**
   * Clear all registrations (useful for testing)
   */
  const clear = () => {
    agents.clear();
    capabilityIndex.clear();
    agentConfigs.clear();
  };
  
  // Return public API
  return {
    register,
    get,
    getConfig,
    getMetadata,
    findByCapability,
    findByCapabilities,
    getAllTypes,
    getAll,
    getAllMetadata,
    discover,
    getBestAgent,
    getAgentGraph,
    canCall,
    clear,
  };
};

// Export singleton instance
export const agentRegistryService = createAgentRegistryService();