import { AlertTriangle } from "lucide-react";
import { SafeExternalLink } from "@/client/components/SafeExternalLink";

export function GoogleOAuthSetupWarning({
  integrationName,
  docsUrl,
}: {
  integrationName: string;
  docsUrl: string;
}) {
  return (
    <div className="alert alert-warning items-start text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-medium">
          El cliente de Google OAuth no está configurado
        </p>
        <p className="text-base-content/70">
          Agrega tu ID de cliente y tu secreto de Google a esta instalación
          antes de conectar {integrationName}.
        </p>
        <SafeExternalLink
          url={docsUrl}
          label="Abrir guía de configuración"
          className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
        />
      </div>
    </div>
  );
}
