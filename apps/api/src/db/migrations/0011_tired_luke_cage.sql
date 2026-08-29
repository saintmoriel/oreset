CREATE TYPE "public"."calibration_result" AS ENUM('pass', 'fail');--> statement-breakpoint
CREATE TYPE "public"."calibration_status" AS ENUM('active', 'retired');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calibration_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calibration_case_id" uuid NOT NULL,
	"operator_id" uuid NOT NULL,
	"decision" "operator_decision" NOT NULL,
	"err_tag" "err_tag",
	"severity" "severity",
	"corrected_outcome" text,
	"notes" text,
	"review_time_ms" integer,
	"result" "calibration_result" NOT NULL,
	"score" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calibration_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"trace_data" jsonb,
	"expected_decision" "operator_decision" NOT NULL,
	"expected_err_tag" "err_tag",
	"expected_severity" "severity",
	"expected_outcome" text,
	"explanation" text NOT NULL,
	"domain" text,
	"language" text DEFAULT 'en',
	"status" "calibration_status" DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calibration_attempts" ADD CONSTRAINT "calibration_attempts_calibration_case_id_calibration_cases_id_fk" FOREIGN KEY ("calibration_case_id") REFERENCES "public"."calibration_cases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calibration_attempts" ADD CONSTRAINT "calibration_attempts_operator_id_users_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calibration_cases" ADD CONSTRAINT "calibration_cases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
