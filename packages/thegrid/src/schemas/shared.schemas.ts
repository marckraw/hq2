import { z } from "@hono/zod-openapi";

// Tool function call schema
export const ToolFunctionSchema = z.object({
  name: z.string(),
  arguments: z.string(), // JSON string
});

// Tool call schema
export const ToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: ToolFunctionSchema,
});

// Base message schema
export const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
});

// Chat message schema (more flexible than Message)
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.any(), // Can be string, null, or structured content
  tool_calls: z.array(ToolCallSchema).optional(),
  tool_call_id: z.string().optional(),
});

// Attachment schema
export const AttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["image/png", "image/jpeg", "application/pdf"]),
  dataUrl: z.string(),
});

// Image attachment schema (for processing)
export const ImageAttachmentSchema = z.object({
  type: z.string(),
  dataUrl: z.string(),
});

// Task status schema
export const TaskStatusSchema = z.object({
  isComplete: z.boolean(),
  reason: z.string(),
});

// Inferred types (replacing the original TypeScript interfaces)
export type Message = z.infer<typeof MessageSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type ToolFunction = z.infer<typeof ToolFunctionSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type ImageAttachment = z.infer<typeof ImageAttachmentSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Validation helpers (without logger dependencies)
export const validateChatMessage = (data: unknown) => {
  const result = ChatMessageSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

export const validateAttachment = (data: unknown) => {
  const result = AttachmentSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

export const validateToolCall = (data: unknown) => {
  const result = ToolCallSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};
