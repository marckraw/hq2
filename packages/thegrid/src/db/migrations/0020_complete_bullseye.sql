ALTER TABLE "approvals" ADD COLUMN "origin" text DEFAULT 'thehorizon' NOT NULL;--> statement-breakpoint
ALTER TABLE "pipelines" ADD COLUMN "origin" text DEFAULT 'thehorizon' NOT NULL;