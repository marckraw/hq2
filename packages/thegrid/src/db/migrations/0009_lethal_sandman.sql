CREATE TABLE IF NOT EXISTS "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_step_id" uuid NOT NULL,
	"status" text NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	CONSTRAINT "approvals_pipeline_step_id_unique" UNIQUE("pipeline_step_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "approvals" ADD CONSTRAINT "approvals_pipeline_step_id_pipeline_steps_id_fk" FOREIGN KEY ("pipeline_step_id") REFERENCES "public"."pipeline_steps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
