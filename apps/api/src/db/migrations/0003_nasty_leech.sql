CREATE TYPE "public"."client_queue_item_status" AS ENUM('pending', 'approved', 'escalated', 'rejected');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "operator_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"location" text NOT NULL,
	"languages" jsonb NOT NULL,
	"dialect" text,
	"academic_background" text NOT NULL,
	"english_proficiency" text NOT NULL,
	"availability" jsonb,
	"experience" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_queue_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" text NOT NULL,
	"external_ref" text NOT NULL,
	"content" text NOT NULL,
	"status" "client_queue_item_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "operator_applications" ADD CONSTRAINT "operator_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "operator_applications_user_id_unique" ON "operator_applications" USING btree ("user_id");