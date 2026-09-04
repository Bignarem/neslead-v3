import { z } from "zod";

export const leadsProjectInputSchema = z.object({
  projectId: z.string().min(1),
});

export const createLeadInputSchema = leadsProjectInputSchema.extend({
  name: z.string().trim().max(200).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(40).optional(),
  source: z
    .enum(["widget", "whatsapp", "instagram", "formulario", "manual"])
    .optional(),
  notes: z.string().trim().max(4000).optional(),
});

export const changeLeadStatusInputSchema = leadsProjectInputSchema.extend({
  leadId: z.string().min(1),
  status: z.enum(["nuevo", "contactado", "cotizado", "ganado", "perdido"]),
  amountUsd: z.number().nonnegative().optional(),
});
