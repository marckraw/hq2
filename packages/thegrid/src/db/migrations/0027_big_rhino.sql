CREATE TABLE IF NOT EXISTS "fitness_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(64) NOT NULL,
	"entity" varchar(64) NOT NULL,
	"entity_id" uuid,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now()
);
