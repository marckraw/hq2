import { logger } from "@/utils/logger";
import { z } from "@hono/zod-openapi";

// Agent execution data schema
export const AgentExecutionDataSchema = z.object({
  id: z.number().optional(),
  conversationId: z.number(),
  messageId: z.number().optional(),
  triggeringMessageId: z.number().optional(),
  agentType: z.string(),
  status: z.enum(["running", "completed", "failed"]),
  autonomousMode: z.boolean(),
  totalSteps: z.number(),
  streamToken: z.string().optional(),
});

// Agent execution step schema
export const AgentExecutionStepSchema = z.object({
  id: z.number().optional(),
  executionId: z.number(),
  stepType: z.enum([
    "user_input",
    "llm_response",
    "tool_execution",
    "tool_response",
    "evaluation",
    "conclusion",
  ]),
  content: z.string(),
  metadata: z.any().optional(),
  stepOrder: z.number(),
});

// Inferred types
export type AgentExecutionData = z.infer<typeof AgentExecutionDataSchema>;
export type AgentExecutionStep = z.infer<typeof AgentExecutionStepSchema>;

// Validation helpers
export const validateAgentExecutionData = (data: unknown) => {
  const result = AgentExecutionDataSchema.safeParse(data);
  if (!result.success) {
    logger.warn(
      "❌ AgentExecutionData validation failed:",
      result.error.issues
    );
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

export const validateAgentExecutionStep = (data: unknown) => {
  const result = AgentExecutionStepSchema.safeParse(data);
  if (!result.success) {
    logger.warn(
      "❌ AgentExecutionStep validation failed:",
      result.error.issues
    );
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};
