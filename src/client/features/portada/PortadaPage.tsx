import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getLeadsPortada } from "@/serverFunctions/leads";
import { getLeadsErrorMessage } from "@/client/features/leads/mensajes";
import { DatoCard } from "@/client/features/portada/DatoCard";

function tendenciaTexto(t: number | null) {
  if (t === null) return "Primer mes: la comparación empieza el mes que viene";
  const p = Math.round(t * 100);
  return p >= 0
    ? `+${p}% frente al mes anterior`
    : `${p}% frente al mes anterior`;
}

function montoTexto(montoGanado30: number) {
  return `US$${montoGanado30.toFixed(0)} cerrados`;
}

// Los cinco números que le importan al dueño: gente que lo encontró,
// escribieron, reservaron, reseñas, tendencia. La capa profunda (keywords,
// posiciones, auditoría, backlinks) vive en /seo y en el menú; aquí no se
// repite.
export function PortadaPage({ projectId }: { projectId: string }) {
  const portada = useQuery({
    queryKey: ["leads-portada", projectId],
    queryFn: () => getLeadsPortada({ data: { projectId } }),
  });
  const d = portada.data;

  return (
    <div className="px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Inicio</h1>
          <p className="text-sm text-base-content/70">
            Cómo va tu negocio este mes, en un vistazo.
          </p>
        </div>

        {portada.isError ? (
          <div className="alert alert-error">
            {getLeadsErrorMessage(portada.error)}
          </div>
        ) : portada.isPending || !d ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-busy>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="card bg-base-100 border border-base-300"
              >
                <div className="card-body gap-2 p-4">
                  <div className="skeleton h-8 w-16" />
                  <div className="skeleton h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DatoCard
              valor="—"
              etiqueta="Gente que te encontró (30 días)"
              detalle="Se activa al conectar la analítica del sitio"
            />
            <DatoCard
              valor={String(d.leads30)}
              etiqueta="Personas que escribieron (30 días)"
              detalle={tendenciaTexto(d.tendencia)}
            />
            <DatoCard
              valor={String(d.ganados30)}
              etiqueta="Ventas cerradas (30 días)"
              detalle={montoTexto(d.montoGanado30)}
            />
            <DatoCard
              valor="—"
              etiqueta="Reseñas nuevas"
              detalle="Se activa al conectar el Perfil de Google"
            />
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to="/p/$projectId/leads"
            params={{ projectId }}
            className="btn btn-primary btn-sm"
          >
            Ver leads
          </Link>
          <Link
            to="/p/$projectId/seo"
            params={{ projectId }}
            className="btn btn-ghost btn-sm"
          >
            Panel de SEO
          </Link>
        </div>
      </div>
    </div>
  );
}
