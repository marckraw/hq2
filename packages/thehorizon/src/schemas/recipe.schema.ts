// lightweight inline validation via type-only import workaround if zod types aren't available
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { z as ZodNS } from "zod";
// @ts-ignore - at runtime, we don't execute this file in the browser directly
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { z } = require("zod") as { z: typeof (undefined as unknown as ZodNS) };

export const RecipeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  heroImageUrl: z.string().url("Must be a valid URL"),
  prepTimeMinutes: z.number().int().nonnegative().optional(),
  difficulty: z.string().optional(),
  servings: z.number().int().nonnegative().optional(),
  calories: z.number().int().nonnegative().optional(),
  protein: z.number().int().nonnegative().optional(),
  carbs: z.number().int().nonnegative().optional(),
  fat: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).default([]),
  ingredients: z.array(z.object({ text: z.string().min(1) })).default([]),
  steps: z.array(z.object({ text: z.string().min(1) })).default([]),
  images: z.array(z.object({ url: z.string().url("Must be a valid URL") })).default([]),
});

export type RecipeFormValues = z.infer<typeof RecipeFormSchema>;
