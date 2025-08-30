import { OpenAPIHono } from "@hono/zod-openapi";
import { getWeeklyPlanRoute } from "./fitness.routes";
import { fitnessService } from "../../../services/atoms/FitnessService/fitness.service";
import { db } from "../../../db";
import {
  meals as mealsTable,
  recipes as recipesTable,
  recipeImages,
  recipeIngredients,
  recipeSteps,
} from "../../../db/schema";
import { eq, inArray, asc } from "drizzle-orm";

export const fitnessRouter = new OpenAPIHono();

// Date helpers to avoid timezone drift
const formatLocalDate = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

fitnessRouter.openapi(getWeeklyPlanRoute, async (c) => {
  // Compute Monday and offset for DB-backed plan
  const today = new Date();
  const offsetWeeks = Number(c.req.query("offset")) || 0; // negative for past, positive for future
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7; // 0=Sunday -> 6, 1=Mon -> 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday + offsetWeeks * 7);
  const mondayIsoForDb = formatLocalDate(monday);
  const plan = await fitnessService.getWeeklyPlan(mondayIsoForDb);
  return c.json(plan);

  /* const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    // Deterministic picks per day so IDs are stable and match detail view
    const baseOrder = Array.from({ length: mealsCatalog.length }, (_, n) => n);
    const picks = baseOrder.map((n) => (n + i) % mealsCatalog.length).slice(0, 4);
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const meals = picks.map((idx, mi) => {
      const base = mealsCatalog[idx % mealsCatalog.length]!;
      const time = ["08:00", "12:30", "16:00", "19:30"][mi] || "12:00";
      totals.calories += base.calories;
      totals.protein += base.protein;
      totals.carbs += base.carbs;
      totals.fat += base.fat;
      return {
        id: `${i}-${slugify(base.title)}-${mi}`,
        time,
        title: base.title,
        calories: base.calories,
        protein: base.protein,
        carbs: base.carbs,
        fat: base.fat,
        tags: mi === 0 ? ["breakfast"] : mi === 3 ? ["dinner"] : ["meal"],
      };
    });

    const weekday = weekdays[i] ?? "";
    return {
      date: formatLocalDate(date),
      weekday,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      meals,
    };
  });

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return c.json({ weekStart: formatLocalDate(monday), weekEnd: formatLocalDate(sunday), days }); */
});

export default fitnessRouter;

// Meal detail endpoint (non-OpenAPI for now)
fitnessRouter.get("/meal", async (c) => {
  const dateStr = c.req.query("date");
  const mealId = c.req.query("mealId");
  if (!dateStr || !mealId) return c.json({ error: "Missing date or mealId" }, 400);

  // Load selected meal
  const [m] = await db
    .select()
    .from(mealsTable)
    .where(eq(mealsTable.id, mealId as string));
  if (!m) return c.json({ error: "Meal not found" }, 404);

  // Load meals for the day to compute totals
  const dayMeals = await db.select().from(mealsTable).where(eq(mealsTable.date, m.date));
  const involvedIds = Array.from(new Set(dayMeals.map((x) => x.recipeId).concat([m.recipeId])));
  const recipeRows = involvedIds.length
    ? await db.select().from(recipesTable).where(inArray(recipesTable.id, involvedIds))
    : [];
  const recipeById = new Map(recipeRows.map((r) => [r.id, r]));

  const totals = dayMeals.reduce(
    (acc, cur) => {
      const r = recipeById.get(cur.recipeId);
      acc.calories += cur.calories ?? r?.calories ?? 0;
      acc.protein += cur.protein ?? r?.protein ?? 0;
      acc.carbs += cur.carbs ?? r?.carbs ?? 0;
      acc.fat += cur.fat ?? r?.fat ?? 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Selected recipe details
  const recipe = recipeById.get(m.recipeId);
  const images = await db
    .select()
    .from(recipeImages)
    .where(eq(recipeImages.recipeId, m.recipeId))
    .orderBy(asc(recipeImages.sortOrder));
  const ings = await db
    .select()
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, m.recipeId))
    .orderBy(asc(recipeIngredients.sortOrder));
  const steps = await db
    .select()
    .from(recipeSteps)
    .where(eq(recipeSteps.recipeId, m.recipeId))
    .orderBy(asc(recipeSteps.sortOrder));

  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(m.date).getDay()] || "";
  return c.json({
    date: m.date,
    weekday,
    totals,
    meal: {
      id: m.id,
      time: m.time,
      title: recipe?.title ?? "Meal",
      description: recipe?.description ?? undefined,
      calories: m.calories ?? recipe?.calories ?? 0,
      protein: m.protein ?? recipe?.protein ?? 0,
      carbs: m.carbs ?? recipe?.carbs ?? 0,
      fat: m.fat ?? recipe?.fat ?? 0,
      prepTimeMinutes: recipe?.prepTimeMinutes ?? 0,
      difficulty: recipe?.difficulty ?? "Easy",
      servings: recipe?.servings ?? 1,
      imageUrl:
        recipe?.heroImageUrl || `https://picsum.photos/seed/${encodeURIComponent(recipe?.title || "meal")}/1200/800`,
      additionalImages: images.map((i) => i.url),
      ingredients: ings.map((i) => i.text),
      instructions: steps.map((s) => s.text),
    },
  });
});
