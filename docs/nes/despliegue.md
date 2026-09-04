# Despliegue

## Etapa `selfhost` (fase 0, tal cual)
- URL: https://open-seo-selfhost.neshost.workers.dev
- Auth: Cloudflare Access, correo permitido neudys21@gmail.com
- Fecha: 2026-09-04
- Puerta de la fase 0: PASADA el 2026-09-04. Las cinco comprobaciones:
  1. Entrada por Cloudflare Access: OK (con la cuenta de Cloudflare, que es el proveedor
     de identidad por defecto; el correo permitido coincide).
  2. Proyecto `nesweb` con dominio nesweb.net: creado.
  3. Keyword research de "diseno web santo domingo": OK. Volumen 30, competencia 0.09,
     tendencia de 12 meses y 19 resultados organicos del SERP.
  4. Rank tracking de "diseno web republica dominicana" sobre nesweb.net (DO, movil,
     top 40): chequeo `completed`, 1 de 1 keyword, sin error. Posicion nula, es decir
     el dominio no esta en el top 40. Verificado en la base: `rank_check_runs` con
     estado completed y `rank_snapshots` con position NULL. La interfaz muestra
     "No history yet" en el grafico, que es cosmetico y no un fallo.
  5. Site audit de nesweb.net: `Done`. 50 paginas rastreadas, 15 avisos informativos,
     47 ms de respuesta media.

## Nota sobre los datos de Republica Dominicana

Para este pais los datos de keywords vienen de Google Ads: hay volumen, CPC y tendencia,
pero **no hay dificultad ni intencion**, y tampoco hay sugerencias de keywords ya
posicionadas (se anaden a mano). Pesa sobre lo que se le puede mostrar y prometer a un
cliente dominicano.

### Recursos provisionados

- Workers: `open-seo` (app principal), `open-seo-audit` (worker de auditoría)
- D1: `DB`
- KV: `KV`, `OAUTH_KV`
- R2: `R2`
- Workflows: `site-audit-workflow-selfhost`, `rank-check-workflow-selfhost`
- Cloudflare Access: aplicación `SelfHostAccess`, grupo de usuarios permitidos
  `SelfHostAllowUsers`
- Subdominio `workers.dev` habilitado; 2 cron triggers reconciliados

Referencia si algún día hay que destruir o recrear la etapa: son los mismos
nombres que reporta `pnpm alchemy deploy --env-file .env.selfhost --stage selfhost`
("Done: 20 succeeded", sin errores).

## Etapa `neslead` (staging, modo hosted) — BLOQUEADA

- URL: https://open-seo-neslead.neshost.workers.dev
- Fecha de despliegue: 2026-09-04
- Infraestructura: desplegada y viva. `curl -sSI` a la raíz devuelve `200`, sin redirección a
  `cloudflareaccess.com` (no hay puerta de Cloudflare Access — correcto, la puerta es el login
  propio). El HTML sirve la app de neslead (`<title>neslead</title>`, módulo
  `useHostedAuthRouteGuard` cargado), no OpenSEO ni Cloudflare Access.
- Variables confirmadas en el worker desplegado (por la API de Cloudflare, solo nombres): 
  `RESEND_API_KEY` (secret_text), `RESEND_FROM` (plain_text), `INVITE_ONLY_SIGNUP` (plain_text),
  `AUTH_MODE`, `DATABASE_PROVIDER`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
  `DATAFORSEO_API_KEY`, `BYPASS_EMAIL_VERIFICATION`, `OPENSEO_TELEMETRY_DISABLED`, entre otras.
- **Bloqueo real: el backend de auth no arranca.** `GET /api/auth/get-session` y
  `POST /api/auth/sign-up/email` devuelven `500 "Missing Better Auth hosted configuration"`.
  Causa raíz: `src/lib/auth.ts` (`getGoogleSocialProviderConfig`, llamada desde
  `hasHostedAuthConfig` y desde la construcción de la instancia de auth) exige
  `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` **de forma incondicional** en modo `hosted`,
  aunque el objetivo de esta etapa sea solo correo+contraseña. No es un archivo tocado por
  NESWEB (código de upstream, sin parchear); no hay bandera para desactivar el login social.
  No es una variable que estuviera en la lista de la Tarea 7 (`task-7-brief.md` Paso 2) ni en
  los prerrequisitos de cuentas.
- **Qué hace falta para destrabar** (decide el negocio, no es un problema técnico de
  despliegue): o bien Neudys crea un cliente OAuth de Google (Google Cloud Console, tipo Web,
  con el URI de redirección `https://open-seo-neslead.neshost.workers.dev/api/auth/callback/google`)
  y se guardan `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` en `~/.config/neshost/neslead.env`, o
  bien se decide parchear `src/lib/auth.ts` para que el login social sea opcional en modo
  hosted (cambio de diseño en código de upstream, fuera del alcance que se me dio para la
  Tarea 7).
- **Paso 4 del brief (puerta parcial) no se pudo ejecutar**: ni la comprobación automática
  (rechazo de registro sin invitación) ni el registro de la cuenta de la agencia son posibles
  mientras el backend de auth devuelva 500. La bandera `INVITE_ONLY_SIGNUP` quedó en `true` en
  `.env.preview`, sin ciclo de apertura — no hubo forma de probarlo.
- Puerta parcial de la fase 1: PENDIENTE — la prueba Neudys en el navegador
- Deuda técnica pendiente de esta etapa (no relacionada con el bloqueo de arriba): ver
  `docs/nes/deuda-tecnica.md` — límites de CPU y cron triggers desactivados por el plan gratis.
