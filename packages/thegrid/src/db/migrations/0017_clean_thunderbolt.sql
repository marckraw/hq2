ALTER TABLE "agent_executions" ADD COLUMN "triggering_message_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_triggering_message_id_messages_id_fk" FOREIGN KEY ("triggering_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
