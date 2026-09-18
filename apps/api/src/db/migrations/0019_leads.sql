CREATE TABLE IF NOT EXISTS "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kind" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "organization" text,
  "agent_type" text,
  "languages" text,
  "audience" text,
  "message" text NOT NULL,
  "status" text DEFAULT 'new' NOT NULL,
  "notes" text,
  "handled_by" uuid,
  "handled_at" timestamp with time zone,
  "source_path" text,
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_handled_by_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
