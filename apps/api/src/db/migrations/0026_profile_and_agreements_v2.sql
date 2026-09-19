ALTER TYPE "agreement_type" ADD VALUE IF NOT EXISTS 'tester_agreement';
--> statement-breakpoint
ALTER TYPE "agreement_type" ADD VALUE IF NOT EXISTS 'identity_account';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_data_url" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username");
--> statement-breakpoint
ALTER TABLE "operator_agreements" ADD COLUMN "accepted_text" text;
--> statement-breakpoint
ALTER TABLE "operator_agreements" ADD COLUMN "text_hash" text;
