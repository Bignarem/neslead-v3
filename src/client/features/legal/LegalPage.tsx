import { Link } from "@tanstack/react-router";
import { Markdown } from "@/client/components/Markdown";
import { AuthPageShell } from "@/client/features/auth/AuthPage";

/**
 * Shared shell for the public legal pages (terms, privacy policy). Reuses
 * `AuthPageShell` so these read as the same entry flow as sign-in/sign-up,
 * but with a wider column — `AuthPageCard`'s `max-w-xs` is sized for a login
 * form, not a full legal document.
 */
export function LegalPage({ content }: { content: string }) {
  return (
    <AuthPageShell>
      <div className="w-full max-w-2xl space-y-6">
        <Link
          to="/sign-up"
          className="block text-center text-2xl font-bold tracking-tight text-primary"
        >
          neslead
        </Link>

        <div className="rounded-lg bg-base-100 p-6 shadow-sm sm:p-8">
          <Markdown>{content}</Markdown>
        </div>

        <div className="text-center">
          <Link
            to="/sign-up"
            className="text-sm text-base-content underline underline-offset-2 hover:text-base-content/80 transition-colors"
          >
            Volver
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
