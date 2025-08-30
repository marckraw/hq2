import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  heroImageUrl: text("hero_image_url"),
  prepTimeMinutes: integer("prep_time_minutes").default(0),
  difficulty: varchar("difficulty", { length: 64 }).default("Easy"),
  servings: integer("servings").default(1),
  calories: integer("calories").default(0),
  protein: integer("protein").default(0),
  carbs: integer("carbs").default(0),
  fat: integer("fat").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recipeImages = pgTable("recipe_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }),
  sortOrder: integer("sort_order").default(0),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const recipeSteps = pgTable("recipe_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// Tags and many-to-many mapping to recipes
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipeTags = pgTable(
  "recipe_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    recipeIdx: index("recipe_tags_recipe_idx").on(t.recipeId),
    tagIdx: index("recipe_tags_tag_idx").on(t.tagId),
    uniq: uniqueIndex("recipe_tags_recipe_tag_uniq").on(t.recipeId, t.tagId),
  })
);

// Meals placed on a specific date and time (reference a recipe)
export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(), // yyyy-mm-dd
  time: varchar("time", { length: 5 }).notNull(), // HH:MM
  // optional overrides on macros
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  notes: text("notes"),
  isCooked: boolean("is_cooked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fitness activities audit log (scoped to fitness for now)
export const fitnessActivities = pgTable("fitness_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: varchar("action", { length: 64 }).notNull(), // e.g., recipe_created, recipe_updated, meal_planned, meal_consumed
  entity: varchar("entity", { length: 64 }).notNull(), // recipe | meal
  entityId: uuid("entity_id"),
  meta: jsonb("meta"), // optional metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type RecipeImage = typeof recipeImages.$inferSelect;
export type NewRecipeImage = typeof recipeImages.$inferInsert;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert;
export type RecipeStep = typeof recipeSteps.$inferSelect;
export type NewRecipeStep = typeof recipeSteps.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type FitnessActivity = typeof fitnessActivities.$inferSelect;
export type NewFitnessActivity = typeof fitnessActivities.$inferInsert;
