import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { fitnessService } from "../../../services/atoms/FitnessService/fitness.service";

export const mealsRouter = new OpenAPIHono();

const MealInput = z.object({
  recipeId: z.string().uuid(),
  date: z.string(),
  time: z.string(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  notes: z.string().optional(),
});

mealsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const input = MealInput.parse(body);
  const meal = await fitnessService.createMeal(input);
  return c.json({ success: true, data: meal });
});

mealsRouter.get("/", async (c) => {
  const start = c.req.query("start");
  const end = c.req.query("end");
  if (!start || !end) return c.json({ success: false, error: "start and end required" }, 400);
  const data = await fitnessService.listMealsByDateRange(start, end);
  return c.json({ success: true, data });
});

mealsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const input = MealInput.partial().omit({ recipeId: true }).parse(body);
  const meal = await fitnessService.updateMeal(id, input as any);
  return c.json({ success: true, data: meal });
});

mealsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await fitnessService.deleteMeal(id);
  return c.json({ success: true });
});

export default mealsRouter;
