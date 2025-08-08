import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Settings metadata
  category: varchar("category", { length: 100 }).notNull(), // 'agent', 'prompts', 'interface', 'notifications'
  key: varchar("key", { length: 100 }).notNull(), // specific setting key within category

  // Setting value (stored as JSON to handle different data types)
  value: jsonb("value").notNull(),

  // Optional metadata
  description: text("description"), // Human-readable description

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create a unique constraint on category + key combination
export const settingsIndex = pgTable(
  "settings_unique_idx",
  {
    category: varchar("category", { length: 100 }),
    key: varchar("key", { length: 100 }),
  },
  (table) => ({
    unique: {
      columns: [table.category, table.key],
      name: "settings_category_key_unique",
    },
  })
);
