import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getOptionalEnvValue: vi.fn() }));
vi.mock("@/server/lib/runtime-env", () => ({
  getOptionalEnvValue: mocks.getOptionalEnvValue,
}));

import { getBillingProvider } from "@/server/lib/billing-provider";

describe("getBillingProvider", () => {
  it("defaults to none when unset", async () => {
    mocks.getOptionalEnvValue.mockResolvedValue(undefined);
    expect(await getBillingProvider()).toBe("none");
  });
  it("returns autumn when set", async () => {
    mocks.getOptionalEnvValue.mockResolvedValue("autumn");
    expect(await getBillingProvider()).toBe("autumn");
  });
  it("rejects unknown values", async () => {
    mocks.getOptionalEnvValue.mockResolvedValue("stripe");
    await expect(getBillingProvider()).rejects.toThrow(/BILLING_PROVIDER/);
  });
});
