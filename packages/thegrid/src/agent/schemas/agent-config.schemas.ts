import { z } from "@hono/zod-openapi";
import { AgentMetadataSchema, AgentTypeSchema } from "@mrck-labs/grid-core";

// Tool source types
export const ToolSourceSchema = z.enum(["local", "mcp", "agent", "external"]);

// Agent behavior configuration
export const AgentBehaviorSchema = z.object({
  maxRetries: z.number().default(3),
  responseFormat: z.enum(["json", "text", "structured"]).default("text"),
  validateResponse: z.boolean().default(false),
  emitEvents: z.array(z.string()).optional(),
  timeout: z.number().optional(), // milliseconds
});

// Agent prompts configuration
export const AgentPromptsSchema = z.object({
  system: z.string(),
  errorCorrection: z.string().optional(),
  fallback: z.string().optional(),
});

// Tool configuration
export const AgentToolsSchema = z.object({
  builtin: z.array(z.string()).default([]), // Names of built-in tools
  custom: z.array(z.string()).optional(), // Names of custom tools
  mcp: z.array(z.string()).optional(), // MCP server tools
  agents: z.array(AgentTypeSchema).optional(), // Other agents as tools
});

// Hooks configuration for custom logic injection
export const AgentHooksSchema = z
  .object({
    beforeAct: z.boolean().default(false),
    afterResponse: z.boolean().default(false),
    onError: z.boolean().default(false),
    validateResponse: z.boolean().default(false),
    transformInput: z.boolean().default(false),
    transformOutput: z.boolean().default(false),
  })
  .partial(); // Make all fields optional

// Orchestration capabilities
export const AgentOrchestrationSchema = z
  .object({
    // Can this agent be called by other agents?
    callable: z.boolean().default(true),

    // Can this agent call other agents?
    canDelegate: z.boolean().default(false),

    // Which agents can this agent delegate to?
    allowedDelegates: z.array(AgentTypeSchema).optional(),

    // Resource constraints
    maxParallelDelegations: z.number().default(3),
    maxDelegationDepth: z.number().default(3),

    // Delegation strategies
    delegationStrategy: z
      .enum([
        "best-match", // Choose best agent based on capabilities
        "load-balance", // Distribute among capable agents
        "specialist", // Always use specialist agents
        "fallback", // Try primary, fallback to secondary
      ])
      .optional(),

    // Cost and resource management
    costTier: z.enum(["low", "medium", "high"]).default("medium"),
    estimatedDuration: z.number().optional(), // milliseconds
  })
  .partial()
  .refine((data) => data, { message: "Invalid orchestration config" });

// Main agent configuration schema
export const AgentConfigSchema = z.object({
  // Basic identification
  id: z.string(),
  type: AgentTypeSchema,
  version: z.string().default("1.0.0"),

  // Metadata
  metadata: AgentMetadataSchema,

  // Prompts configuration
  prompts: AgentPromptsSchema,

  // Behavior configuration
  behavior: AgentBehaviorSchema.default({}),

  // Tools configuration
  tools: AgentToolsSchema.default({ builtin: [] }),

  // Hooks for custom logic
  hooks: AgentHooksSchema.optional(),

  // Orchestration capabilities
  orchestration: AgentOrchestrationSchema.optional(),

  // Feature flags
  features: z.record(z.boolean()).optional(),

  // Custom configuration (agent-specific)
  customConfig: z.record(z.any()).optional(),
});

// Inferred types
export type ToolSource = z.infer<typeof ToolSourceSchema>;
export type AgentBehavior = z.infer<typeof AgentBehaviorSchema>;
export type AgentPrompts = z.infer<typeof AgentPromptsSchema>;
export type AgentTools = z.infer<typeof AgentToolsSchema>;
export type AgentHooks = z.infer<typeof AgentHooksSchema>;
export type AgentOrchestration = z.infer<typeof AgentOrchestrationSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// Validation helpers
export const validateAgentConfig = (data: unknown) => {
  const result = AgentConfigSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

// Config builder helper for better DX
export const createAgentConfig = (config: AgentConfig): AgentConfig => {
  const validation = validateAgentConfig(config);
  if (!validation.success) {
    throw new Error(`Invalid agent configuration: ${JSON.stringify(validation.error)}`);
  }
  return validation.data!;
};
