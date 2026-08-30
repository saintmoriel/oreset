ALTER TABLE "client_queue_items" ADD COLUMN "submitted_by" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "client_queue_items" ADD CONSTRAINT "client_queue_items_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
