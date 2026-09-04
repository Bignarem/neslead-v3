CREATE TABLE "nes_lead_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"kind" text NOT NULL,
	"channel" text,
	"body" text,
	"created_at" text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nes_leads" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'nuevo' NOT NULL,
	"amount_usd" real,
	"notes" text,
	"created_at" text DEFAULT (current_timestamp) NOT NULL,
	"updated_at" text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nes_organization_plans" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"plan" text DEFAULT 'basico' NOT NULL,
	"channel_limit" integer DEFAULT 1 NOT NULL,
	"monthly_credits" integer DEFAULT 0 NOT NULL,
	"updated_at" text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nes_lead_events" ADD CONSTRAINT "nes_lead_events_lead_id_nes_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."nes_leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nes_leads" ADD CONSTRAINT "nes_leads_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nes_organization_plans" ADD CONSTRAINT "nes_organization_plans_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "nes_lead_events_lead_id_idx" ON "nes_lead_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "nes_leads_project_id_idx" ON "nes_leads" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "nes_leads_project_status_idx" ON "nes_leads" USING btree ("project_id","status");