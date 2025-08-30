import { asc, desc, eq, inArray, between } from "drizzle-orm";
import { db } from "../../../db";
import {
  recipes,
  recipeImages,
  recipeIngredients,
  recipeSteps,
  meals,
  tags,
  recipeTags,
  fitnessActivities,
} from "../../../db/schema";

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
    tags?: string[]; // tag slugs
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
    if (input.tags?.length) {
      const tagRows = await db.select().from(tags).where(inArray(tags.slug, input.tags));
      const tagSlugSet = new Set(tagRows.map((t) => t.slug));
      // create missing tags
      const missing = input.tags.filter((s) => !tagSlugSet.has(s));
      if (missing.length) {
        const created = await db
          .insert(tags)
          .values(
            missing.map((s) => ({ name: s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), slug: s }))
          )
          .returning();
        tagRows.push(...created);
      }
      if (tagRows.length) {
        await db.insert(recipeTags).values(tagRows.map((t) => ({ recipeId: r.id, tagId: t.id })));
      }
    }
    await db.insert(fitnessActivities).values({
      action: "recipe_created",
      entity: "recipe",
      entityId: r.id,
      meta: { title: r.title } as unknown as object,
    });
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
    const tagRows = await db
      .select({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(recipeTags)
      .leftJoin(tags, eq(recipeTags.tagId, tags.id))
      .where(eq(recipeTags.recipeId, id));
    const safeTags = tagRows.filter((t): t is { id: string; name: string; slug: string } =>
      Boolean(t.id && t.name && t.slug)
    );
    return { ...r, images: imgs, ingredients: ings, steps, tags: safeTags };
  };

  const listRecipes = async () => {
    const list = await db.select().from(recipes).orderBy(desc(recipes.createdAt));
    if (!list.length) return list;
    const ids = list.map((r) => r.id);
    const tagRows = await db
      .select({ recipeId: recipeTags.recipeId, id: tags.id, name: tags.name, slug: tags.slug })
      .from(recipeTags)
      .leftJoin(tags, eq(recipeTags.tagId, tags.id))
      .where(inArray(recipeTags.recipeId, ids));
    const byRecipe = new Map<string, { id: string; name: string; slug: string }[]>();
    for (const t of tagRows) {
      if (!t.id || !t.name || !t.slug) continue;
      const arr = byRecipe.get(t.recipeId) ?? [];
      arr.push({ id: t.id, name: t.name, slug: t.slug });
      byRecipe.set(t.recipeId, arr);
    }
    return list.map((r) => ({ ...r, tags: byRecipe.get(r.id) ?? [] }));
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
    if (input.tags) {
      // replace all
      await db.delete(recipeTags).where(eq(recipeTags.recipeId, id));
      if (input.tags.length) {
        const tagRows = await db.select().from(tags).where(inArray(tags.slug, input.tags));
        const tagSlugSet = new Set(tagRows.map((t) => t.slug));
        const missing = input.tags.filter((s) => !tagSlugSet.has(s));
        if (missing.length) {
          const created = await db
            .insert(tags)
            .values(
              missing.map((s) => ({ name: s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), slug: s }))
            )
            .returning();
          tagRows.push(...created);
        }
        await db.insert(recipeTags).values(tagRows.map((t) => ({ recipeId: id, tagId: t.id })));
      }
    }
    await db.insert(fitnessActivities).values({
      action: "recipe_updated",
      entity: "recipe",
      entityId: id,
      meta: { title: input.title } as unknown as object,
    });
    return getRecipe(id);
  };

  const deleteRecipe = async (id: string) => {
    // If DB schema enforces CASCADE on child tables, a single delete suffices.
    // We keep this behavior consistent: delete recipe; child rows are removed by FK rules.
    await db.delete(recipes).where(eq(recipes.id, id));
    await db.insert(fitnessActivities).values({ action: "recipe_deleted", entity: "recipe", entityId: id });
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
    if (m) {
      await db.insert(fitnessActivities).values({
        action: "meal_planned",
        entity: "meal",
        entityId: m.id,
        meta: { date: m.date, time: m.time } as unknown as object,
      });
    }
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
      isCooked?: boolean;
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
      consumed?: { calories: number; protein: number; carbs: number; fat: number };
    }[] = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(mondayIso);
      d.setDate(d.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const wd = weekdays[i] ?? "";
      return {
        date: iso,
        weekday: wd,
        meals: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      };
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
        isCooked: Boolean((m as any).isCooked),
      });
      dayRef.calories += cals;
      dayRef.protein += p;
      dayRef.carbs += c;
      dayRef.fat += f;
      if ((m as any).isCooked) {
        dayRef.consumed!.calories += cals;
        dayRef.consumed!.protein += p;
        dayRef.consumed!.carbs += c;
        dayRef.consumed!.fat += f;
      }
    }

    return { weekStart: start, weekEnd: end, days };
  };

  const updateMeal = async (id: string, input: Partial<Omit<Parameters<typeof createMeal>[0], "recipeId">>) => {
    const [before] = await db.select().from(meals).where(eq(meals.id, id));
    await db.update(meals).set(input).where(eq(meals.id, id));
    const [after] = await db.select().from(meals).where(eq(meals.id, id));

    const trackKeys = ["isCooked", "calories", "protein", "carbs", "fat", "time", "date", "notes"] as const;
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const k of trackKeys) {
      if (Object.prototype.hasOwnProperty.call(input, k)) {
        const beforeRec = before as unknown as Record<string, unknown>;
        const afterRec = after as unknown as Record<string, unknown>;
        const fromVal = beforeRec?.[k];
        const toVal = afterRec?.[k];
        if (fromVal !== toVal) changes[k] = { from: fromVal, to: toVal };
      }
    }
    if (Object.keys(changes).length > 0) {
      const meta = {
        ...changes,
        date: (after as unknown as Record<string, unknown>)?.date,
        time: (after as unknown as Record<string, unknown>)?.time,
      } as unknown as object;
      await db.insert(fitnessActivities).values({ action: "meal_updated", entity: "meal", entityId: id, meta });
    }
    return after;
  };

  const deleteMeal = async (id: string) => {
    const [before] = await db.select().from(meals).where(eq(meals.id, id));
    await db.delete(meals).where(eq(meals.id, id));
    const meta = before
      ? ({
          date: (before as unknown as Record<string, unknown>)?.date,
          time: (before as unknown as Record<string, unknown>)?.time,
        } as unknown as object)
      : undefined;
    await db.insert(fitnessActivities).values({ action: "meal_deleted", entity: "meal", entityId: id, meta });
    return { success: true } as const;
  };

  const listActivities = async (limit = 50) => {
    return db.select().from(fitnessActivities).orderBy(desc(fitnessActivities.createdAt)).limit(limit);
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
    listActivities,
    // tags helpers
    createTag: async (name: string) => {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const [t] = await db.insert(tags).values({ name, slug }).onConflictDoNothing().returning();
      return t;
    },
    listTags: async () => db.select().from(tags).orderBy(asc(tags.name)),
  };
};

export type FitnessService = ReturnType<typeof createFitnessService>;
export const fitnessService = createFitnessService();
