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
  // Mock data generation for a 7-day week starting Monday
  const today = new Date();
  const offsetWeeks = Number(c.req.query("offset")) || 0; // negative for past, positive for future
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7; // 0=Sunday -> 6, 1=Mon -> 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday + offsetWeeks * 7);
  const mondayIsoForDb = formatLocalDate(monday);
  const plan = await fitnessService.getWeeklyPlan(mondayIsoForDb);
  return c.json(plan);

  /* const mealsCatalog = [
    { title: "Oats with Berries", protein: 20, carbs: 55, fat: 10, calories: 430 },
    { title: "Chicken Salad Bowl", protein: 35, carbs: 25, fat: 15, calories: 420 },
    { title: "Greek Yogurt & Nuts", protein: 18, carbs: 15, fat: 12, calories: 260 },
    { title: "Salmon, Rice & Greens", protein: 40, carbs: 50, fat: 18, calories: 560 },
    { title: "Protein Shake", protein: 30, carbs: 8, fat: 3, calories: 180 },
    { title: "Egg Scramble & Toast", protein: 28, carbs: 30, fat: 16, calories: 420 },
    { title: "Tex-Mex Bowl", protein: 24, carbs: 70, fat: 22, calories: 680 },
    { title: "Carb-Loaded Pasta Feast", protein: 25, carbs: 150, fat: 20, calories: 900 },
  ]; */

  // Detailed recipe catalog (mock) for potential per-week overrides (unused)
  /* const _recipeCatalog: Record<
    string,
    {
      imageUrl: string;
      prepTimeMinutes: number;
      difficulty: string;
      servings: number;
      ingredients: string[];
      instructions: string[];
    }
  > = {
    "Oats with Berries": {
      imageUrl: "https://images.unsplash.com/photo-1505575972945-2804b56ba9dd?q=80&w=1200&auto=format&fit=crop",
      prepTimeMinutes: 10,
      difficulty: "Easy",
      servings: 1,
      ingredients: [
        "60g rolled oats",
        "250ml milk or almond milk",
        "1 tbsp chia seeds",
        "1 tsp honey or maple syrup",
        "Handful mixed berries",
        "Pinch of salt",
      ],
      instructions: [
        "Combine oats, milk, chia and a pinch of salt in a small pot.",
        "Simmer 3–5 minutes, stirring until creamy.",
        "Serve in a bowl, top with berries and drizzle honey.",
      ],
    },
    "Chicken Salad Bowl": {
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop",
      prepTimeMinutes: 25,
      difficulty: "Easy",
      servings: 2,
      ingredients: [
        "2 chicken breasts",
        "1 tbsp olive oil",
        "Salt & pepper",
        "4 cups mixed salad greens",
        "10 cherry tomatoes, halved",
        "1/2 cucumber, sliced",
        "1/2 avocado, sliced",
        "1 tbsp lemon juice",
        "Optional: 40g feta, crumbled",
      ],
      instructions: [
        "Season chicken with salt and pepper, sear in olive oil 4–5 min per side until cooked.",
        "Whisk lemon juice with 1 tbsp olive oil and a pinch of salt for dressing.",
        "Assemble greens, tomatoes, cucumber and avocado in bowls.",
        "Slice chicken, place on top, drizzle dressing and sprinkle feta.",
      ],
    },
    "Greek Yogurt & Nuts": {
      imageUrl: "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop",
      prepTimeMinutes: 5,
      difficulty: "Easy",
      servings: 1,
      ingredients: ["200g Greek yogurt", "30g mixed nuts", "1 tsp honey", "Optional: 1/2 banana, sliced"],
      instructions: ["Spoon yogurt into a bowl.", "Top with nuts and banana.", "Drizzle honey and serve."],
    },
    "Salmon, Rice & Greens": {
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
      prepTimeMinutes: 30,
      difficulty: "Medium",
      servings: 2,
      ingredients: [
        "2 salmon fillets",
        "1 tbsp olive oil",
        "1 garlic clove, minced",
        "1 lemon",
        "200g rice",
        "200g broccoli or greens",
        "Salt & pepper",
      ],
      instructions: [
        "Cook rice according to package.",
        "Season salmon, drizzle oil, bake 12–15 min at 200°C.",
        "Steam or sauté greens with garlic 3–4 min.",
        "Serve salmon over rice with greens and lemon wedges.",
      ],
    },
    "Protein Shake": {
      imageUrl: "https://images.unsplash.com/photo-1611077070313-6a7d8dfd1c0f?q=80&w=1200&auto=format&fit=crop",
      prepTimeMinutes: 3,
      difficulty: "Easy",
      servings: 1,
      ingredients: ["1 scoop whey protein", "250ml milk or water", "1/2 banana", "1 tbsp peanut butter", "Ice cubes"],
      instructions: ["Blend all ingredients until smooth."],
    },
    "Egg Scramble & Toast": {
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
      prepTimeMinutes: 10,
      difficulty: "Easy",
      servings: 1,
      ingredients: ["2–3 eggs", "1 tsp butter", "Salt & pepper", "Chives, chopped", "2 slices wholegrain bread"],
      instructions: [
        "Whisk eggs with a pinch of salt and pepper.",
        "Melt butter on low heat, add eggs and gently stir until just set.",
        "Toast bread, top with eggs and chives.",
      ],
    },
  }; */

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
      calories: m.calories ?? recipe?.calories ?? 0,
      protein: m.protein ?? recipe?.protein ?? 0,
      carbs: m.carbs ?? recipe?.carbs ?? 0,
      fat: m.fat ?? recipe?.fat ?? 0,
      imageUrl:
        recipe?.heroImageUrl || `https://picsum.photos/seed/${encodeURIComponent(recipe?.title || "meal")}/1200/800`,
      additionalImages: images.map((i) => i.url),
      ingredients: ings.map((i) => i.text),
      instructions: steps.map((s) => s.text),
    },
  });
});
