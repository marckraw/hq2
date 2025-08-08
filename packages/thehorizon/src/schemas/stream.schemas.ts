import { z } from "zod";

// Extensible message types - core types are strictly typed, but allows custom extensions
export const CoreMessageTypes = [
  "user_message",
  "thinking",
  "tool_execution",
  "tool_response",
  "llm_response",
  "memory_saved",
  "finished",
  "error",
] as const;

export const ProgressMessageTypeSchema = z.union([
  z.enum(CoreMessageTypes),
  z.string(), // Allow custom types for extensibility
]);

// Enhanced metadata schema
export const ProgressMessageMetadataSchema = z
  .object({
    // Agent context
    agentType: z.string().optional(),
    agentStatus: z.string().optional(),

    // Tool execution context
    source: z.string().optional(),
    functionName: z.string().optional(),
    toolCallId: z.string().optional(),
    toolCallArguments: z.string().optional(),
    originalToolResponse: z.any().optional(),
    isRaw: z.boolean().optional(),
    isRephrased: z.boolean().optional(),

    // Execution tracking
    executionId: z.number().optional(),
    stepOrder: z.number().optional(),

    // Completion context
    conclusion: z.string().optional(),
    error: z.boolean().optional(),

    // Memory context
    memoryType: z.string().optional(),
    confidence: z.number().optional(),

    // Recovery context
    retryAttempt: z.number().optional(),
    maxRetries: z.number().optional(),
    maxRetriesReached: z.boolean().optional(),
    parseError: z.boolean().optional(),
  })
  .catchall(z.any())
  .partial();

// Unified progress message schema
export const ProgressMessageSchema = z.object({
  type: ProgressMessageTypeSchema,
  content: z.string(),
  metadata: ProgressMessageMetadataSchema.optional(),
  timestamp: z.string().optional(),
});

export type ProgressMessage = z.infer<typeof ProgressMessageSchema>;
export type ProgressMessageMetadata = z.infer<
  typeof ProgressMessageMetadataSchema
>;
export type MessageType = z.infer<typeof ProgressMessageTypeSchema>;

// Validation helper
export const validateProgressMessage = (
  data: unknown
):
  | { success: true; data: ProgressMessage }
  | { success: false; error: string } => {
  const result = ProgressMessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
};

// Message type guards
export const isFinishedMessage = (msg: ProgressMessage): boolean =>
  msg.type === "finished";
export const isErrorMessage = (msg: ProgressMessage): boolean =>
  msg.type === "error";
export const isLLMResponse = (msg: ProgressMessage): boolean =>
  msg.type === "llm_response";
export const isToolExecution = (msg: ProgressMessage): boolean =>
  msg.type === "tool_execution";
