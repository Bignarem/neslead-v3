# Despliegue

## Etapa `selfhost` (fase 0, tal cual)
- URL: https://open-seo-selfhost.neshost.workers.dev
- Auth: Cloudflare Access, correo permitido neudys21@gmail.com
- Fecha: 2026-09-04
- Puerta de la fase 0: PENDIENTE — la prueba Neudys en el navegador

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
