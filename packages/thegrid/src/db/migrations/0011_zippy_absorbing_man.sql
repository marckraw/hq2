CREATE TABLE IF NOT EXISTS "storyblok_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"json_content" jsonb NOT NULL,
	"markdown_content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "storyblok_components_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "storyblok_components_name_idx" ON "storyblok_components" USING btree ("name");