ALTER TABLE "operator_review_decisions" ADD COLUMN "corrected_transcript" text;--> statement-breakpoint
ALTER TABLE "operator_review_decisions" ADD COLUMN "corrected_intent" text;--> statement-breakpoint
ALTER TABLE "operator_review_decisions" ADD COLUMN "corrected_outcome" text;--> statement-breakpoint
ALTER TABLE "operator_review_decisions" ADD COLUMN "review_time_ms" integer;--> statement-breakpoint
ALTER TABLE "public"."client_queue_items" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."client_queue_items" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."client_queue_item_status";--> statement-breakpoint
CREATE TYPE "public"."client_queue_item_status" AS ENUM('pending', 'approved', 'corrected', 'rejected', 'escalated', 'declined');--> statement-breakpoint
ALTER TABLE "public"."client_queue_items" ALTER COLUMN "status" SET DATA TYPE "public"."client_queue_item_status" USING "status"::"public"."client_queue_item_status";--> statement-breakpoint
ALTER TABLE "public"."client_queue_items" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."client_queue_item_status";--> statement-breakpoint
ALTER TABLE "public"."operator_review_decisions" ALTER COLUMN "decision" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."operator_decision";--> statement-breakpoint
CREATE TYPE "public"."operator_decision" AS ENUM('approved', 'corrected', 'rejected', 'escalated', 'declined');--> statement-breakpoint
ALTER TABLE "public"."operator_review_decisions" ALTER COLUMN "decision" SET DATA TYPE "public"."operator_decision" USING "decision"::"public"."operator_decision";
