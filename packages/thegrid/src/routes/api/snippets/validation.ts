import { z } from "@hono/zod-openapi";

export const PromptSnippetSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  insertText: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePromptSnippetSchema = PromptSnippetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePromptSnippetSchema = CreatePromptSnippetSchema.partial();

export type PromptSnippet = z.infer<typeof PromptSnippetSchema>;
export type CreatePromptSnippet = z.infer<typeof CreatePromptSnippetSchema>;
export type UpdatePromptSnippet = z.infer<typeof UpdatePromptSnippetSchema>;
