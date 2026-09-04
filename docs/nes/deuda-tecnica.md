# Deuda técnica

Cosas que se resolvieron con un atajo a propósito, no por descuido. Cada entrada dice qué se
quitó, por qué, qué se pierde mientras tanto, y el paso exacto para revertir.

## Límites de CPU y cron triggers desactivados en previews sobre plan gratis (T7)

**Qué se quitó:** en `alchemy.run.ts`, el worker `open-seo` (app principal) y `open-seo-audit`
dejaron de pedir `limits: { cpuMs: 300_000 }` en cualquier etapa que no sea prod ni self-host,
salvo que `WORKERS_PAID_PLAN=true` esté en el archivo de entorno (self-host, `cloudflare_access`,
nunca pidió este límite — eso no cambió). Lo mismo con los cron triggers del worker `open-seo`
(rank checks cada 5 min + GC diario de OAuth KV), con un matiz importante: **este gate afecta
solo a la etapa alojada (`neslead` y cualquier otra preview), nunca a `selfhost`**. Self-host
sigue registrando sus crons exactamente como antes, sin condición — no tenía el problema de
cuota y no debía tocarse. Solo una etapa que no sea prod ni self-host deja de registrar sus
crons hasta que `WORKERS_PAID_PLAN=true`.

**Por qué:** al desplegar la etapa `neslead` (staging, modo hosted) contra el plan gratis de
Cloudflare Workers de esta cuenta, ambas cosas la rechazan:

- `limits.cpuMs` es una función exclusiva de plan pago (`BadRequest: CPU limits are not
supported for the Free plan`).
- Los cron triggers tienen un tope de 5 por cuenta en el plan gratis, compartido con otros
  proyectos de la cuenta (`amja-scheduled-rebuild`, `nespos-outbox-cron`); `open-seo-selfhost`
  ya usaba 2, así que sumar los 2 de `open-seo` (neslead) rebasaba el tope. `open-seo-selfhost`
  no es el problema — sus 2 crons siguen contando contra el tope igual que antes, pero se
  quedan porque ya estaban reconciliados y funcionando; el gate solo evita que `neslead` sume
  2 más.

El plan del proyecto (`task-7-brief.md`, restricciones globales) dice explícitamente: fases 0 y
1 en plan gratis, Workers Paid recién antes de la Tarea 10. Sin este atajo, la etapa de
staging de la Tarea 7 no podía desplegarse.

**Qué se pierde mientras tanto:**

- `open-seo-audit`: sin el límite de 300s de CPU, el worker corre con el límite por defecto del
  plan gratis para los pasos del workflow de auditoría que procesan lotes grandes de HTML —
  puede fallar por CPU en sitios grandes donde antes no fallaba.
- `open-seo` (neslead): sin cron triggers, el rank tracking programado (`*/5 * * * *`) no corre
  solo — hay que disparar los checks a mano. Tampoco corre el GC diario de `OAUTH_KV`
  (`17 3 * * *`), así que las entradas vencidas se acumulan sin limpiarse.
- Nada de esto afecta la puerta de la fase 1 (Tarea 7): el login propio, el registro por
  invitación y el keyword research a demanda no dependen de crons ni del límite de CPU.

**Cómo revertir:** activar Cloudflare Workers Paid en esta cuenta y agregar
`WORKERS_PAID_PLAN=true` a `.env.preview` (y a cualquier otro archivo de entorno de una etapa
que no sea prod que deba tener el límite y los crons), luego redesplegar esa etapa. El código de
`alchemy.run.ts` no necesita tocarse: el flag ya restaura el comportamiento completo. Si más
adelante se decide que todas las etapas correrán siempre sobre plan pago, se puede simplificar
`alchemy.run.ts` quitando el flag y volviendo a la condición original (solo excluir
`cloudflare_access`) — en ese punto esta entrada se borra.

## Login social de Google vuelto opcional en modo hosted (T7)

**Qué se cambió:** en `src/lib/auth.ts`, `getGoogleSocialProviderConfig()` devuelve
`undefined` (en vez de lanzar) cuando faltan `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`;
`getSocialProviders()` omite la clave `google` del objeto de proveedores cuando eso pasa; y
`hasHostedAuthConfig()` ya no exige Google como parte del arranque. Turnstile y el correo
propio siguen siendo obligatorios, sin tocar.

