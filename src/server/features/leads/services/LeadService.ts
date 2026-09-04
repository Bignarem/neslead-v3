import { LeadRepository, type Lead } from "@/server/features/leads/repositories/LeadRepository";
import { resumirLeads, type ResumenPortada } from "@/server/features/leads/services/resumen";
import { AppError } from "@/server/lib/errors";

export const ESTADOS = ["nuevo", "contactado", "cotizado", "ganado", "perdido"] as const;
export type Estado = (typeof ESTADOS)[number];

async function getPortada(projectId: string): Promise<ResumenPortada> {
  const rows = await LeadRepository.listForProject(projectId, 1000);
  return resumirLeads(rows, new Date());
}

async function list(projectId: string): Promise<Lead[]> {
  return LeadRepository.listForProject(projectId);
}

async function create(input: {
  projectId: string;
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
}): Promise<Lead> {
  if (!input.name && !input.email && !input.phone) {
    throw new AppError("VALIDATION_ERROR", "Hace falta nombre, correo o teléfono.");
  }
  const lead = await LeadRepository.create({
    projectId: input.projectId,
    name: input.name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    source: input.source ?? "manual",
    notes: input.notes ?? null,
  });
  await LeadRepository.addEvent({ leadId: lead.id, kind: "estado", body: "nuevo" });
  return lead;
}

// El estado y el monto solo cambian cuando el lead ya se resolvió contra el
// proyecto llamante: nunca se toca un lead por id suelto.
async function cambiarEstado(input: {
  projectId: string;
  leadId: string;
  status: Estado;
  amountUsd?: number;
}): Promise<Lead> {
  const lead = await LeadRepository.getForProject(input.leadId, input.projectId);
  if (!lead) throw new AppError("NOT_FOUND", "Lead no encontrado.");
  const updated = await LeadRepository.updateStatus(
    lead.id,
    input.projectId,
    input.status,
    input.amountUsd,
  );
  if (!updated) throw new AppError("NOT_FOUND", "Lead no encontrado.");
  await LeadRepository.addEvent({ leadId: lead.id, kind: "estado", body: input.status });
  return updated;
}

export const LeadService = { getPortada, list, create, cambiarEstado };
