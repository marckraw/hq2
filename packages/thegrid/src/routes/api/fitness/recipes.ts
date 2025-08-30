import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { fitnessService } from "../../../services/atoms/FitnessService/fitness.service";

export const recipesRouter = new OpenAPIHono();

const RecipeInput = z.object({
  title: z.string(),
  description: z.string().optional(),
  heroImageUrl: z.string().url().optional(),
  prepTimeMinutes: z.number().optional(),
  difficulty: z.string().optional(),
  servings: z.number().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  images: z
    .array(z.object({ url: z.string().url(), alt: z.string().optional(), sortOrder: z.number().optional() }))
    .optional(),
  ingredients: z.array(z.object({ text: z.string(), sortOrder: z.number().optional() })).optional(),
  steps: z.array(z.object({ text: z.string(), sortOrder: z.number().optional() })).optional(),
});

recipesRouter.post("/", async (c) => {
  const body = await c.req.json();
  const input = RecipeInput.parse(body);
  const recipe = await fitnessService.createRecipe(input);
  return c.json({ success: true, data: recipe });
});

recipesRouter.get("/", async (c) => {
  const list = await fitnessService.listRecipes();
  return c.json({ success: true, data: list });
});

recipesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const recipe = await fitnessService.getRecipe(id);
  if (!recipe) return c.json({ success: false, error: "Not found" }, 404);
  return c.json({ success: true, data: recipe });
});

recipesRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const input = RecipeInput.partial().parse(body);
  const recipe = await fitnessService.updateRecipe(id, input);
  return c.json({ success: true, data: recipe });
});

recipesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await fitnessService.deleteRecipe(id);
  return c.json({ success: true });
});

export default recipesRouter;
