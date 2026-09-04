import { beforeEach, describe, expect, it, vi } from "vitest";

type MockAuthEnv = {
  AUTH_MODE?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  BYPASS_EMAIL_VERIFICATION?: string;
};

const mockEnv = vi.hoisted(() => ({}) as MockAuthEnv);

vi.mock("cloudflare:workers", () => ({ env: mockEnv }));

// Google login is optional in hosted mode (see src/lib/auth.ts,
// getGoogleSocialProviderConfig) — these baseline values are the rest of
// what hasHostedAuthConfig() requires, so each test only has to vary the
// one thing it's checking.
function resetEnvToHostedBaseline() {
  for (const key of Object.keys(mockEnv) as (keyof MockAuthEnv)[]) {
    delete mockEnv[key];
  }
  Object.assign(mockEnv, {
    AUTH_MODE: "hosted",
    BETTER_AUTH_URL: "https://open-seo-neslead.example.workers.dev",
    BETTER_AUTH_SECRET: "a".repeat(32),
    RESEND_API_KEY: "re_test_123456",
  } satisfies MockAuthEnv);
}

beforeEach(() => {
  resetEnvToHostedBaseline();
});

describe("getSocialProviders", () => {
  it("has no google provider when Google credentials are absent", async () => {
    const { getSocialProviders } = await import("@/lib/auth");
    expect(getSocialProviders()).not.toHaveProperty("google");
  });

  it("configures the google provider when both Google credentials are present", async () => {
    mockEnv.GOOGLE_CLIENT_ID = "client-id";
    mockEnv.GOOGLE_CLIENT_SECRET = "client-secret";

    const { getSocialProviders } = await import("@/lib/auth");
    const providers = getSocialProviders();

    expect(providers).toHaveProperty("google");
    expect(providers.google).toMatchObject({
      clientId: "client-id",
      clientSecret: "client-secret",
    });
  });

  it("omits the provider when only one of the two Google credentials is set", async () => {
    mockEnv.GOOGLE_CLIENT_ID = "client-id";

    const { getSocialProviders } = await import("@/lib/auth");
    expect(getSocialProviders()).not.toHaveProperty("google");
  });
});

describe("hasHostedAuthConfig", () => {
  it("is true without Google credentials — Google is optional, not required", async () => {
    const { hasHostedAuthConfig } = await import("@/lib/auth");
    expect(hasHostedAuthConfig()).toBe(true);
  });

  it("is true with Google credentials too — presence doesn't change the other requirements", async () => {
    mockEnv.GOOGLE_CLIENT_ID = "client-id";
    mockEnv.GOOGLE_CLIENT_SECRET = "client-secret";

    const { hasHostedAuthConfig } = await import("@/lib/auth");
    expect(hasHostedAuthConfig()).toBe(true);
  });

  it("is false without Turnstile — that stays required even though Google no longer is", async () => {
    // A runtime site key with no matching secret fails hasHostedTurnstileConfig
    // closed (src/lib/auth-turnstile.ts) — the same case its own test covers.
    mockEnv.TURNSTILE_SITE_KEY = "site-key";

    const { hasHostedAuthConfig } = await import("@/lib/auth");
    expect(hasHostedAuthConfig()).toBe(false);
  });

  it("is false without an email path either", async () => {
    delete mockEnv.RESEND_API_KEY;

    const { hasHostedAuthConfig } = await import("@/lib/auth");
    expect(hasHostedAuthConfig()).toBe(false);
  });
});
