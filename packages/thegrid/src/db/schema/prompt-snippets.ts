import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const promptSnippets = pgTable("prompt_snippets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  insertText: text("insert_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
