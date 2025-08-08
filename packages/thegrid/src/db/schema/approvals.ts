import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { pipelineSteps } from "./pipelines";

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineStepId: uuid("pipeline_step_id")
    .notNull()
    .unique()
    .references(() => pipelineSteps.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["pending", "approved", "rejected"],
  }).notNull(),
  risk: text("risk", {
    enum: ["low", "medium", "high"],
  })
    .default("low")
    .notNull(),
  reason: text("reason"),
  approvalType: text("approval_type", {
    enum: [
      "figma-to-storyblok",
      "changelog",
      "storyblok-editor",
      "irf-architect",
    ],
  })
    .default("figma-to-storyblok")
    .notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
});
