CREATE TYPE "public"."agreement_type" AS ENUM('nda', 'code_of_conduct', 'data_handling');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "operator_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agreement_type" "agreement_type" NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"signed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "operator_agreements" ADD CONSTRAINT "operator_agreements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
