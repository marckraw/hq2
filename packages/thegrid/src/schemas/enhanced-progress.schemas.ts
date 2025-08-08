import { z } from "@hono/zod-openapi";

// Enhanced progress message for better UX
export const EnhancedProgressMessageSchema = z.object({
  // Original fields (maintain compatibility)
  type: z.enum([
    "user_message",
    "thinking",
    "llm_response",
    "tool_execution",
    "tool_response",
    "finished",
    "error",
    "memory_saved",
    "evaluation",
    "conclusion",
  ]),
  content: z.string(),
  metadata: z.any().optional(),

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

export type EnhancedProgressMessage = z.infer<
  typeof EnhancedProgressMessageSchema
>;

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
