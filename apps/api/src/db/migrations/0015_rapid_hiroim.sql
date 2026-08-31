CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"description" text NOT NULL,
	"amount_minor_units" integer NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"case_count" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_link" text,
	"provider" text NOT NULL,
	"provider_reference" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
