import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  s3Key: text("s3_key").notNull().unique(),
  contentType: text("content_type"),
  tags: text("tags").array(),
  uploadedBy: text("uploaded_by"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  indexed: boolean("indexed").default(false),
  deleted: boolean("deleted").default(false),
});
