import { getOptionalEnvValue } from "@/server/lib/runtime-env";

// Remitente propio de correo transaccional (T6b). Sustituye a loops.ts para
// que ningún correo que ve el destinatario lleve el nombre de un proveedor
// externo: la marca blanca es regla dura del proyecto. loops.ts no se toca,
// queda como el archivo de upstream sin usar.
const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "neslead <no-reply@neslead.com>";
const BRAND_COLOR = "#6D4AFF";

export async function hasResendEmailConfig(): Promise<boolean> {
  return Boolean(await getOptionalEnvValue("RESEND_API_KEY"));
}

async function sendResendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = await getOptionalEnvValue("RESEND_API_KEY");

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required in hosted mode");
  }

  const from = (await getOptionalEnvValue("RESEND_FROM")) ?? DEFAULT_FROM;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
    // Mismo timeout que usaba loops.ts: sin esto, un fetch colgado a la API
    // de Resend consume tiempo de CPU facturado en el Worker sin límite y
    // deja al usuario esperando sin respuesta.
    signal: AbortSignal.timeout(10_000),
  });

  if (response.ok) {
    return;
  }

  const errorBody = await response.text();
  throw new Error(
    `Failed to send email via Resend (${response.status}): ${errorBody}`,
  );
}

// Sobrio, una sola columna, sin imágenes externas: saludo, una frase de qué
// es, un botón (enlace con estilo en línea) y el enlace en texto plano debajo
// para quien no vea el botón.
function renderEmail({
  intro,
  buttonLabel,
  url,
}: {
  intro: string;
  buttonLabel: string;
  url: string;
}) {
  return `<div style="font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto;">
  <p>Hola,</p>
  <p>${intro}</p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="${url}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">${buttonLabel}</a>
  </p>
  <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
  <p><a href="${url}">${url}</a></p>
  <p>— El equipo de neslead</p>
</div>`;
}

export async function sendHostedVerificationEmail({
  email,
  confirmationUrl,
}: {
  email: string;
  confirmationUrl: string;
}) {
  await sendResendEmail({
    to: email,
    subject: "Confirma tu correo en neslead",
    html: renderEmail({
      intro: "Confirma tu correo para activar tu cuenta de neslead.",
      buttonLabel: "Confirmar correo",
      url: confirmationUrl,
    }),
  });
}

export async function sendHostedInvitationEmail({
  email,
  inviteUrl,
  organizationName,
  inviterName,
  inviterEmail,
}: {
  email: string;
  inviteUrl: string;
  organizationName: string;
  inviterName: string;
  inviterEmail: string;
}) {
  await sendResendEmail({
    to: email,
    subject: "Te invitaron a neslead",
    html: renderEmail({
      intro: `${inviterName} (${inviterEmail}) te invitó a unirte a ${organizationName} en neslead.`,
      buttonLabel: "Aceptar invitación",
      url: inviteUrl,
    }),
  });
}

export async function sendHostedPasswordResetEmail({
  email,
  resetUrl,
}: {
  email: string;
  resetUrl: string;
}) {
  await sendResendEmail({
    to: email,
    subject: "Restablece tu contraseña de neslead",
    html: renderEmail({
      intro:
        "Recibimos una solicitud para restablecer tu contraseña de neslead.",
      buttonLabel: "Restablecer contraseña",
      url: resetUrl,
    }),
  });
}
