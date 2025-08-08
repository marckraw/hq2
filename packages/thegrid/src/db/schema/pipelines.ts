import { text, timestamp, pgTable, uuid, jsonb } from "drizzle-orm/pg-core";

export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["running", "completed", "failed"],
  }).notNull(),
  source: text("source").notNull(),
  type: text("type").notNull(),
  origin: text("origin", {
    enum: [
      "thehorizon",
      "slack",
      "storyblok-ui",
      "storyblok-plugin",
      "email",
      "api",
      "webhook",
      "system",
      "unknown",
    ],
  })
    .default("thehorizon")
    .notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pipelineSteps = pgTable("pipeline_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["pending", "in_progress", "completed", "failed", "waiting_approval"],
  }).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: text("duration"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
