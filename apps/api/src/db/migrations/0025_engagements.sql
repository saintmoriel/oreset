CREATE TABLE IF NOT EXISTS "engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"agent_name" text NOT NULL,
	"tier" text NOT NULL,
	"phase" text DEFAULT 'kickoff' NOT NULL,
	"scope" text DEFAULT '' NOT NULL,
	"rules" text DEFAULT '' NOT NULL,
	"rules_version" integer DEFAULT 1 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"retest_until" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "engagement_acknowledgements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rules_version" integer NOT NULL,
	"ip" text,
	"acknowledged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_queue_items" ADD COLUMN "engagement_id" uuid;
--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "engagement_acknowledgements" ADD CONSTRAINT "engagement_acknowledgements_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "engagement_acknowledgements" ADD CONSTRAINT "engagement_acknowledgements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "engagements_buyer_idx" ON "engagements" ("buyer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "engagement_acks_engagement_user_idx" ON "engagement_acknowledgements" ("engagement_id","user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "client_queue_items_engagement_idx" ON "client_queue_items" ("engagement_id");
