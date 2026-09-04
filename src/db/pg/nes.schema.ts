import { sql } from "drizzle-orm";
import { index, integer, pgTable, real, serial, text } from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

export const nesOrganizationPlans = pgTable("nes_organization_plans", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  plan: text("plan", { enum: ["basico", "pro", "completo"] })
    .notNull()
    .default("basico"),
  channelLimit: integer("channel_limit").notNull().default(1),
  monthlyCredits: integer("monthly_credits").notNull().default(0),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const nesLeads = pgTable(
  "nes_leads",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    source: text("source").notNull().default("manual"),
    status: text("status").notNull().default("nuevo"),
    amountUsd: real("amount_usd"),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => [
    index("nes_leads_project_id_idx").on(t.projectId),
    index("nes_leads_project_status_idx").on(t.projectId, t.status),
  ],
);

export const nesLeadEvents = pgTable(
  "nes_lead_events",
  {
    id: serial("id").primaryKey(),
    leadId: text("lead_id")
      .notNull()
      .references(() => nesLeads.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    channel: text("channel"),
    body: text("body"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => [index("nes_lead_events_lead_id_idx").on(t.leadId)],
);
