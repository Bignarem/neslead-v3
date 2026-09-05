import { ShieldAlert } from "lucide-react";

type AuthConfigErrorCardProps = {
  message: string;
  onRetry?: () => void;
};

export function AuthConfigErrorCard({
  message,
  onRetry,
}: AuthConfigErrorCardProps) {
  return (
    <div className="card w-full max-w-2xl bg-base-100 border border-base-300 shadow-xl">
      <div className="card-body gap-4">
        <h2 className="card-title gap-2">
          <ShieldAlert className="size-5 text-error" />
          Problema de acceso
        </h2>

        <div className="alert alert-error">
          <span>{message}</span>
        </div>

        <p className="text-sm text-base-content/70">
          Si el problema sigue, contáctanos por soporte.
        </p>

        {onRetry ? (
          <div className="card-actions justify-end">
            <button className="btn btn-ghost btn-sm" onClick={onRetry}>
              Reintentar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
