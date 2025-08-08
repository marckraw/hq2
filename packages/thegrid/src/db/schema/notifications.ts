import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey(),
  userId: text("user_id").notNull(), // who owns the notification
  type: text("type").notNull(), // alert, reminder, insight, etc.
  message: text("message").notNull(),
  metadata: jsonb("metadata"), // optional extra context
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  read: boolean("read").default(false),
});
