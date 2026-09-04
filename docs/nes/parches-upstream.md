# Archivos de upstream que tocamos

Regla: todo archivo de `every-app/open-seo` que se modifique se lista aquí en el mismo
commit. En cada actualización desde upstream se revisa esta lista y nada más.

| Archivo | Qué cambiamos | Tarea |
|---|---|---|
| src/routes/__root.tsx | título "neslead" | T4 |
| src/client/layout/AppShell.tsx | nombre en cabecera | T4 |
| src/client/layout/AppShellParts.tsx | "OpenSEO" a "neslead" en los avisos de configuración de la clave DataForSEO | T4 |
| src/client/components/Sidebar.tsx | "OpenSEO" a "neslead" en la cabecera del sidebar móvil | T4 |
| public/site.webmanifest | name y short_name "neslead" | T4 |
| src/client/styles/app.css | --color-primary y --color-accent al violeta de neslead (tema claro y oscuro) | T4 |
| src/server/email/loops.ts | appName "neslead" en los tres correos | T4 |
| public/*.png, favicon.ico | pendiente: iconos de neslead | T4 |
| src/server/lib/dataforseo/client.ts | meterDataforseoCall salta el cobro cuando BILLING_PROVIDER=none | T5 |
| src/server/lib/dataforseo/client.test.ts | mock de getOptionalEnvValue para que las pruebas de cobro por Autumn sigan pasando BILLING_PROVIDER=autumn | T5 |
| src/lib/auth.ts | hook user.create.before llama a assertSignupAllowed (INVITE_ONLY_SIGNUP) | T6 |
| src/client/features/onboarding/useOnboardingRedirect.ts | no redirige si ONBOARDING_ENABLED=false | T6 |
| vite.config.ts | expone ONBOARDING_ENABLED al cliente vía envPrefix | T6 |
| src/env.d.ts | tipo ImportMetaEnv.ONBOARDING_ENABLED (lo exigía types:check) | T6 |
| src/db/schema.ts | registra nes.schema (imports, tipo, runtime, exports) | T9 |
| src/db/d1/schema.ts | export * nes.schema | T9 |
| src/db/pg/schema.ts | export * nes.schema | T9 |
| src/db/schema-parity.test.ts | incluye nes.schema en ambas listas | T9 |
| src/lib/auth.ts | usa el correo propio (Resend) en vez del proveedor de upstream | T6b |
| src/serverFunctions/organization.ts | import del correo propio (Resend) | T6b |
| alchemy.run.ts | reenvía RESEND_API_KEY, RESEND_FROM e INVITE_ONLY_SIGNUP al worker desplegado (T6b y T6 los usan en runtime, pero nunca se habían agregado a `dataEnv`; sin esto el correo y el registro por invitación quedaban mudos en cualquier despliegue) | T7 |
| src/lib/auth.ts | login con Google opcional en modo hosted: `getGoogleSocialProviderConfig` devuelve `undefined` (no lanza) si faltan las credenciales, `getSocialProviders` omite la clave `google` en ese caso, y `hasHostedAuthConfig` deja de exigirlo — el diseño aprobado del modo hosted es correo+contraseña+Turnstile, sin Google | T7 |
| alchemy.run.ts | TEMPORAL: quita el límite de CPU de 300s (función de plan pago) en los dos workers (`open-seo` y `open-seo-audit`) salvo en prod o con `WORKERS_PAID_PLAN=true`, porque el plan gratis no lo admite. Revertir (volver a exigirlo siempre) al activar Workers Paid. Detalle en `docs/nes/deuda-tecnica.md` | T7 |
| alchemy.run.ts | TEMPORAL: no registra los cron triggers del worker `open-seo` (rank checks + GC de OAuth KV) salvo en prod, en self-host (`cloudflare_access`, sin cambios) o con `WORKERS_PAID_PLAN=true`, porque el plan gratis tiene un tope de 5 por cuenta compartido con otros proyectos (amja, nespos) y ya estaba en 4. Afecta solo a la etapa alojada, nunca a `selfhost`. Revertir al activar Workers Paid. Detalle en `docs/nes/deuda-tecnica.md` | T7 |
| .env.preview.example | agrega WORKERS_PAID_PLAN, RESEND_API_KEY, RESEND_FROM e INVITE_ONLY_SIGNUP comentadas — las cuatro variables que esta tarea volvió necesarias para un despliegue hosted, ausentes de la plantilla original | T7 |
| src/client/navigation/items.ts | item "Leads" en `projectNavItems` (justo después de Dashboard) y en el grupo "Overview" de `getProjectNavGroups`, para que aparezca en el sidebar | T12 |
