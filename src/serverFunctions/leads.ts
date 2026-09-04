import { createServerFn } from "@tanstack/react-start";
import { LeadService } from "@/server/features/leads/services/LeadService";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  changeLeadStatusInputSchema,
  createLeadInputSchema,
  leadsProjectInputSchema,
} from "@/types/schemas/leads";

export const getLeadsPortada = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(leadsProjectInputSchema)
  .handler(({ context }) => LeadService.getPortada(context.projectId));

export const listLeads = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(leadsProjectInputSchema)
  .handler(({ context }) => LeadService.list(context.projectId));

export const createLead = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(createLeadInputSchema)
  .handler(({ context, data }) =>
    LeadService.create({ ...data, projectId: context.projectId }),
  );

export const changeLeadStatus = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(changeLeadStatusInputSchema)
  .handler(({ context, data }) =>
    LeadService.cambiarEstado({ ...data, projectId: context.projectId }),
  );
