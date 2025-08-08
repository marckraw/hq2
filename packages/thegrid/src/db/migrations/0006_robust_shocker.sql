CREATE TABLE IF NOT EXISTS "memory_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memory_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"memory_id" serial NOT NULL,
	"tag" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memory_tags" ADD CONSTRAINT "memory_tags_memory_id_memory_records_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."memory_records"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
