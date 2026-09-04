import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { nesLeadEvents, nesLeads } from "@/db/schema";

export type Lead = typeof nesLeads.$inferSelect;
export type LeadEvent = typeof nesLeadEvents.$inferSelect;

// Todo lo que lee o escribe un lead filtra por projectId: es la frontera de
// aislamiento entre clientes. No existe un getById que no pida también el
// proyecto.
async function listForProject(projectId: string, limit = 200): Promise<Lead[]> {
  return db
    .select()
    .from(nesLeads)
    .where(eq(nesLeads.projectId, projectId))
    .orderBy(desc(nesLeads.createdAt))
    .limit(limit);
}

async function getForProject(id: string, projectId: string): Promise<Lead | null> {
  const rows = await db
    .select()
    .from(nesLeads)
    .where(and(eq(nesLeads.id, id), eq(nesLeads.projectId, projectId)))
    .limit(1);
  return rows[0] ?? null;
}

async function create(values: Omit<typeof nesLeads.$inferInsert, "id">): Promise<Lead> {
  // ISO explícito: el default de columna difiere de formato entre SQLite y
  // Postgres, y resumirLeads/orderBy dependen de un texto ISO-8601 uniforme.
  const now = new Date().toISOString();
  const [row] = await db
    .insert(nesLeads)
    .values({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...values })
    .returning();
  if (!row) throw new Error("Failed to insert nes_lead");
  return row;
}

async function updateStatus(
  id: string,
  projectId: string,
  status: string,
  amountUsd?: number,
): Promise<Lead | null> {
  const [row] = await db
    .update(nesLeads)
    .set({
      status,
      updatedAt: new Date().toISOString(),
      ...(amountUsd === undefined ? {} : { amountUsd }),
    })
    .where(and(eq(nesLeads.id, id), eq(nesLeads.projectId, projectId)))
    .returning();
  return row ?? null;
}

// Escribe sobre nes_lead_events, que no tiene projectId propio: el llamador
// (LeadService) siempre resuelve el lead vía getForProject antes de pasar su
// id aquí, así que el aislamiento ya quedó probado en ese paso previo.
async function addEvent(values: typeof nesLeadEvents.$inferInsert): Promise<LeadEvent> {
  const [row] = await db.insert(nesLeadEvents).values(values).returning();
  if (!row) throw new Error("Failed to insert nes_lead_event");
  return row;
}

// A diferencia de addEvent, este método sí queda expuesto para lecturas
// futuras (bandeja, ruta pública del evento) fuera del flujo de LeadService,
// así que el filtro por proyecto va en el propio SQL, no en el llamador.
async function listEvents(leadId: string, projectId: string): Promise<LeadEvent[]> {
  const rows = await db
    .select({ event: nesLeadEvents })
    .from(nesLeadEvents)
    .innerJoin(nesLeads, eq(nesLeadEvents.leadId, nesLeads.id))
    .where(and(eq(nesLeadEvents.leadId, leadId), eq(nesLeads.projectId, projectId)))
    .orderBy(desc(nesLeadEvents.id));
  return rows.map((r) => r.event);
}

export const LeadRepository = {
  listForProject,
  getForProject,
  create,
  updateStatus,
  addEvent,
  listEvents,
};
