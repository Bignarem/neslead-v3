import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/client/features/dashboard/DashboardPage";

export const Route = createFileRoute("/_project/p/$projectId/seo")({
  component: SeoRoute,
});

function SeoRoute() {
  const { projectId } = Route.useParams();
  return <DashboardPage projectId={projectId} />;
}