**Por qué:** el código de upstream exigía Google de forma incondicional en modo `hosted`, sin
bandera para desactivarlo. El diseño aprobado del modo hosted es "correo y contraseña,
verificación, organizaciones, miembros, invitaciones, claves de API, Turnstile" — no menciona
Google en ningún lado. Los clientes son negocios dominicanos que entran con correo y
contraseña; el login social no está vendido ni prometido, y exigirlo hubiera obligado a pasar
por la consola de Google Cloud y su verificación de marca solo para poder desplegar una etapa
de staging.

**No es deuda en el sentido de "hay que deshacerlo"** — es la decisión de producto correcta,
tomada explícitamente. Se documenta aquí para que quede claro que la ausencia de Google no es
un descuido si alguien lo nota más adelante.

**Cómo reactivar el login con Google** (si algún día se decide venderlo): crear un cliente
OAuth en Google Cloud Console (tipo "Web application", URI de redirección
`https://<host-de-la-etapa>/api/auth/callback/google`) y agregar `GOOGLE_CLIENT_ID` y
`GOOGLE_CLIENT_SECRET` al archivo de entorno de esa etapa. No hace falta tocar
`src/lib/auth.ts`: en cuanto las dos variables estén presentes, `getGoogleSocialProviderConfig()`
vuelve a devolver la configuración completa y el proveedor aparece de nuevo, igual que antes
de este cambio.

## Agente de IA (MCP + Sam) apagado por bandera, se retoma como asistente propio (T4b)

**Qué se apagó:** con `AI_AGENT_ENABLED=false`, tres superficies desaparecen: la tarjeta
"Connect your AI agent" del tablero, la sección "AI & MCP" del menú lateral (y su página en
`/ai`, que además devuelve 404 si se visita la URL directamente), y la pestaña "Chat" del
proyecto con el agente "Sam" (`/p/:id/sam`, también con 404 directo). El paso "mcp" del
checklist de onboarding del tablero también desaparece del todo (no se marca "listo": se
quita de la lista, porque su copy nombra la marca ajena).

**Por qué:** son las tres superficies que le ofrecen a un cliente conectar su propio agente de
IA (Claude Code, Codex, Hermes) directamente al servidor MCP del producto — lo que le permite
sacar datos sin pasar por la interfaz que vendemos. No es solo estética: es un camino que
compite con el producto. Se apaga mientras no hay una versión propia que valga la pena vender.

**Qué se pierde mientras tanto:** ningún cliente puede conectar un agente externo ni usar el
chat "Sam" dentro del proyecto. La API del MCP en sí (`/mcp`, OAuth de MCP) sigue viva a nivel
de protocolo — este cambio bloquea la interfaz y las rutas que lo exponen, no el servidor MCP
del backend (`src/server/mcp/*`). Alguien con la URL y credenciales válidas de antes podría
seguir usándolo; apagar el servidor mismo es un cambio más grande, fuera de esta tarea.

**Plan a futuro (decisión de Neudys, 2026-09-04):** no se borra el código. Cuando se retome,
la idea es un asistente de IA propio (sin nombrar Claude/Codex/Hermes/MCP en la interfaz), con
el costo de las consultas atado a los créditos del plan del cliente en vez de ser gratis o
requerir su propia cuenta de agente. Falta diseñar esa parte de facturación antes de reactivar
la bandera en producción.

**Cómo reactivar:** quitar `AI_AGENT_ENABLED=false` del archivo de entorno de esa etapa (o
ponerlo en `true`). No hace falta tocar código: `src/routes/_app/ai.tsx`,
`src/routes/_project/p/$projectId/sam.tsx`, `src/client/navigation/items.ts`,
`src/client/components/Sidebar.tsx`, `src/client/features/dashboard/DashboardPage.tsx` y
`src/client/features/dashboard/dashboardSteps.ts` ya vuelven a mostrar todo tal como estaba
antes de este cambio.
