import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ hasPendingInvitationForEmail: vi.fn() }));
vi.mock("@/server/auth/repositories/AuthRepository", () => ({
  AuthRepository: mocks,
}));

import { assertSignupAllowed } from "@/server/auth/invite-only-signup";

describe("assertSignupAllowed", () => {
  beforeEach(() => mocks.hasPendingInvitationForEmail.mockReset());

  it("allows anyone when invite-only is off", async () => {
    await expect(assertSignupAllowed("x@y.com", false)).resolves.toBeUndefined();
    expect(mocks.hasPendingInvitationForEmail).not.toHaveBeenCalled();
  });
  it("allows an invited email", async () => {
    mocks.hasPendingInvitationForEmail.mockResolvedValue(true);
    await expect(assertSignupAllowed("x@y.com", true)).resolves.toBeUndefined();
  });
  it("rejects an email without invitation", async () => {
    mocks.hasPendingInvitationForEmail.mockResolvedValue(false);
    await expect(assertSignupAllowed("x@y.com", true)).rejects.toThrow(/invitación/);
  });
});
