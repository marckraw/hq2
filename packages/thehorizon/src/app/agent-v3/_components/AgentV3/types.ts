export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent?: string;
  timestamp: Date;
  isStreaming?: boolean;
  // Collaboration fields
  referencedAgents?: string[];
  collaborationId?: string;
  isPartOfChain?: boolean;
  referencedMessageId?: string;
  // Orchestration fields
  orchestrationId?: string;
  isOrchestrated?: boolean;
  orchestrator?: string;
  // Execution plan tracking
  executionPlan?: {
    currentStep: number;
    totalSteps: number;
    activeAgent: string;
    currentTask?: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  color: string;
  model: string;
}

export interface ContextData {
  showPrecision: boolean;
  selectedAgent: string;
  selectedModel: string;
  commandMode: boolean;
}

export const AVAILABLE_AGENTS: Agent[] = [
  {
    id: "chronos",
    name: "Chronos",
    description: "Time & scheduling specialist",
    color: "blue",
    model: "gpt-4o"
  },
  {
    id: "valkyrie",
    name: "Valkyrie",
    description: "Code warrior & debugger",
    color: "purple",
    model: "gpt-4o"
  },
  {
    id: "heimdall",
    name: "Heimdall",
    description: "All-seeing system observer",
    color: "green",
    model: "gpt-3.5-turbo"
  },
  {
    id: "odin",
    name: "Odin",
    description: "Architecture & strategic planning",
    color: "indigo",
    model: "gpt-4o"
  },
  {
    id: "hermes",
    name: "Hermes",
    description: "Communication & documentation",
    color: "amber",
    model: "gpt-3.5-turbo"
  }
];

export const AVAILABLE_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast & efficient" },
  { id: "claude-3", name: "Claude 3", description: "Thoughtful & precise" },
  { id: "custom", name: "Custom", description: "Your own model" }
];

export interface AgentInteraction {
  fromAgent: string;
  toAgent: string;
  action: string;
  timestamp: Date;
}

export interface CollaborationTrace {
  id: string;
  userQuery: string;
  agents: string[];
  interactions: AgentInteraction[];
  finalResponse?: string;
}

export interface AgentCollaborationPattern {
  trigger: RegExp | string[];
  agents: string[];
  orchestration: "sequential" | "parallel" | "hierarchical";
}

// Orchestration interfaces
export interface AgentPlan {
  steps: AgentPlanStep[];
  strategy: "sequential" | "parallel" | "mixed";
  expectedDuration?: number;
}

export interface AgentPlanStep {
  agent: string;
  task: string;
  dependsOn?: string[]; // IDs of previous steps
  tools?: string[];
  expectedOutput?: string;
}

export interface SubthreadMessage {
  id: string;
  fromAgent: string;
  toAgent?: string; // undefined for internal thoughts
  content: string;
  timestamp: Date;
  tools?: string[];
  memoryHits?: any[];
  confidence?: number;
}

export interface OrchestrationResult {
  id: string;
  finalResponse: string;
  orchestrator: string;
  plan: AgentPlan;
  subthreads: SubthreadMessage[];
  memoryHits?: any[];
  toolsUsed?: string[];
  trace: string[];
  confidence: number;
  duration: number;
}