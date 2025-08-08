import { z } from "@hono/zod-openapi";

export const changelogRequestSchema = z.object({
  repoOwner: z.string(),
  repoName: z.string(),
  prNumber: z.string(),
  title: z.string().optional(),
  summary: z.string().optional(),
  commits: z.any().optional(),
  releaseDate: z.date().optional(),
  createdBy: z.string().optional(),
  published: z.boolean().optional(),
});
