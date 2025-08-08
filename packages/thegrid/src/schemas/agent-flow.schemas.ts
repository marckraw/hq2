import { z } from "@hono/zod-openapi";
import { AgentTypeSchema } from "./agent-base.schemas";
import { SessionDataSchema } from "./conversation.schemas";
import { ChatMessageSchema } from "./shared.schemas";

// Uploaded attachment schema (used in agent flows)
export const UploadedAttachmentSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
});

// Agent flow options schema
export const AgentFlowOptionsSchema = z.object({
  autonomousMode: z.boolean(),
  maxRequests: z.number().optional(),
  streamState: z.any().optional(), // Complex object, using any for now
});

// Delegation context for agent-to-agent communication
export const DelegationContextSchema = z.object({
  fromAgent: AgentTypeSchema,
  delegationDepth: z.number(),
  sharedContext: z.any().optional(),
  parentExecutionId: z.string(),
  delegationPath: z.array(AgentTypeSchema),
});

// Agent flow context schema - comprehensive definition
export const AgentFlowContextSchema = z.object({
  agentType: AgentTypeSchema,
  agent: z.any(), // Agent interface - can't validate functions with Zod
  userMessage: z.string(),
  conversationId: z.number(),
  conversationHistory: z.array(ChatMessageSchema),
  executionId: z.number().optional(),
  userMessageId: z.number().optional(),
  sessionData: SessionDataSchema.optional(),
  uploadedAttachments: z.array(UploadedAttachmentSchema).optional(),
  delegation: DelegationContextSchema.optional(), // For agent-to-agent calls
  sessionToken: z.string().optional(), // For Langfuse tracing
});

// Flow step result schema
export const FlowStepResultSchema = z.object({
  shouldBreak: z.boolean(),
  conclusion: z.string().optional(),
  finalConclusion: z.string().optional(),
});

// Tool execution result schema
export const ToolExecutionResultSchema = z.object({
  toolResponse: z.any(),
  rephrasedContent: z.string(),
  shouldBreak: z.boolean(),
  conclusion: z.string().optional(),
});

// Inferred types
export type UploadedAttachment = z.infer<typeof UploadedAttachmentSchema>;
export type AgentFlowOptions = z.infer<typeof AgentFlowOptionsSchema>;
export type DelegationContext = z.infer<typeof DelegationContextSchema>;
export type AgentFlowContext = z.infer<typeof AgentFlowContextSchema>;
export type FlowStepResult = z.infer<typeof FlowStepResultSchema>;
export type ToolExecutionResult = z.infer<typeof ToolExecutionResultSchema>;

// Validation helpers
export const validateAgentFlowContext = (data: unknown) => {
  const result = AgentFlowContextSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

export const validateAgentFlowOptions = (data: unknown) => {
  const result = AgentFlowOptionsSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

export const validateUploadedAttachment = (data: unknown) => {
  const result = UploadedAttachmentSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

export const validateFlowStepResult = (data: unknown) => {
  const result = FlowStepResultSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

export const validateToolExecutionResult = (data: unknown) => {
  const result = ToolExecutionResultSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};
