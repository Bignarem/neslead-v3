import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/client/features/legal/LegalPage";
import terminosContent from "@/client/features/legal/terminos.md?raw";

export const Route = createFileRoute("/terminos")({
  component: TerminosPage,
});

function TerminosPage() {
  return <LegalPage content={terminosContent} />;
}
