CREATE TABLE IF NOT EXISTS "memory_retrievals" (
	"id" serial PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"memory_ids" jsonb NOT NULL,
	"conversation_id" varchar(255),
	"retrieval_type" varchar(50) NOT NULL,
	"scores" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memory_records" RENAME TO "user_memories";--> statement-breakpoint
ALTER TABLE "memory_tags" DROP CONSTRAINT "memory_tags_memory_id_memory_records_id_fk";
--> statement-breakpoint
ALTER TABLE "user_memories" ADD COLUMN "conversation_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user_memories" ADD COLUMN "confidence" real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_memories" ADD COLUMN "source" varchar(50) DEFAULT 'user_explicit' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_memories" ADD COLUMN "vector_id" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memory_tags" ADD CONSTRAINT "memory_tags_memory_id_user_memories_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."user_memories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
