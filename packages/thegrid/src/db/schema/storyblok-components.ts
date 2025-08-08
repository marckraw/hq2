import {
  text,
  timestamp,
  pgTable,
  uniqueIndex,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

export const storyblokComponents = pgTable(
  "storyblok_components",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    jsonContent: jsonb("json_content").notNull(),
    markdownContent: text("markdown_content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    nameIdx: uniqueIndex("storyblok_components_name_idx").on(table.name),
  })
);

export type StoryblokComponent = typeof storyblokComponents.$inferSelect;
export type NewStoryblokComponent = typeof storyblokComponents.$inferInsert;
