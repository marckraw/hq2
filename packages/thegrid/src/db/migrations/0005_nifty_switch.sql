CREATE TABLE IF NOT EXISTS "changelogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_owner" text NOT NULL,
	"repo_name" text NOT NULL,
	"pr_number" text NOT NULL,
	"title" text,
	"summary" text,
	"commits" jsonb,
	"release_date" timestamp DEFAULT now(),
	"created_by" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"published" boolean DEFAULT false
);
