-- Step 1: Create new enum types
CREATE TYPE "public"."vuln_tag" AS ENUM('VLN-01', 'VLN-02', 'VLN-03', 'VLN-04', 'VLN-05', 'VLN-06');
--> statement-breakpoint
CREATE TYPE "public"."exploit_status" AS ENUM('exploit_successful', 'partial_bypass', 'defended');
--> statement-breakpoint
CREATE TYPE "public"."auditor_decision" AS ENUM('verified', 'false_positive', 'severity_adjusted');
--> statement-breakpoint

-- Step 2: Update operator_decision enum values
-- Old: approved, corrected, rejected, escalated, declined
-- New: exploited, defended, escalated, inconclusive
ALTER TYPE "public"."operator_decision" RENAME TO "operator_decision_old";
--> statement-breakpoint
CREATE TYPE "public"."operator_decision" AS ENUM('exploited', 'defended', 'escalated', 'inconclusive');
--> statement-breakpoint
ALTER TABLE "operator_review_decisions" ALTER COLUMN "decision" TYPE "public"."operator_decision" USING (
  CASE "decision"::text
    WHEN 'approved' THEN 'defended'
    WHEN 'corrected' THEN 'exploited'
    WHEN 'rejected' THEN 'exploited'
    WHEN 'escalated' THEN 'escalated'
    WHEN 'declined' THEN 'inconclusive'
  END
)::"public"."operator_decision";
--> statement-breakpoint
ALTER TABLE "consensus_pairs" ALTER COLUMN "final_decision" TYPE "public"."operator_decision" USING (
  CASE "final_decision"::text
    WHEN 'approved' THEN 'defended'
    WHEN 'corrected' THEN 'exploited'
    WHEN 'rejected' THEN 'exploited'
    WHEN 'escalated' THEN 'escalated'
    WHEN 'declined' THEN 'inconclusive'
    ELSE NULL
  END
)::"public"."operator_decision";
--> statement-breakpoint
DROP TYPE "public"."operator_decision_old";
--> statement-breakpoint

-- Step 3: Update severity enum values
-- Old: SEV-1, SEV-2, SEV-3
-- New: P0, P1, P2, P3
ALTER TYPE "public"."severity" RENAME TO "severity_old";
--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('P0', 'P1', 'P2', 'P3');
--> statement-breakpoint
ALTER TABLE "operator_review_decisions" ALTER COLUMN "severity" TYPE "public"."severity" USING (
  CASE "severity"::text
    WHEN 'SEV-1' THEN 'P0'
    WHEN 'SEV-2' THEN 'P1'
    WHEN 'SEV-3' THEN 'P2'
    ELSE NULL
  END
)::"public"."severity";
--> statement-breakpoint
ALTER TABLE "consensus_pairs" ALTER COLUMN "final_severity" TYPE "public"."severity" USING (
  CASE "final_severity"::text
    WHEN 'SEV-1' THEN 'P0'
    WHEN 'SEV-2' THEN 'P1'
    WHEN 'SEV-3' THEN 'P2'
    ELSE NULL
  END
)::"public"."severity";
--> statement-breakpoint
ALTER TABLE "client_tickets" ALTER COLUMN "severity" TYPE "public"."severity" USING (
  CASE "severity"::text
    WHEN 'SEV-1' THEN 'P0'
    WHEN 'SEV-2' THEN 'P1'
    WHEN 'SEV-3' THEN 'P2'
    ELSE NULL
  END
)::"public"."severity";
--> statement-breakpoint
DROP TYPE "public"."severity_old";
--> statement-breakpoint

-- Step 4: Update client_queue_item_status enum
-- Old: pending, in_review, consensus_split, approved, corrected, rejected, escalated, declined
-- New: pending, in_review, consensus_split, exploited, defended, escalated, inconclusive
ALTER TYPE "public"."client_queue_item_status" RENAME TO "client_queue_item_status_old";
--> statement-breakpoint
CREATE TYPE "public"."client_queue_item_status" AS ENUM('pending', 'in_review', 'consensus_split', 'exploited', 'defended', 'escalated', 'inconclusive');
--> statement-breakpoint
ALTER TABLE "client_queue_items" ALTER COLUMN "status" TYPE "public"."client_queue_item_status" USING (
  CASE "status"::text
    WHEN 'pending' THEN 'pending'
    WHEN 'in_review' THEN 'in_review'
    WHEN 'consensus_split' THEN 'consensus_split'
    WHEN 'approved' THEN 'defended'
    WHEN 'corrected' THEN 'exploited'
    WHEN 'rejected' THEN 'exploited'
    WHEN 'escalated' THEN 'escalated'
    WHEN 'declined' THEN 'inconclusive'
  END
)::"public"."client_queue_item_status";
--> statement-breakpoint
DROP TYPE "public"."client_queue_item_status_old";
--> statement-breakpoint

