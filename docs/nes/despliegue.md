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

## Etapa `neslead` (staging, modo hosted)

- URL: https://open-seo-neslead.neshost.workers.dev
- Fecha de despliegue: 2026-09-04
- Infraestructura: desplegada y viva. `curl -sSI` a la raíz devuelve `200`, sin redirección a
  `cloudflareaccess.com` (no hay puerta de Cloudflare Access — correcto, la puerta es el login
  propio). El HTML sirve la app de neslead (`<title>neslead</title>`), no OpenSEO ni
  Cloudflare Access.
- Migraciones: **se aplicaron**. Confirmado por consulta directa a `open-seo-db-neslead`:
  `d1_migrations` tiene 46 filas, la última es `0045_lovely_stark_industries.sql`. Las tres
  tablas propias de la Tarea 9 existen: `nes_leads`, `nes_lead_events`,
  `nes_organization_plans`. Alchemy las aplica solo porque `alchemy.run.ts` ya declaraba
  `migrationsDir: "drizzle"` en el recurso D1 — no hizo falta tocar nada para esto.
- Variables confirmadas en el worker desplegado (por la API de Cloudflare, solo nombres):
  `RESEND_API_KEY` (secret_text), `RESEND_FROM` (plain_text), `INVITE_ONLY_SIGNUP`
  (plain_text), `AUTH_MODE`, `DATABASE_PROVIDER`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
  `DATAFORSEO_API_KEY`, `BYPASS_EMAIL_VERIFICATION`, `OPENSEO_TELEMETRY_DISABLED`, entre otras.
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` y `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY`
  están definidas pero vacías (ver "Qué falta" abajo).
- **Backend de auth: funciona.** `GET /api/auth/get-session` responde `200` con `null` (antes
  daba `500 "Missing Better Auth hosted configuration"` porque el modo hosted exigía
  credenciales de Google de forma incondicional — ver `docs/nes/deuda-tecnica.md`, entrada
  "login social de Google opcional").
- **Registro por invitación: funciona en el sistema desplegado, no solo en los tests.**
  `POST /api/auth/sign-up/email` con un correo cualquiera devuelve `422
  {"code":"FAILED_TO_CREATE_USER"}` y no crea el usuario — confirmado por consulta directa a
  la base: 0 usuarios, 0 organizaciones. El efecto (rechazar sin invitación) es correcto.
  **Pendiente de otra tarea, no de esta:** better-auth envuelve el error de
  `assertSignupAllowed` (`src/server/auth/invite-only-signup.ts`, código de la Tarea 6) y
  devuelve el mensaje genérico de better-auth en vez de "El registro es solo por invitación".
  La causa probable es que el hook lanza `AppError` en vez de `APIError` de better-auth, que
  es lo que controla el mensaje que ve el cliente. No se tocó: es código de la Tarea 6, no de
  esta.
- Qué falta para completar la puerta de la fase 1:
  1. **Las dos claves de Turnstile** (`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`) — Neudys
     las está gestionando (el token de Cloudflare a mano da 403 en Turnstile). Sin ellas la
     etapa funciona igual (el plugin de captcha se omite si falta el secreto), solo que el
     registro queda sin captcha hasta que existan.
  2. **El primer registro de la cuenta de la agencia**, que solo puede hacer Neudys en el
     navegador (procedimiento exacto abajo).
- Puerta parcial de la fase 1: PENDIENTE — la prueba Neudys en el navegador
- `INVITE_ONLY_SIGNUP=true` en `.env.preview` — la etapa quedó con el registro cerrado.
- Deuda técnica de esta etapa: ver `docs/nes/deuda-tecnica.md` — límites de CPU y cron
  triggers desactivados por el plan gratis, y login social de Google vuelto opcional.

### Procedimiento del primer registro (lo hace Neudys)

La cuenta de la agencia no puede registrarse sola: `INVITE_ONLY_SIGNUP=true` rechaza a
cualquiera sin invitación previa, y todavía no existe ninguna organización que pueda invitar
a alguien. Hay que abrir la bandera una sola vez, registrarse, y volver a cerrarla.

1. **Abrir el registro.** En `/Users/bignarem/dev/neslead-v3/.env.preview`, cambiar la línea
   `INVITE_ONLY_SIGNUP=true` a `INVITE_ONLY_SIGNUP=false`.
2. **Redesplegar** para que el cambio llegue al worker:
   ```bash
   cd /Users/bignarem/dev/neslead-v3
   pnpm deploy:preview --stage neslead --yes
   ```
   Cómo saber que quedó bien: el comando termina con una línea `Done: N succeeded` y sin
   `ERROR` en la salida.
3. **Registrarse en el navegador** en https://open-seo-neslead.neshost.workers.dev con
   `neudys21@gmail.com` y una contraseña.
4. **Verificar el correo.** Llega desde el remitente propio sobre `neslead.com` (Tarea 6b).
   Cómo saber que quedó bien: al hacer clic en el enlace del correo, la sesión queda iniciada
   y se ve el tablero con una organización ya creada — no debe redirigir a `/onboarding`.
5. **Cerrar el registro otra vez.** En `.env.preview`, volver
   `INVITE_ONLY_SIGNUP=false` a `INVITE_ONLY_SIGNUP=true`.
6. **Redesplegar de nuevo:**
   ```bash
   cd /Users/bignarem/dev/neslead-v3
   pnpm deploy:preview --stage neslead --yes
   ```
   Cómo saber que quedó bien: repetir el paso 3 con un correo distinto debe devolver un error
   (no debe poder registrarse nadie más).

No saltarse el paso 5-6: dejar la bandera abierta deja el registro público abierto en un
sistema que se vende como privado.

