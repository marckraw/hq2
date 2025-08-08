import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

export const signals = pgTable("signals", {
  id: uuid("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  source: text("source").notNull(), // e.g., "task", "system"
  type: text("type").notNull(), // e.g., "system.daily_reset"
  payload: jsonb("payload").notNull(),
  metadata: jsonb("metadata"), // optional additional info
});
