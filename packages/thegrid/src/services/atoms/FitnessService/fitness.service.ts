import { asc, desc, eq, inArray, between } from "drizzle-orm";
import { db } from "../../../db";
import { recipes, recipeImages, recipeIngredients, recipeSteps, meals } from "../../../db/schema";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const createFitnessService = () => {
  const createRecipe = async (input: {
    title: string;
    description?: string;
    heroImageUrl?: string;
    prepTimeMinutes?: number;
    difficulty?: string;
    servings?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    images?: { url: string; alt?: string; sortOrder?: number }[];
    ingredients?: { text: string; sortOrder?: number }[];
    steps?: { text: string; sortOrder?: number }[];
  }) => {
    const [r] = await db
      .insert(recipes)
      .values({
        title: input.title,
        slug: slugify(input.title),
        description: input.description,
        heroImageUrl: input.heroImageUrl,
        prepTimeMinutes: input.prepTimeMinutes ?? 0,
        difficulty: input.difficulty ?? "Easy",
        servings: input.servings ?? 1,
        calories: input.calories ?? 0,
        protein: input.protein ?? 0,
        carbs: input.carbs ?? 0,
        fat: input.fat ?? 0,
      })
      .returning();
    if (!r) {
      throw new Error("Failed to create recipe");
    }

    if (input.images?.length) {
      await db.insert(recipeImages).values(input.images.map((img) => ({ ...img, recipeId: r.id })));
    }
    if (input.ingredients?.length) {
      await db.insert(recipeIngredients).values(input.ingredients.map((it) => ({ ...it, recipeId: r.id })));
    }
    if (input.steps?.length) {
      await db.insert(recipeSteps).values(input.steps.map((st) => ({ ...st, recipeId: r.id })));
    }
    return r;
  };

  const getRecipe = async (id: string) => {
    const [r] = await db.select().from(recipes).where(eq(recipes.id, id));
    if (!r) return null;
    const imgs = await db
      .select()
      .from(recipeImages)
      .where(eq(recipeImages.recipeId, id))
      .orderBy(asc(recipeImages.sortOrder));
    const ings = await db
      .select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, id))
      .orderBy(asc(recipeIngredients.sortOrder));
    const steps = await db
      .select()
      .from(recipeSteps)
      .where(eq(recipeSteps.recipeId, id))
      .orderBy(asc(recipeSteps.sortOrder));
    return { ...r, images: imgs, ingredients: ings, steps };
  };

  const listRecipes = async () => {
    return await db.select().from(recipes).orderBy(desc(recipes.createdAt));
  };

  const updateRecipe = async (id: string, input: Partial<Parameters<typeof createRecipe>[0]>) => {
    await db
      .update(recipes)
      .set({
        title: input.title,
        slug: input.title ? slugify(input.title) : undefined,
        description: input.description,
        heroImageUrl: input.heroImageUrl,
        prepTimeMinutes: input.prepTimeMinutes,
        difficulty: input.difficulty,
        servings: input.servings,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id));

    if (input.images) {
      await db.delete(recipeImages).where(eq(recipeImages.recipeId, id));
      if (input.images.length)
        await db.insert(recipeImages).values(input.images.map((img) => ({ ...img, recipeId: id })));
    }
    if (input.ingredients) {
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
      if (input.ingredients.length)
        await db.insert(recipeIngredients).values(input.ingredients.map((it) => ({ ...it, recipeId: id })));
    }
    if (input.steps) {
      await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, id));
      if (input.steps.length) await db.insert(recipeSteps).values(input.steps.map((st) => ({ ...st, recipeId: id })));
    }
    return getRecipe(id);
  };

  const deleteRecipe = async (id: string) => {
    await db.delete(recipes).where(eq(recipes.id, id));
    return { success: true } as const;
  };

  const createMeal = async (input: {
    recipeId: string;
    date: string;
    time: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
  }) => {
    const [m] = await db.insert(meals).values(input).returning();
    return m;
  };

  const listMealsByDateRange = async (startDate: string, endDate: string) => {
    return await db
      .select()
      .from(meals)
      .where(between(meals.date, startDate, endDate))
      .orderBy(asc(meals.date), asc(meals.time));
  };

  const getWeeklyPlan = async (mondayIso: string) => {
    const start = mondayIso;
    const endDate = new Date(mondayIso);
    endDate.setDate(endDate.getDate() + 6);
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const scheduled = await listMealsByDateRange(start, end);
    const recipeIds = Array.from(new Set(scheduled.map((m) => m.recipeId)));
    const recipeRows = recipeIds.length ? await db.select().from(recipes).where(inArray(recipes.id, recipeIds)) : [];
    const byId = new Map(recipeRows.map((r) => [r.id, r]));

    type WeeklyMeal = {
      id: string;
      time: string;
      title: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      description?: string;
      tags?: string[];
    };
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
    const days: {
      date: string;
      weekday: string;
      meals: WeeklyMeal[];
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[] = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(mondayIso);
      d.setDate(d.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const wd = weekdays[i] ?? "";
      return { date: iso, weekday: wd, meals: [], calories: 0, protein: 0, carbs: 0, fat: 0 };
    });

    const indexByDate = new Map(days.map((d, i) => [d.date, i]));
    for (const m of scheduled) {
      const r = byId.get(m.recipeId);
      const cals = m.calories ?? r?.calories ?? 0;
      const p = m.protein ?? r?.protein ?? 0;
      const c = m.carbs ?? r?.carbs ?? 0;
      const f = m.fat ?? r?.fat ?? 0;
      const idx = indexByDate.get(m.date);
      if (idx === undefined) continue;
      const dayRef = days[idx]!;
      dayRef.meals.push({
        id: m.id,
        time: m.time,
        title: r?.title ?? "Meal",
        description: r?.description ?? undefined,
        calories: cals,
        protein: p,
        carbs: c,
        fat: f,
      });
      dayRef.calories += cals;
      dayRef.protein += p;
      dayRef.carbs += c;
      dayRef.fat += f;
    }

    return { weekStart: start, weekEnd: end, days };
  };

  const updateMeal = async (id: string, input: Partial<Omit<Parameters<typeof createMeal>[0], "recipeId">>) => {
    await db.update(meals).set(input).where(eq(meals.id, id));
    const [m] = await db.select().from(meals).where(eq(meals.id, id));
    return m;
  };

  const deleteMeal = async (id: string) => {
    await db.delete(meals).where(eq(meals.id, id));
    return { success: true } as const;
  };

  return {
    createRecipe,
    getRecipe,
    listRecipes,
    updateRecipe,
    deleteRecipe,
    createMeal,
    listMealsByDateRange,
    getWeeklyPlan,
    updateMeal,
    deleteMeal,
  };
};

export type FitnessService = ReturnType<typeof createFitnessService>;
export const fitnessService = createFitnessService();
