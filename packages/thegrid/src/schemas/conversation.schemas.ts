import { z } from "@hono/zod-openapi";

// Session data schema
export const SessionDataSchema = z.object({
  message: z.object({
    content: z.string(),
    role: z.string(),
  }),
  conversationId: z.number(),
  userMessageId: z.number().optional(),
  autonomousMode: z.boolean(),
  agentType: z.string(),
  attachments: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      dataUrl: z.string(),
    })
  ),
  modelId: z.string().optional(),
  contextData: z
    .object({
      contextType: z.string().optional(),
      selectedSpace: z.string().optional(),
      selectedStory: z.string().optional(),
    })
    .optional(),
});

// Progress message schemas are now imported from core.mrck.dev

// Inferred types
export type SessionData = z.infer<typeof SessionDataSchema>;

// Re-export shared types from core.mrck.dev
export type { ProgressMessage, ProgressMessageMetadata } from "core.mrck.dev";

// Validation helpers (without logger dependencies)
export const validateSessionData = (data: unknown) => {
  const result = SessionDataSchema.safeParse(data);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data, error: null };
};

// Re-export validateProgressMessage from core.mrck.dev
export { validateProgressMessage } from "core.mrck.dev";
