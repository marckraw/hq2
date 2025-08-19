import { z } from "@hono/zod-openapi";

// Request schemas
export const InitRequestSchema = z.object({
  message: z.string().min(1).describe("User's message"),
  conversationId: z.number().optional().describe("Existing conversation ID"),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        dataUrl: z.string(),
      })
    )
    .optional()
    .default([])
    .describe("File attachments"),
  agentType: z
    .string()
    .optional()
    .default("general")
    .describe("Type of agent to use"),
  modelId: z
    .string()
    .optional()
    .default("claude-3-sonnet")
    .describe("LLM model to use"),
});

export const StopStreamRequestSchema = z.object({
  streamToken: z.string().describe("Stream token to stop"),
});

// Response schemas
export const InitResponseSchema = z.object({
  streamToken: z.string().describe("Token for SSE stream"),
  conversationId: z.number().describe("Conversation ID"),
});

export const ConversationSchema = z.object({
  id: z.number(),
  title: z.string(),
  systemMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ConversationsResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
});

export const MessageSchema = z.object({
  id: z.number(),
  conversationId: z.number(),
  role: z.string(),
  content: z.string(),
  tool_call_id: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const ExecutionStepSchema = z.object({
  id: z.number(),
  executionId: z.number(),
  stepType: z.string(),
  content: z.string(),
  metadata: z.any().nullable(),
  stepOrder: z.number(),
  createdAt: z.string(),
});

export const ExecutionSchema = z.object({
  id: z.number(),
  conversationId: z.number(),
  messageId: z.number().nullable(),
  triggeringMessageId: z.number().nullable(),
  agentType: z.string(),
  status: z.string(),
  autonomousMode: z.boolean(),
  totalSteps: z.number(),
  streamToken: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  steps: z.array(ExecutionStepSchema),
});

export const TimelineItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("message"),
    data: MessageSchema,
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("execution_step"),
    data: ExecutionStepSchema.extend({
      execution: z.object({
        id: z.number(),
        agentType: z.string(),
        autonomousMode: z.boolean(),
        messageId: z.number().nullable(),
        triggeringMessageId: z.number().nullable(),
      }),
    }),
    timestamp: z.string(),
  }),
]);

export const TimelineResponseSchema = z.object({
  timeline: z.object({
    messages: z.array(MessageSchema),
    executions: z.array(ExecutionSchema),
    timeline: z.array(TimelineItemSchema),
  }),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

// Type exports
export type InitRequest = z.infer<typeof InitRequestSchema>;
export type InitResponse = z.infer<typeof InitResponseSchema>;
export type StopStreamRequest = z.infer<typeof StopStreamRequestSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ExecutionStep = z.infer<typeof ExecutionStepSchema>;
export type Execution = z.infer<typeof ExecutionSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type TimelineResponse = z.infer<typeof TimelineResponseSchema>;