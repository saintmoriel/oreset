-- Finding remediation lifecycle (free retest is part of every engagement)
CREATE TYPE "public"."finding_status" AS ENUM('discovered', 'verified', 'fix_submitted', 'retesting', 'closed', 'reopened', 'false_positive');
--> statement-breakpoint
ALTER TABLE "verified_findings" ADD COLUMN "status" "public"."finding_status" DEFAULT 'verified' NOT NULL;
--> statement-breakpoint
ALTER TABLE "verified_findings" ADD COLUMN "fix_submitted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "verified_findings" ADD COLUMN "retested_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "verified_findings" ADD COLUMN "retested_by" uuid;
--> statement-breakpoint
ALTER TABLE "verified_findings" ADD COLUMN "retest_notes" text;
--> statement-breakpoint
ALTER TABLE "verified_findings" ADD COLUMN "closed_at" timestamp with time zone;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verified_findings" ADD CONSTRAINT "verified_findings_retested_by_users_id_fk" FOREIGN KEY ("retested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
