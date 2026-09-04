import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/client/features/legal/LegalPage";
import privacidadContent from "@/client/features/legal/privacidad.md?raw";

export const Route = createFileRoute("/privacidad")({
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return <LegalPage content={privacidadContent} />;
}
