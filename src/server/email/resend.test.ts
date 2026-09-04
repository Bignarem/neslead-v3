import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  hasResendEmailConfig,
  sendHostedInvitationEmail,
  sendHostedPasswordResetEmail,
  sendHostedVerificationEmail,
} from "./resend";

const { getOptionalEnvValueMock } = vi.hoisted(() => ({
  getOptionalEnvValueMock: vi.fn(),
}));

vi.mock("@/server/lib/runtime-env", () => ({
  getOptionalEnvValue: getOptionalEnvValueMock,
}));

function setEnv(values: Record<string, string | undefined>) {
  getOptionalEnvValueMock.mockImplementation(
    async (name: string) => values[name],
  );
}

const resendRequestBodySchema = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  html: z.string(),
});

function parseResendRequestBody(init: RequestInit | undefined) {
  const body = init?.body;
  if (typeof body !== "string") {
    throw new Error("Expected Resend request body to be a string");
  }
  return resendRequestBodySchema.parse(JSON.parse(body));
}

function assertNoThirdPartyProviderNamed(text: string) {
  const lowercased = text.toLowerCase();
  expect(lowercased).not.toContain("resend");
  expect(lowercased).not.toContain("loops");
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
  setEnv({ RESEND_API_KEY: "re_test_123456" });
});

describe("hasResendEmailConfig", () => {
  it("is false without RESEND_API_KEY", async () => {
    setEnv({});
    await expect(hasResendEmailConfig()).resolves.toBe(false);
  });

  it("is true with RESEND_API_KEY", async () => {
    setEnv({ RESEND_API_KEY: "re_test_123456" });
    await expect(hasResendEmailConfig()).resolves.toBe(true);
  });
});

describe("sendHostedVerificationEmail", () => {
  it("posts to Resend with the confirmation link and neslead branding", async () => {
    await sendHostedVerificationEmail({
      email: "cliente@example.com",
      confirmationUrl: "https://neslead.com/verify/abc123",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer re_test_123456",
    });

    const body = parseResendRequestBody(init);
    expect(body.to).toBe("cliente@example.com");
    expect(body.from).toContain("neslead");
    expect(body.subject).toBe("Confirma tu correo en neslead");
    expect(body.html).toContain("https://neslead.com/verify/abc123");
    expect(body.html.toLowerCase()).toContain("neslead");

    assertNoThirdPartyProviderNamed(body.subject);
    assertNoThirdPartyProviderNamed(body.html);
    assertNoThirdPartyProviderNamed(body.from);
  });
});

describe("sendHostedPasswordResetEmail", () => {
  it("posts to Resend with the reset link", async () => {
    await sendHostedPasswordResetEmail({
      email: "cliente@example.com",
      resetUrl: "https://neslead.com/reset/xyz789",
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = parseResendRequestBody(init);
    expect(body.to).toBe("cliente@example.com");
    expect(body.subject).toBe("Restablece tu contraseña de neslead");
    expect(body.html).toContain("https://neslead.com/reset/xyz789");

    assertNoThirdPartyProviderNamed(body.subject);
    assertNoThirdPartyProviderNamed(body.html);
  });
});

describe("sendHostedInvitationEmail", () => {
  it("posts to Resend with the invite link", async () => {
    await sendHostedInvitationEmail({
      email: "nuevo@example.com",
      inviteUrl: "https://neslead.com/accept-invitation/inv1",
      organizationName: "Agencia Demo",
      inviterName: "Neudys Sanchez",
      inviterEmail: "neudys@nesweb.net",
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = parseResendRequestBody(init);
    expect(body.to).toBe("nuevo@example.com");
    expect(body.subject).toBe("Te invitaron a neslead");
    expect(body.html).toContain("https://neslead.com/accept-invitation/inv1");

    assertNoThirdPartyProviderNamed(body.subject);
    assertNoThirdPartyProviderNamed(body.html);
  });
});

describe("error propagation", () => {
  it("throws when the API returns a non-2xx status instead of swallowing it", async () => {
    fetchMock.mockResolvedValue(
      new Response("invalid api key", { status: 401 }),
    );

    await expect(
      sendHostedVerificationEmail({
        email: "cliente@example.com",
        confirmationUrl: "https://neslead.com/verify/abc123",
      }),
    ).rejects.toThrow();
  });
});
