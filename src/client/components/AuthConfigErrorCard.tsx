import { ShieldAlert } from "lucide-react";
import { isHostedClientAuthMode } from "@/lib/auth-mode";

const CLOUDFLARE_SETUP_GUIDE_URL =
  "https://github.com/every-app/open-seo/blob/main/docs/SELF_HOSTING_CLOUDFLARE.md#2-configure-authentication-and-secrets";

type AuthConfigErrorCardProps = {
  message: string;
  onRetry?: () => void;
};

export function AuthConfigErrorCard({
  message,
  onRetry,
}: AuthConfigErrorCardProps) {
  const isHostedMode = isHostedClientAuthMode();

  return (
    <div className="card w-full max-w-2xl bg-base-100 border border-base-300 shadow-xl">
      <div className="card-body gap-4">
        <h2 className="card-title gap-2">
          <ShieldAlert className="size-5 text-error" />
          Falta configurar la autenticación
        </h2>

        <div className="alert alert-error">
          <span>{message}</span>
        </div>

        {isHostedMode ? (
          <p className="text-sm text-base-content/70">
            El modo alojado necesita{" "}
            <code className="mx-1">BETTER_AUTH_SECRET</code>
            (32 o más caracteres), <code className="mx-1">BETTER_AUTH_URL</code>
            , y credenciales de Google OAuth en el despliegue.
          </p>
        ) : (
          <p className="text-sm text-base-content/70">
            El modo Cloudflare Access necesita
            <code className="mx-1">TEAM_DOMAIN</code> (una URL https completa) y
            <code className="mx-1">POLICY_AUD</code> en el despliegue, con una
            aplicación de Access protegiendo este dominio.
          </p>
        )}

        <div className="card-actions justify-end">
          {onRetry ? (
            <button className="btn btn-ghost btn-sm" onClick={onRetry}>
              Reintentar
            </button>
          ) : null}
          <a
            className="btn btn-primary btn-sm"
            href={CLOUDFLARE_SETUP_GUIDE_URL}
            target="_blank"
            rel="noreferrer"
          >
            Abrir guía de configuración
          </a>
        </div>
      </div>
    </div>
  );
}
