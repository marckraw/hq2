import { createRoute, z } from "@hono/zod-openapi";

export const WeeklyPlanDaySchema = z.object({
  date: z.string(),
  weekday: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  meals: z.array(
    z.object({
      id: z.string(),
      time: z.string(),
      title: z.string(),
      description: z.string().optional(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      tags: z.array(z.string()).optional(),
    })
  ),
});

export const WeeklyPlanSchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
  days: z.array(WeeklyPlanDaySchema),
});

export const getWeeklyPlanRoute = createRoute({
  method: "get",
  path: "/weekly",
  summary: "Get weekly fitness meal plan (mocked)",
  description: "Returns a mocked weekly plan with meals and macros for 7 days.",
  tags: ["Fitness"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      offset: z
        .string()
        .regex(/^[-+]?\d+$/)
        .optional()
        .describe("Week offset from current week (e.g., -1 previous, +1 next)"),
    }),
  },
  responses: {
    200: {
      description: "Weekly plan",
      content: { "application/json": { schema: WeeklyPlanSchema } },
    },
  },
});

// Meal detail schemas and route
export const MealDetailSchema = z.object({
  date: z.string(),
  weekday: z.string(),
  totals: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
  meal: z.object({
    id: z.string(),
    time: z.string(),
    title: z.string(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    tags: z.array(z.string()).optional(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
  }),
});

export const getMealRoute = createRoute({
  method: "get",
  path: "/meal",
  summary: "Get meal details for a given date and id (mocked)",
  tags: ["Fitness"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      date: z.string().describe("ISO date yyyy-mm-dd that contains the meal"),
      mealId: z.string().describe("Meal id from weekly plan"),
    }),
  },
  responses: {
    200: {
      description: "Meal details",
      content: { "application/json": { schema: MealDetailSchema } },
    },
    404: {
      description: "Meal not found",
      content: { "application/json": { schema: z.object({ error: z.string() }) } },
    },
  },
});
