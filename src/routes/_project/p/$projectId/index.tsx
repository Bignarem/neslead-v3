import { createFileRoute } from "@tanstack/react-router";
import { PortadaPage } from "@/client/features/portada/PortadaPage";

export const Route = createFileRoute("/_project/p/$projectId/")({
  component: PortadaRoute,
});

function PortadaRoute() {
  const { projectId } = Route.useParams();
  return <PortadaPage projectId={projectId} />;
}
