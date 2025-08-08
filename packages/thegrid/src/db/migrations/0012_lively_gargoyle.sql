ALTER TABLE "changelogs" ALTER COLUMN "release_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "changelogs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "changelogs" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "conversation_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "conversation_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "uploaded_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "habit_logs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "memory_records" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "memory_records" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "memory_tags" ALTER COLUMN "memory_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "memory_tags" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET NOT NULL;