CREATE TABLE IF NOT EXISTS "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"time" varchar(5) NOT NULL,
	"calories" integer,
	"protein" integer,
	"carbs" integer,
	"fat" integer,
	"notes" text,
	"is_cooked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" varchar(255),
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"text" text NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"text" text NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"hero_image_url" text,
	"prep_time_minutes" integer DEFAULT 0,
	"difficulty" varchar(64) DEFAULT 'Easy',
	"servings" integer DEFAULT 1,
	"calories" integer DEFAULT 0,
	"protein" integer DEFAULT 0,
	"carbs" integer DEFAULT 0,
	"fat" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "recipes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meals" ADD CONSTRAINT "meals_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_images" ADD CONSTRAINT "recipe_images_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
