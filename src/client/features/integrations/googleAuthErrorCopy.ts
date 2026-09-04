/**
 * Plain-language copy for Google OAuth failures, shared by the connect-surface
 * inline alert (GoogleLinkErrorAlert) and the /auth-error fallback page.
 * `code` is the `error` query param Better Auth appends on its error
 * redirects.
 *
 * `providerLabel` ("Search Console" / "Google Analytics") is set when the
 * failure came from a connect flow; without it the copy reads as a Google
 * sign-in failure.
 */
export function googleAuthErrorCopy(
  code: string,
  providerLabel?: string,
): { title: string; description: string } {
  const what = providerLabel
    ? `La conexión con ${providerLabel}`
    : "El inicio de sesión con Google";

  switch (code) {
    case "state_mismatch":
      return {
        title: `${what} no terminó`,
        description:
          "El intento expiró o se interrumpió. Vuelve a intentarlo en una sola pestaña del navegador y completa los pasos de Google en menos de 10 minutos. Si sigue pasando, revisa que tu navegador permita cookies para este sitio.",
      };
    case "access_denied":
      return {
        title: `${what} se canceló`,
        description:
          "Se cerró o se rechazó la pantalla de permisos de Google. Vuelve a intentarlo cuando quieras.",
      };
    case "account_already_linked_to_different_user":
      return {
        title: "Esa cuenta de Google ya está conectada",
        description:
          "Esa cuenta de Google ya está vinculada a otra cuenta de neslead. Desconéctala ahí primero, o contacta a soporte para transferirla.",
      };
    default:
      return {
        title: `${what} no terminó`,
        description:
          "Algo salió mal al comunicarnos con Google. Vuelve a intentarlo; si el problema sigue, contacta a soporte.",
      };
  }
}
