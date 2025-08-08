import { z } from "zod";
import { ProgressMessageTypeEnum } from "@mrck-labs/grid-core";
import { ProgressMessageSchema } from "@mrck-labs/grid-core";

// Progress message metadata schema
export const ProgressMessageMetadataSchema = z
  .object({
    source: z.string().optional(),
    functionName: z.string().optional(),
    toolCallId: z.string().optional(),
    toolCallArguments: z.string().optional(),
    agentType: z.string().optional(),
    originalToolResponse: z.any().optional(),
    isRaw: z.boolean().optional(),
    isRephrased: z.boolean().optional(),
    agentStatus: z.any().optional(),
    conclusion: z.string().optional(),
  })
  .partial();

// Inferred TypeScript types
export type ProgressMessage = z.infer<typeof ProgressMessageSchema>;
export type ProgressMessageMetadata = z.infer<typeof ProgressMessageMetadataSchema>;

// Enhanced progress message for better UX
export const EnhancedProgressMessageSchema = z.object({
  // Original fields (maintain compatibility)
  type: ProgressMessageTypeEnum,
  content: z.string(),
  metadata: z.record(z.any()).optional(),

  // Enhanced UX fields
  userFriendlyContent: z.string().optional(),
  phase: z.enum(["understanding", "working", "finalizing"]).optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  estimatedDuration: z.number().optional(), // seconds
  canCollapse: z.boolean().default(false),
  icon: z.string().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  toolName: z.string().optional(),
  shouldReplace: z.boolean().default(false), // Replace previous message instead of adding
});

export type EnhancedProgressMessage = z.infer<typeof EnhancedProgressMessageSchema>;

// Validation helpers (without logger dependencies)
export const validateProgressMessage = (
  data: unknown
): { success: true; data: ProgressMessage } | { success: false; error: string } => {
  const result = ProgressMessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
};

// Tool configuration for user-friendly display
export const ToolDisplayConfigSchema = z.object({
  name: z.string(),
  userFriendlyName: z.string(),
  description: z.string(),
  estimatedTime: z.string(),
  icon: z.string(),
  phase: z.enum(["understanding", "working", "finalizing"]),
  requiresConfirmation: z.boolean().default(false),
});

export type ToolDisplayConfig = z.infer<typeof ToolDisplayConfigSchema>;

// Agent suggestion system
export const AgentSuggestionSchema = z.object({
  trigger: z.string(), // Regex pattern as string
  suggestedAgent: z.string(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
});

export type AgentSuggestion = z.infer<typeof AgentSuggestionSchema>;

// Error recovery information
export const ErrorRecoverySchema = z.object({
  error: z.string(),
  userMessage: z.string(),
  suggestedActions: z.array(z.string()),
  canRetry: z.boolean(),
  retryAttempt: z.number().optional(),
});

export type ErrorRecovery = z.infer<typeof ErrorRecoverySchema>;

export const validateEnhancedProgressMessage = (
  data: unknown
): { success: true; data: EnhancedProgressMessage } | { success: false; error: string } => {
  const result = EnhancedProgressMessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
};

export { ProgressMessageSchema, ProgressMessageTypeEnum };
