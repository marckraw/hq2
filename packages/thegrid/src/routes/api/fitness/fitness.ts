import { OpenAPIHono } from "@hono/zod-openapi";
import { getWeeklyPlanRoute } from "./fitness.routes";

export const fitnessRouter = new OpenAPIHono();

// Date helpers to avoid timezone drift
const formatLocalDate = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseLocalDate = (isoDate: string) => {
  const parts = isoDate.split("-").map((x) => Number(x));
  const y = parts[0] ?? 1970;
  const m = (parts[1] ?? 1) - 1;
  const d = parts[2] ?? 1;
  return new Date(y, m, d);
};

// Detailed recipe catalog (mock) - shared by handlers
const recipeCatalog: Record<
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
  "Tex-Mex Bowl": {
    imageUrl: "https://images.unsplash.com/photo-1625944528290-85f1e4b74e6e?q=80&w=1200&auto=format&fit=crop",
    prepTimeMinutes: 35,
    difficulty: "Medium",
    servings: 4,
    ingredients: [
      "2 red onions",
      "400g cherry tomatoes",
      "2 tsp sweet smoked paprika",
      "3 tbsp olive oil",
      "2 limes",
      "4 wholemeal tortilla wraps",
      "75g Cheddar cheese",
      "1 x 400g tin of black beans",
      "1/2 iceberg lettuce",
      "Sea salt & black pepper",
      "1 tsp cumin",
      "Fresh coriander, chopped",
    ],
    instructions: [
      "Preheat oven to 200°C. Peel and halve onions. Cut 1.5 onions into wedges; finely slice the remaining half.",
      "Halve 2/3 of the tomatoes. Toss wedges and halved tomatoes with 1 tsp paprika and 1 tbsp olive oil; roast 20 minutes.",
      "Finely chop remaining tomatoes and sliced onion; zest one lime and squeeze the juice. Season and set aside for salsa.",
      "Slice tortillas into long strips; drizzle with 1 tbsp olive oil, sprinkle 1 tsp paprika and half the grated cheese. Bake 8 minutes until crisp.",
      "Warm beans in a pan with 1 tbsp olive oil, juice of 1/2 lime, 1 tsp cumin; mash lightly and season.",
      "Finely shred lettuce. Assemble bowls with beans, roasted veg, lettuce and salsa; top with remaining cheese and coriander. Serve with lime wedges.",
    ],
  },
};

fitnessRouter.openapi(getWeeklyPlanRoute, async (c) => {
  // Mock data generation for a 7-day week starting Monday
  const today = new Date();
  const offsetWeeks = Number(c.req.query("offset")) || 0; // negative for past, positive for future
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7; // 0=Sunday -> 6, 1=Mon -> 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday + offsetWeeks * 7);

  const mealsCatalog = [
    { title: "Oats with Berries", protein: 20, carbs: 55, fat: 10, calories: 430 },
    { title: "Chicken Salad Bowl", protein: 35, carbs: 25, fat: 15, calories: 420 },
    { title: "Greek Yogurt & Nuts", protein: 18, carbs: 15, fat: 12, calories: 260 },
    { title: "Salmon, Rice & Greens", protein: 40, carbs: 50, fat: 18, calories: 560 },
    { title: "Protein Shake", protein: 30, carbs: 8, fat: 3, calories: 180 },
    { title: "Egg Scramble & Toast", protein: 28, carbs: 30, fat: 16, calories: 420 },
    { title: "Tex-Mex Bowl", protein: 24, carbs: 70, fat: 22, calories: 680 },
  ];

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

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

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
        id: `${i}-${idx}-${mi}`,
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

  return c.json({
    weekStart: formatLocalDate(monday),
    weekEnd: formatLocalDate(sunday),
    days,
  });
});

export default fitnessRouter;

// Meal detail endpoint (non-OpenAPI for now)
fitnessRouter.get("/meal", (c) => {
  const dateStr = c.req.query("date");
  const mealId = c.req.query("mealId");
  if (!dateStr || !mealId) return c.json({ error: "Missing date or mealId" }, 400);

  const date = parseLocalDate(dateStr);
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);

  // reuse the generation logic from weekly handler
  const mealsCatalog = [
    { title: "Oats with Berries", protein: 20, carbs: 55, fat: 10, calories: 430 },
    { title: "Chicken Salad Bowl", protein: 35, carbs: 25, fat: 15, calories: 420 },
    { title: "Greek Yogurt & Nuts", protein: 18, carbs: 15, fat: 12, calories: 260 },
    { title: "Salmon, Rice & Greens", protein: 40, carbs: 50, fat: 18, calories: 560 },
    { title: "Protein Shake", protein: 30, carbs: 8, fat: 3, calories: 180 },
    { title: "Egg Scramble & Toast", protein: 28, carbs: 30, fat: 16, calories: 420 },
  ];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const baseOrder = [0, 1, 2, 3, 4, 5];
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
        id: `${i}-${idx}-${mi}`,
        time,
        title: base.title,
        calories: base.calories,
        protein: base.protein,
        carbs: base.carbs,
        fat: base.fat,
        tags: mi === 0 ? ["breakfast"] : mi === 3 ? ["dinner"] : ["meal"],
      };
    });
    return {
      date: formatLocalDate(d),
      weekday: weekdays[i] ?? "",
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      meals,
    };
  });

  const dayData = days.find((d) => d.date === dateStr);
  const meal = dayData?.meals.find((m) => m.id === mealId);
  if (!dayData || !meal) return c.json({ error: "Meal not found" }, 404);

  // Try to enrich with catalog details
  const baseDetails = recipeCatalog[meal.title];
  const details = baseDetails
    ? {
        ...baseDetails,
        additionalImages:
          meal.title === "Tex-Mex Bowl"
            ? [
                "https://images.unsplash.com/photo-1526312426976-593c2d0b13fb?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1604908554177-6a5d8b9f6f98?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1498654077810-12f23fc4b2bf?q=80&w=800&auto=format&fit=crop",
              ]
            : undefined,
      }
    : {
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(meal.title)}/800/800`,
        prepTimeMinutes: 30,
        difficulty: "Easy",
        servings: 2,
        ingredients: ["Ingredient A", "Ingredient B", "Ingredient C"],
        instructions: ["Step 1", "Step 2", "Step 3"],
      };

  return c.json({
    date: dayData.date,
    weekday: dayData.weekday,
    totals: { calories: dayData.calories, protein: dayData.protein, carbs: dayData.carbs, fat: dayData.fat },
    meal: {
      ...meal,
      ...details,
    },
  });
});
