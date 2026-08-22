CREATE TYPE "public"."dataset_status" AS ENUM('draft', 'sealed', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'resolved');--> statement-breakpoint
ALTER TYPE "public"."role_type" ADD VALUE 'buyer';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"buyer_id" uuid,
	"license_terms" text NOT NULL,
	"status" "dataset_status" DEFAULT 'draft' NOT NULL,
	"provenance_hash" text,
	"sealed_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dataset_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operator_review_decision_id" uuid NOT NULL,
	"client_name" text NOT NULL,
	"external_ref" text NOT NULL,
	"err_tag" "err_tag",
	"severity" "severity",
	"notes" text,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"resolution_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "datasets" ADD CONSTRAINT "datasets_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "datasets" ADD CONSTRAINT "datasets_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "datasets" ADD CONSTRAINT "datasets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dataset_items" ADD CONSTRAINT "dataset_items_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dataset_items" ADD CONSTRAINT "dataset_items_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_tickets" ADD CONSTRAINT "client_tickets_operator_review_decision_id_operator_review_decisions_id_fk" FOREIGN KEY ("operator_review_decision_id") REFERENCES "public"."operator_review_decisions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_tickets" ADD CONSTRAINT "client_tickets_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "dataset_items_submission_id_unique" ON "dataset_items" USING btree ("submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "client_tickets_operator_review_decision_id_unique" ON "client_tickets" USING btree ("operator_review_decision_id");