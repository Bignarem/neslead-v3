import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { OnboardingChat } from "@/client/features/onboarding/OnboardingChat";
import { isHostedClientAuthMode } from "@/lib/auth-mode";

export const Route = createFileRoute("/_authenticated/onboarding/chat")({
  // The strategy chat is hosted-only (managed LLM + trial credits). Self-hosted
  // has no business here — send it back to the onboarding wizard.
  //
  // NES: ONBOARDING_ENABLED=false 404s this route too, matching
  // _authenticated.onboarding.index.tsx — see docs/nes/marca.md.
  beforeLoad: () => {
    if (import.meta.env.ONBOARDING_ENABLED === "false") {
      throw notFound();
    }
    if (!isHostedClientAuthMode()) {
      throw redirect({ to: "/onboarding", search: { step: 3 }, replace: true });
    }
  },
  component: OnboardingChat,
});
