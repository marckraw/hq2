import "dotenv/config";
import { db, pool } from "../db";
import { logger } from "../utils/logger";
import { recipes, recipeImages, recipeIngredients, recipeSteps, meals } from "../db/schema";
import { and, between, eq } from "drizzle-orm";

/**
 *
 * This is just a test script to run sql commands on the database
 * so we can easily run something using this script
 *
 */
async function run() {
  logger.info("Seeding fitness recipes...");
  const seedRecipe = async (data: {
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
    images?: string[];
    ingredients: string[];
    steps: string[];
  }) => {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await db.select().from(recipes).where(eq(recipes.slug, slug));
    let recipeId: string;
    if (existing[0]) {
      recipeId = existing[0].id;
      // Update core fields to keep data fresh
      await db
        .update(recipes)
        .set({
          title: data.title,
          description: data.description,
          heroImageUrl: data.heroImageUrl,
          prepTimeMinutes: data.prepTimeMinutes ?? existing[0].prepTimeMinutes,
          difficulty: data.difficulty ?? existing[0].difficulty,
          servings: data.servings ?? existing[0].servings,
          calories: data.calories ?? existing[0].calories,
          protein: data.protein ?? existing[0].protein,
          carbs: data.carbs ?? existing[0].carbs,
          fat: data.fat ?? existing[0].fat,
        })
        .where(eq(recipes.id, recipeId));

      // Replace child rows idempotently
      await db.delete(recipeImages).where(eq(recipeImages.recipeId, recipeId));
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));
      await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId));
    } else {
      const [r] = await db
        .insert(recipes)
        .values({
          title: data.title,
          slug,
          description: data.description,
          heroImageUrl: data.heroImageUrl,
          prepTimeMinutes: data.prepTimeMinutes ?? 0,
          difficulty: data.difficulty ?? "Easy",
          servings: data.servings ?? 1,
          calories: data.calories ?? 0,
          protein: data.protein ?? 0,
          carbs: data.carbs ?? 0,
          fat: data.fat ?? 0,
        })
        .returning();
      recipeId = r.id;
    }

    if (data.images?.length) {
      await db.insert(recipeImages).values(data.images.map((url, i) => ({ recipeId, url, sortOrder: i })));
    }
    await db.insert(recipeIngredients).values(data.ingredients.map((text, i) => ({ recipeId, text, sortOrder: i })));
    await db.insert(recipeSteps).values(data.steps.map((text, i) => ({ recipeId, text, sortOrder: i })));

    return recipeId;
  };

  const texmexId = await seedRecipe({
    title: "Tex-Mex Bowl",
    heroImageUrl: "https://picsum.photos/seed/texmex/1200/800",
    prepTimeMinutes: 35,
    difficulty: "Medium",
    servings: 4,
    calories: 680,
    protein: 24,
    carbs: 70,
    fat: 22,
    images: ["https://picsum.photos/seed/texmex2/600/400", "https://picsum.photos/seed/texmex3/600/400"],
    ingredients: ["2 red onions", "400g cherry tomatoes", "2 tsp sweet smoked paprika", "3 tbsp olive oil"],
    steps: ["Roast veg", "Make salsa", "Crisp tortillas", "Assemble"],
  });
  const pastaId = await seedRecipe({
    title: "Carb-Loaded Pasta Feast",
    heroImageUrl: "https://picsum.photos/seed/pasta/1200/800",
    prepTimeMinutes: 40,
    servings: 4,
    calories: 900,
    protein: 25,
    carbs: 150,
    fat: 20,
    images: ["https://picsum.photos/seed/pasta2/600/400"],
    ingredients: ["500g spaghetti", "3 tbsp olive oil", "3 garlic cloves", "400g tomatoes"],
    steps: ["Boil pasta", "Simmer sauce", "Combine and serve"],
  });

  logger.info("✅ Seed completed");
  // Seed meals only for week 2025-08-25 to 2025-08-31
  const week = [
    { date: "2025-08-25", time: "08:00" },
    { date: "2025-08-25", time: "12:30" },
    { date: "2025-08-26", time: "19:30" },
    { date: "2025-08-27", time: "08:00" },
    { date: "2025-08-28", time: "12:30" },
    { date: "2025-08-29", time: "19:30" },
  ];
  // Idempotent: clear existing meals in that range, then insert
  await db.delete(meals).where(and(between(meals.date, "2025-08-25", "2025-08-31")) as any);
  for (let i = 0; i < week.length; i++) {
    const useId = i % 2 === 0 ? texmexId : pastaId;
    await db.insert(meals).values({ recipeId: useId, date: week[i].date, time: week[i].time });
  }
  logger.info("✅ Week meals seeded (2025-08-25..2025-08-31)");
  await pool.end();
}

run().catch((error) => logger.error("Script execution failed", { error }));
