ALTER TABLE "operator_applications" ADD COLUMN "security_experience_years" text;
--> statement-breakpoint
ALTER TABLE "operator_applications" ADD COLUMN "ai_red_team_exposure" text;
--> statement-breakpoint
ALTER TABLE "operator_applications" ADD COLUMN "tools" text;
--> statement-breakpoint
ALTER TABLE "operator_applications" ADD COLUMN "work_sample" text;
--> statement-breakpoint
ALTER TABLE "operator_applications" ADD COLUMN "portfolio_url" text;
--> statement-breakpoint
ALTER TABLE "operator_applications" ALTER COLUMN "academic_background" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "operator_applications" ALTER COLUMN "english_proficiency" DROP NOT NULL;