-- Step 5: Rename err_tag columns to vuln_tag and change type
ALTER TABLE "operator_review_decisions" RENAME COLUMN "err_tag" TO "vuln_tag";
--> statement-breakpoint
ALTER TABLE "operator_review_decisions" ALTER COLUMN "vuln_tag" TYPE "public"."vuln_tag" USING (
  CASE "vuln_tag"::text
    WHEN 'ERR-01' THEN 'VLN-01'
    WHEN 'ERR-02' THEN 'VLN-02'
    WHEN 'ERR-03' THEN 'VLN-03'
    WHEN 'ERR-04' THEN 'VLN-04'
    ELSE NULL
  END
)::"public"."vuln_tag";
--> statement-breakpoint
ALTER TABLE "consensus_pairs" RENAME COLUMN "final_err_tag" TO "final_vuln_tag";
--> statement-breakpoint
ALTER TABLE "consensus_pairs" ALTER COLUMN "final_vuln_tag" TYPE "public"."vuln_tag" USING (
  CASE "final_vuln_tag"::text
    WHEN 'ERR-01' THEN 'VLN-01'
    WHEN 'ERR-02' THEN 'VLN-02'
    WHEN 'ERR-03' THEN 'VLN-03'
    WHEN 'ERR-04' THEN 'VLN-04'
    ELSE NULL
  END
)::"public"."vuln_tag";
--> statement-breakpoint
ALTER TABLE "client_tickets" RENAME COLUMN "err_tag" TO "vuln_tag";
--> statement-breakpoint
ALTER TABLE "client_tickets" ALTER COLUMN "vuln_tag" TYPE "public"."vuln_tag" USING (
  CASE "vuln_tag"::text
    WHEN 'ERR-01' THEN 'VLN-01'
    WHEN 'ERR-02' THEN 'VLN-02'
    WHEN 'ERR-03' THEN 'VLN-03'
    WHEN 'ERR-04' THEN 'VLN-04'
    ELSE NULL
  END
)::"public"."vuln_tag";
--> statement-breakpoint

-- Step 6: Add new columns to operator_review_decisions
ALTER TABLE "operator_review_decisions" ADD COLUMN "exploit_status" "public"."exploit_status";
--> statement-breakpoint
ALTER TABLE "operator_review_decisions" ADD COLUMN "reproduction_steps" text;
--> statement-breakpoint
ALTER TABLE "operator_review_decisions" ADD COLUMN "recommended_fix" text;
--> statement-breakpoint

-- Step 7: Drop old columns from operator_review_decisions
ALTER TABLE "operator_review_decisions" DROP COLUMN IF EXISTS "corrected_transcript";
--> statement-breakpoint
ALTER TABLE "operator_review_decisions" DROP COLUMN IF EXISTS "corrected_intent";
--> statement-breakpoint
ALTER TABLE "operator_review_decisions" DROP COLUMN IF EXISTS "corrected_outcome";
--> statement-breakpoint

-- Step 7b: Update calibration_cases — rename expected_err_tag, add expected_exploit_status, drop expected_outcome
ALTER TABLE "calibration_cases" RENAME COLUMN "expected_err_tag" TO "expected_vuln_tag";
--> statement-breakpoint
ALTER TABLE "calibration_cases" ALTER COLUMN "expected_vuln_tag" TYPE "public"."vuln_tag" USING (
  CASE "expected_vuln_tag"::text
    WHEN 'ERR-01' THEN 'VLN-01'
    WHEN 'ERR-02' THEN 'VLN-02'
    WHEN 'ERR-03' THEN 'VLN-03'
    WHEN 'ERR-04' THEN 'VLN-04'
    ELSE NULL
  END
)::"public"."vuln_tag";
--> statement-breakpoint
ALTER TABLE "calibration_cases" ADD COLUMN "expected_exploit_status" "public"."exploit_status";
--> statement-breakpoint
ALTER TABLE "calibration_cases" DROP COLUMN IF EXISTS "expected_outcome";
--> statement-breakpoint

-- Step 7c: Update calibration_attempts — rename err_tag, add exploit_status + reproduction_steps, drop corrected_outcome
ALTER TABLE "calibration_attempts" RENAME COLUMN "err_tag" TO "vuln_tag";
--> statement-breakpoint
ALTER TABLE "calibration_attempts" ALTER COLUMN "vuln_tag" TYPE "public"."vuln_tag" USING (
  CASE "vuln_tag"::text
    WHEN 'ERR-01' THEN 'VLN-01'
    WHEN 'ERR-02' THEN 'VLN-02'
    WHEN 'ERR-03' THEN 'VLN-03'
    WHEN 'ERR-04' THEN 'VLN-04'
    ELSE NULL
  END
)::"public"."vuln_tag";
--> statement-breakpoint
ALTER TABLE "calibration_attempts" ADD COLUMN "exploit_status" "public"."exploit_status";
--> statement-breakpoint
ALTER TABLE "calibration_attempts" ADD COLUMN "reproduction_steps" text;
--> statement-breakpoint
ALTER TABLE "calibration_attempts" DROP COLUMN IF EXISTS "corrected_outcome";
--> statement-breakpoint

-- Step 8: Create verified_findings table
CREATE TABLE IF NOT EXISTS "verified_findings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_item_id" uuid NOT NULL,
  "review_decision_id" uuid NOT NULL,
  "auditor_id" uuid NOT NULL,
  "verdict" "public"."auditor_decision" NOT NULL,
  "adjusted_severity" "public"."severity",
  "reproducible" boolean NOT NULL,
  "blast_radius" text,
  "auditor_notes" text,
  "verified_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verified_findings" ADD CONSTRAINT "verified_findings_client_item_id_client_queue_items_id_fk" FOREIGN KEY ("client_item_id") REFERENCES "public"."client_queue_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verified_findings" ADD CONSTRAINT "verified_findings_review_decision_id_operator_review_decisions_id_fk" FOREIGN KEY ("review_decision_id") REFERENCES "public"."operator_review_decisions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verified_findings" ADD CONSTRAINT "verified_findings_auditor_id_users_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
