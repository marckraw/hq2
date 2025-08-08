import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const changelogs = pgTable("changelogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  repoOwner: text("repo_owner").notNull(),
  repoName: text("repo_name").notNull(),
  prNumber: text("pr_number").notNull(),
  title: text("title"),
  summary: text("summary"),
  commits: jsonb("commits"),
  releaseDate: timestamp("release_date").defaultNow().notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  published: boolean("published").default(false),
});
