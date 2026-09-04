# Deuda técnica

Cosas que se resolvieron con un atajo a propósito, no por descuido. Cada entrada dice qué se
quitó, por qué, qué se pierde mientras tanto, y el paso exacto para revertir.

## Límites de CPU y cron triggers desactivados en previews sobre plan gratis (T7)

**Qué se quitó:** en `alchemy.run.ts`, el worker `open-seo` (app principal) y `open-seo-audit`
dejaron de pedir `limits: { cpuMs: 300_000 }` en cualquier etapa que no sea prod, salvo que
`WORKERS_PAID_PLAN=true` esté en el archivo de entorno. Lo mismo con los cron triggers del
worker `open-seo` (rank checks cada 5 min + GC diario de OAuth KV): en una etapa que no sea prod,
solo se registran con `WORKERS_PAID_PLAN=true`.

**Por qué:** al desplegar la etapa `neslead` (staging, modo hosted) contra el plan gratis de
Cloudflare Workers de esta cuenta, ambas cosas la rechazan:
- `limits.cpuMs` es una función exclusiva de plan pago (`BadRequest: CPU limits are not
  supported for the Free plan`).
- Los cron triggers tienen un tope de 5 por cuenta en el plan gratis, compartido con otros
  proyectos de la cuenta (`amja-scheduled-rebuild`, `nespos-outbox-cron`); `open-seo-selfhost`
  ya usaba 2, así que sumar los 2 de `open-seo` (neslead) rebasaba el tope.

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
