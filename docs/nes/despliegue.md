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
