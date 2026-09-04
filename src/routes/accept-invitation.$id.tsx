import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AuthPageCard, AuthPageShell } from "@/client/features/auth/AuthPage";
import { captureClientEvent } from "@/client/lib/posthog";
import { authClient, signOutAndRedirect, useSession } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";

export const Route = createFileRoute("/accept-invitation/$id")({
  beforeLoad: () => {
    if (!isHostedClientAuthMode()) {
      throw notFound();
    }
  },
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { id } = Route.useParams();
  const { data: session, isPending: isSessionPending } = useSession();

  return (
    <AuthPageShell>
      {isSessionPending ? null : session?.user ? (
        <InvitationCard invitationId={id} userEmail={session.user.email} />
      ) : (
        <SignedOutInvitationCard invitationId={id} />
      )}
    </AuthPageShell>
  );
}

// getInvitation requires a session matching the invited email, so a
// logged-out visitor gets a generic shell — no invitation details are
// exposed pre-auth by design.
function SignedOutInvitationCard({ invitationId }: { invitationId: string }) {
  const redirect = `/accept-invitation/${invitationId}`;

  return (
    <AuthPageCard title="Te invitaron">
      <p className="text-sm text-base-content/70">
        Te invitaron a unirte a una organización en neslead. Inicia sesión con
        el correo que recibió la invitación para aceptarla.
      </p>
      <div className="space-y-2">
        <Link
          to="/sign-up"
          search={{ redirect }}
          className="btn btn-soft w-full"
        >
          Crear cuenta
        </Link>
        <Link
          to="/sign-in"
          search={{ redirect }}
          className="btn btn-ghost w-full"
        >
          Iniciar sesión
        </Link>
      </div>
    </AuthPageCard>
  );
}

function InvitationCard({
  invitationId,
  userEmail,
}: {
  invitationId: string;
  userEmail: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [declined, setDeclined] = useState(false);

  const invitationQuery = useQuery({
    queryKey: ["invitation", invitationId],
    queryFn: async () => {
      const result = await authClient.organization.getInvitation({
        query: { id: invitationId },
      });
      if (result.error) {
        throw new Error(result.error.message || "Invitación no encontrada");
      }
      return result.data;
    },
    retry: false,
  });

  async function handleAccept() {
    setActionError(null);
    setIsSubmitting(true);
    try {
      const accepted = await authClient.organization.acceptInvitation({
        invitationId,
      });
      if (accepted.error) {
        setActionError(
          accepted.error.message || "No pudimos aceptar la invitación.",
        );
        setIsSubmitting(false);
        return;
      }

      // Accepting updates the session row but not the session cookie cache;
      // setActive refreshes the cookie so the app opens in the joined org
      // immediately instead of after the cache expires.
      await authClient.organization.setActive({
        organizationId: accepted.data.invitation.organizationId,
      });
      captureClientEvent("team:invitation_accept");
      // Full navigation: every cached query in this tab belongs to the old
      // workspace.
      window.location.assign("/");
    } catch {
      setActionError("No pudimos aceptar la invitación. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  }

  async function handleDecline() {
    setActionError(null);
    setIsSubmitting(true);
    try {
      const result = await authClient.organization.rejectInvitation({
        invitationId,
      });
      if (result.error) {
        setActionError(
          result.error.message || "No pudimos rechazar la invitación.",
        );
        setIsSubmitting(false);
        return;
      }
      captureClientEvent("team:invitation_decline");
      setDeclined(true);
    } catch {
      setActionError("No pudimos rechazar la invitación. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  }

  if (invitationQuery.isPending) {
    return (
      <AuthPageCard title="Comprobando la invitación...">
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-md" />
        </div>
      </AuthPageCard>
    );
  }

  if (invitationQuery.isError) {
    return (
      <AuthPageCard title="Invitación no disponible">
        <p className="text-sm text-base-content/70">
          Esta invitación puede haber vencido, haberse cancelado, o ser para un
          correo distinto. Iniciaste sesión como{" "}
          <span className="font-medium" data-ph-mask>
            {userEmail}
          </span>
          .
        </p>
        <p className="text-sm text-base-content/70">
          Si la invitación se envió a otro correo, cierra sesión y vuelve a
          entrar con ese correo. Si no, pide a tu compañero que envíe una
          invitación nueva.
        </p>
        <div className="space-y-2">
          <button
            type="button"
            className="btn btn-soft w-full"
            onClick={() => {
              // Signs out, then lands on sign-in with a redirect back to this
              // invitation (staying signed in would bounce straight back here).
              signOutAndRedirect();
            }}
          >
            Usar otra cuenta
          </button>
          <Link to="/" className="btn btn-ghost w-full">
            Ir al panel
          </Link>
        </div>
      </AuthPageCard>
    );
  }

  if (declined) {
    return (
      <AuthPageCard title="Invitación rechazada">
        <p className="text-sm text-base-content/70">
          Rechazaste la invitación para unirte a{" "}
          <span className="font-medium">
            {invitationQuery.data.organizationName}
          </span>
          .
        </p>
        <Link to="/" className="btn btn-ghost w-full">
          Ir al panel
        </Link>
      </AuthPageCard>
    );
  }

  return (
    <AuthPageCard title="Unirse a la organización">
      <p className="text-sm text-base-content/70">
        <span className="font-medium" data-ph-mask>
          {invitationQuery.data.inviterEmail}
        </span>{" "}
        te invitó a unirte a{" "}
        <span className="font-medium">
          {invitationQuery.data.organizationName}
        </span>{" "}
        en neslead.
      </p>
      {actionError ? <p className="text-sm text-error">{actionError}</p> : null}
      <div className="space-y-2">
        <button
          type="button"
          className="btn btn-soft w-full"
          disabled={isSubmitting}
          onClick={() => void handleAccept()}
        >
          {isSubmitting ? "Uniéndote..." : "Aceptar invitación"}
        </button>
        <button
          type="button"
          className="btn btn-ghost w-full"
          disabled={isSubmitting}
          onClick={() => void handleDecline()}
        >
          Rechazar
        </button>
      </div>
    </AuthPageCard>
  );
}
