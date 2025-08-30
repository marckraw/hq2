CREATE INDEX IF NOT EXISTS "recipe_tags_recipe_idx" ON "recipe_tags" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_tags_tag_idx" ON "recipe_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "recipe_tags_recipe_tag_uniq" ON "recipe_tags" USING btree ("recipe_id","tag_id");