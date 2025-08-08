ALTER TABLE "pipeline_steps" DROP CONSTRAINT "pipeline_steps_pipeline_id_pipelines_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pipeline_steps" ADD CONSTRAINT "pipeline_steps_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
