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
