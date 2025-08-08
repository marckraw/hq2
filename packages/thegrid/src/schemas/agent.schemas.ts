import { z } from "@hono/zod-openapi";
import { ChatMessageSchema } from "./shared.schemas";
import { AgentFlowContextSchema } from "./agent-flow.schemas";
import { logger } from "../utils/logger";
import { AgentMetadataSchema, AgentTypeSchema, type AgentMetadata } from "@mrck-labs/grid-core";

// Agent input schema
export const AgentInputSchema = z.object({
  messages: z.array(ChatMessageSchema),
  tools: z.array(z.any()).optional(), // Tools can be any structure
  context: AgentFlowContextSchema.optional(), // Full AgentFlowContext with all data
});

// Agent response schema (this is just ChatMessage)
export const AgentResponseSchema = ChatMessageSchema;

// Base agent config schema
export const BaseAgentConfigSchema = z.object({
  id: z.string(),
  type: AgentTypeSchema,
  availableTools: z.array(z.any()).optional(),
  metadata: AgentMetadataSchema.partial().optional(),
});

// Agent interface schema (for validation of agent objects)
export const AgentSchema = z.object({
  id: z.string(),
  type: AgentTypeSchema,
  availableTools: z.array(z.any()),
  // Note: we can't validate functions directly with Zod
  // but we can validate their existence and types at runtime
});

export type { AgentType, AgentCapability } from "./agent-base.schemas";
export type AgentInput = z.infer<typeof AgentInputSchema>;
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
// export type AgentMetadata = z.infer<typeof AgentMetadataSchema>;
export type BaseAgentConfig = z.infer<typeof BaseAgentConfigSchema>;

// Validation helpers
export const validateAgentInput = (data: unknown) => {
  const result = AgentInputSchema.safeParse(data);
  if (!result.success) {
    logger.warn("❌ AgentInput validation failed", {
      issues: result.error.issues,
    });
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

export const validateAgentResponse = (data: unknown) => {
  const result = AgentResponseSchema.safeParse(data);
  if (!result.success) {
    logger.warn("❌ AgentResponse validation failed", {
      issues: result.error.issues,
    });
    return { success: true, data: data as any, error: result.error }; // ⚠️ GRACEFUL: Return data anyway but log error
  }
  return { success: true, data: result.data, error: null };
};

export const validateAgentMetadata = (data: unknown) => {
  const result = AgentMetadataSchema.safeParse(data);
  if (!result.success) {
    logger.warn("❌ AgentMetadata validation failed", {
      issues: result.error.issues,
    });
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

// Special validation for agent act method responses with enhanced logging
export const validateAgentActResponse = (data: unknown, agentType: string) => {
  const result = AgentResponseSchema.safeParse(data);
  if (!result.success) {
    logger.warn(`❌ Agent "${agentType}" returned invalid response`, {
      issues: result.error.issues,
      receivedData: data,
      timestamp: new Date().toISOString(),
      agentType,
    });

    // 🚨 This is critical - we want to know when agents misbehave
    // But we also want the system to keep running
    return {
      success: false,
      data: data as any, // Return the data anyway for graceful degradation
      error: result.error,
      agentType,
    };
  }

  logger.debug(`✅ Agent "${agentType}" returned valid response`);
  return { success: true, data: result.data, error: null, agentType };
};

export { AgentMetadataSchema, AgentTypeSchema };
export type { AgentMetadata };
