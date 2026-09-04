import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { changeLeadStatus, listLeads } from "@/serverFunctions/leads";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { NuevoLeadForm } from "@/client/features/leads/NuevoLeadForm";

const ESTADOS = [
  "nuevo",
  "contactado",
  "cotizado",
  "ganado",
  "perdido",
] as const;
type Estado = (typeof ESTADOS)[number];

const ESTADO_ETIQUETA: Record<Estado, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cotizado: "Cotizado",
  ganado: "Ganado",
  perdido: "Perdido",
};

// Canales de captura tal como llegan de LeadService.create; "manual" es lo
// que escribe este mismo formulario.
const ORIGEN_ETIQUETA: Record<string, string> = {
  widget: "Sitio web",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  formulario: "Formulario",
  manual: "Manual",
};

export function LeadsPage({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ["leads", projectId],
    queryFn: () => listLeads({ data: { projectId } }),
  });

  const cambiarEstado = useMutation({
    mutationFn: (input: { leadId: string; status: Estado }) =>
      changeLeadStatus({ data: { projectId, ...input } }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["leads", projectId] }),
    onError: (error) =>
      toast.error(
        getStandardErrorMessage(error, "No se pudo cambiar el estado."),
      ),
  });

  const leads = leadsQuery.data ?? [];

  return (
    <div className="px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-base-content/70">
            Contactos que han llegado por los canales del proyecto, más los que
            añadas a mano.
          </p>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3 p-5">
            <h2 className="text-sm font-semibold">Añadir lead</h2>
            <NuevoLeadForm projectId={projectId} />
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-0 p-0">
            <div className="px-5 pt-4 pb-3">
              <h2 className="text-sm font-semibold">Todos los leads</h2>
            </div>
            <div className="border-t border-base-300">
              {leadsQuery.isError ? (
                <div className="p-5">
                  <div className="alert alert-error">
                    {getStandardErrorMessage(
                      leadsQuery.error,
                      "No se pudieron cargar los leads.",
                    )}
                  </div>
                </div>
              ) : leadsQuery.isPending ? (
                <div className="space-y-4 px-5 py-4" aria-busy>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="skeleton h-4 w-48" />
                      <div className="skeleton h-3 w-72" />
                    </div>
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <div className="space-y-2 px-5 py-10 text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-base-200">
                    <Users className="size-5 text-base-content/40" />
                  </div>
                  <p className="text-sm font-medium text-base-content/70">
                    Todavía no hay leads en este proyecto
                  </p>
                  <p className="text-xs text-base-content/40">
                    Añade el primero con el formulario de arriba, o espera a que
                    lleguen por los canales conectados.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Contacto</th>
                        <th>Origen</th>
                        <th>Estado</th>
                        <th>Recibido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id}>
                          <td>{lead.name ?? "Sin nombre"}</td>
                          <td>
                            {[lead.phone, lead.email]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </td>
                          <td>{ORIGEN_ETIQUETA[lead.source] ?? lead.source}</td>
                          <td>
                            <select
                              className="select select-sm select-bordered"
                              value={lead.status}
                              disabled={cambiarEstado.isPending}
                              onChange={(event) =>
                                cambiarEstado.mutate({
                                  leadId: lead.id,
                                  status: event.target.value as Estado,
                                })
                              }
                            >
                              {ESTADOS.map((estado) => (
                                <option key={estado} value={estado}>
                                  {ESTADO_ETIQUETA[estado]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{lead.createdAt.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
