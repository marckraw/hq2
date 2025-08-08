import { z } from "@hono/zod-openapi";

export const chatRequestSchema = z
  .object({
    messages: z.array(
      z
        .object({
          role: z.enum(["user", "system", "assistant"]),
          content: z.string(),
        })
        .strict()
    ),
    conversationId: z.number().optional(),
    autonomousMode: z.boolean().optional().default(false),
    agentType: z
      .enum([
        "general",
        "test-openrouter",
        "scribe",
        "rephraser",
        "figma-analyzer",
        "storyblok",
        "IRFLayoutArchitecture",
      ])
      .optional()
      .default("general"),
    attachments: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.enum(["image/png", "image/jpeg", "application/pdf"]),
          dataUrl: z.string(),
        })
      )
      .optional(),
  })
  .strict();

export const chatStreamRequestSchema = chatRequestSchema;

export const messagesRequestSchema = z
  .object({
    conversationId: z.number().optional(),
  })
  .strict();
