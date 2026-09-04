import { describe, expect, it } from "vitest";
import { getStepOrder } from "./dashboardSteps";

describe("getStepOrder", () => {
  it("includes the mcp step by default", () => {
    expect(getStepOrder(undefined)).toEqual([
      "domain",
      "mcp",
      "gsc",
      "competitor",
    ]);
    expect(getStepOrder("true")).toEqual([
      "domain",
      "mcp",
      "gsc",
      "competitor",
    ]);
  });

  it("drops the mcp step entirely when AI_AGENT_ENABLED is false", () => {
    // Not just "done" — the step's own copy names the agent feature, so it
    // must be unreachable, not merely marked complete.
    expect(getStepOrder("false")).toEqual(["domain", "gsc", "competitor"]);
  });
});
