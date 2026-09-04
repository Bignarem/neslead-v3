import { getErrorCode } from "@/client/lib/error-messages";

// STANDARD_MESSAGES (src/client/lib/error-messages.ts) está en inglés — es
// upstream y traducirlo entero es una decisión de alcance mayor, fuera de
// esta pantalla. Este mapa cubre en español solo los códigos que de verdad
// puede devolver el flujo de leads (ver LeadService y ensureUserMiddleware).
const MENSAJES_LEADS: Partial<Record<string, string>> = {
  NOT_FOUND:
    "No encontramos este lead o este proyecto. Puede que ya no exista.",
  VALIDATION_ERROR:
    "Hace falta al menos un nombre, un teléfono o un correo para guardar el lead.",
  FORBIDDEN: "No tienes acceso a este proyecto.",
};

const MENSAJE_GENERICO = "Ocurrió un error. Inténtalo de nuevo.";

export function getLeadsErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  if (code && MENSAJES_LEADS[code]) return MENSAJES_LEADS[code];
  return MENSAJE_GENERICO;
}
