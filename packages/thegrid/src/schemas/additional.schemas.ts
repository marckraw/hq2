import { logger } from "@/utils/logger";
import { z } from "@hono/zod-openapi";

// Attachment schema for user messages
export const AttachmentSchema = z.object({
  type: z.string(),
  data: z.string(),
});

// AI Message schemas - supporting different message types
export const UserMessageSchema = z.object({
  role: z.literal("user"),
  content: z.string(),
  attachments: z.array(AttachmentSchema).optional(),
});

export const SystemMessageSchema = z.object({
  role: z.literal("system"),
  content: z.string(),
});

export const ToolMessageSchema = z.object({
  role: z.literal("tool"),
  content: z.string(),
  tool_call_id: z.string(),
});

// Assistant message schema (from OpenAI)
export const AssistantMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.string().nullable().optional(),
  tool_calls: z
    .array(
      z.object({
        id: z.string(),
        type: z.literal("function"),
        function: z.object({
          name: z.string(),
          arguments: z.string(),
        }),
      })
    )
    .optional(),
});

// Union of all AI message types
export const AIMessageSchema = z.union([
  UserMessageSchema,
  SystemMessageSchema,
  ToolMessageSchema,
  AssistantMessageSchema,
]);

// Tool function input schema
export const ToolFunctionInputSchema = z.object({
  userMessage: z.string(),
  toolArgs: z.any(), // Generic tool arguments
});

// Tool function result schema (generic)
export const ToolFunctionResultSchema = z.any();

// Progress message schema (from thecore)
export const ProgressMessageSchema = z.object({
  type: z.string(),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

// Error schemas
export const FigmaErrorSchema = z.object({
  status: z.number(),
  err: z.string(),
  message: z.string().optional(),
});

export const GenericErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

// File attachment schema (for UI components)
export const FileAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
  dataUrl: z.string().optional(),
});

// Enhanced attachment schema with validation
export const EnhancedAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
  ]),
  dataUrl: z.string(),
  size: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

// Timeline item schemas (for chat interface)
export const TimelineMessageSchema = z.object({
  type: z.literal("message"),
  data: z.any(), // Would reference actual Message schema
  timestamp: z.string(),
});

export const TimelineExecutionStepSchema = z.object({
  type: z.literal("execution_step"),
  data: z.object({
    id: z.number(),
    executionId: z.number(),
    stepType: z.string(),
    content: z.string(),
    metadata: z.any(),
    stepOrder: z.number(),
    createdAt: z.string(),
    execution: z.object({
      id: z.number(),
      agentType: z.string(),
      autonomousMode: z.boolean(),
      messageId: z.number().nullable(),
      triggeringMessageId: z.number().nullable(),
    }),
  }),
  timestamp: z.string(),
});

export const TimelineItemSchema = z.union([
  TimelineMessageSchema,
  TimelineExecutionStepSchema,
]);

// Rate limit info schema
export const RateLimitInfoSchema = z.object({
  count: z.number(),
  reset: z.number(),
  limit: z.number().optional(),
  remaining: z.number().optional(),
});

// API response wrapper schemas
export const ApiSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  metadata: z.record(z.any()).optional(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  details: z.any().optional(),
  code: z.string().optional(),
});

export const ApiResponseSchema = z.union([
  ApiSuccessResponseSchema,
  ApiErrorResponseSchema,
]);

// Inferred types
export type Attachment = z.infer<typeof AttachmentSchema>;
export type UserMessage = z.infer<typeof UserMessageSchema>;
export type SystemMessage = z.infer<typeof SystemMessageSchema>;
export type ToolMessage = z.infer<typeof ToolMessageSchema>;
export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;
export type AIMessage = z.infer<typeof AIMessageSchema>;
export type ToolFunctionInput = z.infer<typeof ToolFunctionInputSchema>;
export type ToolFunctionResult = z.infer<typeof ToolFunctionResultSchema>;
export type ProgressMessage = z.infer<typeof ProgressMessageSchema>;
export type FigmaError = z.infer<typeof FigmaErrorSchema>;
export type GenericError = z.infer<typeof GenericErrorSchema>;
export type FileAttachment = z.infer<typeof FileAttachmentSchema>;
export type EnhancedAttachment = z.infer<typeof EnhancedAttachmentSchema>;
export type TimelineMessage = z.infer<typeof TimelineMessageSchema>;
export type TimelineExecutionStep = z.infer<typeof TimelineExecutionStepSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type RateLimitInfo = z.infer<typeof RateLimitInfoSchema>;
export type ApiSuccessResponse = z.infer<typeof ApiSuccessResponseSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Tool function interface (cannot be validated with Zod, but typed)
export interface ToolFunction<A = any, T = any> {
  (input: ToolFunctionInput & { toolArgs: A }): Promise<T>;
}

// Validation helpers
export const validateAIMessage = (
  data: unknown
): { success: true; data: AIMessage } | { success: false; error: string } => {
  const result = AIMessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn("AI message validation failed:", result.error.format());
  return { success: false, error: result.error.message };
};

export const validateProgressMessage = (
  data: unknown
):
  | { success: true; data: ProgressMessage }
  | { success: false; error: string } => {
  const result = ProgressMessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn("Progress message validation failed:", result.error.format());
  return { success: false, error: result.error.message };
};

export const validateFileAttachment = (
  data: unknown
):
  | { success: true; data: EnhancedAttachment }
  | { success: false; error: string } => {
  const result = EnhancedAttachmentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn("File attachment validation failed:", result.error.format());
  return { success: false, error: result.error.message };
};

export const validateTimelineItem = (
  data: unknown
):
  | { success: true; data: TimelineItem }
  | { success: false; error: string } => {
  const result = TimelineItemSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  logger.warn("Timeline item validation failed:", result.error.format());
  return { success: false, error: result.error.message };
};
