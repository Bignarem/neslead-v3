import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// Plan comercial por organización. Decide features visibles, cuota mensual de
// créditos y tope de canales conectados. Sin fila = "basico".
export const nesOrganizationPlans = sqliteTable("nes_organization_plans", {
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

export const nesLeads = sqliteTable(
  "nes_leads",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    // De dónde llegó: widget | whatsapp | instagram | formulario | manual
    source: text("source").notNull().default("manual"),
    // nuevo | contactado | cotizado | ganado | perdido
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

// Historial del lead: mensajes, cambios de estado, notas. Lo alimentan el
// widget, la bandeja y la agencia.
export const nesLeadEvents = sqliteTable(
  "nes_lead_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    leadId: text("lead_id")
      .notNull()
      .references(() => nesLeads.id, { onDelete: "cascade" }),
    // mensaje_entrante | mensaje_saliente | estado | nota
    kind: text("kind").notNull(),
    channel: text("channel"),
    body: text("body"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => [index("nes_lead_events_lead_id_idx").on(t.leadId)],
);
