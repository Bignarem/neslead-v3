# neslead v3 — notas del fork

Fork de every-app/open-seo. Diseño y plan en el centro de mando:
`~/Documents/Business/NES/nesweb/projects/neslead/`.

Repo: `Bignarem/neslead-v3`. El nombre `neslead` lo ocupa todavía el CRM anterior; se libera en el cutover de la fase 9.

- Etiqueta base de upstream: v0.1.7
- Lo propio vive en `src/*/features/<nombre>` y `src/db/nes.schema.ts`.
- Archivos de upstream que tocamos: `docs/nes/parches-upstream.md`.
- Cómo actualizar desde upstream: `docs/nes/actualizar-upstream.md`.
- Sistema de diseño de pantallas (anchos, patrones de tabla/formulario/estados): `docs/nes/diseno.md`.

## Tests rotos en upstream

(ninguno)

## Puertas

- Fase 0 (2026-09-04): despliegue tal cual, keyword research / rank check / audit OK. Detalle en `docs/nes/despliegue.md`.
- Fase 1 (2026-09-04): marca aplicada; el código del modo alojado ya no exige un sistema de cobro externo (bandera BILLING_PROVIDER); registro solo por invitación; onboarding apagado. Ensayo de merge contra v0.1.7: 0 conflictos, trivial porque v0.1.7 sigue siendo la última etiqueta de upstream y es ancestro directo de HEAD, así que no prueba compatibilidad con una versión nueva. Falta la Tarea 7: todavía no hay ninguna etapa desplegada en modo alojado.
