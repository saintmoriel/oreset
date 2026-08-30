CREATE TYPE "public"."consensus_status" AS ENUM('awaiting_reviews', 'agreed', 'disagreed', 'adjudicated');--> statement-breakpoint
ALTER TYPE "public"."client_queue_item_status" ADD VALUE 'in_review' BEFORE 'approved';--> statement-breakpoint
ALTER TYPE "public"."client_queue_item_status" ADD VALUE 'consensus_split' BEFORE 'approved';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consensus_pairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_item_id" uuid NOT NULL,
	"reviewer_one_id" uuid NOT NULL,
	"reviewer_two_id" uuid,
	"decision_one_id" uuid,
	"decision_two_id" uuid,
	"status" "consensus_status" DEFAULT 'awaiting_reviews' NOT NULL,
	"final_decision" "operator_decision",
	"final_err_tag" "err_tag",
	"final_severity" "severity",
	"agreement_score" real,
	"adjudicator_id" uuid,
	"adjudicator_notes" text,
	"adjudicated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_queue_items" ADD COLUMN "requires_dual_solve" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consensus_pairs" ADD CONSTRAINT "consensus_pairs_client_item_id_client_queue_items_id_fk" FOREIGN KEY ("client_item_id") REFERENCES "public"."client_queue_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consensus_pairs" ADD CONSTRAINT "consensus_pairs_reviewer_one_id_users_id_fk" FOREIGN KEY ("reviewer_one_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consensus_pairs" ADD CONSTRAINT "consensus_pairs_reviewer_two_id_users_id_fk" FOREIGN KEY ("reviewer_two_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consensus_pairs" ADD CONSTRAINT "consensus_pairs_decision_one_id_operator_review_decisions_id_fk" FOREIGN KEY ("decision_one_id") REFERENCES "public"."operator_review_decisions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consensus_pairs" ADD CONSTRAINT "consensus_pairs_decision_two_id_operator_review_decisions_id_fk" FOREIGN KEY ("decision_two_id") REFERENCES "public"."operator_review_decisions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consensus_pairs" ADD CONSTRAINT "consensus_pairs_adjudicator_id_users_id_fk" FOREIGN KEY ("adjudicator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
