import type { DashboardActivation } from "@/server/features/dashboard/services/DashboardService";
import type { DashboardHeroStep } from "@/types/schemas/dashboard";

// "mcp" drops out entirely when AI_AGENT_ENABLED=false — its copy names the
// agent feature by name, so marking the step merely "done" isn't enough; it
// must never be reachable by paging through the checklist.
export function getStepOrder(
  aiAgentEnabled: string | undefined,
): DashboardHeroStep[] {
  return aiAgentEnabled === "false"
    ? ["domain", "gsc", "competitor"]
    : ["domain", "mcp", "gsc", "competitor"];
}

export const STEP_ORDER: DashboardHeroStep[] = getStepOrder(
  import.meta.env.AI_AGENT_ENABLED,
);

// A step is "done" when the underlying product state exists, regardless of
// how it got there. The MCP hero step completes at authorization (the card
// below owns the connected-but-no-call-yet coaching) or when the user said
// "I already connected".
export function isStepDone(
  activation: DashboardActivation,
  step: DashboardHeroStep,
): boolean {
  switch (step) {
    case "domain":
      return activation.domain !== null;
    case "mcp":
      return (
        activation.mcp.authorizedAt !== null ||
        activation.mcp.cardDismissedAt !== null
      );
    case "gsc":
      return activation.gsc.connected;
    case "competitor":
      return activation.competitorClickedAt !== null;
  }
}

/** The single step the hero should coach next; null = coaching is over. */
export function computeNextStep(
  activation: DashboardActivation,
): DashboardHeroStep | null {
  for (const step of STEP_ORDER) {
    if (!isStepDone(activation, step)) return step;
  }
  return null;
}
